import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
    const { user, isWorker } = await parent();

    if (!user) {
        redirect(303, '/login');
    }

    if (!isWorker) {
        redirect(303, '/client');
    }

    return {};
};
