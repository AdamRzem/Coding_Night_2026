import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

type BlogPost = {
  id: number;
  title: string;
  text: string;
  ostatnia_zmiana: string;
  user_id: string | null;
  user_display_name: string | null;
  czy_na_bocznicy: number;
};

export const load: PageServerLoad = async ({ locals, depends }) => {
  depends('supabase:db');
  const { data, error } = await locals.supabase
    .from('wagony')
    .select('*')
    .order('ostatnia_zmiana', { ascending: false });
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
  toggle: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'You must be signed in' });
    }

    const formData = await request.formData();
    const id = Number(formData.get('id'));

    if (!id) {
      return fail(400, { error: 'ID is required' });
    }

    console.log('Toggle called with id:', id);

    // Fetch current value
    const { data: post, error: fetchError } = await locals.supabase
      .from('wagony')
      .select('id, czy_na_bocznicy')
      .eq('id', id)
      .single();

    console.log('Fetched post:', post, 'Error:', fetchError);

    if (fetchError || !post) {
      console.log('Post not found for id:', id);
      return fail(404, { error: 'Post not found' });
    }

    const newValue = post.czy_na_bocznicy === 1 ? 0 : 1;
    console.log('Current czy_na_bocznicy:', post.czy_na_bocznicy, '-> New value:', newValue);

    const { data: updated, error: updateError } = await locals.supabase
      .from('wagony')
      .update({ czy_na_bocznicy: newValue, ostatnia_zmiana: new Date().toISOString() })
      .eq('id', id)
      .select();

    console.log('Update result:', updated, 'Error:', updateError);

    if (updateError) {
      return fail(500, { error: updateError.message });
    }

    return { success: true };
  }
};