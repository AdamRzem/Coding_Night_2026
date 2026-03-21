import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

/** Compact signed payload embedded in the pickup QR URL. */
export type OrderTicketPayload = {
	id: number;
	dish: string;
	client: string;
	iat: number;
};

const PREFIX = 'v1';

function getSecret(): string | null {
	const s = env.ORDER_PICKUP_SECRET;
	return s && s.length >= 16 ? s : null;
}

/** Returns `null` if ORDER_PICKUP_SECRET is not configured (min 16 chars). */
export function signOrderTicket(payload: Omit<OrderTicketPayload, 'iat'>, secret?: string): string | null {
	const key = secret ?? getSecret();
	if (!key) return null;
	const body: OrderTicketPayload = {
		...payload,
		iat: Math.floor(Date.now() / 1000)
	};
	const json = JSON.stringify(body);
	const payloadB64 = Buffer.from(json, 'utf8').toString('base64url');
	const sig = createHmac('sha256', key).update(`${PREFIX}:${payloadB64}`).digest('base64url');
	return `${PREFIX}.${payloadB64}.${sig}`;
}

export function verifyOrderTicket(token: string, secret?: string): OrderTicketPayload | null {
	const key = secret ?? getSecret();
	if (!key) return null;

	const parts = token.split('.');
	if (parts.length !== 3 || parts[0] !== PREFIX) return null;
	const [, payloadB64, sig] = parts;
	if (!payloadB64 || !sig) return null;

	const expectedSig = createHmac('sha256', key).update(`${PREFIX}:${payloadB64}`).digest('base64url');
	try {
		const a = Buffer.from(expectedSig, 'utf8');
		const b = Buffer.from(sig, 'utf8');
		if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	} catch {
		return null;
	}

	try {
		const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
		const data = JSON.parse(json) as OrderTicketPayload;
		if (
			typeof data.id !== 'number' ||
			typeof data.dish !== 'string' ||
			typeof data.client !== 'string' ||
			typeof data.iat !== 'number'
		) {
			return null;
		}
		return data;
	} catch {
		return null;
	}
}

export function orderTicketSecretConfigured(): boolean {
	return getSecret() !== null;
}
