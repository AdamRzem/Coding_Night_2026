import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

type BlogPost = {
  id: number;
  title: string;
  text: string;
  createdAt: string;
  user_id: string | null;
  user_display_name: string | null;
};

export const load: PageServerLoad = async ({ locals }) => {
  const { data, error } = await locals.supabase
    .from('BlogPost')
    .select('*')
    .order('createdAt', { ascending: false });
    // .limit(3);

  if (error) {
    console.error('Error loading blog posts:', error.message);
    return { blogPosts: [] };
  }

  return {
    blogPosts: (data ?? []) as BlogPost[],
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'You must be signed in to create a post' });
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString()?.trim();
    const text = formData.get('text')?.toString()?.trim();

    if (!title || !text) {
      return fail(400, { error: 'Title and text are required', title, text });
    }

    const user = locals.user;
    const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';

    const { data, error } = await locals.supabase
      .from('BlogPost')
      .insert({ title, text, user_id: user.id, user_display_name: displayName })
      .select()
      .single();

    if (error) {
      return fail(500, { error: error.message, title, text });
    }

    return { success: true, post: data };
  }
};