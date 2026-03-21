<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data, form }: { data: any; form: any } = $props();
	let selectedDishId = $state('');
	let submitting = $state(false);
	let orderPlaced = $state(false);

	function addFromDropdown() {
		const id = Number(selectedDishId);
		const dish = data.dishes.find((d: any) => d.id === id);
		if (dish) {
			cart.add({ id: dish.id, name: dish.name });
			selectedDishId = '';
		}
	}

	const PICKUP_TIME_SLOTS = [
		{ h: 7, m: 45 },  // 7:45
		{ h: 8, m: 35 },  // 8:35
		{ h: 9, m: 25 },  // 9:25
		{ h: 10, m: 15 }, // 10:15
		{ h: 11, m: 15 }, // 11:15
		{ h: 12, m: 5 },  // 12:05
		{ h: 12, m: 55 }, // 12:55
		{ h: 14, m: 0 },  // 14:00
		{ h: 14, m: 45 }, // 14:45
		{ h: 15, m: 40 }, // 15:40
		{ h: 16, m: 30 }, // 16:30
		{ h: 17, m: 20 }, // 17:20
		{ h: 18, m: 10 }, // 18:10
	];

	function getDefaultPickupDate(): string {
		const d = new Date();
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd}`;
	}

	function buildPickupDatetime(dateStr: string, slot: { h: number; m: number }): string {
		return `${dateStr}T${String(slot.h + 1).padStart(2, '0')}:${String(slot.m).padStart(2, '0')}`;
	}

	// Default: today's date, first available slot (7:45) or next slot if 7:45 has passed
	function getDefaultSlotIndex(): number {
		const now = new Date();
		const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
		const idx = PICKUP_TIME_SLOTS.findIndex(({ h, m }) => h * 60 + m > minutesSinceMidnight);
		return idx >= 0 ? idx : 0;
	}

	let pickupDate = $state(getDefaultPickupDate());
	let pickupSlotIndex = $state(getDefaultSlotIndex());
	let pickupTime = $derived(buildPickupDatetime(pickupDate, PICKUP_TIME_SLOTS[Number(pickupSlotIndex)]));
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Cart</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">
			Each item will be placed as a separate order.
		</p>
	</div>

	{#if form?.error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
			{form.error}
		</div>
	{/if}

	{#if orderPlaced}
		<div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl text-sm">
			Orders placed successfully! <a href="/client" class="underline font-medium">Go to dashboard</a>
		</div>
	{/if}

	<!-- Add from dropdown -->
	<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
		<h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add a dish</h2>
		<div class="flex gap-2">
			<select
				bind:value={selectedDishId}
				class="flex-1 rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-amber-500 focus:ring-amber-500 text-sm transition-colors"
			>
				<option value="" disabled>Select a dish…</option>
				{#each data.dishes as dish}
					<option value={dish.id}>{dish.name}</option>
				{/each}
			</select>
			<button
				type="button"
				onclick={addFromDropdown}
				disabled={!selectedDishId}
				class="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all cursor-pointer"
			>
				Add
			</button>
		</div>
	</div>

	<!-- Cart items -->
	{#if cart.count > 0}
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
			<ul class="divide-y divide-gray-100 dark:divide-gray-800">
				{#each cart.items as item, idx (idx)}
					<li class="flex items-center justify-between px-5 py-3">
						<div class="flex items-center gap-3">
							<span class="text-xs text-gray-400 w-6 text-right">{idx + 1}.</span>
							<span class="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
						</div>
						<button
							type="button"
							onclick={() => cart.remove(idx)}
							class="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
							title="Remove"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Pickup time + submit -->
		<form
			method="POST"
			action="?/placeOrders"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					submitting = false;
					if (result.type === 'success') {
						cart.clear();
						orderPlaced = true;
					} else {
						await update();
					}
				};
			}}
			class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 space-y-4"
		>
			<input type="hidden" name="dishIds" value={JSON.stringify(cart.items.map(i => i.id))} />
			<input type="hidden" name="plannedPickup" value={pickupTime} />

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="pickupDate" class="block text-sm font-medium mb-1.5">Pickup date</label>
					<input
						type="date"
						id="pickupDate"
						bind:value={pickupDate}
						class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-amber-500 focus:ring-amber-500 transition-colors"
						required
					/>
				</div>
				<div>
					<label for="pickupTime" class="block text-sm font-medium mb-1.5">Pickup time</label>
					<select
						id="pickupTime"
						bind:value={pickupSlotIndex}
						class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-amber-500 focus:ring-amber-500 transition-colors"
					>
						{#each PICKUP_TIME_SLOTS as slot, i}
							<option value={i}>
								{String(slot.h).padStart(2, '0')}:{String(slot.m).padStart(2, '0')}
							</option>
						{/each}
					</select>
				</div>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
			>
				{#if submitting}
					<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Placing orders…
				{:else}
					Place {cart.count} order{cart.count !== 1 ? 's' : ''}
				{/if}
			</button>
		</form>
	{:else if !orderPlaced}
		<div class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
			<svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
			</svg>
			<p class="text-lg font-medium text-gray-400 dark:text-gray-500">Your cart is empty</p>
			<a href="/client/menu" class="inline-block mt-2 text-sm text-amber-600 dark:text-amber-400 hover:underline">Browse the menu &rarr;</a>
		</div>
	{/if}
</div>
