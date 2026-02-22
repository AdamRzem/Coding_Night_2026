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

	// Derive display name from user metadata or email
	let displayName = $derived(
		data.user?.user_metadata?.display_name ||
		data.user?.user_metadata?.full_name ||
		data.user?.email?.split('@')[0] ||
		''
	);

	onMount(() => {
		theme.init();

		const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
			invalidate('supabase:auth');
		});

		return () => subscription.unsubscribe();
	});

	// Set chatbot user name when user data changes
	$effect(() => {
		if (typeof window !== 'undefined') {
			(window as any).chtlConfig = {
				chatbotId: '5612156321',
				...(displayName ? { user: { name: displayName } } : {})
			};
			// Also store in cookie for SSR access
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

	const navLinks = [
		{ href: '/', label: 'Posts', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
		{ href: '/graph', label: 'Graph', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
		{ href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
		{ href: '/contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
	];
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
	<nav class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<a href="/" class="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
					<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					BlogApp
				</a>
				<div class="flex items-center gap-1">
					{#each navLinks as link}
						<a
							href={link.href}
							class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
								{page.url.pathname === link.href
								? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
								: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={link.icon} />
							</svg>
							<span class="hidden sm:inline">{link.label}</span>
						</a>
					{/each}

					<!-- Auth section -->
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
								class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow-sm hover:shadow"
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
			&copy; {new Date().getFullYear()} BlogApp. Built with SvelteKit.
		</div>
	</footer>
</div>

