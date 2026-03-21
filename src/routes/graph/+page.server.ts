import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('supabase:db');
	const { data, error } = await locals.supabase
		.from('BlogPost')
		.select('createdAt')
		.order('createdAt', { ascending: true });

	if (error) {
		console.error('Error loading posts for graph:', error.message);
		return { postDates: [] };
	}

	return {
		postDates: (data ?? []).map((p) => p.createdAt)
	};
};
