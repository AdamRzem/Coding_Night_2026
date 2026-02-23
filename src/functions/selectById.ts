/**
 * ============================================================================
 * selectById — Fetch a SINGLE row from any table by its ID
 * selectById — Pobierz JEDEN wiersz z dowolnej tabeli po jego ID
 * ============================================================================
 *
 * USE THIS WHEN:  You need one specific item (one post, one product, one user)
 * UŻYJ GDY:       Potrzebujesz jeden konkretny element (jeden post, jeden produkt, jednego użytkownika)
 *
 * EXAMPLE / PRZYKŁAD:
 *   const post = await selectById(locals.supabase, 'BlogPost', 5);
 *   const wagon = await selectById(locals.supabase, 'wagony', 12, 'id', 'id, title, text');
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches a single row from a Supabase table by its unique identifier.
 * Pobiera pojedynczy wiersz z tabeli Supabase po jego unikalnym identyfikatorze.
 *
 * @param supabase     — The Supabase client (from locals.supabase or imported)
 *                        Klient Supabase (z locals.supabase lub zaimportowany)
 *
 * @param table        — CHANGE THIS: Name of YOUR table in Supabase
 *                        ZMIEŃ TO: Nazwa TWOJEJ tabeli w Supabase
 *                        Example / Przykład: 'BlogPost', 'wagony', 'products'
 *
 * @param id           — The ID value of the row you want to fetch
 *                        Wartość ID wiersza, który chcesz pobrać
 *                        Example / Przykład: 5, 'uuid-string-here', 42
 *
 * @param idColumn     — CHANGE THIS IF NEEDED: The name of the ID column in your table
 *                        ZMIEŃ TO JEŚLI TRZEBA: Nazwa kolumny ID w twojej tabeli
 *                        Default: 'id' — most tables use 'id' as primary key
 *                        Domyślnie: 'id' — większość tabel używa 'id' jako klucz główny
 *                        NOTE: If your table uses a different column name (e.g., 'user_id', 'post_id'),
 *                              change this parameter
 *                        UWAGA: Jeśli twoja tabela używa innej nazwy kolumny (np. 'user_id', 'post_id'),
 *                              zmień ten parametr
 *
 * @param columns      — Which columns to fetch. Default: '*' (all)
 *                        Które kolumny pobrać. Domyślnie: '*' (wszystkie)
 *                        CHANGE THIS TO: only the columns you need for better performance
 *                        ZMIEŃ NA: tylko kolumny których potrzebujesz dla lepszej wydajności
 *                        Example / Przykład: 'id, title, text', 'id, name, price'
 *
 * @returns            — { data, error } — data is the single row object (or null), error is null on success
 *                        { data, error } — data to obiekt jednego wiersza (lub null), error jest null gdy sukces
 */
export async function selectById(
	supabase: SupabaseClient,
	table: string,           // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	id: string | number,     // ← the ID value / wartość ID
	idColumn: string = 'id', // ← CHANGE IF NEEDED: your ID column name / ZMIEŃ JEŚLI TRZEBA: nazwa kolumny ID
	columns: string = '*'    // ← CHANGE: columns to fetch / ZMIEŃ: kolumny do pobrania
) {
	// -----------------------------------------------------------------------
	// .from('table')     — which table to query / z której tabeli pobierać
	// .select('columns') — which columns to return / które kolumny zwrócić
	// .eq(column, value) — WHERE column = value / GDZIE kolumna = wartość
	// .single()          — expect exactly ONE row (throws error if 0 or 2+)
	//                       oczekuj dokładnie JEDNEGO wiersza (zwraca błąd jeśli 0 lub 2+)
	// -----------------------------------------------------------------------
	const { data, error } = await supabase
		.from(table)
		.select(columns)
		.eq(idColumn, id)
		.single(); // ← .single() = only ONE result / tylko JEDEN wynik

	if (error) {
		console.error(`[selectById] Error fetching from "${table}" where ${idColumn}=${id}:`, error.message);
	}

	return { data, error };
}
