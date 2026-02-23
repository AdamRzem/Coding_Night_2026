/**
 * ============================================================================
 * countRows — Count how many rows exist in a table (with optional filter)
 * countRows — Policz ile wierszy istnieje w tabeli (z opcjonalnym filtrem)
 * ============================================================================
 *
 * USE THIS WHEN:  You need a total count (e.g., "Total Posts: 42", "Active Users: 15")
 * UŻYJ GDY:       Potrzebujesz łącznej liczby (np. "Wszystkie Posty: 42", "Aktywni Użytkownicy: 15")
 *
 * This is MORE EFFICIENT than fetching all rows and counting them in JavaScript!
 * To jest BARDZIEJ WYDAJNE niż pobieranie wszystkich wierszy i liczenie ich w JavaScript!
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Count all blog posts / Policz wszystkie wpisy
 *   const total = await countRows(locals.supabase, 'BlogPost');
 *
 *   // Count posts by specific user / Policz wpisy konkretnego użytkownika
 *   const userPosts = await countRows(locals.supabase, 'BlogPost', 'user_id', 'abc-123');
 *
 *   // Count active wagons / Policz aktywne wagony
 *   const active = await countRows(locals.supabase, 'wagony', 'czy_na_bocznicy', 1);
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Counts rows in a Supabase table, optionally filtered by a column value.
 * Liczy wiersze w tabeli Supabase, opcjonalnie filtrowane po wartości kolumny.
 *
 * @param supabase      — The Supabase client
 *                         Klient Supabase
 *
 * @param table         — CHANGE THIS: Your table name
 *                         ZMIEŃ TO: Nazwa twojej tabeli
 *
 * @param filterColumn  — OPTIONAL: Column to filter by
 *                         OPCJONALNE: Kolumna do filtrowania
 *
 * @param filterValue   — OPTIONAL: Value the column must equal
 *                         OPCJONALNE: Wartość którą kolumna musi mieć
 *
 * @returns             — { count, error } — count is the number of matching rows
 *                         { count, error } — count to liczba pasujących wierszy
 */
export async function countRows(
	supabase: SupabaseClient,
	table: string,
	filterColumn?: string,
	filterValue?: string | number | boolean
): Promise<{ count: number; error: any }> {
	// -----------------------------------------------------------------------
	// .select('*', { count: 'exact', head: true })
	//
	// count: 'exact'  — tells Supabase to count rows precisely (not approximate)
	//                    mówi Supabase żeby policzył wiersze dokładnie (nie przybliżenie)
	//
	// head: true       — tells Supabase to NOT return the actual rows (only the count)
	//                     mówi Supabase żeby NIE zwracał faktycznych wierszy (tylko liczbę)
	//                     This makes it much faster! / Dzięki temu jest dużo szybciej!
	// -----------------------------------------------------------------------
	let query = supabase.from(table).select('*', { count: 'exact', head: true });

	if (filterColumn && filterValue !== undefined) {
		query = query.eq(filterColumn, filterValue);
	}

	const { count, error } = await query;

	if (error) {
		console.error(`[countRows] Error counting rows in "${table}":`, error.message);
	}

	return { count: count ?? 0, error };
}
