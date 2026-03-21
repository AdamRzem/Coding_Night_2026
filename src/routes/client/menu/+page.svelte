<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';

	let { data } = $props();
	let expandedId = $state<number | null>(null);

	function toggle(id: number) {
		expandedId = expandedId === id ? null : id;
	}

	function addToCart(dish: { id: number; name: string }) {
		cart.add({ id: dish.id, name: dish.name });
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Menu</h1>
			<p class="mt-1 text-gray-500 dark:text-gray-400">Click a dish to see its ingredients</p>
		</div>
		{#if cart.count > 0}
			<a
				href="/client/cart"
				class="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
				</svg>
				Cart ({cart.count})
			</a>
		{/if}
	</div>

	{#if data.error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
			Could not load menu: {data.error}
		</div>
	{/if}

	{#if data.dishes.length > 0}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.dishes as dish (dish.id)}
				<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-md">
					<button
						type="button"
						onclick={() => toggle(dish.id)}
						class="w-full text-left px-5 py-4 flex items-center justify-between gap-3 cursor-pointer"
					>
						<div class="min-w-0">
							<h2 class="font-semibold text-gray-900 dark:text-gray-100 truncate">{dish.name}</h2>
							{#if dish.prep_time_minutes != null}
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dish.prep_time_minutes} min prep</p>
							{/if}
						</div>
						<svg
							class="w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 {expandedId === dish.id ? 'rotate-180' : ''}"
							fill="none" stroke="currentColor" viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{#if expandedId === dish.id}
						<div class="border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-gray-50/50 dark:bg-gray-800/30 space-y-3">
							{#if dish.products.length > 0}
								<div>
									<p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ingredients</p>
									<div class="flex flex-wrap gap-1.5">
										{#each dish.products as product}
											<span class="text-xs px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
												{product}
											</span>
										{/each}
									</div>
								</div>
							{:else}
								<p class="text-sm text-gray-400 dark:text-gray-500">No products linked.</p>
							{/if}

							<button
								type="button"
								onclick={() => addToCart(dish)}
								class="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								Add to cart
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else if !data.error}
		<div class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
			<svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
			</svg>
			<p class="text-lg font-medium text-gray-400 dark:text-gray-500">Menu coming soon</p>
			<p class="text-sm mt-1 text-gray-300 dark:text-gray-600">Dishes will appear here once added.</p>
		</div>
	{/if}
</div>
