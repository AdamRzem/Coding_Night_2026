/**
 * ============================================================================
 * toggleField — Toggle a 0/1 (or boolean) field in any Supabase table
 * toggleField — Przełącz pole 0/1 (lub boolean) w dowolnej tabeli Supabase
 * ============================================================================
 *
 * USE THIS WHEN:  You have a yes/no, on/off, active/inactive field to flip
 * UŻYJ GDY:       Masz pole tak/nie, włączone/wyłączone, aktywne/nieaktywne do przełączenia
 *
 * This is exactly what your 'wagony' table does with 'czy_na_bocznicy' (0 ↔ 1)
 * To jest dokładnie to co twoja tabela 'wagony' robi z 'czy_na_bocznicy' (0 ↔ 1)
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Toggle wagon's "czy_na_bocznicy" field / Przełącz pole "czy_na_bocznicy" wagonu
 *   const result = await toggleField(locals.supabase, 'wagony', 12, 'czy_na_bocznicy');
 *
 *   // Toggle product "is_active" field / Przełącz pole "is_active" produktu
 *   const result = await toggleField(locals.supabase, 'products', 5, 'is_active');
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Toggles a numeric (0/1) or boolean field on a single row.
 * Przełącza pole numeryczne (0/1) lub boolean na pojedynczym wierszu.
 *
 * HOW IT WORKS / JAK TO DZIAŁA:
 * 1. Fetches the current value of the field / Pobiera aktualną wartość pola
 * 2. Flips it: 0→1 or 1→0 (or false→true / true→false)
 *    Odwraca: 0→1 lub 1→0 (lub false→true / true→false)
 * 3. Updates the row with the new value / Aktualizuje wiersz nową wartością
 *
 * @param supabase      — The Supabase client
 *                         Klient Supabase
 *
 * @param table         — CHANGE THIS: Your table name
 *                         ZMIEŃ TO: Nazwa twojej tabeli
 *                         Example / Przykład: 'wagony', 'products', 'users'
 *
 * @param id            — The ID of the row to toggle
 *                         ID wiersza do przełączenia
 *
 * @param toggleColumn  — CHANGE THIS: The name of the column to toggle
 *                         ZMIEŃ TO: Nazwa kolumny do przełączenia
 *                         Example / Przykład: 'czy_na_bocznicy', 'is_active', 'is_published'
 *
 * @param extraUpdates  — OPTIONAL: Additional columns to update at the same time
 *                         OPCJONALNE: Dodatkowe kolumny do zaktualizowania jednocześnie
 *                         Example / Przykład: { ostatnia_zmiana: new Date().toISOString() }
 *                         Useful for timestamps! / Przydatne dla znaczników czasu!
 *
 * @param idColumn      — CHANGE IF NEEDED: Name of the ID column
 *                         ZMIEŃ JEŚLI TRZEBA: Nazwa kolumny ID
 *                         Default: 'id'
 *
 * @returns             — { data, error, newValue } — newValue is the flipped value
 *                         { data, error, newValue } — newValue to odwrócona wartość
 */
export async function toggleField(
	supabase: SupabaseClient,
	table: string,                                      // ← CHANGE: your table name / ZMIEŃ: nazwa tabeli
	id: string | number,                                // ← the row ID / ID wiersza
	toggleColumn: string,                               // ← CHANGE: column to toggle / ZMIEŃ: kolumna do przełączenia
	extraUpdates: Record<string, unknown> = {},          // ← OPTIONAL: extra columns to update / OPCJONALNE
	idColumn: string = 'id'                             // ← CHANGE IF NEEDED / ZMIEŃ JEŚLI TRZEBA
) {
	// -----------------------------------------------------------------------
	// Step 1: Fetch the current value of the toggle column
	// Krok 1: Pobierz aktualną wartość kolumny do przełączenia
	// -----------------------------------------------------------------------
	// We only need the ID column and the toggle column — no need to fetch everything
	// Potrzebujemy tylko kolumnę ID i kolumnę do przełączenia — nie trzeba pobierać wszystkiego
	const { data: currentRow, error: fetchError } = await supabase
		.from(table)
		.select(`${idColumn}, ${toggleColumn}`)
		.eq(idColumn, id)
		.single();

	if (fetchError || !currentRow) {
		console.error(`[toggleField] Row not found in "${table}" where ${idColumn}=${id}:`, fetchError?.message);
		return { data: null, error: fetchError, newValue: null };
	}

	// -----------------------------------------------------------------------
	// Step 2: Calculate the new (flipped) value
	// Krok 2: Oblicz nową (odwróconą) wartość
	// -----------------------------------------------------------------------
	// For 0/1 fields: 0 becomes 1, 1 becomes 0
	// Dla pól 0/1: 0 staje się 1, 1 staje się 0
	// For boolean fields: false becomes true, true becomes false
	// Dla pól boolean: false staje się true, true staje się false
	const currentValue = (currentRow as Record<string, any>)[toggleColumn];
	let newValue: number | boolean;

	if (typeof currentValue === 'boolean') {
		// Boolean toggle: true ↔ false
		newValue = !currentValue;
	} else {
		// Numeric toggle: 0 ↔ 1 (like czy_na_bocznicy)
		newValue = currentValue === 1 ? 0 : 1;
	}

	// -----------------------------------------------------------------------
	// Step 3: Update the row with the new value (+ any extra updates)
	// Krok 3: Zaktualizuj wiersz nową wartością (+ dodatkowe aktualizacje)
	// -----------------------------------------------------------------------
	const { data: updatedRow, error: updateError } = await supabase
		.from(table)
		.update({
			[toggleColumn]: newValue,  // ← the toggled value / przełączona wartość
			...extraUpdates            // ← e.g., { ostatnia_zmiana: new Date().toISOString() }
		})
		.eq(idColumn, id)
		.select()
		.single();

	if (updateError) {
		console.error(`[toggleField] Error toggling "${toggleColumn}" in "${table}":`, updateError.message);
	}

	return { data: updatedRow, error: updateError, newValue };
}
