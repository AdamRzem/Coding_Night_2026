import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
        cookies: {
            getAll: () => event.cookies.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                    event.cookies.set(name, value, {
                        ...options,
                        path: '/'
                    });
                });
            }
        }
    });

    // getSession() MUST be called first — it reads cookies, refreshes expired tokens,
    // and sets the client's internal auth headers so DB queries include the JWT.
    // Without this, all queries go as "anon" and auth.uid() is NULL in RLS.
    const { data: { session } } = await event.locals.supabase.auth.getSession();

    // getUser() validates the JWT by contacting the Supabase Auth server (secure).
    // We only trust the user object from getUser(), not from getSession().
    if (session) {
        const { data: { user }, error } = await event.locals.supabase.auth.getUser();
        event.locals.user = error ? null : user;
    } else {
        event.locals.user = null;
    }

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version';
        }
    });
};