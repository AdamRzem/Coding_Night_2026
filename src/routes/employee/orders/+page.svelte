<script lang="ts">
	let { data } = $props();
	let columns = $derived(data.items.length > 0 ? Object.keys(data.items[0]) : []);

	function formatDateTime(value: string): string {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, '0');
		const dd = String(date.getDate()).padStart(2, '0');
		const hh = String(date.getHours()).padStart(2, '0');
		const min = String(date.getMinutes()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
	}

	function formatDish(item: Record<string, unknown>): string {
		const name = item.name != null ? String(item.name) : '';
		const prep = item.prep_time_minutes != null ? String(item.prep_time_minutes) : '';
		if (name && prep) return `${name} (${prep} min)`;
		if (name) return name;
		if (prep) return `${prep} min`;
		return JSON.stringify(item);
	}

	function formatCellValue(column: string, value: unknown): string {
		if (value == null) return '—';
		if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
			if (typeof value === 'string' && ['created_at', 'planned_pickup', 'received_at'].includes(column)) {
				return formatDateTime(value);
			}
			return String(value);
		}
		if (Array.isArray(value)) {
			if (value.length === 0) return '—';
			return value
				.map((item) => {
					if (item && typeof item === 'object' && 'name' in item) {
						return formatDish(item as Record<string, unknown>);
					}
					return typeof item === 'object' ? JSON.stringify(item) : String(item);
				})
				.join(', ');
		}
		if (typeof value === 'object' && value && 'name' in value) {
			return formatDish(value as Record<string, unknown>);
		}
		return JSON.stringify(value);
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Orders</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">View and manage all orders</p>
	</div>

	{#if data.error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
			Failed to load orders: {data.error}
		</div>
	{/if}

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
									<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{formatCellValue(col, (row as Record<string, unknown>)[col])}</td>
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
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
			<p class="text-lg font-medium text-gray-400 dark:text-gray-500">No orders yet</p>
			<p class="text-sm mt-1 text-gray-300 dark:text-gray-600">Orders will appear here once they're created.</p>
		</div>
	{/if}
</div>
