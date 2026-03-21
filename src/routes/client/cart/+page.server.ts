import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, depends }) => {
    depends('supabase:db');

    const { data, error } = await locals.supabase
        .from('dish')
        .select('id, name')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error loading dishes for cart:', error.message);
        return { dishes: [] };
    }

    return { dishes: data ?? [] };
};

export const actions: Actions = {
    placeOrders: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { error: 'Not authenticated' });

        const formData = await request.formData();
        const dishIdsRaw = formData.get('dishIds')?.toString();
        const plannedPickup = formData.get('plannedPickup')?.toString();

        if (!dishIdsRaw) return fail(400, { error: 'Cart is empty' });
        if (!plannedPickup) return fail(400, { error: 'Pickup time is required' });

        const dishIds = JSON.parse(dishIdsRaw) as number[];
        if (!Array.isArray(dishIds) || dishIds.length === 0) {
            return fail(400, { error: 'Cart is empty' });
        }

        const pickupDate = new Date(plannedPickup);
        if (Number.isNaN(pickupDate.getTime())) {
            return fail(400, { error: 'Invalid pickup time' });
        }

        const { data: weatherRow } = await locals.supabase
            .from('temperature_and_humidity')
            .select('temperature, humidity')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();

        const weather = weatherRow
            ? `${weatherRow.temperature ?? ''}°C / ${weatherRow.humidity ?? ''}%`
            : null;
        const tempCelsius = weatherRow?.temperature != null
            ? Math.round(Number(weatherRow.temperature))
            : null;

        const now = new Date().toISOString();

        const { data: maxRow } = await locals.supabase
            .from('client_order')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();

        let nextId = (maxRow?.id as number ?? 0) + 1;

        const rows = dishIds.map((idDish) => ({
            id: nextId++,
            id_client: locals.user!.id,
            id_dish: idDish,
            created_at: now,
            planned_pickup: pickupDate.toISOString(),
            received_at: null,
            id_plate: null,
            id_worker: null,
            is_done: 0,
            weather,
            temp_celsius: tempCelsius,
            humidity: weatherRow?.humidity ?? null
        }));

        const { error } = await locals.supabase
            .from('client_order')
            .insert(rows);

        if (error) {
            console.error('Error placing orders:', error.message);
            return fail(500, { error: error.message });
        }

        return { success: true, count: rows.length };
    }
};
