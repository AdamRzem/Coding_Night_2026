import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

export const load: PageServerLoad = async () => {
	const { data, error } = await supabase
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
