/**
 * ============================================================================
 * deleteRow — Delete a row from any Supabase table
 * deleteRow — Usuń wiersz z dowolnej tabeli Supabase
 * ============================================================================
 *
 * USE THIS WHEN:  You want to REMOVE an item permanently
 * UŻYJ GDY:       Chcesz USUNĄĆ element na stałe
 *
 * ⚠️ WARNING: This PERMANENTLY deletes the row. There is no undo!
 * ⚠️ UWAGA: To TRWALE usuwa wiersz. Nie ma cofania!
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Delete blog post with id 5 / Usuń wpis na bloga z id 5
 *   const result = await deleteRow(locals.supabase, 'BlogPost', 5);
 *
 *   // Delete a product / Usuń produkt
 *   const result = await deleteRow(locals.supabase, 'products', 42);
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Deletes a single row from a Supabase table by its ID.
 * Usuwa pojedynczy wiersz z tabeli Supabase po jego ID.
 *
 * @param supabase   — The Supabase client
 *                      Klient Supabase
 *
 * @param table      — CHANGE THIS: Name of YOUR table
 *                      ZMIEŃ TO: Nazwa TWOJEJ tabeli
 *                      Example / Przykład: 'BlogPost', 'wagony', 'products'
 *
 * @param id         — The ID of the row to delete
 *                      ID wiersza do usunięcia
 *
 * @param idColumn   — CHANGE IF NEEDED: Name of the ID column
 *                      ZMIEŃ JEŚLI TRZEBA: Nazwa kolumny ID
 *                      Default: 'id'
 *
 * @returns          — { data, error } — data is the deleted row, error is null on success
 *                      { data, error } — data to usunięty wiersz, error jest null gdy sukces
 */
export async function deleteRow(
	supabase: SupabaseClient,
	table: string,            // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	id: string | number,      // ← the ID of the row to delete / ID wiersza do usunięcia
	idColumn: string = 'id'   // ← CHANGE IF NEEDED: your ID column / ZMIEŃ JEŚLI TRZEBA
) {
	// -----------------------------------------------------------------------
	// .from('table')     — which table to delete from / z której tabeli usunąć
	// .delete()          — DELETE operation / operacja DELETE
	// .eq(column, value) — WHERE column = value (which row to delete)
	//                       GDZIE kolumna = wartość (który wiersz usunąć)
	// .select()          — return the deleted row (so you can confirm what was deleted)
	//                       zwróć usunięty wiersz (żebyś mógł potwierdzić co usunięto)
	// .single()          — expect one row
	//                       oczekuj jednego wiersza
	//
	// ⚠️ NOTE ON RLS (Row Level Security):
	// ⚠️ UWAGA NA RLS (Row Level Security):
	//    If RLS is enabled on your table, the user can only delete rows they have
	//    permission to delete (e.g., their own rows). If the user doesn't have
	//    permission, the error will say "row not found" even though it exists.
	//
	//    Jeśli RLS jest włączone na twojej tabeli, użytkownik może usunąć tylko wiersze
	//    do których ma uprawnienia (np. swoje własne). Jeśli użytkownik nie ma
	//    uprawnień, błąd powie "wiersz nie znaleziony" mimo że istnieje.
	// -----------------------------------------------------------------------
	const { data, error } = await supabase
		.from(table)
		.delete()
		.eq(idColumn, id)
		.select()
		.single();

	if (error) {
		console.error(`[deleteRow] Error deleting from "${table}" where ${idColumn}=${id}:`, error.message);
	}

	return { data, error };
}

/**
 * ============================================================================
 * deleteMultipleRows — Delete ALL rows matching a filter condition
 * deleteMultipleRows — Usuń WSZYSTKIE wiersze pasujące do warunku
 * ============================================================================
 *
 * ⚠️ DANGEROUS: Can delete many rows at once! Double-check your filter.
 * ⚠️ NIEBEZPIECZNE: Może usunąć wiele wierszy naraz! Sprawdź dokładnie filtr.
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Delete all posts by a specific user / Usuń wszystkie wpisy konkretnego użytkownika
 *   await deleteMultipleRows(locals.supabase, 'BlogPost', 'user_id', 'some-uuid');
 */
export async function deleteMultipleRows(
	supabase: SupabaseClient,
	table: string,
	filterColumn: string,
	filterValue: string | number | boolean
) {
	const { data, error } = await supabase
		.from(table)
		.delete()
		.eq(filterColumn, filterValue)
		.select();

	if (error) {
		console.error(`[deleteMultipleRows] Error deleting from "${table}":`, error.message);
	}

	return { data: data ?? [], error };
}
