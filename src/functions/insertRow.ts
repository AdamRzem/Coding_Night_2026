/**
 * ============================================================================
 * insertRow — Insert a new row into any Supabase table
 * insertRow — Wstaw nowy wiersz do dowolnej tabeli Supabase
 * ============================================================================
 *
 * USE THIS WHEN:  You want to CREATE a new item (new post, new product, new user, etc.)
 * UŻYJ GDY:       Chcesz UTWORZYĆ nowy element (nowy post, nowy produkt, nowy użytkownik, itp.)
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Insert a blog post / Wstaw wpis na bloga
 *   const result = await insertRow(locals.supabase, 'BlogPost', {
 *     title: 'My Post',
 *     text: 'Hello world',
 *     user_id: user.id,
 *     user_display_name: 'John'
 *   });
 *
 *   // Insert a product / Wstaw produkt
 *   const result = await insertRow(locals.supabase, 'products', {
 *     name: 'Laptop',
 *     price: 999.99,
 *     category: 'electronics'
 *   });
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Inserts a new row into a Supabase table and returns the inserted row.
 * Wstawia nowy wiersz do tabeli Supabase i zwraca wstawiony wiersz.
 *
 * @param supabase  — The Supabase client (from locals.supabase or imported)
 *                     Klient Supabase (z locals.supabase lub zaimportowany)
 *
 * @param table     — CHANGE THIS: Name of YOUR table in Supabase
 *                     ZMIEŃ TO: Nazwa TWOJEJ tabeli w Supabase
 *                     Example / Przykład: 'BlogPost', 'products', 'orders'
 *
 * @param rowData   — CHANGE THIS: An object with column names as keys and values to insert
 *                     ZMIEŃ TO: Obiekt z nazwami kolumn jako klucze i wartościami do wstawienia
 *
 *                     ⚠️ IMPORTANT: The keys MUST match your table's column names EXACTLY
 *                     ⚠️ WAŻNE: Klucze MUSZĄ odpowiadać nazwom kolumn w tabeli DOKŁADNIE
 *
 *                     Example / Przykład:
 *                     { title: 'My Post', text: 'Content', user_id: 'abc-123' }
 *                     { name: 'Laptop', price: 999.99, category: 'electronics' }
 *
 *                     ❌ DO NOT include 'id' if it's auto-generated (auto-increment)
 *                     ❌ NIE dodawaj 'id' jeśli jest auto-generowane (auto-increment)
 *
 *                     ❌ DO NOT include 'createdAt' if it has a database default (like now())
 *                     ❌ NIE dodawaj 'createdAt' jeśli ma domyślną wartość w bazie (jak now())
 *
 * @returns         — { data, error } — data is the inserted row, error is null on success
 *                     { data, error } — data to wstawiony wiersz, error jest null gdy sukces
 */
export async function insertRow(
	supabase: SupabaseClient,
	table: string,                    // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	rowData: Record<string, unknown>  // ← CHANGE: object with your column values / ZMIEŃ: obiekt z wartościami kolumn
) {
	// -----------------------------------------------------------------------
	// .from('table')  — which table to insert into / do której tabeli wstawić
	// .insert({...})  — the data to insert (object with column: value pairs)
	//                    dane do wstawienia (obiekt z parami kolumna: wartość)
	// .select()       — return the inserted row (without this, insert returns nothing)
	//                    zwróć wstawiony wiersz (bez tego, insert nie zwraca nic)
	// .single()       — we inserted one row, so expect one row back
	//                    wstawiliśmy jeden wiersz, więc oczekujemy jednego z powrotem
	// -----------------------------------------------------------------------
	const { data, error } = await supabase
		.from(table)
		.insert(rowData)
		.select()   // ← IMPORTANT: without .select(), you won't get the inserted row back
		            //    WAŻNE: bez .select() nie dostaniesz wstawionego wiersza z powrotem
		.single();  // ← returns a single object instead of an array
		            //    zwraca pojedynczy obiekt zamiast tablicy

	if (error) {
		console.error(`[insertRow] Error inserting into "${table}":`, error.message);
	}

	return { data, error };
}

/**
 * ============================================================================
 * insertMultipleRows — Insert MANY rows at once (batch insert)
 * insertMultipleRows — Wstaw WIELE wierszy naraz (wstawianie wsadowe)
 * ============================================================================
 *
 * USE THIS WHEN:  You want to insert multiple items at once (faster than one-by-one)
 * UŻYJ GDY:       Chcesz wstawić wiele elementów naraz (szybciej niż jeden po jednym)
 *
 * EXAMPLE / PRZYKŁAD:
 *   const result = await insertMultipleRows(locals.supabase, 'BlogPost', [
 *     { title: 'Post 1', text: 'Hello' },
 *     { title: 'Post 2', text: 'World' },
 *   ]);
 */
export async function insertMultipleRows(
	supabase: SupabaseClient,
	table: string,                      // ← CHANGE: your table name / ZMIEŃ: nazwa twojej tabeli
	rows: Record<string, unknown>[]     // ← CHANGE: array of row objects / ZMIEŃ: tablica obiektów wierszy
) {
	// -----------------------------------------------------------------------
	// .insert([{...}, {...}]) — pass an ARRAY of objects to insert many rows
	//                            przekaż TABLICĘ obiektów aby wstawić wiele wierszy
	// .select()               — return all inserted rows
	//                            zwróć wszystkie wstawione wiersze
	// -----------------------------------------------------------------------
	const { data, error } = await supabase
		.from(table)
		.insert(rows)
		.select(); // ← returns an array of all inserted rows / zwraca tablicę wstawionych wierszy

	if (error) {
		console.error(`[insertMultipleRows] Error inserting into "${table}":`, error.message);
	}

	return { data: data ?? [], error };
}
