import type { PageServerLoad } from './$types';
import type { User } from '@supabase/supabase-js';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { extractDishName } from '$lib/supabaseOrderHelpers';
import { orderTicketSecretConfigured, signOrderTicket } from '$lib/orderTicketToken';

type Recommendation = { dish_id: number; dish_name: string; chance: number; max_orderable: number };
type DishMeta = { dish_name: string; max_orderable: number };
type PythonRecommendation = { dish_id: number; chance_pct: number };
type PythonPayload = {
	ok: boolean;
	recommendations?: Array<{ dish_id?: unknown; 'chance_%'?: unknown }>;
	error?: string;
};

const execFileAsync = promisify(execFile);
const pythonRecommendationCache = new Map<string, { expiresAt: number; data: PythonRecommendation[] }>();
const PYTHON_CACHE_TTL_MS = 5 * 60 * 1000;

function parsePythonPayload(stdout: string): PythonPayload {
	const lines = stdout
		.split(/\r?\n/g)
		.map((line) => line.trim())
		.filter(Boolean);

	for (let i = lines.length - 1; i >= 0; i--) {
		try {
			const parsed = JSON.parse(lines[i]);
			if (parsed && typeof parsed === 'object' && 'ok' in parsed) {
				return parsed as PythonPayload;
			}
		} catch {
			// Ignore non-JSON lines and continue scanning from the end.
		}
	}

	throw new Error('Could not parse JSON output from Python recommender.');
}

function buildDishMetaMap(allDishes: unknown[]): Map<number, DishMeta> {
	const dishMetaMap = new Map<number, DishMeta>();

	for (const raw of allDishes as Array<Record<string, unknown>>) {
		const id = Number(raw.id);
		if (!Number.isFinite(id)) continue;

		const links = Array.isArray(raw.link_dish_recipe)
			? (raw.link_dish_recipe as Array<Record<string, unknown>>)
			: [];

		const quantities = links.map((link) => {
			const product = link.product as Record<string, unknown> | null | undefined;
			return product?.quantity != null ? Number(product.quantity) : 0;
		});

		const maxOrderable = quantities.length > 0 ? Math.min(...quantities) : 0;
		dishMetaMap.set(id, {
			dish_name: typeof raw.name === 'string' && raw.name.trim().length > 0 ? raw.name : `Dish #${id}`,
			max_orderable: maxOrderable
		});
	}

	return dishMetaMap;
}

async function getPythonRecommendations(userId: string, topN = 5): Promise<PythonRecommendation[] | null> {
	const now = Date.now();
	const cached = pythonRecommendationCache.get(userId);
	if (cached && cached.expiresAt > now) {
		return cached.data;
	}

	const env = { ...process.env };
	if (!env.SUPABASE_URL && process.env.PUBLIC_SUPABASE_URL) {
		env.SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
	}
	if (!env.SUPABASE_KEY) {
		env.SUPABASE_KEY =
			process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
	}

	const scriptPath = resolve(process.cwd(), 'python_code', 'recomendations.py');
	const recommendArgs = [
		scriptPath,
		'--recommend',
		'--user-id',
		userId,
		'--temp',
		'0',
		'--weather',
		'0',
		'--top-n',
		String(topN)
	];

	const pythonRunners: Array<{ cmd: string; prefix: string[] }> = [];
	if (process.env.PYTHON_BIN) {
		pythonRunners.push({ cmd: process.env.PYTHON_BIN, prefix: [] });
	}
	pythonRunners.push({ cmd: 'python', prefix: [] });
	pythonRunners.push({ cmd: 'py', prefix: ['-3'] });

	let lastError: unknown = null;
	for (const runner of pythonRunners) {
		try {
			const { stdout, stderr } = await execFileAsync(runner.cmd, [...runner.prefix, ...recommendArgs], {
				env,
				timeout: 30_000,
				maxBuffer: 1024 * 1024,
				encoding: 'utf8'
			});

			const payload = parsePythonPayload(stdout);
			if (!payload.ok) {
				throw new Error(payload.error || stderr || 'Python recommender returned an error.');
			}

			const parsedRecommendations = (payload.recommendations ?? [])
				.map((row) => ({
					dish_id: Number(row.dish_id),
					chance_pct: Number(row['chance_%'])
				}))
				.filter((row) => Number.isFinite(row.dish_id) && Number.isFinite(row.chance_pct));

			pythonRecommendationCache.set(userId, {
				expiresAt: now + PYTHON_CACHE_TTL_MS,
				data: parsedRecommendations
			});

			return parsedRecommendations;
		} catch (error) {
			lastError = error;
		}
	}

	console.warn('[Recommendations] Python recommender unavailable, using fallback scoring.', lastError);
	return null;
}

function buildRecommendationsFromPython(
	pythonRows: PythonRecommendation[],
	dishMetaMap: Map<number, DishMeta>,
	topN: number
): Recommendation[] {
	return pythonRows
		.map((row) => {
			const meta = dishMetaMap.get(row.dish_id);
			if (!meta || meta.max_orderable <= 0) return null;

			return {
				dish_id: row.dish_id,
				dish_name: meta.dish_name,
				chance: Math.max(0, Math.min(100, Math.round(row.chance_pct * 100) / 100)),
				max_orderable: meta.max_orderable
			};
		})
		.filter((row): row is Recommendation => row !== null)
		.sort((a, b) => b.chance - a.chance)
		.slice(0, topN);
}

function clientDisplayName(user: User): string {
	const u = user;
	return (
		(u.user_metadata?.display_name as string | undefined) ||
		(u.user_metadata?.full_name as string | undefined) ||
		u.email?.split('@')[0] ||
		'Anonymous'
	);
}

export const load: PageServerLoad = async ({ locals, depends, url }) => {
	depends('supabase:db');

	if (!locals.user) {
		return {
			recommendations: [] as Recommendation[],
			activeOrders: [],
			activeOrdersError: null,
			latestFoods: [],
			latestFoodsError: null,
			pickupQrEnabled: false
		};
	}

	const displayName = clientDisplayName(locals.user);
	const ticketSecretOk = orderTicketSecretConfigured();

	const { data, error } = await locals.supabase
		.from('client_order')
		.select('id, dish(name), created_at, planned_pickup, is_done, id_plate')
		.eq('id_client', locals.user.id)
		.eq('is_done', 0)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error loading active orders:', error.message);
	}

	const activeOrders = (data ?? []).map(
		(o: {
			id: unknown;
			dish?: unknown;
			created_at?: string | null;
			planned_pickup?: string | null;
			is_done?: unknown;
			id_plate?: unknown;
		}) => ({
			id: o.id,
			dish_name: extractDishName(o.dish),
			created_at: o.created_at ?? null,
			planned_pickup: o.planned_pickup ?? null,
			is_done: o.is_done,
			id_plate: o.id_plate
		})
	);

	const { data: latestData, error: latestError } = await locals.supabase
		.from('client_order')
		.select('id, dish(name), created_at, planned_pickup, is_done')
		.eq('id_client', locals.user.id)
		.is('received_at', null)
		.order('created_at', { ascending: false })
		.limit(10);

	if (latestError) {
		console.error('Error loading latest foods:', latestError.message);
	}

	const latestFoods = (latestData ?? []).map(
		(o: { id: unknown; dish?: unknown; created_at?: string | null; planned_pickup?: string | null; is_done?: unknown }) => {
			const id = Number(o.id);
			const dish_name = extractDishName(o.dish);
			const isDone = o.is_done === 1 || o.is_done === '1' || o.is_done === true;
			let pickup_qr_url: string | null = null;
			if (ticketSecretOk && isDone && Number.isFinite(id)) {
				const token = signOrderTicket({
					id,
					dish: dish_name,
					client: displayName
				});
				if (token) {
					pickup_qr_url = `${url.origin}/order/pickup?token=${encodeURIComponent(token)}`;
				}
			}
			return {
				id: o.id,
				dish_name,
				planned_pickup: o.planned_pickup ?? null,
				is_done: o.is_done,
				pickup_qr_url
			};
		}
	);

	// --- Dish recommendations (mirrors python_code/recomendations.py logic) ---
	let recommendations: Recommendation[] = [];
	try {
		const topN = 5;

		const { data: allDishes } = await locals.supabase
			.from('dish')
			.select('id, name, link_dish_recipe(product(quantity))');

		const dishMetaMap = buildDishMetaMap((allDishes ?? []) as unknown[]);

		const pythonRows = await getPythonRecommendations(locals.user.id, topN);
		if (pythonRows && pythonRows.length > 0) {
			recommendations = buildRecommendationsFromPython(pythonRows, dishMetaMap, topN);
		}

		if (recommendations.length > 0) {
			return {
				recommendations,
				activeOrders,
				activeOrdersError: error?.message ?? null,
				latestFoods,
				latestFoodsError: latestError?.message ?? null,
				pickupQrEnabled: ticketSecretOk
			};
		}

		const now = new Date();
		const currentHour = now.getHours();
		const currentDow = now.getDay();

		const { data: historyData } = await locals.supabase
			.from('client_order')
			.select('id_dish, created_at, weather, dish(name)')
			.eq('id_client', locals.user.id)
			.order('created_at', { ascending: false })
			.limit(200);

		const dishStockMap = new Map<number, number>();
		const availableDishIds = new Set<number>();
		for (const [dishId, meta] of dishMetaMap) {
			dishStockMap.set(dishId, meta.max_orderable);
			if (meta.max_orderable > 0) availableDishIds.add(dishId);
		}

		const { data: currentWeather } = await locals.supabase
			.from('weather')
			.select('id')
			.limit(100);

		const weatherIds = (currentWeather ?? []).map((w: any) => w.id);
		const randomWeatherId = weatherIds.length > 0
			? weatherIds[Math.floor(Math.random() * weatherIds.length)]
			: null;

		if (historyData && historyData.length >= 3) {
			const dishScores = new Map<number, { score: number; name: string }>();

			for (const order of historyData) {
				const dishId = order.id_dish as number;
				const name = extractDishName(order.dish);
				if (!dishId || !availableDishIds.has(dishId)) continue;

				const entry = dishScores.get(dishId) ?? { score: 0, name };
				entry.score += 1;

				if (order.created_at) {
					const orderDate = new Date(order.created_at);
					if (Math.abs(orderDate.getHours() - currentHour) <= 2) entry.score += 2;
					if (orderDate.getDay() === currentDow) entry.score += 1.5;
				}

				if (randomWeatherId != null && order.weather != null && Number(order.weather) === randomWeatherId) {
					entry.score += 1.5;
				}

				dishScores.set(dishId, entry);
			}

			const totalScore = [...dishScores.values()].reduce((s, d) => s + d.score, 0);
			recommendations = [...dishScores.entries()]
				.map(([dish_id, { score, name }]) => ({
					dish_id,
					dish_name: name,
					chance: totalScore > 0 ? Math.round((score / totalScore) * 10000) / 100 : 0,
					max_orderable: dishStockMap.get(dish_id) ?? 0
				}))
				.sort((a, b) => b.chance - a.chance)
				.slice(0, 5);
		}
	} catch (e) {
		console.error('Error generating recommendations:', e);
	}

	return {
		recommendations,
		activeOrders,
		activeOrdersError: error?.message ?? null,
		latestFoods,
		latestFoodsError: latestError?.message ?? null,
		pickupQrEnabled: ticketSecretOk
	};
};
