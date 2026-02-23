/**
 * ============================================================================
 * authHelpers — All authentication functions in one place
 * authHelpers — Wszystkie funkcje autoryzacji w jednym miejscu
 * ============================================================================
 *
 * This file contains reusable functions for:
 * Ten plik zawiera wielokrotnego użytku funkcje do:
 *
 * 1. signInWithEmail        — Sign in with email + password / Logowanie emailem i hasłem
 * 2. signUpWithEmail        — Register with email + password / Rejestracja emailem i hasłem
 * 3. signInWithOAuth        — Sign in with Google, GitHub, etc. / Logowanie przez Google, GitHub, itp.
 * 4. signOut                — Sign out / Wylogowanie
 * 5. getCurrentUser         — Get the current logged-in user / Pobierz aktualnie zalogowanego użytkownika
 * 6. getUserDisplayName     — Get display name from user object / Pobierz wyświetlaną nazwę z obiektu użytkownika
 * 7. requireAuth            — Check if user is logged in (for server-side protection)
 *                              Sprawdź czy użytkownik jest zalogowany (ochrona po stronie serwera)
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { fail } from '@sveltejs/kit';

// ===========================================================================
// 1. SIGN IN WITH EMAIL + PASSWORD
//    LOGOWANIE EMAILEM I HASŁEM
// ===========================================================================

/**
 * Signs in a user with email and password.
 * Loguje użytkownika emailem i hasłem.
 *
 * USE THIS ON: the login page (client-side, in +page.svelte)
 * UŻYJ NA:     stronie logowania (po stronie klienta, w +page.svelte)
 *
 * @param supabase  — The browser Supabase client (from supabaseClient.ts or createBrowserClient)
 *                     Klient Supabase przeglądarki (z supabaseClient.ts lub createBrowserClient)
 *
 * @param email     — User's email address / Adres email użytkownika
 *
 * @param password  — User's password / Hasło użytkownika
 *
 * EXAMPLE / PRZYKŁAD:
 *   const { user, error } = await signInWithEmail(supabase, 'john@example.com', 'password123');
 *   if (error) { showError(error); } else { goto('/'); }
 */
export async function signInWithEmail(
	supabase: SupabaseClient,
	email: string,
	password: string
) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	return {
		user: data?.user ?? null,
		session: data?.session ?? null,
		error: error?.message ?? null
	};
}

// ===========================================================================
// 2. SIGN UP WITH EMAIL + PASSWORD
//    REJESTRACJA EMAILEM I HASŁEM
// ===========================================================================

/**
 * Registers a new user with email, password, and optional metadata.
 * Rejestruje nowego użytkownika emailem, hasłem i opcjonalnymi metadanymi.
 *
 * USE THIS ON: the register page (client-side, in +page.svelte)
 * UŻYJ NA:     stronie rejestracji (po stronie klienta, w +page.svelte)
 *
 * @param supabase     — The browser Supabase client
 *                        Klient Supabase przeglądarki
 *
 * @param email        — New user's email / Email nowego użytkownika
 *
 * @param password     — New user's password (min 6 characters in Supabase default)
 *                        Hasło nowego użytkownika (min 6 znaków domyślnie w Supabase)
 *
 * @param metadata     — CHANGE THIS: Additional user data to store
 *                        ZMIEŃ TO: Dodatkowe dane użytkownika do zapisania
 *
 *                        ⚠️ This data is stored in user_metadata and is accessible via user.user_metadata
 *                        ⚠️ Te dane są zapisane w user_metadata i dostępne przez user.user_metadata
 *
 *                        Example / Przykład:
 *                        { display_name: 'John', avatar_url: 'https://...' }
 *                        { full_name: 'Jan Kowalski', role: 'admin' }
 *
 * @param redirectTo   — CHANGE THIS: URL to redirect to after email confirmation
 *                        ZMIEŃ TO: URL do przekierowania po potwierdzeniu emaila
 *
 *                        For local dev / Dla lokalnego dev: 'http://localhost:5173/auth/callback'
 *                        For production / Dla produkcji: 'https://yourdomain.com/auth/callback'
 *
 *                        ⚠️ This MUST be added to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 *                        ⚠️ To MUSI być dodane w Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 *
 * EXAMPLE / PRZYKŁAD:
 *   const { user, error } = await signUpWithEmail(supabase, 'john@example.com', 'password123', {
 *     display_name: 'John'
 *   }, 'http://localhost:5173/auth/callback');
 */
export async function signUpWithEmail(
	supabase: SupabaseClient,
	email: string,
	password: string,
	metadata: Record<string, string> = {},   // ← CHANGE: your user metadata fields / ZMIEŃ: pola metadanych użytkownika
	redirectTo: string = ''                   // ← CHANGE: your callback URL / ZMIEŃ: twój URL callback
) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			// ---------------------------------------------------------------
			// data: {} — custom metadata stored on the user object
			//            niestandardowe metadane zapisane na obiekcie użytkownika
			// Access later via: user.user_metadata.display_name
			// Dostęp później przez: user.user_metadata.display_name
			// ---------------------------------------------------------------
			data: metadata,

			// ---------------------------------------------------------------
			// emailRedirectTo — where to redirect after clicking the confirmation email link
			//                    gdzie przekierować po kliknięciu linku potwierdzającego w emailu
			// MUST point to your /auth/callback route / MUSI wskazywać na twoją trasę /auth/callback
			// ---------------------------------------------------------------
			...(redirectTo ? { emailRedirectTo: redirectTo } : {})
		}
	});

	return {
		user: data?.user ?? null,
		session: data?.session ?? null,
		error: error?.message ?? null
	};
}

// ===========================================================================
// 3. SIGN IN WITH OAUTH (Google, GitHub, Discord, etc.)
//    LOGOWANIE PRZEZ OAUTH (Google, GitHub, Discord, itp.)
// ===========================================================================

/**
 * Signs in with an OAuth provider (Google, GitHub, Discord, Apple, etc.).
 * Loguje przez dostawcę OAuth (Google, GitHub, Discord, Apple, itp.).
 *
 * ⚠️ BEFORE USING: You must enable the OAuth provider in Supabase Dashboard:
 * ⚠️ PRZED UŻYCIEM: Musisz włączyć dostawcę OAuth w Supabase Dashboard:
 *    Supabase Dashboard → Authentication → Providers → Enable [Google/GitHub/etc.]
 *    And add the client ID + secret from the provider's console
 *    I dodać client ID + secret z konsoli dostawcy
 *
 * @param supabase   — The browser Supabase client
 *                      Klient Supabase przeglądarki
 *
 * @param provider   — CHANGE THIS: The OAuth provider name
 *                      ZMIEŃ TO: Nazwa dostawcy OAuth
 *
 *                      Available providers / Dostępni dostawcy:
 *                      'google' | 'github' | 'discord' | 'apple' | 'facebook' |
 *                      'twitter' | 'azure' | 'gitlab' | 'bitbucket' | 'spotify' | etc.
 *
 * @param redirectTo — CHANGE THIS: Where to redirect after OAuth
 *                      ZMIEŃ TO: Gdzie przekierować po OAuth
 *                      Example / Przykład: `${window.location.origin}/auth/callback`
 *
 * EXAMPLE / PRZYKŁAD:
 *   await signInWithOAuth(supabase, 'google', `${window.location.origin}/auth/callback`);
 *   await signInWithOAuth(supabase, 'github', `${window.location.origin}/auth/callback`);
 */
export async function signInWithOAuth(
	supabase: SupabaseClient,
	provider: 'google' | 'github' | 'discord' | 'apple' | 'facebook' | 'twitter' | string, // ← CHANGE: your provider / ZMIEŃ: twój dostawca
	redirectTo: string   // ← CHANGE: your callback URL / ZMIEŃ: twój URL callback
) {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: provider as any,
		options: {
			redirectTo   // ← where to go after login / gdzie przejść po logowaniu
		}
	});

	return {
		url: data?.url ?? null,   // The OAuth provider's login page URL / URL strony logowania dostawcy OAuth
		error: error?.message ?? null
	};
}

// ===========================================================================
// 4. SIGN OUT
//    WYLOGOWANIE
// ===========================================================================

/**
 * Signs the user out (clears session).
 * Wylogowuje użytkownika (czyści sesję).
 *
 * EXAMPLE / PRZYKŁAD:
 *   await signOut(supabase);
 *   goto('/');
 */
export async function signOut(supabase: SupabaseClient) {
	const { error } = await supabase.auth.signOut();
	return { error: error?.message ?? null };
}

// ===========================================================================
// 5. GET CURRENT USER (server-side)
//    POBIERZ AKTUALNEGO UŻYTKOWNIKA (po stronie serwera)
// ===========================================================================

/**
 * Gets the currently authenticated user (from JWT token).
 * Pobiera aktualnie uwierzytelionego użytkownika (z tokenu JWT).
 *
 * USE THIS IN: +page.server.ts or hooks.server.ts
 * UŻYJ W:      +page.server.ts lub hooks.server.ts
 *
 * ⚠️ IMPORTANT: Always use getUser() for security, NOT getSession()!
 * ⚠️ WAŻNE: Zawsze używaj getUser() dla bezpieczeństwa, NIE getSession()!
 * getSession() reads from cookies (can be tampered with)
 * getUser() validates the JWT against Supabase Auth server (secure)
 *
 * EXAMPLE / PRZYKŁAD:
 *   const user = await getCurrentUser(locals.supabase);
 *   if (!user) { return fail(401, { error: 'Not logged in' }); }
 */
export async function getCurrentUser(supabase: SupabaseClient): Promise<User | null> {
	// -----------------------------------------------------------------------
	// Step 1: getSession() — reads cookies and refreshes expired tokens
	//         MUST be called first to set up the auth headers!
	// Krok 1: getSession() — czyta cookies i odświeża wygasłe tokeny
	//         MUSI być wywołane pierwsze żeby ustawić nagłówki autoryzacji!
	// -----------------------------------------------------------------------
	const { data: { session } } = await supabase.auth.getSession();

	if (!session) return null;

	// -----------------------------------------------------------------------
	// Step 2: getUser() — securely validates the JWT (contacts Supabase Auth server)
	// Krok 2: getUser() — bezpiecznie waliduje JWT (kontaktuje się z serwerem Supabase Auth)
	// -----------------------------------------------------------------------
	const { data: { user }, error } = await supabase.auth.getUser();

	if (error) {
		console.error('[getCurrentUser] Error getting user:', error.message);
		return null;
	}

	return user;
}

// ===========================================================================
// 6. GET USER DISPLAY NAME
//    POBIERZ WYŚWIETLANĄ NAZWĘ UŻYTKOWNIKA
// ===========================================================================

/**
 * Extracts display name from a Supabase User object.
 * Wyciąga wyświetlaną nazwę z obiektu User Supabase.
 *
 * Checks (in order / sprawdza w kolejności):
 * 1. user_metadata.display_name  — set during signUp / ustawione przy rejestracji
 * 2. user_metadata.full_name     — set by OAuth providers (Google) / ustawione przez dostawców OAuth
 * 3. email username (before @)   — fallback / zapasowe
 * 4. 'Anonymous'                 — last resort / ostateczność
 *
 * EXAMPLE / PRZYKŁAD:
 *   const name = getUserDisplayName(user);  // → "John" or "john" or "Anonymous"
 */
export function getUserDisplayName(user: User | null): string {
	if (!user) return 'Anonymous';

	return (
		user.user_metadata?.display_name ||   // ← from signUp metadata / z metadanych rejestracji
		user.user_metadata?.full_name ||       // ← from OAuth (Google writes full_name) / z OAuth
		user.email?.split('@')[0] ||           // ← email prefix as fallback / przedrostek emaila jako zapasowy
		'Anonymous'                            // ← ultimate fallback / ostateczny zapasowy
	);
}

// ===========================================================================
// 7. REQUIRE AUTH (server-side protection)
//    WYMAGAJ AUTORYZACJI (ochrona po stronie serwera)
// ===========================================================================

/**
 * Checks if the user is authenticated. Returns fail(401) if not.
 * Sprawdza czy użytkownik jest uwierzytelniony. Zwraca fail(401) jeśli nie.
 *
 * USE THIS IN: SvelteKit form actions or server load functions
 * UŻYJ W:      akcjach formularzy SvelteKit lub funkcjach server load
 *
 * ⚠️ locals.user is set in hooks.server.ts — make sure it's configured!
 * ⚠️ locals.user jest ustawione w hooks.server.ts — upewnij się że jest skonfigurowane!
 *
 * EXAMPLE / PRZYKŁAD:
 *   export const actions = {
 *     create: async ({ request, locals }) => {
 *       const authCheck = requireAuth(locals.user);
 *       if (authCheck) return authCheck;  // ← returns 401 error if not logged in
 *                                         //    zwraca błąd 401 jeśli nie zalogowany
 *       // ... rest of your action / reszta twojej akcji
 *     }
 *   };
 */
export function requireAuth(user: User | null) {
	if (!user) {
		// ---------------------------------------------------------------
		// fail(401, {...}) — returns HTTP 401 (Unauthorized) with an error message
		// fail(401, {...}) — zwraca HTTP 401 (Nieautoryzowany) z komunikatem błędu
		//
		// CHANGE the error message to match your app's language
		// ZMIEŃ komunikat błędu aby pasował do języka twojej aplikacji
		// ---------------------------------------------------------------
		return fail(401, { error: 'You must be signed in / Musisz być zalogowany' });
	}
	return null; // ← null means "all good, user is logged in" / null oznacza "wszystko OK, użytkownik zalogowany"
}
