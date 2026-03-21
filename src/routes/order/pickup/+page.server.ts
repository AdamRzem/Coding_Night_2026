import type { PageServerLoad } from './$types';
import { verifyOrderTicket } from '$lib/orderTicketToken';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		return {
			order: null,
			error: 'Missing ticket. Scan a valid pickup QR code.'
		};
	}

	const payload = verifyOrderTicket(token);
	if (!payload) {
		return {
			order: null,
			error: 'Invalid or tampered ticket.'
		};
	}

	return {
		order: {
			id: payload.id,
			dishName: payload.dish,
			clientDisplayName: payload.client
		},
		error: null as string | null
	};
};
