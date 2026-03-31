<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let props = $props<{ error?: App.Error; status?: number }>();
	let offline = $state(false);

	const knownRoutes = [
		'/',
		'/login',
		'/register',
		'/contact',
		'/settings',
		'/client',
		'/client/menu',
		'/client/cart',
		'/client/past-orders',
		'/client/settings',
		'/employee',
		'/employee/orders',
		'/employee/scan',
		'/employee/dishes',
		'/employee/products',
		'/employee/product-orders',
		'/employee/stats',
		'/employee/settings',
		'/panel',
		'/graph',
		'/order/pickup'
	];

	function normalizePath(pathname: string): string {
		if (!pathname || pathname === '/') return '/';
		const trimmed = pathname.trim().toLowerCase();
		return trimmed.endsWith('/') && trimmed.length > 1 ? trimmed.slice(0, -1) : trimmed;
	}

	function levenshtein(a: string, b: string): number {
		if (a === b) return 0;
		if (a.length === 0) return b.length;
		if (b.length === 0) return a.length;

		const previous = new Array(b.length + 1);
		const current = new Array(b.length + 1);

		for (let j = 0; j <= b.length; j++) previous[j] = j;

		for (let i = 1; i <= a.length; i++) {
			current[0] = i;
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
			}
			for (let j = 0; j <= b.length; j++) previous[j] = current[j];
		}

		return previous[b.length];
	}

	function findClosestRoute(pathname: string): string | null {
		if (!pathname || pathname === '/' || pathname.startsWith('/api/')) return null;

		let best: { route: string; score: number } | null = null;
		for (const route of knownRoutes) {
			const score = levenshtein(pathname, route);
			if (!best || score < best.score) best = { route, score };
		}

		if (!best) return null;
		const maxDistance = Math.max(2, Math.floor(pathname.length * 0.35));
		return best.score <= maxDistance ? best.route : null;
	}

	const currentPath = $derived.by(() => {
		try {
			return normalizePath(page?.url?.pathname ?? (browser ? window.location.pathname : '/'));
		} catch {
			return '/';
		}
	});

	const resolvedStatus = $derived.by(() => {
		try {
			const value = props.status ?? page?.status;
			return typeof value === 'number' ? value : 500;
		} catch {
			return 500;
		}
	});

	const resolvedError = $derived.by(() => {
		try {
			const value = props.error ?? page?.error;
			if (value && typeof value === 'object' && 'message' in value && value.message) {
				return value as App.Error;
			}
		} catch {
			// Fall through to default below.
		}

		return {
			message: 'An unexpected server or API error occurred.'
		} as App.Error;
	});

	const suggestedRoute = $derived(findClosestRoute(currentPath));

	function getErrorMeta(statusCode: number, fallbackMessage?: string) {
		switch (statusCode) {
			case 400:
				return {
					pageTitle: 'Bad request',
					heading: 'Request could not be processed',
					message: 'Please check the link or submitted data and try again.'
				};
			case 404:
				return {
					pageTitle: 'Page not found',
					heading: 'This page does not exist',
					message: 'The link may be misspelled, outdated, or removed.'
				};
			case 500:
				return {
					pageTitle: 'Internal server error',
					heading: 'Internal server error',
					message: 'Our server could not complete this request. Please try again in a moment.'
				};
			case 502:
				return {
					pageTitle: 'Upstream service error',
					heading: 'Connected service error',
					message: 'A connected provider returned an invalid response. Please retry shortly.'
				};
			case 503:
				return {
					pageTitle: 'Service unavailable',
					heading: 'Service temporarily unavailable',
					message: 'The service is currently unavailable. Please try again soon.'
				};
			case 504:
				return {
					pageTitle: 'Request timeout',
					heading: 'Upstream request timed out',
					message: 'A backend dependency took too long to respond. Please retry.'
				};
			default:
				return {
					pageTitle: 'Unexpected error',
					heading: 'Something went wrong',
					message: fallbackMessage || 'An unexpected server or API error occurred.'
				};
		}
	}

	const errorMeta = $derived(getErrorMeta(resolvedStatus, resolvedError.message));

	onMount(() => {
		if (!browser) return;
		offline = !navigator.onLine;

		const onOnline = () => {
			offline = false;
		};
		const onOffline = () => {
			offline = true;
		};

		window.addEventListener('online', onOnline);
		window.addEventListener('offline', onOffline);

		return () => {
			window.removeEventListener('online', onOnline);
			window.removeEventListener('offline', onOffline);
		};
	});
</script>

<svelte:head>
	<title>{errorMeta.pageTitle}</title>
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
	<div
		class="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
	>
		<p class="text-sm font-semibold tracking-widest text-gray-500 uppercase dark:text-gray-400">
			Error {resolvedStatus}
		</p>

		<h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
			{errorMeta.heading}
		</h1>

		<p class="text-gray-600 dark:text-gray-300">{errorMeta.message}</p>

		{#if offline}
			<div
				class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
			>
				You appear to be offline. Check your internet connection and try again.
			</div>
		{/if}

		{#if resolvedStatus === 404 && suggestedRoute}
			<div
				class="rounded-xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-200"
			>
				Did you mean <a href={suggestedRoute} class="font-semibold underline hover:no-underline"
					>{suggestedRoute}</a
				>?
			</div>
		{/if}

		{#if resolvedError.requestId}
			<p class="text-xs text-gray-500 dark:text-gray-400">
				Reference ID: <span class="font-mono">{resolvedError.requestId}</span>
			</p>
		{/if}

		<div class="flex flex-wrap gap-3 pt-2">
			<a
				href="/"
				class="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
			>
				Go to home
			</a>
			<a
				href="/login"
				class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
			>
				Go to login
			</a>
		</div>
	</div>
</section>
