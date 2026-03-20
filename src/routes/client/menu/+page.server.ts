import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const { data, error } = await locals.supabase
        .from('dishes')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error loading menu:', error.message);
        return { items: [] };
    }

    return { items: data ?? [] };
};
