import type { PageServerLoad } from './$types';
import type { User } from '@supabase/supabase-js';
import { extractDishName } from '$lib/supabaseOrderHelpers';
import { orderTicketSecretConfigured, signOrderTicket } from '$lib/orderTicketToken';

type Recommendation = { dish_id: number; dish_name: string; chance: number; max_orderable: number };

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

	// --- Dish recommendations (mirrors scripts/main.py logic) ---
	let recommendations: Recommendation[] = [];
	try {
		const now = new Date();
		const currentHour = now.getHours();
		const currentDow = now.getDay();

		const { data: historyData } = await locals.supabase
			.from('client_order')
			.select('id_dish, created_at, weather, dish(name)')
			.eq('id_client', locals.user.id)
			.order('created_at', { ascending: false })
			.limit(200);

		const { data: allDishes } = await locals.supabase
			.from('dish')
			.select('id, link_dish_recipe(product(id, quantity))');

		const dishStockMap = new Map<number, number>();
		const availableDishIds = new Set<number>();
		for (const d of (allDishes ?? []) as any[]) {
			const links = (d.link_dish_recipe ?? []) as any[];
			const quantities = links.map(
				(lr: any) => lr.product?.quantity != null ? Number(lr.product.quantity) : 0
			);
			const maxOrderable = quantities.length > 0 ? Math.min(...quantities) : 0;
			dishStockMap.set(d.id as number, maxOrderable);
			if (maxOrderable > 0) availableDishIds.add(d.id as number);
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
