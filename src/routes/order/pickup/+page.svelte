<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Order pickup</title>
</svelte:head>

<div class="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
	<div class="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-8 space-y-6">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Pickup ticket</h1>

		{#if data.order}
			<dl class="space-y-4 text-sm">
				<div>
					<dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Order ID</dt>
					<dd class="mt-1 text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">{data.order.id}</dd>
				</div>
				<div>
					<dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Dish</dt>
					<dd class="mt-1 text-base text-gray-900 dark:text-gray-100">{data.order.dishName}</dd>
				</div>
				<div>
					<dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Display name</dt>
					<dd class="mt-1 text-base text-gray-900 dark:text-gray-100">{data.order.clientDisplayName}</dd>
				</div>
			</dl>
		{:else}
			<div
				class="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 px-4 py-3 text-sm"
				role="status"
			>
				No pickup data available.
			</div>
		{/if}
	</div>
</div>
