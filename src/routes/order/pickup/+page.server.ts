import type { PageServerLoad } from './$types';
import { verifyOrderTicket } from '$lib/orderTicketToken';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		throw error(400, 'Missing ticket. Scan a valid pickup QR code.');
	}

	let payload: ReturnType<typeof verifyOrderTicket>;
	try {
		payload = verifyOrderTicket(token);
	} catch (err) {
		console.error('[Pickup] Ticket verification failed with unexpected error:', err);
		throw error(500, 'Could not verify ticket right now. Please try again in a moment.');
	}

	if (!payload) {
		throw error(404, 'Ticket was not found. The token may be invalid or expired.');
	}

	return {
		order: {
			id: payload.id,
			dishName: payload.dish,
			clientDisplayName: payload.client
		}
	};
};
