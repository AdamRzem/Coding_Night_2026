<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores/theme.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { invalidate, goto } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

	let { data, children } = $props();

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY);

	let displayName = $derived(
		data.user?.user_metadata?.display_name ||
		data.user?.user_metadata?.full_name ||
		data.user?.email?.split('@')[0] ||
		''
	);

	let isEmployeeSection = $derived(page.url.pathname.startsWith('/employee'));
	let isClientSection = $derived(page.url.pathname.startsWith('/client'));

	const publicNavLinks = [
		{ href: '/', label: 'Posts', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
		{ href: '/graph', label: 'Graph', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
		{ href: '/contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
		{ href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
	];

	const workerNavLinks = [
		{ href: '/employee', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/employee/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
		{ href: '/employee/dishes', label: 'Dishes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
		{ href: '/employee/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
		{ href: '/employee/stats', label: 'Stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
	];

	const clientNavLinks = [
		{ href: '/client', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/client/menu', label: 'Menu', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
		{ href: '/client/past-orders', label: 'Past Orders', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
		{ href: '/client/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
	];

	let activeNavLinks = $derived(
		isEmployeeSection ? workerNavLinks :
		isClientSection ? clientNavLinks :
		publicNavLinks
	);

	let brandName = $derived(
		isEmployeeSection ? 'Staff Panel' :
		isClientSection ? 'My Portal' :
		'BlogApp'
	);

	let brandClasses = $derived(
		isEmployeeSection ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300' :
		isClientSection ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300' :
		'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300'
	);

	let activeLinkClasses = $derived(
		isEmployeeSection ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shadow-sm' :
		isClientSection ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shadow-sm' :
		'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
	);

	let signInBtnClasses = $derived(
		isEmployeeSection ? 'bg-emerald-600 hover:bg-emerald-700' :
		isClientSection ? 'bg-amber-600 hover:bg-amber-700' :
		'bg-indigo-600 hover:bg-indigo-700'
	);

	let brandHref = $derived(
		isEmployeeSection ? '/employee' :
		isClientSection ? '/client' :
		'/'
	);

	let brandIcon = $derived(
		isEmployeeSection ? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' :
		isClientSection ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' :
		'M13 10V3L4 14h7v7l9-11h-7z'
	);

	/**
	 * Realtime: listen to all `public` tables in the `supabase_realtime` publication, then refetch
	 * any server load that uses `depends('supabase:db')`.
	 * - `realtime.setAuth(jwt)` so the WebSocket sends your session (needed when RLS is on; also fixes some delivery issues with SSR clients).
	 * - Schema-wide filter (no `table`) matches Supabase docs and catches Pi / SQL / Table Editor updates on any published table.
	 */
	onMount(() => {
		theme.init();

		async function syncRealtimeAuth() {
			const {
				data: { session }
			} = await supabase.auth.getSession();
			await supabase.realtime.setAuth(session?.access_token ?? null);
		}

		void syncRealtimeAuth();

		const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth');
			void syncRealtimeAuth();
		});

		let invalidateTimer: ReturnType<typeof setTimeout> | null = null;
		function scheduleDbInvalidate() {
			if (invalidateTimer) clearTimeout(invalidateTimer);
			invalidateTimer = setTimeout(() => {
				invalidateTimer = null;
				void invalidate('supabase:db');
			}, 120);
		}

		const dbChannel = supabase
			.channel('global-db-refresh')
			.on('postgres_changes', { event: '*', schema: 'public' }, () => {
				scheduleDbInvalidate();
			});

		dbChannel.subscribe((status, err) => {
			if (import.meta.env.DEV) {
				if (status === 'SUBSCRIBED') {
					console.info('[Supabase Realtime] Subscribed to postgres_changes on schema public');
				} else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
					console.warn('[Supabase Realtime]', status, err);
				}
			}
		});

		return () => {
			authSubscription.unsubscribe();
			if (invalidateTimer) clearTimeout(invalidateTimer);
			void supabase.removeChannel(dbChannel);
		};
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			(window as any).chtlConfig = {
				chatbotId: '5612156321',
				...(displayName ? { user: { name: displayName } } : {})
			};
			if (displayName) {
				document.cookie = `user_display_name=${encodeURIComponent(displayName)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
			} else {
				document.cookie = 'user_display_name=; path=/; max-age=0';
			}
		}
	});

	async function handleSignOut() {
		await supabase.auth.signOut();
		document.cookie = 'user_display_name=; path=/; max-age=0';
		goto('/');
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
	<nav class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<a href={brandHref} class="flex items-center gap-2 text-xl font-bold {brandClasses} transition-colors">
					<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={brandIcon} />
					</svg>
					{brandName}
				</a>
				<div class="flex items-center gap-1">
					{#each activeNavLinks as link}
						<a
							href={link.href}
							class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
								{page.url.pathname === link.href
								? activeLinkClasses
								: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={link.icon} />
							</svg>
							<span class="hidden sm:inline">{link.label}</span>
						</a>
					{/each}

					<div class="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 flex items-center gap-2">
						{#if data.user}
							<span class="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 truncate max-w-32">
								{displayName}
							</span>
							<button
								onclick={handleSignOut}
								class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								<span class="hidden sm:inline">Sign out</span>
							</button>
						{:else}
							<a
								href="/login"
								class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium {signInBtnClasses} text-white transition-all duration-200 shadow-sm hover:shadow"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								<span class="hidden sm:inline">Sign in</span>
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</nav>

	<main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{@render children()}
	</main>

	<footer class="border-t border-gray-200 dark:border-gray-800 mt-12">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400 dark:text-gray-600">
			&copy; {new Date().getFullYear()} SmartCanteen. Built with SvelteKit.
		</div>
	</footer>
</div>
