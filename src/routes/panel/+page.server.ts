import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(303, '/login');
    }

    const { data, error } = await locals.supabase
        .from('user_data')
        .select('is_worker')
        .eq('id_user', locals.user.id)
        .maybeSingle();

    if (error) {
        console.error('Failed to read user_data:', error.message);
        redirect(303, '/client');
    }

    const rawFlag = data?.is_worker;
    const isWorker = rawFlag === 1 || rawFlag === '1' || rawFlag === true;

    redirect(303, isWorker ? '/employee' : '/client');
};
