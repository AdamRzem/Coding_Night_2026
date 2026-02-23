/**
 * ============================================================================
 * rpcCall — Call a Supabase database function (RPC = Remote Procedure Call)
 * rpcCall — Wywołaj funkcję bazy danych Supabase (RPC = Zdalne Wywołanie Procedury)
 * ============================================================================
 *
 * USE THIS WHEN:  You have complex logic in a PostgreSQL function (stored procedure)
 *                 that can't be done with simple select/insert/update
 * UŻYJ GDY:       Masz złożoną logikę w funkcji PostgreSQL (procedura składowana)
 *                 która nie może być wykonana prostym select/insert/update
 *
 * ⚠️ BEFORE USING / PRZED UŻYCIEM:
 *    You need to create the function in Supabase Dashboard → SQL Editor
 *    Musisz utworzyć funkcję w Supabase Dashboard → SQL Editor
 *
 *    Example SQL to create a function / Przykładowy SQL do stworzenia funkcji:
 *
 *    CREATE OR REPLACE FUNCTION get_post_stats()
 *    RETURNS TABLE(total_posts bigint, latest_date timestamptz) AS $$
 *    BEGIN
 *      RETURN QUERY
 *      SELECT count(*), max("createdAt") FROM "BlogPost";
 *    END;
 *    $$ LANGUAGE plpgsql;
 *
 *    CREATE OR REPLACE FUNCTION increment_views(post_id int)
 *    RETURNS void AS $$
 *    BEGIN
 *      UPDATE "BlogPost" SET views = views + 1 WHERE id = post_id;
 *    END;
 *    $$ LANGUAGE plpgsql;
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Call a function with no parameters / Wywołaj funkcję bez parametrów
 *   const { data } = await rpcCall(locals.supabase, 'get_post_stats');
 *
 *   // Call a function with parameters / Wywołaj funkcję z parametrami
 *   const { data } = await rpcCall(locals.supabase, 'increment_views', { post_id: 5 });
 *
 *   // Call a function that returns data / Wywołaj funkcję która zwraca dane
 *   const { data } = await rpcCall(locals.supabase, 'search_posts', { search_term: 'svelte' });
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calls a Supabase database function (RPC).
 * Wywołuje funkcję bazy danych Supabase (RPC).
 *
 * @param supabase      — The Supabase client / Klient Supabase
 *
 * @param functionName  — CHANGE THIS: Name of the PostgreSQL function to call
 *                         ZMIEŃ TO: Nazwa funkcji PostgreSQL do wywołania
 *
 *                         ⚠️ This must match EXACTLY the function name in the database
 *                         ⚠️ To musi pasować DOKŁADNIE do nazwy funkcji w bazie danych
 *
 *                         Example / Przykład: 'get_post_stats', 'search_posts', 'increment_views'
 *
 * @param params        — CHANGE THIS: Parameters to pass to the function
 *                         ZMIEŃ TO: Parametry do przekazania do funkcji
 *
 *                         ⚠️ Parameter names must match the function definition in SQL!
 *                         ⚠️ Nazwy parametrów muszą pasować do definicji funkcji w SQL!
 *
 *                         Example / Przykład: { post_id: 5 }, { search_term: 'hello' }
 *
 * @returns             — { data, error }
 */
export async function rpcCall(
	supabase: SupabaseClient,
	functionName: string,                       // ← CHANGE: your function name / ZMIEŃ: nazwa funkcji
	params: Record<string, unknown> = {}        // ← CHANGE: function parameters / ZMIEŃ: parametry funkcji
) {
	// -----------------------------------------------------------------------
	// .rpc('function_name', { param1: value1, param2: value2 })
	//
	// This is equivalent to SQL: SELECT function_name(param1 := value1, param2 := value2);
	// To jest równoważne SQL: SELECT function_name(param1 := value1, param2 := value2);
	//
	// The function MUST exist in your Supabase database
	// Funkcja MUSI istnieć w twojej bazie danych Supabase
	//
	// You can create functions in:
	// Możesz tworzyć funkcje w:
	//   Supabase Dashboard → SQL Editor → New Query
	// -----------------------------------------------------------------------
	const { data, error } = await supabase.rpc(functionName, params);

	if (error) {
		console.error(`[rpcCall] Error calling function "${functionName}":`, error.message);
	}

	return { data, error };
}
