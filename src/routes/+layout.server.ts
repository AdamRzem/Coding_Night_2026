import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
    depends('supabase:auth');

    let isWorker: boolean | null = null;

    if (locals.user) {
        const { data } = await locals.supabase
            .from('user_data')
            .select('is_worker')
            .eq('id_user', locals.user.id)
            .maybeSingle();

        if (data) {
            const raw = data.is_worker;
            isWorker = raw === 1 || raw === '1' || raw === true;
        }
    }

    return {
        user: locals.user,
        isWorker
    };
};