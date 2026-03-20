<script lang="ts">
	let { data } = $props();
	let columns = $derived(data.items.length > 0 ? Object.keys(data.items[0]) : []);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Past Orders</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Your order history</p>
	</div>

	{#if data.items.length > 0}
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead class="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400">
						<tr>
							{#each columns as col}
								<th class="px-4 py-3 font-medium">{col}</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-gray-800">
						{#each data.items as row}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
								{#each columns as col}
									<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{row[col] ?? '—'}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<div class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
			<svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<p class="text-lg font-medium text-gray-400 dark:text-gray-500">No past orders</p>
			<p class="text-sm mt-1 text-gray-300 dark:text-gray-600">Your order history will appear here.</p>
		</div>
	{/if}
</div>
