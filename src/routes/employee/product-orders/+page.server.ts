import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

const STATUS_FLOW: Record<string, string> = {
	suggested: 'accepted',
	accepted: 'in_progress',
	in_progress: 'delivered'
};

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('supabase:db');

	const { data, error } = await locals.supabase
		.from('product_order')
		.select('id, created_at, quantity, status, product:id_product(id, name, quantity)')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error loading product orders:', error.message);
		return { orders: [], error: error.message };
	}

	const orders = (data ?? []).map((o: any) => ({
		id: o.id,
		created_at: o.created_at,
		quantity: o.quantity,
		status: o.status,
		product_name: o.product?.name ?? '—',
		product_id: o.product?.id ?? null,
		product_current_qty: o.product?.quantity ?? null
	}));

	return { orders, error: null as string | null };
};

export const actions: Actions = {
	advance: async ({ request, locals }) => {
		const formData = await request.formData();
		const orderId = Number(formData.get('orderId'));
		const currentStatus = formData.get('currentStatus')?.toString();

		if (!orderId || !currentStatus) return fail(400, { error: 'Missing data' });

		const nextStatus = STATUS_FLOW[currentStatus];
		if (!nextStatus) return fail(400, { error: `Cannot advance from status "${currentStatus}"` });

		// Fetch the order first to verify its current status and get restock info
		const { data: order, error: fetchErr } = await locals.supabase
			.from('product_order')
			.select('id, id_product, quantity, status')
			.eq('id', orderId)
			.maybeSingle();

		if (fetchErr) {
			console.error('Error fetching product order:', fetchErr.message);
			return fail(500, { error: fetchErr.message });
		}

		if (!order) return fail(404, { error: 'Order not found' });

		if (order.status !== currentStatus) {
			return fail(409, { error: 'Order status has already changed. Please refresh.' });
		}

		// Update status
		const { error: updateErr } = await locals.supabase
			.from('product_order')
			.update({ status: nextStatus })
			.eq('id', orderId);

		if (updateErr) {
			console.error('Error advancing product order:', updateErr.message);
			return fail(500, { error: updateErr.message });
		}

		// Restock when transitioning to 'delivered'
		if (nextStatus === 'delivered') {
			const { data: product } = await locals.supabase
				.from('product')
				.select('id, quantity')
				.eq('id', order.id_product)
				.maybeSingle();

			if (product) {
				const newQty = (product.quantity ?? 0) + (order.quantity ?? 0);
				const { error: restockErr } = await locals.supabase
					.from('product')
					.update({ quantity: newQty })
					.eq('id', product.id);

				if (restockErr) {
					console.error('Error restocking product:', restockErr.message);
				} else {
					console.log(
						`Restocked product #${product.id}: ${product.quantity} + ${order.quantity} = ${newQty}`
					);
				}
			}
		}

		return { success: true };
	}
};
