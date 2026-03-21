import type { PageServerLoad } from './$types';
import { seedFromDateString, shuffleSeeded } from '$lib/menuOfTheDay';

const MENU_OF_THE_DAY_COUNT = 5;

export const load: PageServerLoad = async ({ locals, depends }) => {
    depends('supabase:db');

    const { data, error } = await locals.supabase
        .from('dish')
        .select('id, name, prep_time_minutes, link_dish_recipe(product(id, name, quantity))')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error loading menu:', error.message);
        return {
            dishes: [],
            menuOfTheDay: [],
            menuOfTheDayDateLabel: '',
            error: error.message
        };
    }

    const allDishes = (data ?? []).map((d: any) => {
        const links = ((d.link_dish_recipe ?? []) as any[]);
        const products = links
            .map((lr: any) => lr.product?.name as string | undefined)
            .filter((n): n is string => Boolean(n));
        const quantities = links.map(
            (lr: any) => lr.product?.quantity != null ? Number(lr.product.quantity) : 0
        );
        const max_orderable = quantities.length > 0 ? Math.min(...quantities) : 0;
        const available = max_orderable > 0;
        return {
            id: d.id as number,
            name: (d.name ?? '—') as string,
            prep_time_minutes: d.prep_time_minutes as number | null,
            products,
            available,
            max_orderable
        };
    });

    const dishes = allDishes.filter((d) => d.available);

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayLocal = `${y}-${m}-${d}`;
    const seed = seedFromDateString(todayLocal);
    const shuffled = shuffleSeeded(dishes, seed);
    const menuOfTheDay = shuffled.slice(0, Math.min(MENU_OF_THE_DAY_COUNT, shuffled.length));
    const featuredIds = new Set(menuOfTheDay.map((dish) => dish.id));
    const restDishes = dishes.filter((dish) => !featuredIds.has(dish.id));

    const menuOfTheDayDateLabel = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(now);

    return {
        dishes: restDishes,
        menuOfTheDay,
        menuOfTheDayDateLabel,
        error: null
    };
};
