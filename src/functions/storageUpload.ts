/**
 * ============================================================================
 * storageUpload — Upload files to Supabase Storage
 * storageUpload — Prześlij pliki do Supabase Storage
 * ============================================================================
 *
 * USE THIS WHEN:  You want users to upload images, PDFs, documents, etc.
 * UŻYJ GDY:       Chcesz umożliwić użytkownikom przesyłanie obrazów, PDF, dokumentów, itp.
 *
 * ⚠️ BEFORE USING / PRZED UŻYCIEM:
 *    1. Create a storage bucket in Supabase Dashboard → Storage → New Bucket
 *       Utwórz storage bucket w Supabase Dashboard → Storage → New Bucket
 *    2. Set the bucket as public or private depending on your needs
 *       Ustaw bucket jako publiczny lub prywatny w zależności od potrzeb
 *    3. Configure RLS policies on the bucket if needed
 *       Skonfiguruj polityki RLS na buckecie jeśli potrzeba
 *
 * EXAMPLE / PRZYKŁAD:
 *   // Upload an image from a file input / Prześlij obraz z inputa pliku
 *   const fileInput = document.querySelector('input[type="file"]');
 *   const file = fileInput.files[0];
 *
 *   const { path, url, error } = await uploadFile(supabase, 'avatars', file, 'user123/avatar.jpg');
 *
 *   // Upload with auto-generated name / Prześlij z automatycznie wygenerowaną nazwą
 *   const { path, url, error } = await uploadFile(supabase, 'documents', file);
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Uploads a file to a Supabase Storage bucket and returns the public URL.
 * Przesyła plik do bucketu Supabase Storage i zwraca publiczny URL.
 *
 * @param supabase   — The Supabase client
 *                      Klient Supabase
 *
 * @param bucket     — CHANGE THIS: Name of your storage bucket
 *                      ZMIEŃ TO: Nazwa twojego bucketu storage
 *
 *                      ⚠️ This bucket must already exist in Supabase Dashboard → Storage
 *                      ⚠️ Ten bucket musi już istnieć w Supabase Dashboard → Storage
 *
 *                      Example / Przykład: 'avatars', 'images', 'documents', 'uploads'
 *
 * @param file       — The file to upload (from <input type="file"> or FormData)
 *                      Plik do przesłania (z <input type="file"> lub FormData)
 *
 * @param filePath   — OPTIONAL: Custom path/name for the file inside the bucket
 *                      OPCJONALNE: Niestandardowa ścieżka/nazwa pliku wewnątrz bucketu
 *
 *                      If not provided, uses a unique timestamp + original name
 *                      Jeśli nie podano, używa unikatowego znacznika czasu + oryginalna nazwa
 *
 *                      Example / Przykład:
 *                      'user123/avatar.jpg'     — organized by user / zorganizowane po użytkowniku
 *                      'posts/42/image.png'     — organized by post / zorganizowane po poście
 *                      'invoices/2024/jan.pdf'  — organized by date / zorganizowane po dacie
 *
 * @param upsert     — If true, overwrites existing file with same path. Default: false
 *                      Jeśli true, nadpisuje istniejący plik o tej samej ścieżce. Domyślnie: false
 *
 * @returns          — { path, url, error }
 *                      path — file path in the bucket / ścieżka pliku w buckecie
 *                      url  — the public URL to access the file / publiczny URL do dostępu do pliku
 */
export async function uploadFile(
	supabase: SupabaseClient,
	bucket: string,            // ← CHANGE: your bucket name / ZMIEŃ: nazwa twojego bucketu
	file: File,                // ← the file from input / plik z inputa
	filePath?: string,         // ← OPTIONAL: custom path / OPCJONALNE: niestandardowa ścieżka
	upsert: boolean = false    // ← overwrite if exists? / nadpisać jeśli istnieje?
) {
	// -----------------------------------------------------------------------
	// Generate a unique file path if not provided
	// Wygeneruj unikalną ścieżkę pliku jeśli nie podano
	// -----------------------------------------------------------------------
	// Date.now() gives a unique timestamp / Date.now() daje unikalny znacznik czasu
	// Math.random() adds extra randomness / Math.random() dodaje dodatkową losowość
	const path = filePath || `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

	// -----------------------------------------------------------------------
	// .storage.from('bucket').upload(path, file, options)
	//
	// Uploads the file to the specified bucket at the given path
	// Przesyła plik do podanego bucketu pod podaną ścieżką
	//
	// contentType: file.type — tells Supabase what kind of file it is (image/png, application/pdf, etc.)
	//                           mówi Supabase jakiego rodzaju jest plik (image/png, application/pdf, itp.)
	//
	// upsert: true/false — if true, overwrites existing file / jeśli true, nadpisuje istniejący plik
	//                       if false, fails if file already exists / jeśli false, błąd jeśli plik istnieje
	// -----------------------------------------------------------------------
	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(path, file, {
			contentType: file.type,
			upsert
		});

	if (error) {
		console.error(`[uploadFile] Error uploading to bucket "${bucket}":`, error.message);
		return { path: null, url: null, error: error.message };
	}

	// -----------------------------------------------------------------------
	// Get the public URL for the uploaded file
	// Pobierz publiczny URL dla przesłanego pliku
	// -----------------------------------------------------------------------
	// ⚠️ This only works if the bucket is set to PUBLIC in Supabase Dashboard
	// ⚠️ To działa tylko jeśli bucket jest ustawiony jako PUBLICZNY w Supabase Dashboard
	// For private buckets, use getSignedUrl() instead (shown below)
	// Dla prywatnych bucketów, użyj getSignedUrl() zamiast tego (pokazane poniżej)
	const { data: { publicUrl } } = supabase.storage
		.from(bucket)
		.getPublicUrl(data.path);

	return { path: data.path, url: publicUrl, error: null };
}

/**
 * ============================================================================
 * getSignedUrl — Get a temporary URL for a PRIVATE file
 * getSignedUrl — Pobierz tymczasowy URL dla PRYWATNEGO pliku
 * ============================================================================
 *
 * USE THIS WHEN:  Your bucket is PRIVATE and you need a temporary download link
 * UŻYJ GDY:       Twój bucket jest PRYWATNY i potrzebujesz tymczasowego linku do pobrania
 *
 * EXAMPLE / PRZYKŁAD:
 *   const { url, error } = await getSignedUrl(supabase, 'private-docs', 'invoices/inv-001.pdf', 3600);
 *   // url is valid for 3600 seconds (1 hour) / url jest ważny przez 3600 sekund (1 godzina)
 */
export async function getSignedUrl(
	supabase: SupabaseClient,
	bucket: string,          // ← CHANGE: your bucket name / ZMIEŃ: nazwa twojego bucketu
	filePath: string,        // ← path to the file in the bucket / ścieżka do pliku w buckecie
	expiresInSeconds: number = 3600  // ← CHANGE: how long the URL is valid / ZMIEŃ: jak długo URL jest ważny
) {
	// -----------------------------------------------------------------------
	// .createSignedUrl(path, expiresIn)
	//
	// Creates a temporary URL that expires after the specified time
	// Tworzy tymczasowy URL który wygasa po podanym czasie
	//
	// expiresInSeconds examples / przykłady:
	//   60     = 1 minute / 1 minuta
	//   3600   = 1 hour / 1 godzina
	//   86400  = 24 hours / 24 godziny
	//   604800 = 7 days / 7 dni
	// -----------------------------------------------------------------------
	const { data, error } = await supabase.storage
		.from(bucket)
		.createSignedUrl(filePath, expiresInSeconds);

	if (error) {
		console.error(`[getSignedUrl] Error getting signed URL:`, error.message);
		return { url: null, error: error.message };
	}

	return { url: data.signedUrl, error: null };
}

/**
 * ============================================================================
 * deleteFile — Delete a file from Supabase Storage
 * deleteFile — Usuń plik z Supabase Storage
 * ============================================================================
 *
 * EXAMPLE / PRZYKŁAD:
 *   await deleteFile(supabase, 'avatars', 'user123/avatar.jpg');
 */
export async function deleteFile(
	supabase: SupabaseClient,
	bucket: string,
	filePath: string
) {
	const { error } = await supabase.storage
		.from(bucket)
		.remove([filePath]); // ← takes an ARRAY of paths (can delete multiple) / przyjmuje TABLICĘ ścieżek

	if (error) {
		console.error(`[deleteFile] Error deleting from bucket "${bucket}":`, error.message);
	}

	return { error: error?.message ?? null };
}
