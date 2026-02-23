/**
 * ============================================================================
 * selectWithJoin — Fetch rows with RELATED data from another table (JOIN)
 * selectWithJoin — Pobierz wiersze z POWIĄZANYMI danymi z innej tabeli (JOIN)
 * ============================================================================
 *
 * USE THIS WHEN:  You have two related tables and want data from both
 *                 (e.g., posts with their author info, orders with product details)
 * UŻYJ GDY:       Masz dwie powiązane tabele i chcesz dane z obu
 *                 (np. posty z informacjami o autorze, zamówienia ze szczegółami produktu)
 *
 * ⚠️ REQUIREMENTS / WYMAGANIA:
 *    You need a FOREIGN KEY relationship between the tables in Supabase
 *    Potrzebujesz relacji KLUCZA OBCEGO między tabelami w Supabase
 *
 *    Example setup / Przykładowa konfiguracja:
 *    Table "BlogPost" has column "user_id" → references "profiles"."id"
 *    Tabela "BlogPost" ma kolumnę "user_id" → odwołuje się do "profiles"."id"
 *
 * HOW SUPABASE JOINS WORK / JAK DZIAŁAJĄ JOINY W SUPABASE:
 *    Instead of SQL JOINs, Supabase uses NESTED SELECT syntax:
 *    Zamiast SQL JOIN, Supabase używa zagnieżdżonej składni SELECT:
 *
 *    .select('id, title, profiles(display_name, avatar_url)')
 *                        ^^^^^^^^ — this is the related table name / to jest nazwa powiązanej tabeli
 *
 *    This returns: { id: 1, title: "Hello", profiles: { display_name: "John", avatar_url: "..." } }
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Get blog posts with author profile data
 *   // Pobierz wpisy na blogu z danymi profilu autora
 *   const { data } = await selectWithJoin(
 *     locals.supabase,
 *     'BlogPost',
 *     'id, title, text, createdAt, profiles(display_name, avatar_url)',
 *     { orderBy: 'createdAt', ascending: false }
 *   );
 *
 *   // Get orders with product details
 *   // Pobierz zamówienia ze szczegółami produktu
 *   const { data } = await selectWithJoin(
 *     locals.supabase,
 *     'orders',
 *     'id, quantity, products(name, price, image_url)',
 *     { filterColumn: 'user_id', filterValue: user.id }
 *   );
 */

import type { SupabaseClient } from '@supabase/supabase-js';

type JoinOptions = {
	/**
	 * Column to sort by / Kolumna do sortowania
	 */
	orderBy?: string;

	/**
	 * Sort direction / Kierunek sortowania
	 */
	ascending?: boolean;

	/**
	 * Max rows to return / Maks. wierszy do zwrócenia
	 */
	limit?: number;

	/**
	 * Filter column / Kolumna filtra
	 */
	filterColumn?: string;

	/**
	 * Filter value / Wartość filtra
	 */
	filterValue?: string | number | boolean;
};

/**
 * Fetches rows with embedded/related data from another table.
 * Pobiera wiersze z zagnieżdżonymi/powiązanymi danymi z innej tabeli.
 *
 * @param supabase   — The Supabase client / Klient Supabase
 *
 * @param table      — CHANGE THIS: Your main table name
 *                      ZMIEŃ TO: Nazwa twojej głównej tabeli
 *
 * @param columns    — CHANGE THIS: Columns to select, INCLUDING the join syntax
 *                      ZMIEŃ TO: Kolumny do wybrania, WŁĄCZNIE ze składnią join
 *
 *                      ⚠️ JOIN SYNTAX / SKŁADNIA JOIN:
 *                      'main_col1, main_col2, related_table(col1, col2)'
 *
 *                      Examples / Przykłady:
 *                      'id, title, profiles(display_name)'
 *                      'id, title, text, profiles(display_name, avatar_url)'
 *                      'id, quantity, products(name, price)'
 *                      '*, categories(name, slug)'  ← * for all main columns + join
 *
 * @param options    — Sort, limit, filter options / Opcje sortowania, limitu, filtrowania
 *
 * @returns          — { data, error }
 */
export async function selectWithJoin(
	supabase: SupabaseClient,
	table: string,               // ← CHANGE: main table / ZMIEŃ: główna tabela
	columns: string,             // ← CHANGE: columns with join syntax / ZMIEŃ: kolumny ze składnią join
	options: JoinOptions = {}
) {
	const { orderBy, ascending = true, limit, filterColumn, filterValue } = options;

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
		console.error(`[selectWithJoin] Error fetching from "${table}" with join:`, error.message);
	}

	return { data: data ?? [], error };
}
