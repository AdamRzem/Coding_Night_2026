/**
 * ============================================================================
 * serverActionHelpers — Helper functions for SvelteKit server actions (+page.server.ts)
 * serverActionHelpers — Funkcje pomocnicze dla akcji serwera SvelteKit (+page.server.ts)
 * ============================================================================
 *
 * These are the patterns you use ALL THE TIME in +page.server.ts files.
 * To są wzorce których używasz CAŁY CZAS w plikach +page.server.ts.
 *
 * This file provides ready-to-use templates for:
 * Ten plik zapewnia gotowe do użycia szablony dla:
 *
 * 1. createLoadFunction    — standard load function (fetch data for a page)
 * 2. createFormAction      — standard form action (handle form submission)
 * 3. createToggleAction    — toggle a 0/1 field (like your wagony page)
 * 4. createDeleteAction    — delete a row via form action
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { fail } from '@sveltejs/kit';

// ===========================================================================
// 1. STANDARD LOAD FUNCTION HELPER
//    HELPER DLA STANDARDOWEJ FUNKCJI LOAD
// ===========================================================================

/**
 * Creates a standard data-loading response for a page.
 * Tworzy standardową odpowiedź z danymi do załadowania na stronę.
 *
 * USE THIS IN: the load function of +page.server.ts
 * UŻYJ W:      funkcji load w +page.server.ts
 *
 * @param supabase       — locals.supabase from the load function
 *                          locals.supabase z funkcji load
 *
 * @param table          — CHANGE THIS: your table name / ZMIEŃ TO: nazwa twojej tabeli
 *
 * @param options        — Query options (columns, order, limit, filter)
 *                          Opcje zapytania (kolumny, kolejność, limit, filtr)
 *
 * @param returnKey      — CHANGE THIS: the key name in the returned object
 *                          ZMIEŃ TO: nazwa klucza w zwracanym obiekcie
 *                          This is what you'll access in +page.svelte as `data.KEY_NAME`
 *                          To jest to co będziesz mieć w +page.svelte jako `data.NAZWA_KLUCZA`
 *                          Example / Przykład: 'blogPosts', 'products', 'users', 'wagony'
 *
 * EXAMPLE / PRZYKŁAD:
 *   // In +page.server.ts:
 *   export const load: PageServerLoad = async ({ locals }) => {
 *     return loadTableData(locals.supabase, 'BlogPost', {
 *       orderBy: 'createdAt',
 *       ascending: false,
 *       limit: 10
 *     }, 'blogPosts');
 *   };
 *
 *   // Then in +page.svelte you access it as:
 *   let { data } = $props();
 *   data.blogPosts  // ← your array of posts
 */
export async function loadTableData(
	supabase: SupabaseClient,
	table: string,        // ← CHANGE: your table name / ZMIEŃ: nazwa tabeli
	options: {
		columns?: string;
		orderBy?: string;
		ascending?: boolean;
		limit?: number;
		filterColumn?: string;
		filterValue?: string | number | boolean;
	} = {},
	returnKey: string     // ← CHANGE: key name in returned data / ZMIEŃ: nazwa klucza w danych
) {
	const {
		columns = '*',
		orderBy,
		ascending = true,
		limit,
		filterColumn,
		filterValue
	} = options;

	let query = supabase.from(table).select(columns);

	if (filterColumn && filterValue !== undefined) {
		query = query.eq(filterColumn, filterValue);
	}

	if (orderBy) {
		query = query.order(orderBy, { ascending });
	}

	if (limit) {
		query = query.limit(limit);
	}

	const { data, error } = await query;

	if (error) {
		console.error(`[loadTableData] Error loading "${table}":`, error.message);
		return { [returnKey]: [] };
	}

	return { [returnKey]: data ?? [] };
}

// ===========================================================================
// 2. CREATE FORM ACTION (INSERT)
//    AKCJA FORMULARZA (WSTAWIENIE)
// ===========================================================================

/**
 * Handles a form submission that INSERTS a new row (like creating a blog post).
 * Obsługuje przesłanie formularza który WSTAWIA nowy wiersz (jak tworzenie wpisu na bloga).
 *
 * @param request        — the request object from the action / obiekt request z akcji
 * @param supabase       — locals.supabase
 * @param user           — locals.user (null if not logged in / null jeśli nie zalogowany)
 * @param table          — CHANGE THIS: your table name / ZMIEŃ TO: nazwa tabeli
 * @param requiredFields — CHANGE THIS: form field names that must not be empty
 *                          ZMIEŃ TO: nazwy pól formularza które nie mogą być puste
 * @param extraData      — OPTIONAL: additional data to include (like user_id, timestamps)
 *                          OPCJONALNE: dodatkowe dane do dodania (jak user_id, znaczniki czasu)
 * @param requireLogin   — whether user must be logged in (default: true)
 *                          czy użytkownik musi być zalogowany (domyślnie: true)
 *
 * EXAMPLE / PRZYKŁAD:
 *   export const actions = {
 *     create: async ({ request, locals }) => {
 *       return handleCreateAction(request, locals.supabase, locals.user, 'BlogPost', ['title', 'text'], {
 *         user_id: locals.user?.id,
 *         user_display_name: locals.user?.user_metadata?.display_name || 'Anonymous'
 *       });
 *     }
 *   };
 */
export async function handleCreateAction(
	request: Request,
	supabase: SupabaseClient,
	user: User | null,
	table: string,                           // ← CHANGE: your table name / ZMIEŃ: nazwa tabeli
	requiredFields: string[],                // ← CHANGE: required form fields / ZMIEŃ: wymagane pola formularza
	extraData: Record<string, unknown> = {}, // ← CHANGE: extra columns to add / ZMIEŃ: dodatkowe kolumny
	requireLogin: boolean = true
) {
	// Check authentication / Sprawdź autoryzację
	if (requireLogin && !user) {
		return fail(401, { error: 'You must be signed in / Musisz być zalogowany' });
	}

	// Extract form data / Wyciągnij dane formularza
	const formData = await request.formData();
	const values: Record<string, string> = {};

	for (const field of requiredFields) {
		const value = formData.get(field)?.toString()?.trim() ?? '';
		if (!value) {
			return fail(400, {
				error: `Field "${field}" is required / Pole "${field}" jest wymagane`,
				...values  // ← return already-filled values so the form doesn't lose data / zwróć już wypełnione wartości
			});
		}
		values[field] = value;
	}

	// Insert into database / Wstaw do bazy danych
	const { data, error } = await supabase
		.from(table)
		.insert({ ...values, ...extraData })
		.select()
		.single();

	if (error) {
		return fail(500, { error: error.message, ...values });
	}

	return { success: true, record: data };
}

// ===========================================================================
// 3. TOGGLE ACTION (like your wagony toggle)
//    AKCJA PRZEŁĄCZANIA (jak twój toggle wagonów)
// ===========================================================================

/**
 * Handles toggling a 0/1 field via form action (exactly like your proba page).
 * Obsługuje przełączanie pola 0/1 przez akcję formularza (dokładnie jak twoja strona proba).
 *
 * EXAMPLE / PRZYKŁAD:
 *   export const actions = {
 *     toggle: async ({ request, locals }) => {
 *       return handleToggleAction(request, locals.supabase, locals.user, 'wagony', 'czy_na_bocznicy', {
 *         ostatnia_zmiana: new Date().toISOString()
 *       });
 *     }
 *   };
 */
export async function handleToggleAction(
	request: Request,
	supabase: SupabaseClient,
	user: User | null,
	table: string,                                   // ← CHANGE: table name / ZMIEŃ: nazwa tabeli
	toggleColumn: string,                            // ← CHANGE: column to toggle / ZMIEŃ: kolumna do przełączenia
	extraUpdates: Record<string, unknown> = {},      // ← CHANGE: extra columns to update / ZMIEŃ: dodatkowe kolumny
	idField: string = 'id'                           // ← CHANGE IF NEEDED: name of the ID form field / ZMIEŃ JEŚLI TRZEBA
) {
	if (!user) {
		return fail(401, { error: 'You must be signed in / Musisz być zalogowany' });
	}

	const formData = await request.formData();
	const id = Number(formData.get(idField));

	if (!id) {
		return fail(400, { error: 'ID is required / ID jest wymagane' });
	}

	// Fetch current value / Pobierz aktualną wartość
	const { data: row, error: fetchError } = await supabase
		.from(table)
		.select(`id, ${toggleColumn}`)
		.eq('id', id)
		.single();

	if (fetchError || !row) {
		return fail(404, { error: 'Record not found / Rekord nie znaleziony' });
	}

	// Flip the value / Odwróć wartość
	const newValue = (row as Record<string, any>)[toggleColumn] === 1 ? 0 : 1;

	// Update the row / Zaktualizuj wiersz
	const { error: updateError } = await supabase
		.from(table)
		.update({ [toggleColumn]: newValue, ...extraUpdates })
		.eq('id', id);

	if (updateError) {
		return fail(500, { error: updateError.message });
	}

	return { success: true };
}

// ===========================================================================
// 4. DELETE ACTION
//    AKCJA USUWANIA
// ===========================================================================

/**
 * Handles deleting a row via form action.
 * Obsługuje usuwanie wiersza przez akcję formularza.
 *
 * EXAMPLE / PRZYKŁAD:
 *   export const actions = {
 *     delete: async ({ request, locals }) => {
 *       return handleDeleteAction(request, locals.supabase, locals.user, 'BlogPost');
 *     }
 *   };
 *
 *   <!-- In your Svelte template: -->
 *   <form method="POST" action="?/delete">
 *     <input type="hidden" name="id" value={post.id} />
 *     <button type="submit">Delete</button>
 *   </form>
 */
export async function handleDeleteAction(
	request: Request,
	supabase: SupabaseClient,
	user: User | null,
	table: string,              // ← CHANGE: table name / ZMIEŃ: nazwa tabeli
	idField: string = 'id'      // ← CHANGE IF NEEDED / ZMIEŃ JEŚLI TRZEBA
) {
	if (!user) {
		return fail(401, { error: 'You must be signed in / Musisz być zalogowany' });
	}

	const formData = await request.formData();
	const id = Number(formData.get(idField));

	if (!id) {
		return fail(400, { error: 'ID is required / ID jest wymagane' });
	}

	const { error } = await supabase
		.from(table)
		.delete()
		.eq('id', id);

	if (error) {
		return fail(500, { error: error.message });
	}

	return { success: true };
}
