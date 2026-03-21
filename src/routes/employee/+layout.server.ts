import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent, locals, depends }) => {
    depends('supabase:db');
    const { user, isWorker } = await parent();

    if (!user) {
        redirect(303, '/login');
    }

    if (!isWorker) {
        redirect(303, '/client');
    }

    const { data: worker } = await locals.supabase
        .from('worker')
        .select('id')
        .eq('id_user', user.id)
        .maybeSingle();

    return { workerId: worker?.id ?? null };
};
