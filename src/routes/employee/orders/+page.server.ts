import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, parent, depends }) => {
    depends('supabase:db');
    const { workerId } = await parent();

    const { data, error } = await locals.supabase
        .from('client_order')
        .select('id, id_dish, created_at, planned_pickup, is_done, id_plate, dish(name, prep_time_minutes, link_dish_recipe(product(name)))')
        .is('id_worker', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading orders:', error.message);
        return { orders: [], workerId, error: error.message };
    }

    const orders = (data ?? []).map((o: any) => ({
        id: o.id,
        dish_name: o.dish?.name ?? '—',
        prep_time_minutes: o.dish?.prep_time_minutes ?? null,
        created_at: o.created_at,
        planned_pickup: o.planned_pickup,
        is_done: o.is_done,
        id_plate: o.id_plate,
        products: (o.dish?.link_dish_recipe ?? []).map((lr: any) => lr.product?.name ?? '—')
    }));

    return { orders, workerId, error: null };
};

export const actions: Actions = {
    claim: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { error: 'Not authenticated' });

        const formData = await request.formData();
        const orderId = formData.get('orderId');
        if (!orderId) return fail(400, { error: 'Missing order ID' });

        const { data: worker } = await locals.supabase
            .from('worker')
            .select('id')
            .eq('id_user', locals.user.id)
            .single();

        if (!worker) return fail(400, { error: 'Worker record not found' });

        const { error } = await locals.supabase
            .from('client_order')
            .update({ id_worker: worker.id })
            .eq('id', Number(orderId))
            .is('id_worker', null);

        if (error) return fail(500, { error: error.message });

        return { success: true };
    }
};
