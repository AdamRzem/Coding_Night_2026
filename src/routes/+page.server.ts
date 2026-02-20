import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/supabaseClient';
import { fail } from '@sveltejs/kit';

type BlogPost = {
  id: number;
  title: string;
  text: string;
  createdAt: string;
};

export const load: PageServerLoad = async () => {
  const { data, error } = await supabase
    .from('BlogPost')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error loading blog posts:', error.message);
    return { blogPosts: [] };
  }

  return {
    blogPosts: (data ?? []) as BlogPost[],
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title')?.toString()?.trim();
    const text = formData.get('text')?.toString()?.trim();

    if (!title || !text) {
      return fail(400, { error: 'Title and text are required', title, text });
    }

    const { data, error } = await supabase
      .from('BlogPost')
      .insert({ title, text })
      .select()
      .single();

    if (error) {
      return fail(500, { error: error.message, title, text });
    }

    return { success: true, post: data };
  }
};