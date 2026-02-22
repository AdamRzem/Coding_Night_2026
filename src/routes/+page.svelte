<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form }: { data: any; form: any } = $props();

	let optimisticPosts = $state<any[]>([]);
	let allPosts = $derived([...optimisticPosts, ...data.blogPosts]);
	let title = $state('');
	let text = $state('');
	let submitting = $state(false);

	let isLoggedIn = $derived(!!data.user);

	// Clear optimistic posts when server data refreshes
	$effect(() => {
		data.blogPosts;
		optimisticPosts = [];
	});
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Posts</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Share your thoughts with the world</p>
	</div>

	{#if isLoggedIn}
	<!-- New Post Form -->
	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			submitting = true;
			return async ({ result, update }) => {
				submitting = false;
				if (result.type === 'success' && (result.data as any)?.post) {
					optimisticPosts = [(result.data as any).post, ...optimisticPosts];
					title = '';
					text = '';
				} else {
					await update();
				}
			};
		}}
		class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4"
	>
		<h2 class="text-lg font-semibold flex items-center gap-2">
			<svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Create New Post
		</h2>

		{#if form?.error}
			<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
				{form.error}
			</div>
		{/if}

		<div>
			<label for="title" class="block text-sm font-medium mb-1.5">Title</label>
			<input
				type="text"
				id="title"
				name="title"
				bind:value={title}
				placeholder="Enter post title..."
				class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
				required
			/>
		</div>

		<div>
			<label for="text" class="block text-sm font-medium mb-1.5">Content</label>
			<textarea
				id="text"
				name="text"
				rows={4}
				bind:value={text}
				placeholder="What's on your mind?"
				class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
				required
			></textarea>
		</div>

		<button
			type="submit"
			disabled={submitting}
			class="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow"
		>
			{#if submitting}
				<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Posting...
			{:else}
				<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
				</svg>
				Publish Post
			{/if}
		</button>
	</form>
	{:else}
	<!-- Sign-in prompt -->
	<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
		<svg class="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
		</svg>
		<p class="text-gray-500 dark:text-gray-400 mb-3">Sign in to create posts</p>
		<a
			href="/login"
			class="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow"
		>
			Sign in
		</a>
	</div>
	{/if}

	<!-- Posts List -->
	<div class="space-y-4">
		{#each allPosts as post (post.id)}
			<article class="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all duration-200 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
				<div class="flex items-start justify-between gap-4">
					<h3 class="text-xl font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{post.title}</h3>
					<time class="shrink-0 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
						{post.createdAt
							? new Date(post.createdAt).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric'
								})
							: 'No date'}
					</time>
				</div>
				{#if post.user_display_name}
					<p class="mt-1 text-sm text-indigo-500 dark:text-indigo-400">
						<svg class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						{post.user_display_name}
					</p>
				{/if}
				<p class="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{post.text}</p>
			</article>
		{:else}
			<div class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
				<svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
				</svg>
				<p class="text-lg font-medium text-gray-400 dark:text-gray-500">No posts yet</p>
				<p class="text-sm mt-1 text-gray-300 dark:text-gray-600">Be the first to publish something!</p>
			</div>
		{/each}
	</div>
</div>