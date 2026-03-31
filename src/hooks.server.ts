import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import type { Handle, HandleServerError } from '@sveltejs/kit';

const PROTECTED_PATH_PREFIXES = ['/client', '/employee', '/panel', '/graph', '/order/pickup'];

function isProtectedRoute(path: string): boolean {
	return PROTECTED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '/'));
}

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

	try {
		// getSession() MUST be called first — it reads cookies, refreshes expired tokens,
		// and sets the client's internal auth headers so DB queries include the JWT.
		// Without this, all queries go as "anon" and auth.uid() is NULL in RLS.
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		// getUser() validates the JWT by contacting the Supabase Auth server (secure).
		// We only trust the user object from getUser(), not from getSession().
		if (session) {
			const {
				data: { user },
				error
			} = await event.locals.supabase.auth.getUser();
			event.locals.user = error ? null : user;
		} else {
			event.locals.user = null;
		}
	} catch (error) {
		event.locals.user = null;
		console.error('[Auth] Failed to resolve session/user in handle hook:', error);
	}

	const path = event.url.pathname;
	if (!event.locals.user && isProtectedRoute(path)) {
		throw redirect(303, '/login');
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	const requestId = crypto.randomUUID();

	console.error(
		`[${requestId}] ${event.request.method} ${event.url.pathname} failed with status ${status}:`,
		error
	);

	const publicMessageByStatus: Record<number, string> = {
		400: 'Request could not be processed. Please verify your input and try again.',
		404: message,
		500: 'Internal server error. Please try again in a moment.',
		502: 'A connected service returned an invalid response. Please retry shortly.',
		503: 'Service is temporarily unavailable. Please try again soon.',
		504: 'A dependent service timed out. Please retry.'
	};

	return {
		message:
			publicMessageByStatus[status] ??
			'Something went wrong while processing your request. Please try again in a moment.',
		requestId
	};
};
