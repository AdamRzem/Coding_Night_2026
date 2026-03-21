import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, depends }) => {
    depends('supabase:db');
    const { workerId } = await parent();

    if (!workerId) {
        return { claimedOrders: [] };
    }

    const { data, error } = await locals.supabase
        .from('client_order')
        .select('id, created_at, planned_pickup, is_done, received_at, id_plate, dish(name, prep_time_minutes)')
        .eq('id_worker', workerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading claimed orders:', error.message);
        return { claimedOrders: [] };
    }

    const claimedOrders = (data ?? []).map((o: any) => ({
        id: o.id,
        dish_name: o.dish?.name ?? '—',
        prep_time_minutes: o.dish?.prep_time_minutes ?? null,
        created_at: o.created_at,
        planned_pickup: o.planned_pickup,
        is_done: o.is_done,
        received_at: o.received_at,
        id_plate: o.id_plate
    }));

    return { claimedOrders };
};
