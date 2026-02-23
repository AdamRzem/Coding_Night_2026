/**
 * ============================================================================
 * realtimeSubscribe — Subscribe to real-time database changes
 * realtimeSubscribe — Subskrybuj zmiany w bazie danych w czasie rzeczywistym
 * ============================================================================
 *
 * USE THIS WHEN:  You want your UI to update AUTOMATICALLY when data changes
 *                 (e.g., new posts appear without page refresh, live dashboard, chat)
 * UŻYJ GDY:       Chcesz żeby twój UI aktualizował się AUTOMATYCZNIE gdy dane się zmienią
 *                 (np. nowe posty pojawiają się bez odświeżania, live dashboard, czat)
 *
 * ⚠️ REQUIREMENTS / WYMAGANIA:
 *    1. Realtime must be enabled on your table in Supabase Dashboard
 *       Realtime musi być włączony na twojej tabeli w Supabase Dashboard
 *       Go to: Database → Tables → Your table → Enable Realtime
 *       Przejdź do: Database → Tables → Twoja tabela → Enable Realtime
 *
 *    2. If RLS is enabled, the user must have SELECT permission
 *       Jeśli RLS jest włączony, użytkownik musi mieć uprawnienie SELECT
 *
 * USE THIS IN:  Client-side (in +page.svelte, inside onMount)
 * UŻYJ W:       Po stronie klienta (w +page.svelte, wewnątrz onMount)
 *
 * EXAMPLE / PRZYKŁAD:
 *   <script>
 *     import { onMount } from 'svelte';
 *     import { supabase } from '$lib/supabaseClient';
 *     import { subscribeToTable } from '$functions/realtimeSubscribe';
 *
 *     let posts = $state([]);
 *
 *     onMount(() => {
 *       const channel = subscribeToTable(supabase, 'BlogPost', {
 *         onInsert: (newPost) => {
 *           posts = [newPost, ...posts];  // Add new post to the top
 *         },
 *         onUpdate: (updatedPost) => {
 *           posts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
 *         },
 *         onDelete: (deletedPost) => {
 *           posts = posts.filter(p => p.id !== deletedPost.id);
 *         }
 *       });
 *
 *       // IMPORTANT: Clean up on component destroy / WAŻNE: Posprzątaj przy zniszczeniu komponentu
 *       return () => {
 *         channel.unsubscribe();
 *       };
 *     });
 *   </script>
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

type RealtimeCallbacks = {
	/**
	 * Called when a new row is INSERTED into the table
	 * Wywoływane gdy nowy wiersz jest WSTAWIANY do tabeli
	 *
	 * @param newRow — the newly inserted row data / dane nowo wstawionego wiersza
	 */
	onInsert?: (newRow: any) => void;

	/**
	 * Called when an existing row is UPDATED
	 * Wywoływane gdy istniejący wiersz jest AKTUALIZOWANY
	 *
	 * @param updatedRow — the row data after the update / dane wiersza po aktualizacji
	 */
	onUpdate?: (updatedRow: any) => void;

	/**
	 * Called when a row is DELETED
	 * Wywoływane gdy wiersz jest USUWANY
	 *
	 * @param deletedRow — the row data that was deleted (only contains old data)
	 *                      dane wiersza który był usunięty (zawiera tylko stare dane)
	 *
	 * ⚠️ NOTE: For DELETE events, the row data comes from payload.old (not payload.new)
	 * ⚠️ UWAGA: Dla zdarzeń DELETE, dane wiersza pochodzą z payload.old (nie payload.new)
	 */
	onDelete?: (deletedRow: any) => void;

	/**
	 * Called for ANY change (INSERT, UPDATE, DELETE) — useful if you just want to refresh
	 * Wywoływane dla KAŻDEJ zmiany (INSERT, UPDATE, DELETE) — przydatne jeśli chcesz po prostu odświeżyć
	 */
	onAny?: (eventType: string, data: any) => void;
};

/**
 * Subscribes to real-time changes on a Supabase table.
 * Subskrybuje zmiany w czasie rzeczywistym na tabeli Supabase.
 *
 * @param supabase    — The Supabase client (browser-side client!)
 *                       Klient Supabase (klient po stronie przeglądarki!)
 *
 * @param table       — CHANGE THIS: Your table name
 *                       ZMIEŃ TO: Nazwa twojej tabeli
 *                       Example / Przykład: 'BlogPost', 'wagony', 'messages'
 *
 * @param callbacks   — Functions to call when changes happen
 *                       Funkcje do wywołania gdy zmiany nastąpią
 *
 * @param channelName — OPTIONAL: Unique name for this subscription channel
 *                       OPCJONALNE: Unikalna nazwa dla tego kanału subskrypcji
 *                       Used to identify the channel if you have multiple subscriptions
 *                       Używane do identyfikacji kanału jeśli masz wiele subskrypcji
 *
 * @returns           — The channel object — CALL .unsubscribe() when done!
 *                       Obiekt kanału — WYWOŁAJ .unsubscribe() gdy skończysz!
 */
export function subscribeToTable(
	supabase: SupabaseClient,
	table: string,                                         // ← CHANGE: your table name / ZMIEŃ: nazwa tabeli
	callbacks: RealtimeCallbacks,
	channelName: string = `realtime-${table}`             // ← auto-generated name / automatyczna nazwa
): RealtimeChannel {
	// -----------------------------------------------------------------------
	// supabase.channel('name') — creates a new realtime channel
	//                             tworzy nowy kanał realtime
	//
	// .on('postgres_changes', { event, schema, table }, callback)
	//
	// event: '*'       = ALL changes (INSERT, UPDATE, DELETE) / WSZYSTKIE zmiany
	// event: 'INSERT'  = only new rows / tylko nowe wiersze
	// event: 'UPDATE'  = only changed rows / tylko zmienione wiersze
	// event: 'DELETE'  = only deleted rows / tylko usunięte wiersze
	//
	// schema: 'public' = the database schema (almost always 'public')
	//                     schemat bazy danych (prawie zawsze 'public')
	//
	// table: 'BlogPost' = which table to watch / którą tabelę obserwować
	// -----------------------------------------------------------------------
	const channel = supabase
		.channel(channelName)
		.on(
			'postgres_changes',
			{
				event: '*',          // ← listen to ALL events / nasłuchuj WSZYSTKICH zdarzeń
				schema: 'public',    // ← CHANGE IF NEEDED: your database schema / ZMIEŃ JEŚLI TRZEBA
				table: table         // ← which table to watch / którą tabelę obserwować
			},
			(payload) => {
				// -----------------------------------------------------------
				// payload.eventType — 'INSERT' | 'UPDATE' | 'DELETE'
				// payload.new       — the new row data (for INSERT and UPDATE)
				//                      nowe dane wiersza (dla INSERT i UPDATE)
				// payload.old       — the old row data (for UPDATE and DELETE)
				//                      stare dane wiersza (dla UPDATE i DELETE)
				// -----------------------------------------------------------
				const eventType = payload.eventType;

				// Call the appropriate callback / Wywołaj odpowiedni callback
				if (eventType === 'INSERT' && callbacks.onInsert) {
					callbacks.onInsert(payload.new);
				}
				if (eventType === 'UPDATE' && callbacks.onUpdate) {
					callbacks.onUpdate(payload.new);
				}
				if (eventType === 'DELETE' && callbacks.onDelete) {
					callbacks.onDelete(payload.old);  // ← DELETE uses .old (the deleted data) / DELETE używa .old
				}

				// Always call onAny if provided / Zawsze wywołaj onAny jeśli podano
				if (callbacks.onAny) {
					callbacks.onAny(
						eventType,
						eventType === 'DELETE' ? payload.old : payload.new
					);
				}
			}
		)
		.subscribe();  // ← IMPORTANT: .subscribe() actually starts listening / WAŻNE: .subscribe() faktycznie zaczyna nasłuchiwać

	return channel;

	// ⚠️ REMEMBER TO UNSUBSCRIBE when the component is destroyed!
	// ⚠️ PAMIĘTAJ O UNSUBSCRIBE gdy komponent jest niszczony!
	//
	// In Svelte 5:
	//   onMount(() => {
	//     const channel = subscribeToTable(...);
	//     return () => channel.unsubscribe();  // ← cleanup / sprzątanie
	//   });
}

/**
 * ============================================================================
 * subscribeToRow — Subscribe to changes on a SINGLE specific row
 * subscribeToRow — Subskrybuj zmiany na JEDNYM konkretnym wierszu
 * ============================================================================
 *
 * USE THIS WHEN:  You're on a detail page and want live updates for ONE item
 * UŻYJ GDY:       Jesteś na stronie szczegółów i chcesz aktualizacje na żywo dla JEDNEGO elementu
 *
 * EXAMPLE / PRZYKŁAD:
 *   const channel = subscribeToRow(supabase, 'BlogPost', 'id', 42, {
 *     onUpdate: (updatedPost) => { post = updatedPost; }
 *   });
 */
export function subscribeToRow(
	supabase: SupabaseClient,
	table: string,
	filterColumn: string,                // ← CHANGE: column to filter by / ZMIEŃ: kolumna do filtrowania
	filterValue: string | number,        // ← CHANGE: value to filter by / ZMIEŃ: wartość do filtrowania
	callbacks: RealtimeCallbacks
): RealtimeChannel {
	const channel = supabase
		.channel(`realtime-${table}-${filterColumn}-${filterValue}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: table,
				// -----------------------------------------------------------
				// filter — only listen to changes where this column equals this value
				//           nasłuchuj tylko zmian gdzie ta kolumna równa się tej wartości
				//
				// Format: 'column=eq.value' (eq = equals / równa się)
				// -----------------------------------------------------------
				filter: `${filterColumn}=eq.${filterValue}`
			},
			(payload) => {
				const eventType = payload.eventType;
				if (eventType === 'INSERT' && callbacks.onInsert) callbacks.onInsert(payload.new);
				if (eventType === 'UPDATE' && callbacks.onUpdate) callbacks.onUpdate(payload.new);
				if (eventType === 'DELETE' && callbacks.onDelete) callbacks.onDelete(payload.old);
				if (callbacks.onAny) callbacks.onAny(eventType, eventType === 'DELETE' ? payload.old : payload.new);
			}
		)
		.subscribe();

	return channel;
}
