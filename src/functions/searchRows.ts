/**
 * ============================================================================
 * searchRows — Search/filter rows using text matching (ILIKE = case-insensitive)
 * searchRows — Wyszukaj/filtruj wiersze używając dopasowania tekstu (ILIKE = bez rozróżniania wielkości liter)
 * ============================================================================
 *
 * USE THIS WHEN:  You have a search bar and want to find rows containing some text
 * UŻYJ GDY:       Masz pasek wyszukiwania i chcesz znaleźć wiersze zawierające jakiś tekst
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Search blog posts by title / Wyszukaj wpisy po tytule
 *   const results = await searchRows(locals.supabase, 'BlogPost', 'title', 'hello');
 *   // → finds posts with "hello", "Hello", "HELLO" in the title
 *   // → znajdzie posty z "hello", "Hello", "HELLO" w tytule
 *
 *   // Search in multiple columns / Wyszukaj w wielu kolumnach
 *   const results = await searchRowsMultiColumn(locals.supabase, 'BlogPost', ['title', 'text'], 'svelte');
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Searches rows in a single column using ILIKE (case-insensitive partial match).
 * Wyszukuje wiersze w jednej kolumnie używając ILIKE (dopasowanie częściowe bez rozróżniania wielkości liter).
 *
 * @param supabase      — The Supabase client
 *                         Klient Supabase
 *
 * @param table         — CHANGE THIS: Your table name
 *                         ZMIEŃ TO: Nazwa twojej tabeli
 *
 * @param searchColumn  — CHANGE THIS: Which column to search in
 *                         ZMIEŃ TO: W której kolumnie szukać
 *                         Example / Przykład: 'title', 'text', 'name', 'description'
 *
 * @param searchText    — The text to search for (user input from search bar)
 *                         Tekst do wyszukania (dane z paska wyszukiwania)
 *
 * @param columns       — Which columns to return. Default: '*'
 *                         Które kolumny zwrócić. Domyślnie: '*'
 *
 * @param orderBy       — Column to sort results by
 *                         Kolumna do sortowania wyników
 *
 * @param ascending     — Sort direction
 *                         Kierunek sortowania
 *
 * @param limit         — Max results to return
 *                         Maks. wyników do zwrócenia
 */
export async function searchRows(
	supabase: SupabaseClient,
	table: string,
	searchColumn: string,
	searchText: string,
	columns: string = '*',
	orderBy?: string,
	ascending: boolean = true,
	limit?: number
) {
	// -----------------------------------------------------------------------
	// .ilike(column, '%text%')
	//
	// ilike = case-insensitive LIKE (works like SQL's ILIKE)
	// ilike = LIKE bez rozróżniania wielkości liter
	//
	// '%text%' means: any characters BEFORE and AFTER "text"
	// '%text%' znaczy: dowolne znaki PRZED i PO "text"
	//
	// Examples / Przykłady:
	//   '%hello%' → matches "hello world", "say hello", "HELLO"
	//   'hello%'  → matches "hello world" but NOT "say hello" (must START with "hello")
	//   '%hello'  → matches "say hello" but NOT "hello world" (must END with "hello")
	// -----------------------------------------------------------------------
	let query = supabase
		.from(table)
		.select(columns)
		.ilike(searchColumn, `%${searchText}%`); // ← '%text%' = "contains" / "zawiera"

	if (orderBy) {
		query = query.order(orderBy, { ascending });
	}

	if (limit) {
		query = query.limit(limit);
	}

	const { data, error } = await query;

	if (error) {
		console.error(`[searchRows] Error searching "${table}":`, error.message);
	}

	return { data: data ?? [], error };
}

/**
 * ============================================================================
 * searchRowsMultiColumn — Search across MULTIPLE columns at once
 * searchRowsMultiColumn — Wyszukaj w WIELU kolumnach naraz
 * ============================================================================
 *
 * USE THIS WHEN:  You want to search in title AND content at the same time
 * UŻYJ GDY:       Chcesz szukać w tytule I treści jednocześnie
 *
 * EXAMPLE / PRZYKŁAD:
 *   const results = await searchRowsMultiColumn(
 *     locals.supabase,
 *     'BlogPost',
 *     ['title', 'text'],  // ← search in both columns / szukaj w obu kolumnach
 *     'svelte'
 *   );
 */
export async function searchRowsMultiColumn(
	supabase: SupabaseClient,
	table: string,
	searchColumns: string[],   // ← CHANGE: array of column names to search in / ZMIEŃ: tablica nazw kolumn do przeszukania
	searchText: string,
	columns: string = '*',
	orderBy?: string,
	ascending: boolean = true,
	limit?: number
) {
	// -----------------------------------------------------------------------
	// .or('column1.ilike.%text%, column2.ilike.%text%')
	//
	// This creates an OR condition: match if text is found in ANY of the columns
	// To tworzy warunek OR: dopasuj jeśli tekst jest w KTÓREJKOLWIEK z kolumn
	//
	// Example generated string / Przykład wygenerowanego stringa:
	// 'title.ilike.%hello%, text.ilike.%hello%'
	// → finds rows where title contains "hello" OR text contains "hello"
	// → znajduje wiersze gdzie tytuł zawiera "hello" LUB tekst zawiera "hello"
	// -----------------------------------------------------------------------
	const orCondition = searchColumns
		.map((col) => `${col}.ilike.%${searchText}%`)
		.join(', ');

	let query = supabase
		.from(table)
		.select(columns)
		.or(orCondition);

	if (orderBy) {
		query = query.order(orderBy, { ascending });
	}

	if (limit) {
		query = query.limit(limit);
	}

	const { data, error } = await query;

	if (error) {
		console.error(`[searchRowsMultiColumn] Error searching "${table}":`, error.message);
	}

	return { data: data ?? [], error };
}
