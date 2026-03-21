<script lang="ts">
	import { theme } from '$lib/stores/theme.svelte';
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Settings</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Customize your experience</p>
	</div>

	<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
		<div>
			<h2 class="text-lg font-semibold mb-1">Appearance</h2>
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-5">Choose how the app looks to you</p>

			<div class="grid sm:grid-cols-2 gap-4 max-w-lg">
				<button
					onclick={() => (theme.mode = 'light')}
					class="relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer
						{theme.mode === 'light'
						? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm shadow-emerald-100 dark:shadow-emerald-900/20'
						: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'}"
				>
					{#if theme.mode === 'light'}
						<div class="absolute top-3 right-3">
							<svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
						</div>
					{/if}
					<div class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
						<svg class="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					</div>
					<div class="text-center">
						<span class="font-semibold block">Light</span>
						<span class="text-xs text-gray-500 dark:text-gray-400">Clean & bright</span>
					</div>
				</button>

				<button
					onclick={() => (theme.mode = 'dark')}
					class="relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer
						{theme.mode === 'dark'
						? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm shadow-emerald-100 dark:shadow-emerald-900/20'
						: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'}"
				>
					{#if theme.mode === 'dark'}
						<div class="absolute top-3 right-3">
							<svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
						</div>
					{/if}
					<div class="w-14 h-14 rounded-2xl bg-gray-800 dark:bg-gray-700 flex items-center justify-center">
						<svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
						</svg>
					</div>
					<div class="text-center">
						<span class="font-semibold block">Dark</span>
						<span class="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</span>
					</div>
				</button>
			</div>
		</div>
	</div>
</div>
