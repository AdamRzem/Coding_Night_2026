<script lang="ts">
	let { data } = $props();
	let columns = $derived(data.items.length > 0 ? Object.keys(data.items[0]) : []);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Dishes</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Manage the dish catalog</p>
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
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
			</svg>
			<p class="text-lg font-medium text-gray-400 dark:text-gray-500">No dishes yet</p>
			<p class="text-sm mt-1 text-gray-300 dark:text-gray-600">Dishes will appear here once they're added.</p>
		</div>
	{/if}
</div>
