/**
 * ============================================================================
 * paginateRows — Fetch rows with pagination (page by page)
 * paginateRows — Pobierz wiersze z paginacją (strona po stronie)
 * ============================================================================
 *
 * USE THIS WHEN:  You have many rows and want to show them page by page
 *                 (e.g., "Page 1 of 5", "Next", "Previous" buttons)
 * UŻYJ GDY:       Masz wiele wierszy i chcesz je wyświetlać strona po stronie
 *                 (np. "Strona 1 z 5", przyciski "Następna", "Poprzednia")
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Get page 1 (first 10 posts) / Pobierz stronę 1 (pierwsze 10 postów)
 *   const page1 = await paginateRows(locals.supabase, 'BlogPost', {
 *     page: 1,
 *     perPage: 10,
 *     orderBy: 'createdAt',
 *     ascending: false
 *   });
 *   // page1.data = [...10 posts]
 *   // page1.totalCount = 42  (total posts in the table)
 *   // page1.totalPages = 5   (42 / 10 = 5 pages)
 *   // page1.currentPage = 1
 *
 *   // Get page 2 / Pobierz stronę 2
 *   const page2 = await paginateRows(locals.supabase, 'BlogPost', {
 *     page: 2,
 *     perPage: 10,
 *     orderBy: 'createdAt',
 *     ascending: false
 *   });
 */

import type { SupabaseClient } from '@supabase/supabase-js';

type PaginateOptions = {
	/**
	 * Which page to fetch (1-based). Page 1 = first page.
	 * Którą stronę pobrać (od 1). Strona 1 = pierwsza strona.
	 * Default: 1
	 */
	page?: number;

	/**
	 * How many rows per page. Default: 10
	 * Ile wierszy na stronę. Domyślnie: 10
	 *
	 * CHANGE THIS TO: whatever makes sense for your UI
	 * ZMIEŃ NA:       cokolwiek ma sens dla twojego UI
	 * Example / Przykład: 5, 10, 20, 50
	 */
	perPage?: number;

	/**
	 * Which columns to fetch. Default: '*' (all)
	 * Które kolumny pobrać. Domyślnie: '*' (wszystkie)
	 */
	columns?: string;

	/**
	 * Column to sort by
	 * Kolumna do sortowania
	 */
	orderBy?: string;

	/**
	 * Sort direction. true = ascending (oldest first), false = descending (newest first)
	 * Kierunek sortowania. true = rosnąco (najstarsze), false = malejąco (najnowsze)
	 */
	ascending?: boolean;

	/**
	 * Optional filter
	 * Opcjonalny filtr
	 */
	filterColumn?: string;
	filterValue?: string | number | boolean;
};

/**
 * Fetches a specific page of rows from a table, with total count for pagination UI.
 * Pobiera konkretną stronę wierszy z tabeli, z łączną liczbą do UI paginacji.
 *
 * @returns — { data, totalCount, totalPages, currentPage, perPage, error }
 */
export async function paginateRows(
	supabase: SupabaseClient,
	table: string,              // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	options: PaginateOptions = {}
) {
	const {
		page = 1,
		perPage = 10,
		columns = '*',
		orderBy,
		ascending = true,
		filterColumn,
		filterValue
	} = options;

	// -----------------------------------------------------------------------
	// Calculate the range (which rows to fetch)
	// Oblicz zakres (które wiersze pobrać)
	// -----------------------------------------------------------------------
	// Page 1, perPage 10 → from 0, to 9   (rows 1-10)
	// Page 2, perPage 10 → from 10, to 19 (rows 11-20)
	// Strona 1, perPage 10 → od 0, do 9   (wiersze 1-10)
	// Strona 2, perPage 10 → od 10, do 19 (wiersze 11-20)
	const from = (page - 1) * perPage;
	const to = from + perPage - 1;

	// -----------------------------------------------------------------------
	// Build the query with .range() for pagination
	// Zbuduj zapytanie z .range() do paginacji
	// -----------------------------------------------------------------------
	// count: 'exact' — also returns total row count (needed for "Page X of Y")
	// count: 'exact' — zwraca też łączną liczbę wierszy (potrzebne do "Strona X z Y")
	let query = supabase
		.from(table)
		.select(columns, { count: 'exact' })
		.range(from, to); // ← .range(from, to) = fetch rows from index 'from' to 'to'
	                      //    .range(od, do) = pobierz wiersze od indeksu 'od' do 'do'

	if (filterColumn && filterValue !== undefined) {
		query = query.eq(filterColumn, filterValue);
	}

	if (orderBy) {
		query = query.order(orderBy, { ascending });
	}

	const { data, count, error } = await query;

	if (error) {
		console.error(`[paginateRows] Error paginating "${table}":`, error.message);
	}

	const totalCount = count ?? 0;
	const totalPages = Math.ceil(totalCount / perPage);

	return {
		data: data ?? [],
		totalCount,           // Total rows in table / Łączna liczba wierszy w tabeli
		totalPages,           // Total pages / Łączna liczba stron
		currentPage: page,    // Current page number / Numer bieżącej strony
		perPage,              // Rows per page / Wierszy na stronę
		error
	};
}
