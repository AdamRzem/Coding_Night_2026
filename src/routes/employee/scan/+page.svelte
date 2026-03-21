<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let scanning = $state(false);
	let cameraError = $state('');
	let ticketData = $state<{ id: number; dish: string; client: string } | null>(null);
	let scanError = $state('');
	let manualUrl = $state('');
	let cameraSupported = $state(true);

	let videoEl: HTMLVideoElement | undefined = $state();
	let canvasEl: HTMLCanvasElement | undefined = $state();
	let stream: MediaStream | null = null;
	let animFrameId = 0;

	$effect(() => {
		if (browser) {
			cameraSupported = !!(navigator.mediaDevices?.getUserMedia);
		}
	});

	async function startScanning() {
		if (!browser) return;
		if (!navigator.mediaDevices?.getUserMedia) {
			cameraError = 'Camera access requires HTTPS or localhost. Use the manual URL input below, or open the app on your phone (Capacitor).';
			return;
		}
		ticketData = null;
		scanError = '';
		cameraError = '';
		scanning = true;

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			if (videoEl) {
				videoEl.srcObject = stream;
				await videoEl.play();
				scanFrame();
			}
		} catch (e: any) {
			cameraError = e.message || 'Could not access camera';
			scanning = false;
		}
	}

	function scanFrame() {
		if (!videoEl || !canvasEl || !scanning) return;
		const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
			canvasEl.width = videoEl.videoWidth;
			canvasEl.height = videoEl.videoHeight;
			ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
			const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);

			import('jsqr').then(({ default: jsQR }) => {
				const code = jsQR(imageData.data, imageData.width, imageData.height, {
					inversionAttempts: 'dontInvert'
				});
				if (code?.data) {
					handleScannedUrl(code.data);
					return;
				}
				animFrameId = requestAnimationFrame(scanFrame);
			});
			return;
		}
		animFrameId = requestAnimationFrame(scanFrame);
	}

	async function handleScannedUrl(raw: string) {
		stopScanning();
		try {
			const url = new URL(raw);
			const token = url.searchParams.get('token');
			if (!token) {
				scanError = 'QR code does not contain a valid pickup token.';
				return;
			}
			const res = await fetch(`/order/pickup?token=${encodeURIComponent(token)}`);
			const html = await res.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const dds = doc.querySelectorAll('dd');
			if (dds.length >= 3) {
				ticketData = {
					id: parseInt(dds[0].textContent?.trim() ?? '0', 10),
					dish: dds[1].textContent?.trim() ?? '—',
					client: dds[2].textContent?.trim() ?? '—'
				};
			} else {
				const errorDiv = doc.querySelector('[role="alert"]');
				scanError = errorDiv?.textContent?.trim() ?? 'Could not parse ticket data.';
			}
		} catch {
			scanError = 'Invalid QR code URL.';
		}
	}

	function stopScanning() {
		scanning = false;
		cancelAnimationFrame(animFrameId);
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			stream = null;
		}
	}

	onMount(() => () => stopScanning());
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Scan Pickup QR</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Scan a client's pickup QR code to verify their order</p>
	</div>

	{#if cameraError}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
			Camera error: {cameraError}
		</div>
	{/if}

	{#if scanError}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
			{scanError}
		</div>
	{/if}

	{#if ticketData}
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
			<h2 class="text-lg font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
				Ticket verified
			</h2>
			<dl class="space-y-3 text-sm">
				<div>
					<dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Order ID</dt>
					<dd class="mt-0.5 text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">#{ticketData.id}</dd>
				</div>
				<div>
					<dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Dish</dt>
					<dd class="mt-0.5 text-base text-gray-900 dark:text-gray-100">{ticketData.dish}</dd>
				</div>
				<div>
					<dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Client</dt>
					<dd class="mt-0.5 text-base text-gray-900 dark:text-gray-100">{ticketData.client}</dd>
				</div>
			</dl>
		</div>
	{/if}

	<div class="flex gap-3">
		{#if !scanning}
			<button
				type="button"
				onclick={startScanning}
				class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
				</svg>
				{ticketData ? 'Scan another' : 'Start scanning'}
			</button>
		{:else}
			<button
				type="button"
				onclick={stopScanning}
				class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
			>
				Stop
			</button>
		{/if}
	</div>

	<div class="relative rounded-2xl overflow-hidden bg-black {scanning ? '' : 'hidden'}" style="max-width: 480px;">
		<!-- svelte-ignore element_invalid_self_closing_tag -->
		<video bind:this={videoEl} class="w-full" playsinline muted />
		<canvas bind:this={canvasEl} class="hidden"></canvas>
		<div class="absolute inset-0 border-2 border-emerald-400/50 rounded-2xl pointer-events-none"></div>
	</div>

	<!-- Manual URL input (fallback when camera is unavailable) -->
	{#if !cameraSupported}
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 space-y-3" style="max-width: 480px;">
			<h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Paste pickup URL manually</h3>
			<p class="text-xs text-gray-500 dark:text-gray-400">
				Camera requires HTTPS. Paste the QR code URL here instead, or use the native app on your phone.
			</p>
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={manualUrl}
					placeholder="https://…/order/pickup?token=…"
					class="flex-1 rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
				/>
				<button
					type="button"
					disabled={!manualUrl.trim()}
					onclick={() => handleScannedUrl(manualUrl.trim())}
					class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all cursor-pointer"
				>
					Verify
				</button>
			</div>
		</div>
	{/if}
</div>
