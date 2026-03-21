<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Order pickup</title>
</svelte:head>

<div class="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
	<div class="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-8 space-y-6">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Pickup ticket</h1>

		{#if data.error}
			<div
				class="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 px-4 py-3 text-sm"
				role="alert"
			>
				{data.error}
			</div>
		{:else if data.order}
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
		{/if}
	</div>
</div>
