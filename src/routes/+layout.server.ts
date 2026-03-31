import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('supabase:auth');
	depends('supabase:db');

	let isWorker: boolean | null = null;

	if (locals.user) {
		try {
			const { data, error } = await locals.supabase
				.from('user_data')
				.select('is_worker')
				.eq('id_user', locals.user.id)
				.maybeSingle();

			if (error) {
				console.warn('[Layout] Failed to resolve is_worker flag:', error.message);
			} else if (data) {
				const raw = data.is_worker;
				isWorker = raw === 1 || raw === '1' || raw === true;
			}
		} catch (error) {
			// Keep layout rendering even if the DB request fails (network, provider outage, etc.).
			console.error('[Layout] Unexpected error resolving worker flag:', error);
		}
	}

	return {
		user: locals.user,
		isWorker
	};
};
