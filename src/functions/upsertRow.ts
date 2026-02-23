/**
 * ============================================================================
 * upsertRow — Insert OR Update (if already exists) a row in any table
 * upsertRow — Wstaw LUB Zaktualizuj (jeśli już istnieje) wiersz w dowolnej tabeli
 * ============================================================================
 *
 * USE THIS WHEN:  You want to "save" data — insert if new, update if exists
 * UŻYJ GDY:       Chcesz "zapisać" dane — wstaw jeśli nowe, zaktualizuj jeśli istnieje
 *
 * HOW IT WORKS / JAK TO DZIAŁA:
 *   - If a row with the same primary key (e.g. 'id') exists → it UPDATES that row
 *   - If no row with that key exists → it INSERTS a new row
 *   - Jeśli wiersz z tym samym kluczem głównym (np. 'id') istnieje → AKTUALIZUJE go
 *   - Jeśli nie ma wiersza z tym kluczem → WSTAWIA nowy wiersz
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Save user profile (creates if new, updates if exists)
 *   // Zapisz profil użytkownika (tworzy jeśli nowy, aktualizuje jeśli istnieje)
 *   const result = await upsertRow(locals.supabase, 'profiles', {
 *     user_id: 'abc-123',  // ← this is the "conflict" column / to jest kolumna "konfliktu"
 *     display_name: 'John',
 *     bio: 'Hello!'
 *   }, 'user_id');
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Upserts a row — inserts if it doesn't exist, updates if it does.
 * Upsertuje wiersz — wstawia jeśli nie istnieje, aktualizuje jeśli istnieje.
 *
 * @param supabase         — The Supabase client
 *                            Klient Supabase
 *
 * @param table            — CHANGE THIS: Name of YOUR table
 *                            ZMIEŃ TO: Nazwa TWOJEJ tabeli
 *
 * @param rowData          — CHANGE THIS: Object with ALL column values (including the ID/key)
 *                            ZMIEŃ TO: Obiekt ze WSZYSTKIMI wartościami kolumn (włącznie z ID/kluczem)
 *
 *                            ⚠️ IMPORTANT: You MUST include the column that determines uniqueness!
 *                            ⚠️ WAŻNE: MUSISZ dodać kolumnę która określa unikalność!
 *
 * @param onConflictColumn — CHANGE THIS: The column that determines if a row "already exists"
 *                            ZMIEŃ TO: Kolumna która określa czy wiersz "już istnieje"
 *                            Usually this is your primary key or a unique column
 *                            Zazwyczaj jest to klucz główny lub kolumna unikalna
 *                            Default: 'id'
 *                            Example / Przykład: 'id', 'user_id', 'email', 'slug'
 *
 * @returns                — { data, error }
 */
export async function upsertRow(
	supabase: SupabaseClient,
	table: string,                       // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	rowData: Record<string, unknown>,    // ← CHANGE: data to upsert / ZMIEŃ: dane do upsert
	onConflictColumn: string = 'id'      // ← CHANGE: which column to check for conflicts / ZMIEŃ: po jakiej kolumnie sprawdzać konflikty
) {
	// -----------------------------------------------------------------------
	// .upsert(data, { onConflict: 'column' })
	//
	// onConflict tells Supabase: "if a row with this same 'column' value exists,
	// UPDATE it instead of inserting a new one"
	//
	// onConflict mówi Supabase: "jeśli wiersz z tą samą wartością 'column' istnieje,
	// ZAKTUALIZUJ go zamiast wstawiać nowy"
	//
	// ⚠️ The onConflict column MUST have a UNIQUE constraint in the database!
	// ⚠️ Kolumna onConflict MUSI mieć ograniczenie UNIQUE w bazie danych!
	// -----------------------------------------------------------------------
	const { data, error } = await supabase
		.from(table)
		.upsert(rowData, { onConflict: onConflictColumn })
		.select()
		.single();

	if (error) {
		console.error(`[upsertRow] Error upserting into "${table}":`, error.message);
	}

	return { data, error };
}
