import type { PageServerLoad } from './$types';
import type { User } from '@supabase/supabase-js';
import { extractDishName } from '$lib/supabaseOrderHelpers';
import { orderTicketSecretConfigured, signOrderTicket } from '$lib/orderTicketToken';

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
		.select('id, dish(name), created_at, is_done')
		.eq('id_client', locals.user.id)
		.order('created_at', { ascending: false })
		.limit(10);

	if (latestError) {
		console.error('Error loading latest foods:', latestError.message);
	}

	const latestFoods = (latestData ?? []).map(
		(o: { id: unknown; dish?: unknown; created_at?: string | null; is_done?: unknown }) => {
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
				created_at: o.created_at ?? null,
				is_done: o.is_done,
				pickup_qr_url
			};
		}
	);

	return {
		activeOrders,
		activeOrdersError: error?.message ?? null,
		latestFoods,
		latestFoodsError: latestError?.message ?? null,
		pickupQrEnabled: ticketSecretOk
	};
};
