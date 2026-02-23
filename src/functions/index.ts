/**
 * ============================================================================
 * INDEX — Re-exports all functions from the src/functions/ folder
 * INDEX — Re-eksportuje wszystkie funkcje z folderu src/functions/
 * ============================================================================
 *
 * HOW TO IMPORT / JAK IMPORTOWAĆ:
 *
 *   1. From the index (shorter) / Z indeksu (krótszy):
 *      import { selectRows, insertRow, signInWithEmail } from '$functions';
 *
 *   2. From individual files (if you want only one function):
 *      import { selectRows } from '$functions/selectRows';
 *
 * ⚠️ IMPORTANT: For option 1 to work, you need the '$functions' alias in svelte.config.js:
 * ⚠️ WAŻNE: Aby opcja 1 działała, potrzebujesz aliasu '$functions' w svelte.config.js:
 *
 *   // In svelte.config.js → kit → alias:
 *   alias: {
 *     '$functions': 'src/functions',
 *     '$functions/*': 'src/functions/*'
 *   }
 *
 *   Or you can import using relative paths / Lub możesz importować ścieżkami relatywnymi:
 *   import { selectRows } from '../../functions/selectRows';
 */

// ---------------------------------------------------------------------------
// DATABASE QUERIES / ZAPYTANIA DO BAZY DANYCH
// ---------------------------------------------------------------------------

/** Select multiple rows / Pobierz wiele wierszy */
export { selectRows } from './selectRows';

/** Select a single row by ID / Pobierz jeden wiersz po ID */
export { selectById } from './selectById';

/** Select with related data (JOIN) / Pobierz z powiązanymi danymi (JOIN) */
export { selectWithJoin } from './selectWithJoin';

/** Insert one or many rows / Wstaw jeden lub wiele wierszy */
export { insertRow, insertMultipleRows } from './insertRow';

/** Update one or many rows / Zaktualizuj jeden lub wiele wierszy */
export { updateRow, updateMultipleRows } from './updateRow';

/** Delete one or many rows / Usuń jeden lub wiele wierszy */
export { deleteRow, deleteMultipleRows } from './deleteRow';

/** Upsert (insert or update) / Upsert (wstaw lub zaktualizuj) */
export { upsertRow } from './upsertRow';

/** Toggle a 0/1 field / Przełącz pole 0/1 */
export { toggleField } from './toggleField';

/** Count rows / Policz wiersze */
export { countRows } from './countRows';

/** Paginated data fetching / Pobieranie danych z paginacją */
export { paginateRows } from './paginateRows';

/** Search/filter by text / Wyszukaj/filtruj po tekście */
export { searchRows, searchRowsMultiColumn } from './searchRows';

/** Call database functions (RPC) / Wywołaj funkcje bazy danych (RPC) */
export { rpcCall } from './rpcCall';

// ---------------------------------------------------------------------------
// AUTHENTICATION / AUTORYZACJA
// ---------------------------------------------------------------------------

/** All auth helpers / Wszystkie helpery autoryzacji */
export {
	signInWithEmail,
	signUpWithEmail,
	signInWithOAuth,
	signOut,
	getCurrentUser,
	getUserDisplayName,
	requireAuth
} from './authHelpers';

// ---------------------------------------------------------------------------
// FORM HELPERS / HELPERY FORMULARZY
// ---------------------------------------------------------------------------

/** Form data extraction & validation / Wyciąganie i walidacja danych formularza */
export {
	extractFormFields,
	extractFormNumber,
	extractOptionalFields
} from './validateFormData';

// ---------------------------------------------------------------------------
// SERVER ACTION HELPERS / HELPERY AKCJI SERWERA
// ---------------------------------------------------------------------------

/** Ready-to-use server action handlers / Gotowe do użycia handlery akcji serwera */
export {
	loadTableData,
	handleCreateAction,
	handleToggleAction,
	handleDeleteAction
} from './serverActionHelpers';

// ---------------------------------------------------------------------------
// EMAIL / EMAIL
// ---------------------------------------------------------------------------

/** Send emails / Wysyłaj emaile */
export { sendEmail, sendEmailFromContactForm } from './sendEmail';

// ---------------------------------------------------------------------------
// FILE STORAGE / PRZECHOWYWANIE PLIKÓW
// ---------------------------------------------------------------------------

/** Upload, download, delete files / Prześlij, pobierz, usuń pliki */
export { uploadFile, getSignedUrl, deleteFile } from './storageUpload';

// ---------------------------------------------------------------------------
// REALTIME / CZAS RZECZYWISTY
// ---------------------------------------------------------------------------

/** Subscribe to database changes / Subskrybuj zmiany w bazie danych */
export { subscribeToTable, subscribeToRow } from './realtimeSubscribe';
