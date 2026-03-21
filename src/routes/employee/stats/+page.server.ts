import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, depends }) => {
    depends('supabase:db');
    const { workerId } = await parent();

    if (!workerId) {
        return { orderDates: [], totalOrders: 0 };
    }

    const { data, error } = await locals.supabase
        .from('client_order')
        .select('created_at')
        .eq('id_worker', workerId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading stats:', error.message);
        return { orderDates: [], totalOrders: 0 };
    }

    const dates = (data ?? []).map((o: any) => o.created_at);

    return { orderDates: dates, totalOrders: dates.length };
};
