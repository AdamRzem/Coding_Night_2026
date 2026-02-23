/**
 * ============================================================================
 * validateFormData — Extract and validate form data from SvelteKit form actions
 * validateFormData — Wyciągnij i zwaliduj dane formularza z akcji formularzy SvelteKit
 * ============================================================================
 *
 * USE THIS IN:  +page.server.ts form actions (the actions: {...} export)
 * UŻYJ W:       akcjach formularzy w +page.server.ts (eksport actions: {...})
 *
 * This saves you from writing the same formData.get() + trim + validation code every time.
 * To oszczędza ci pisania tego samego kodu formData.get() + trim + walidacja za każdym razem.
 *
 * EXAMPLE / PRZYKŁAD:
 *   export const actions = {
 *     create: async ({ request }) => {
 *       const formData = await request.formData();
 *
 *       // Define required fields / Zdefiniuj wymagane pola
 *       const { values, error } = extractFormFields(formData, ['title', 'text']);
 *       if (error) return fail(400, { error });
 *
 *       // Now use values.title, values.text / Teraz użyj values.title, values.text
 *       const { data, error: dbError } = await locals.supabase
 *         .from('BlogPost')
 *         .insert({ title: values.title, text: values.text })
 *         .select().single();
 *     }
 *   };
 */

/**
 * Extracts and validates required string fields from FormData.
 * Wyciąga i waliduje wymagane pola tekstowe z FormData.
 *
 * @param formData       — The FormData object from request.formData()
 *                          Obiekt FormData z request.formData()
 *
 * @param requiredFields — CHANGE THIS: Array of field names that MUST exist and not be empty
 *                          ZMIEŃ TO: Tablica nazw pól które MUSZĄ istnieć i nie być puste
 *
 *                          ⚠️ These must match the "name" attributes of your HTML inputs!
 *                          ⚠️ Te muszą pasować do atrybutów "name" w twoich inputach HTML!
 *
 *                          Example / Przykład:
 *                          ['title', 'text']           — for a blog post form
 *                          ['name', 'email', 'message'] — for a contact form
 *                          ['product_name', 'price']    — for a product form
 *
 * @returns              — { values, error } — values is an object with field names as keys
 *                          { values, error } — values to obiekt z nazwami pól jako klucze
 *
 *                          If any required field is empty/missing, error contains a message.
 *                          Jeśli jakiekolwiek wymagane pole jest puste/brakuje, error zawiera komunikat.
 */
export function extractFormFields(
	formData: FormData,
	requiredFields: string[]
): { values: Record<string, string>; error: string | null } {
	const values: Record<string, string> = {};

	// -----------------------------------------------------------------------
	// Extract all fields from the form
	// Wyciągnij wszystkie pola z formularza
	// -----------------------------------------------------------------------
	for (const field of requiredFields) {
		// .get(field)       — get the value of the form field by its "name" attribute
		//                      pobierz wartość pola formularza po atrybucie "name"
		// ?.toString()      — convert to string (FormData values are FormDataEntryValue type)
		//                      przekonwertuj na string
		// ?.trim()          — remove whitespace from start and end
		//                      usuń białe znaki z początku i końca
		// ?? ''             — if null/undefined, use empty string
		//                      jeśli null/undefined, użyj pustego stringa
		const value = formData.get(field)?.toString()?.trim() ?? '';
		values[field] = value;
	}

	// -----------------------------------------------------------------------
	// Check that all required fields have values
	// Sprawdź czy wszystkie wymagane pola mają wartości
	// -----------------------------------------------------------------------
	const missingFields = requiredFields.filter((field) => !values[field]);

	if (missingFields.length > 0) {
		// ---------------------------------------------------------------
		// CHANGE the error message format to match your app's language
		// ZMIEŃ format komunikatu błędu aby pasował do języka aplikacji
		// ---------------------------------------------------------------
		const error = `Required fields are missing: ${missingFields.join(', ')} / Wymagane pola są puste: ${missingFields.join(', ')}`;
		return { values, error };
	}

	return { values, error: null };
}

/**
 * ============================================================================
 * extractFormNumber — Extract a numeric value from FormData
 * extractFormNumber — Wyciągnij wartość liczbową z FormData
 * ============================================================================
 *
 * USE THIS WHEN:  You have a number input in your form (price, quantity, ID, etc.)
 * UŻYJ GDY:       Masz input liczbowy w formularzu (cena, ilość, ID, itp.)
 *
 * EXAMPLE / PRZYKŁAD:
 *   const id = extractFormNumber(formData, 'id');
 *   if (id === null) return fail(400, { error: 'ID is required' });
 */
export function extractFormNumber(
	formData: FormData,
	fieldName: string  // ← CHANGE: the name attribute of your number input / ZMIEŃ: atrybut name twojego inputa liczbowego
): number | null {
	const raw = formData.get(fieldName)?.toString()?.trim();

	if (!raw) return null;

	const num = Number(raw);

	// Check if it's a valid number / Sprawdź czy to prawidłowa liczba
	// NaN = Not a Number (e.g., if user typed "abc" in a number field)
	// NaN = Not a Number (np. jeśli użytkownik wpisał "abc" w pole liczbowe)
	if (isNaN(num)) return null;

	return num;
}

/**
 * ============================================================================
 * extractOptionalFields — Extract optional (non-required) fields from FormData
 * extractOptionalFields — Wyciągnij opcjonalne (nie wymagane) pola z FormData
 * ============================================================================
 *
 * Returns only fields that actually have values (skips empty ones).
 * Zwraca tylko pola które faktycznie mają wartości (pomija puste).
 *
 * EXAMPLE / PRZYKŁAD:
 *   const optional = extractOptionalFields(formData, ['bio', 'website', 'phone']);
 *   // Only includes fields that the user filled in
 *   // Zawiera tylko pola które użytkownik wypełnił
 */
export function extractOptionalFields(
	formData: FormData,
	fieldNames: string[]
): Record<string, string> {
	const values: Record<string, string> = {};

	for (const field of fieldNames) {
		const value = formData.get(field)?.toString()?.trim();
		if (value) {
			values[field] = value;
		}
	}

	return values;
}
