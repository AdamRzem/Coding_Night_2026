/**
 * ============================================================================
 * sendEmail — Send an email via your API endpoint (using nodemailer on server)
 * sendEmail — Wyślij email przez twój endpoint API (używając nodemailer na serwerze)
 * ============================================================================
 *
 * USE THIS ON:  Client-side (in +page.svelte) to send emails through your /api/send-email endpoint
 * UŻYJ PO:      Stronie klienta (w +page.svelte) aby wysłać emaile przez endpoint /api/send-email
 *
 * ⚠️ REQUIREMENTS / WYMAGANIA:
 *    1. You need the /api/send-email/+server.ts endpoint set up (already exists in this project)
 *       Potrzebujesz endpoint /api/send-email/+server.ts (już istnieje w tym projekcie)
 *    2. You need EMAIL_USER and EMAIL_PASS in your .env file
 *       Potrzebujesz EMAIL_USER i EMAIL_PASS w pliku .env
 *    3. For Gmail: enable "App Passwords" (2FA must be on), NOT your regular password
 *       Dla Gmail: włącz "Hasła aplikacji" (2FA musi być włączone), NIE twoje zwykłe hasło
 *
 * EXAMPLE / PRZYKŁAD:
 *   const result = await sendEmail({
 *     fromName: 'Paweł',
 *     fromEmail: 'pawel@example.com',
 *     subject: 'Hello from contact form',
 *     text: 'This is plain text version',
 *     html: '<p>This is <strong>HTML</strong> version</p>'
 *   });
 */

type SendEmailParams = {
	/**
	 * Sender's name (displayed in the email)
	 * Imię nadawcy (wyświetlane w emailu)
	 */
	fromName: string;

	/**
	 * Sender's email (used as reply-to address)
	 * Email nadawcy (używany jako adres do odpowiedzi)
	 */
	fromEmail: string;

	/**
	 * Email subject line
	 * Temat emaila
	 *
	 * CHANGE THIS TO: whatever makes sense for your form
	 * ZMIEŃ NA:       cokolwiek ma sens dla twojego formularza
	 */
	subject: string;

	/**
	 * Plain text version of the email (for email clients that don't support HTML)
	 * Wersja tekstowa emaila (dla klientów poczty nie obsługujących HTML)
	 */
	text: string;

	/**
	 * HTML version of the email (for email clients that support HTML)
	 * Wersja HTML emaila (dla klientów poczty obsługujących HTML)
	 */
	html: string;
};

/**
 * Sends an email by calling the /api/send-email endpoint.
 * Wysyła email wywołując endpoint /api/send-email.
 *
 * @param params   — Email parameters (fromName, fromEmail, subject, text, html)
 *                    Parametry emaila
 *
 * @param endpoint — CHANGE IF NEEDED: The API endpoint URL
 *                    ZMIEŃ JEŚLI TRZEBA: URL endpointu API
 *                    Default: '/api/send-email' (matches the project's existing endpoint)
 *                    Domyślnie: '/api/send-email' (pasuje do istniejącego endpointu w projekcie)
 *
 * @returns        — { success, message, error }
 */
export async function sendEmail(
	params: SendEmailParams,
	endpoint: string = '/api/send-email'  // ← CHANGE if your endpoint is at a different path / ZMIEŃ jeśli twój endpoint jest pod inną ścieżką
): Promise<{ success: boolean; message?: string; error?: string }> {
	try {
		// -------------------------------------------------------------------
		// fetch(endpoint, { method: 'POST', ... })
		//
		// This sends a POST request to YOUR server's API endpoint
		// To wysyła żądanie POST do endpointu API TWOJEGO serwera
		//
		// The server endpoint (/api/send-email/+server.ts) then uses nodemailer
		// to actually send the email via Gmail SMTP (or whatever service you configured)
		//
		// Endpoint serwera (/api/send-email/+server.ts) następnie używa nodemailer
		// aby faktycznie wysłać email przez Gmail SMTP (lub jakąkolwiek usługę skonfigurowałeś)
		// -------------------------------------------------------------------
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params)
		});

		const result = await response.json();

		return {
			success: result.success ?? false,
			message: result.message,
			error: result.error
		};
	} catch (err: any) {
		return {
			success: false,
			error: err.message || 'Failed to send email / Nie udało się wysłać emaila'
		};
	}
}

/**
 * ============================================================================
 * sendEmailFromContactForm — Convenience wrapper for contact form data
 * sendEmailFromContactForm — Wygodny wrapper do danych z formularza kontaktowego
 * ============================================================================
 *
 * Takes the raw form inputs and formats them into a proper email.
 * Przyjmuje surowe dane z formularza i formatuje je w poprawny email.
 *
 * EXAMPLE / PRZYKŁAD:
 *   const result = await sendEmailFromContactForm('Paweł', 'pawel@example.com', 'Hello there');
 */
export async function sendEmailFromContactForm(
	name: string,
	email: string,
	message: string
) {
	return sendEmail({
		fromName: name,
		fromEmail: email,
		// -------------------------------------------------------------------
		// CHANGE the subject template to match your needs
		// ZMIEŃ szablon tematu aby pasował do twoich potrzeb
		// -------------------------------------------------------------------
		subject: `Contact form message from ${name}`,
		// -------------------------------------------------------------------
		// Plain text version / Wersja tekstowa
		// -------------------------------------------------------------------
		text: `From: ${name} <${email}>\n\n${message}`,
		// -------------------------------------------------------------------
		// HTML version — you can style this however you want
		// Wersja HTML — możesz to ostylować jak chcesz
		// -------------------------------------------------------------------
		html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br>')}</p>`
	});
}
