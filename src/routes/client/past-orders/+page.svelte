<script lang="ts">
	import { formatOrderDateTime } from '$lib/orderDateTime';

	let { data } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Past Orders</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Your order history</p>
	</div>

	{#if data.error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
			Could not load orders: {data.error}
		</div>
	{/if}

	{#if data.items.length > 0}
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400">
						<tr>
							<th class="px-4 py-3 font-medium">#</th>
							<th class="px-4 py-3 font-medium">Dish</th>
							<th class="px-4 py-3 font-medium">Created</th>
							<th class="px-4 py-3 font-medium">Planned pickup</th>
							<th class="px-4 py-3 font-medium">Plate</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-gray-800">
						{#each data.items as row (row.id)}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
								<td class="px-4 py-3 text-gray-500 dark:text-gray-400">{row.id}</td>
								<td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{row.dish_name}</td>
							<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{formatOrderDateTime(row.created_at)}</td>
							<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{formatOrderDateTime(row.planned_pickup)}</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-300">{row.id_plate ?? '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else if !data.error}
		<div class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
			<svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<p class="text-lg font-medium text-gray-400 dark:text-gray-500">No past orders</p>
			<p class="text-sm mt-1 text-gray-300 dark:text-gray-600">Your order history will appear here.</p>
		</div>
	{/if}
</div>
