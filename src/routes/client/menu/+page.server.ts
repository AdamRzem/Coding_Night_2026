import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
    depends('supabase:db');

    const { data, error } = await locals.supabase
        .from('dish')
        .select('id, name, prep_time_minutes, link_dish_recipe(product(name))')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error loading menu:', error.message);
        return { dishes: [], error: error.message };
    }

    const dishes = (data ?? []).map((d: any) => ({
        id: d.id as number,
        name: (d.name ?? '—') as string,
        prep_time_minutes: d.prep_time_minutes as number | null,
        products: ((d.link_dish_recipe ?? []) as any[])
            .map((lr: any) => lr.product?.name as string | undefined)
            .filter((n): n is string => Boolean(n))
    }));

    return { dishes, error: null };
};
