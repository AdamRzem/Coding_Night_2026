/**
 * ============================================================================
 * selectRows — Fetch multiple rows from any Supabase table
 * selectRows — Pobierz wiele wierszy z dowolnej tabeli Supabase
 * ============================================================================
 *
 * USE THIS WHEN:  You need a list of items (posts, products, users, etc.)
 * UŻYJ GDY:       Potrzebujesz listę elementów (posty, produkty, użytkownicy, itp.)
 *
 * EXAMPLE / PRZYKŁAD:
 *   const posts = await selectRows(locals.supabase, 'BlogPost', {
 *     columns: 'id, title, text',
 *     orderBy: 'createdAt',
 *     ascending: false,
 *     limit: 10
 *   });
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Options type — what you can customize when calling selectRows
// Typ opcji — co możesz dostosować przy wywołaniu selectRows
// ---------------------------------------------------------------------------
type SelectRowsOptions = {
	/**
	 * Which columns to fetch. Default: '*' (all columns)
	 * Które kolumny pobrać. Domyślnie: '*' (wszystkie kolumny)
	 *
	 * CHANGE THIS TO: a comma-separated list of column names from YOUR table
	 * ZMIEŃ NA:       listę nazw kolumn z TWOJEJ tabeli, oddzieloną przecinkami
	 *
	 * Example / Przykład: 'id, title, createdAt' or 'id, name, price, category'
	 */
	columns?: string;

	/**
	 * Column name to sort by. Default: no sorting
	 * Nazwa kolumny do sortowania. Domyślnie: brak sortowania
	 *
	 * CHANGE THIS TO: the column you want to sort by from YOUR table
	 * ZMIEŃ NA:       kolumnę, po której chcesz sortować z TWOJEJ tabeli
	 *
	 * Example / Przykład: 'createdAt', 'name', 'price', 'id'
	 */
	orderBy?: string;

	/**
	 * Sort direction. true = A→Z / oldest first, false = Z→A / newest first
	 * Kierunek sortowania. true = A→Z / najstarsze, false = Z→A / najnowsze
	 *
	 * Default: true (ascending / rosnąco)
	 */
	ascending?: boolean;

	/**
	 * Maximum number of rows to return. Default: no limit (all rows)
	 * Maksymalna liczba wierszy do zwrócenia. Domyślnie: bez limitu (wszystkie)
	 *
	 * Example / Przykład: 10, 50, 100
	 */
	limit?: number;

	/**
	 * Filter: column name to filter by using .eq()
	 * Filtr: nazwa kolumny do filtrowania za pomocą .eq()
	 *
	 * CHANGE THIS TO: the column name you want to filter by
	 * ZMIEŃ NA:       nazwę kolumny, po której chcesz filtrować
	 *
	 * Example / Przykład: 'user_id', 'category', 'status'
	 */
	filterColumn?: string;

	/**
	 * Filter: value that filterColumn must equal
	 * Filtr: wartość, którą filterColumn musi mieć
	 *
	 * Example / Przykład: 'some-user-uuid', 'electronics', 'active'
	 */
	filterValue?: string | number | boolean;
};

// ---------------------------------------------------------------------------
// Main function / Główna funkcja
// ---------------------------------------------------------------------------

/**
 * Fetches multiple rows from a Supabase table with optional sorting, filtering, and limiting.
 * Pobiera wiele wierszy z tabeli Supabase z opcjonalnym sortowaniem, filtrowaniem i limitowaniem.
 *
 * @param supabase  — The Supabase client (from locals.supabase in server files, or imported client)
 *                     Klient Supabase (z locals.supabase w plikach server, lub zaimportowany klient)
 *
 * @param table     — CHANGE THIS: Name of YOUR table in Supabase (exactly as in the database)
 *                     ZMIEŃ TO: Nazwa TWOJEJ tabeli w Supabase (dokładnie jak w bazie danych)
 *                     Example / Przykład: 'BlogPost', 'wagony', 'products', 'users'
 *
 * @param options   — Optional settings (columns, order, limit, filter)
 *                     Opcjonalne ustawienia (kolumny, kolejność, limit, filtr)
 *
 * @returns         — { data, error } — data is the array of rows, error is null on success
 *                     { data, error } — data to tablica wierszy, error jest null gdy sukces
 */
export async function selectRows(
	supabase: SupabaseClient,
	table: string, // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	options: SelectRowsOptions = {}
) {
	const {
		columns = '*',
		orderBy,
		ascending = true,
		limit,
		filterColumn,
		filterValue
	} = options;

	// -----------------------------------------------------------------------
	// Step 1: Start building the query
	// Krok 1: Zacznij budować zapytanie
	// -----------------------------------------------------------------------
	// .from('TABLE_NAME') — CHANGE 'table' to your table name when calling
	// .from('NAZWA_TABELI') — ZMIEŃ 'table' na nazwę twojej tabeli przy wywołaniu
	// .select('COLUMNS') — which columns to fetch ('*' = all)
	// .select('KOLUMNY') — które kolumny pobrać ('*' = wszystkie)
	let query = supabase.from(table).select(columns);

	// -----------------------------------------------------------------------
	// Step 2: Add optional filter (.eq = "equals" / "równa się")
	// Krok 2: Dodaj opcjonalny filtr (.eq = "równa się")
	// -----------------------------------------------------------------------
	// This filters rows where filterColumn === filterValue
	// To filtruje wiersze gdzie filterColumn === filterValue
	//
	// OTHER FILTERS YOU CAN USE / INNE FILTRY KTÓRE MOŻESZ UŻYĆ:
	//   .gt(column, value)   — greater than / większe niż
	//   .lt(column, value)   — less than / mniejsze niż
	//   .gte(column, value)  — greater or equal / większe lub równe
	//   .lte(column, value)  — less or equal / mniejsze lub równe
	//   .neq(column, value)  — not equal / nie równa się
	//   .like(column, '%text%') — contains text / zawiera tekst
	//   .ilike(column, '%text%') — contains text (case-insensitive) / zawiera tekst (bez rozróżniania wielkości liter)
	//   .in(column, [val1, val2]) — is one of / jest jednym z
	//   .is(column, null)    — is null / jest null
	if (filterColumn && filterValue !== undefined) {
		query = query.eq(filterColumn, filterValue);
	}

	// -----------------------------------------------------------------------
	// Step 3: Add optional sorting
	// Krok 3: Dodaj opcjonalne sortowanie
	// -----------------------------------------------------------------------
	// .order('COLUMN', { ascending: true/false })
	// ascending: true = 1,2,3 or A,B,C (rosnąco)
	// ascending: false = 3,2,1 or C,B,A (malejąco — newest first / najnowsze pierwsze)
	if (orderBy) {
		query = query.order(orderBy, { ascending });
	}

	// -----------------------------------------------------------------------
	// Step 4: Add optional limit
	// Krok 4: Dodaj opcjonalny limit
	// -----------------------------------------------------------------------
	// .limit(N) — return at most N rows / zwróć najwyżej N wierszy
	if (limit) {
		query = query.limit(limit);
	}

	// -----------------------------------------------------------------------
	// Step 5: Execute query and return result
	// Krok 5: Wykonaj zapytanie i zwróć wynik
	// -----------------------------------------------------------------------
	const { data, error } = await query;

	if (error) {
		// Log the error for debugging / Logowanie błędu do debugowania
		console.error(`[selectRows] Error fetching from "${table}":`, error.message);
	}

	return { data: data ?? [], error };
}
