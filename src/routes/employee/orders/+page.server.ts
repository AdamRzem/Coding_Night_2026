import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const { data, error } = await locals.supabase
        .from('client_order')
        .select('dish(name, prep_time_minutes), created_at, planned_pickup, received_at, id_plate')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading orders:', error.message);
        return { items: [], tableName: 'client_order', error: error.message };
    }

    return { items: data ?? [], tableName: 'client_order', error: null };
};
