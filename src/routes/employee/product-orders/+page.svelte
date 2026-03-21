<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatOrderDateTime } from '$lib/orderDateTime';

	let { data } = $props();

	const STATUS_LABELS: Record<string, { label: string; color: string; next: string | null }> = {
		suggested: { label: 'Suggested', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', next: 'Accept' },
		accepted: { label: 'Accepted', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', next: 'Mark In Progress' },
		in_progress: { label: 'In Progress', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20', next: 'Mark Delivered' },
		delivered: { label: 'Delivered', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', next: null }
	};
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Supply Orders</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">
			Auto-created when product stock falls below 10. Advance status to track delivery.
		</p>
	</div>

	{#if data.error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
			{data.error}
		</div>
	{/if}

	{#if data.orders.length > 0}
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400">
						<tr>
							<th class="px-4 py-3 font-medium">#</th>
							<th class="px-4 py-3 font-medium">Product</th>
							<th class="px-4 py-3 font-medium">Order Qty</th>
							<th class="px-4 py-3 font-medium">Current Stock</th>
							<th class="px-4 py-3 font-medium">Created</th>
							<th class="px-4 py-3 font-medium">Status</th>
							<th class="px-4 py-3 font-medium">Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-gray-800">
						{#each data.orders as order (order.id)}
							{@const info = STATUS_LABELS[order.status] ?? STATUS_LABELS.suggested}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
								<td class="px-4 py-3 text-gray-500 dark:text-gray-400">{order.id}</td>
								<td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{order.product_name}</td>
								<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{order.quantity}</td>
								<td class="px-4 py-3 text-gray-700 dark:text-gray-300">
									{#if order.product_current_qty != null}
										<span class={order.product_current_qty < 10 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
											{order.product_current_qty}
										</span>
									{:else}
										—
									{/if}
								</td>
								<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{formatOrderDateTime(order.created_at)}</td>
								<td class="px-4 py-3">
									<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold {info.color}">
										{info.label}
									</span>
								</td>
								<td class="px-4 py-3">
									{#if info.next}
										<form method="POST" action="?/advance" use:enhance>
											<input type="hidden" name="orderId" value={order.id} />
											<input type="hidden" name="currentStatus" value={order.status} />
											<button
												type="submit"
												class="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
											>
												{info.next}
											</button>
										</form>
									{:else}
										<span class="text-xs text-gray-400">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else if !data.error}
		<div class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
			<svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
			</svg>
			<p class="text-lg font-medium text-gray-400 dark:text-gray-500">No supply orders yet</p>
			<p class="text-sm mt-1 text-gray-300 dark:text-gray-600">
				Orders are auto-created when product stock drops below 10.
			</p>
		</div>
	{/if}
</div>
