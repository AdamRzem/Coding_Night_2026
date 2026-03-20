import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const { data, error } = await locals.supabase
        .from('product')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error loading products:', error.message);
        return { items: [], tableName: 'products' };
    }

    return { items: data ?? [], tableName: 'products' };
};
