/**
 * ============================================================================
 * updateRow — Update an existing row in any Supabase table
 * updateRow — Zaktualizuj istniejący wiersz w dowolnej tabeli Supabase
 * ============================================================================
 *
 * USE THIS WHEN:  You want to EDIT/MODIFY an existing item
 * UŻYJ GDY:       Chcesz EDYTOWAĆ/ZMODYFIKOWAĆ istniejący element
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Update a blog post title / Zaktualizuj tytuł wpisu
 *   const result = await updateRow(locals.supabase, 'BlogPost', 5, {
 *     title: 'New Title',
 *     text: 'Updated content'
 *   });
 *
 *   // Update wagon status / Zaktualizuj status wagonu
 *   const result = await updateRow(locals.supabase, 'wagony', 12, {
 *     czy_na_bocznicy: 1,
 *     ostatnia_zmiana: new Date().toISOString()
 *   });
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Updates an existing row in a Supabase table and returns the updated row.
 * Aktualizuje istniejący wiersz w tabeli Supabase i zwraca zaktualizowany wiersz.
 *
 * @param supabase    — The Supabase client (from locals.supabase or imported)
 *                       Klient Supabase (z locals.supabase lub zaimportowany)
 *
 * @param table       — CHANGE THIS: Name of YOUR table in Supabase
 *                       ZMIEŃ TO: Nazwa TWOJEJ tabeli w Supabase
 *                       Example / Przykład: 'BlogPost', 'wagony', 'products'
 *
 * @param id          — The ID of the row to update
 *                       ID wiersza do zaktualizowania
 *                       Example / Przykład: 5, 'uuid-string', 42
 *
 * @param updates     — CHANGE THIS: An object with ONLY the columns you want to change
 *                       ZMIEŃ TO: Obiekt z TYLKO kolumnami które chcesz zmienić
 *
 *                       ⚠️ You DON'T need to include all columns — only the ones you're changing!
 *                       ⚠️ NIE musisz podawać wszystkich kolumn — tylko te które zmieniasz!
 *
 *                       Example / Przykład:
 *                       { title: 'New Title' }              — only changes title / zmienia tylko tytuł
 *                       { price: 19.99, stock: 100 }        — changes price and stock / zmienia cenę i stan
 *                       { czy_na_bocznicy: 0 }              — changes only this flag / zmienia tylko tę flagę
 *
 * @param idColumn    — CHANGE IF NEEDED: The name of the ID column in your table
 *                       ZMIEŃ JEŚLI TRZEBA: Nazwa kolumny ID w twojej tabeli
 *                       Default: 'id'
 *
 * @returns           — { data, error } — data is the updated row, error is null on success
 *                       { data, error } — data to zaktualizowany wiersz, error jest null gdy sukces
 */
export async function updateRow(
	supabase: SupabaseClient,
	table: string,                       // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	id: string | number,                 // ← the ID of the row to update / ID wiersza do zaktualizowania
	updates: Record<string, unknown>,    // ← CHANGE: columns to update / ZMIEŃ: kolumny do zaktualizowania
	idColumn: string = 'id'              // ← CHANGE IF NEEDED: your ID column name / ZMIEŃ JEŚLI TRZEBA
) {
	// -----------------------------------------------------------------------
	// .from('table')     — which table to update / w której tabeli zaktualizować
	// .update({...})     — object with new values (only changed columns!)
	//                       obiekt z nowymi wartościami (tylko zmienione kolumny!)
	// .eq(column, value) — WHERE column = value (which row to update)
	//                       GDZIE kolumna = wartość (który wiersz zaktualizować)
	// .select()          — return the updated row
	//                       zwróć zaktualizowany wiersz
	// .single()          — expect exactly one result
	//                       oczekuj dokładnie jednego wyniku
	// -----------------------------------------------------------------------
	const { data, error } = await supabase
		.from(table)
		.update(updates)
		.eq(idColumn, id)
		.select()
		.single();

	if (error) {
		console.error(`[updateRow] Error updating "${table}" where ${idColumn}=${id}:`, error.message);
	}

	return { data, error };
}

/**
 * ============================================================================
 * updateMultipleRows — Update ALL rows matching a filter condition
 * updateMultipleRows — Zaktualizuj WSZYSTKIE wiersze pasujące do warunku filtra
 * ============================================================================
 *
 * USE THIS WHEN:  You want to update many rows at once (e.g., set all orders to 'shipped')
 * UŻYJ GDY:       Chcesz zaktualizować wiele wierszy naraz (np. ustaw wszystkie zamówienia na 'wysłane')
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Set all wagons to "nie na bocznicy" / Ustaw wszystkie wagony na "nie na bocznicy"
 *   await updateMultipleRows(locals.supabase, 'wagony', 'czy_na_bocznicy', 1, { czy_na_bocznicy: 0 });
 */
export async function updateMultipleRows(
	supabase: SupabaseClient,
	table: string,                        // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	filterColumn: string,                 // ← CHANGE: column to filter by / ZMIEŃ: kolumna do filtrowania
	filterValue: string | number | boolean, // ← CHANGE: value to match / ZMIEŃ: wartość do dopasowania
	updates: Record<string, unknown>      // ← CHANGE: what to update / ZMIEŃ: co zaktualizować
) {
	const { data, error } = await supabase
		.from(table)
		.update(updates)
		.eq(filterColumn, filterValue)
		.select();

	if (error) {
		console.error(`[updateMultipleRows] Error updating "${table}":`, error.message);
	}

	return { data: data ?? [], error };
}
