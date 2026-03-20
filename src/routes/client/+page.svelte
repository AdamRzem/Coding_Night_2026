<script lang="ts">
	let { data } = $props();

	const quickLinks = [
		{ href: '/client/menu', label: 'Menu', description: 'Browse available dishes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
		{ href: '/client/settings', label: 'Settings', description: 'Customize your preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
		{ href: '/client/past-orders', label: 'Past Orders', description: 'View your order history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
	];
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Welcome</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Your personal portal. Explore below.</p>
	</div>

	<div class="grid sm:grid-cols-3 gap-4">
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
</div>
