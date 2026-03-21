import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
    depends('supabase:db');
    const { data, error } = await locals.supabase
        .from('dish')
        .select('name, prep_time_minutes')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error loading dishes:', error.message);
        return { items: [], tableName: 'dishes' };
    }

    return { items: data ?? [], tableName: 'dishes' };
};
