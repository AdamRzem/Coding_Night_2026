<script lang="ts">
	import { browser } from '$app/environment';

	let { data } = $props();

	let qrModalOpen = $state(false);
	let qrImageSrc = $state('');
	let qrLoading = $state(false);
	let qrSummary = $state<{ id: unknown; dish: string } | null>(null);

	async function openPickupQr(url: string | null, row: { id: unknown; dish_name: string }) {
		if (!browser || !url) return;
		qrSummary = { id: row.id, dish: row.dish_name };
		qrModalOpen = true;
		qrLoading = true;
		qrImageSrc = '';
		try {
			const QRCode = (await import('qrcode')).default;
			qrImageSrc = await QRCode.toDataURL(url, {
				width: 280,
				margin: 2,
				color: { dark: '#0f172a', light: '#ffffff' }
			});
		} catch (e) {
			console.error(e);
		} finally {
			qrLoading = false;
		}
	}

	function closeQrModal() {
		qrModalOpen = false;
		qrSummary = null;
		qrImageSrc = '';
	}

	function formatDateTime(value: string | null): string {
		if (!value) return '—';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, '0');
		const dd = String(date.getDate()).padStart(2, '0');
		const hh = String(date.getHours()).padStart(2, '0');
		const min = String(date.getMinutes()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
	}

	const quickLinks = [
		{ href: '/client/menu', label: 'Menu', description: 'Browse available dishes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
		{ href: '/client/cart', label: 'Cart', description: 'Review your cart and place orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
		{ href: '/client/past-orders', label: 'Past Orders', description: 'View your order history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
		{ href: '/client/settings', label: 'Settings', description: 'Customize your preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
	];
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Welcome</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Your personal portal. Explore below.</p>
	</div>

	<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each quickLinks as link}
			<a
				href={link.href}
				class="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all duration-200 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800"
			>
				<div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
					<svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={link.icon} />
					</svg>
				</div>
				<h3 class="font-semibold text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{link.label}</h3>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{link.description}</p>
			</a>
		{/each}
	</div>

	<!-- Active orders (in progress) -->
	<div>
		<h2 class="text-xl font-bold tracking-tight mb-3">Active orders</h2>
		{#if data.activeOrdersError}
			<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
				Could not load active orders: {data.activeOrdersError}
			</div>
		{:else if data.activeOrders.length > 0}
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
							{#each data.activeOrders as row (row.id)}
								<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
									<td class="px-4 py-3 text-gray-500 dark:text-gray-400">{row.id}</td>
									<td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{row.dish_name}</td>
									<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(row.created_at)}</td>
									<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(row.planned_pickup)}</td>
									<td class="px-4 py-3 text-gray-600 dark:text-gray-300">{row.id_plate ?? '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<div class="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
				No active orders. When you place an order that isn't finished yet, it will show here.
			</div>
		{/if}
	</div>

	<!-- Latest ordered foods -->
	<div>
		<h2 class="text-xl font-bold tracking-tight mb-3">Latest ordered foods</h2>
		{#if !data.pickupQrEnabled}
			<p class="mb-3 text-xs text-amber-800 dark:text-amber-200/90 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-2">
				Pickup QR codes are off until you set <code class="rounded bg-amber-100 dark:bg-amber-900/50 px-1">ORDER_PICKUP_SECRET</code> (at least 16 characters) in
				<code class="rounded bg-amber-100 dark:bg-amber-900/50 px-1">.env</code> and restart the dev server.
			</p>
		{/if}
		{#if data.latestFoodsError}
			<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
				Could not load latest foods: {data.latestFoodsError}
			</div>
		{:else if data.latestFoods.length > 0}
			<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-sm text-left">
						<thead class="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 dark:text-gray-400">
							<tr>
								<th class="px-4 py-3 font-medium">#</th>
								<th class="px-4 py-3 font-medium">Dish</th>
								<th class="px-4 py-3 font-medium">Ordered</th>
								<th class="px-4 py-3 font-medium">Status</th>
								<th class="px-4 py-3 font-medium">Pickup QR</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100 dark:divide-gray-800">
							{#each data.latestFoods as row (row.id)}
								<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
									<td class="px-4 py-3 text-gray-500 dark:text-gray-400">{row.id}</td>
									<td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
										<button
											type="button"
											class="text-left underline-offset-2 hover:underline text-amber-700 dark:text-amber-300 disabled:no-underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
											disabled={!row.pickup_qr_url}
											onclick={() => openPickupQr(row.pickup_qr_url ?? null, row)}
											title={row.pickup_qr_url ? 'Show pickup QR code' : 'Configure ORDER_PICKUP_SECRET to enable'}
										>
											{row.dish_name}
										</button>
									</td>
									<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(row.created_at)}</td>
									<td class="px-4 py-3">
										{#if row.is_done}
											<span class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
												<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
												Done
											</span>
										{:else}
											<span class="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
												<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
												In progress
											</span>
										{/if}
									</td>
									<td class="px-4 py-3">
										<button
											type="button"
											disabled={!row.pickup_qr_url}
											onclick={() => openPickupQr(row.pickup_qr_url ?? null, row)}
											class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
											</svg>
											QR
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<div class="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
				No orders yet. <a href="/client/menu" class="text-amber-600 dark:text-amber-400 hover:underline">Browse the menu</a> to get started.
			</div>
		{/if}
	</div>
</div>

{#if qrModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		onclick={(e) => e.target === e.currentTarget && closeQrModal()}
	>
		<div
			class="relative max-w-sm w-full rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-6 space-y-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="qr-dialog-title"
		>
			<button
				type="button"
				class="absolute top-3 right-3 p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
				onclick={closeQrModal}
				aria-label="Close"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
			</button>
			<h3 id="qr-dialog-title" class="text-lg font-semibold text-gray-900 dark:text-gray-50 pr-8">
				Pickup QR
			</h3>
			{#if qrSummary}
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Order <span class="font-mono font-medium text-gray-900 dark:text-gray-100">#{qrSummary.id}</span>
					· {qrSummary.dish}
				</p>
			{/if}
			<p class="text-xs text-gray-500 dark:text-gray-500">
				Scanning opens a page with order ID, dish name, and your display name for staff.
			</p>
			<div class="flex justify-center rounded-xl bg-white p-3 border border-gray-100 dark:border-gray-800">
				{#if qrLoading}
					<div class="h-[280px] w-[280px] flex items-center justify-center text-sm text-gray-500">Generating…</div>
				{:else if qrImageSrc}
					<img src={qrImageSrc} alt="QR code linking to pickup ticket" class="w-[280px] h-[280px]" width="280" height="280" />
				{:else}
					<p class="text-sm text-red-600 dark:text-red-400">Could not create QR code.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
