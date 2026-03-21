import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, depends }) => {
    depends('supabase:db');

    const { data, error } = await locals.supabase
        .from('dish')
        .select('id, name, link_dish_recipe(product(id, quantity))')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error loading dishes for cart:', error.message);
        return { dishes: [] };
    }

    const available = (data ?? []).filter((d: any) => {
        const links = (d.link_dish_recipe ?? []) as any[];
        return links.every(
            (lr: any) => lr.product?.quantity != null && Number(lr.product.quantity) > 0
        );
    }).map((d: any) => ({ id: d.id, name: d.name }));

    return { dishes: available };
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

        const { data: weatherRows, error: weatherErr } = await locals.supabase
            .from('weather')
            .select('id, weather');

        if (weatherErr) {
            console.error('Error loading weather options:', weatherErr.message);
        }

        const weatherOptions = (weatherRows ?? []).filter(
            (r: { weather?: string | null }) => r.weather != null && String(r.weather).trim() !== ''
        );
        const picked =
            weatherOptions.length > 0
                ? weatherOptions[Math.floor(Math.random() * weatherOptions.length)]
                : null;
        const weather = picked?.weather != null ? String(picked.weather) : null;
        /** No longer from sensor; kept null unless you add columns to `weather` table. */
        const tempCelsius: number | null = null;
        const humidity: number | null = null;

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
            humidity
        }));

        const { error } = await locals.supabase
            .from('client_order')
            .insert(rows);

        if (error) {
            console.error('Error placing orders:', error.message);
            return fail(500, { error: error.message });
        }

        // --- Decrement product quantities for each ordered dish ---
        const uniqueDishIds = [...new Set(dishIds)];
        const dishCounts = new Map<number, number>();
        for (const id of dishIds) dishCounts.set(id, (dishCounts.get(id) ?? 0) + 1);

        const { data: recipeLinks } = await locals.supabase
            .from('link_dish_recipe')
            .select('id_dish, id_product')
            .in('id_dish', uniqueDishIds);

        if (recipeLinks && recipeLinks.length > 0) {
            const productDecrements = new Map<number, number>();
            for (const link of recipeLinks) {
                const dishQty = dishCounts.get(link.id_dish) ?? 0;
                productDecrements.set(
                    link.id_product,
                    (productDecrements.get(link.id_product) ?? 0) + dishQty
                );
            }

            const productIds = [...productDecrements.keys()];
            const { data: products } = await locals.supabase
                .from('product')
                .select('id, quantity')
                .in('id', productIds);

            if (products) {
                for (const product of products) {
                    const decrement = productDecrements.get(product.id) ?? 0;
                    const newQty = Math.max(0, (product.quantity ?? 0) - decrement);
                    await locals.supabase
                        .from('product')
                        .update({ quantity: newQty })
                        .eq('id', product.id);

                    // Auto-create product_order if quantity drops below 10
                    if (newQty < 10) {
                        const { data: existingOrder } = await locals.supabase
                            .from('product_order')
                            .select('id')
                            .eq('id_product', product.id)
                            .in('status', ['suggested', 'accepted', 'in_progress'])
                            .maybeSingle();

                        if (!existingOrder) {
                            await locals.supabase
                                .from('product_order')
                                .insert({
                                    id_product: product.id,
                                    quantity: 50,
                                    status: 'suggested'
                                });
                        }
                    }
                }
            }
        }

        return { success: true, count: rows.length };
    }
};
