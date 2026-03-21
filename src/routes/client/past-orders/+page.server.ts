import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
    depends('supabase:db');
    const { data, error } = await locals.supabase
        .from('orders')
        .select('*')
        .eq('user_id', locals.user!.id)
        .order('id', { ascending: false });

    if (error) {
        console.error('Error loading past orders:', error.message);
        return { items: [] };
    }

    return { items: data ?? [] };
};
