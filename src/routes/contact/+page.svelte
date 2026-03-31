<script lang="ts">
	import { onMount } from 'svelte';

	let mapContainer: HTMLDivElement;

	onMount(() => {
		let mapInstance: any = null;
		let linkEl: HTMLLinkElement | null = null;

		(async () => {
			const L = await import('leaflet');

			// Load Leaflet CSS
			const link = document.createElement('link');
			linkEl = link;
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
			document.head.appendChild(link);

			// Fix Leaflet default icon paths for bundlers
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
			});

			// Wait for CSS
			await new Promise((resolve) => setTimeout(resolve, 150));

			// Nowy Sącz, Poland: 49.6249, 20.6872
			const map = L.map(mapContainer).setView([49.6249, 20.6872], 14);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			L.marker([49.6249, 20.6872])
				.addTo(map)
				.bindPopup('<strong>Our Location</strong><br>Nowy Sącz, Poland')
				.openPopup();

			mapInstance = map;
		})();

		return () => {
			mapInstance?.remove();
			linkEl?.remove();
		};
	});

	let email = '';
	let name = '';
	let message = '';
	let status = '';
	let statusTone: 'idle' | 'pending' | 'success' | 'error' = 'idle';

	async function sendEmail() {
		if (typeof navigator !== 'undefined' && !navigator.onLine) {
			statusTone = 'error';
			status = 'No internet connection. Please reconnect and try again.';
			return;
		}

		statusTone = 'pending';
		status = 'Sending...';

		try {
			const response = await fetch('/api/send-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					fromName: name,
					fromEmail: email,
					subject: `Contact form message from ${name}`,
					text: `From: ${name} <${email}>\n\n${message}`,
					html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message}</p>`
				})
			});

			let result: { success?: boolean; error?: string } | null = null;
			try {
				result = await response.json();
			} catch {
				// Ignore parse errors to provide a friendly fallback message below.
			}

			if (!response.ok || !result?.success) {
				statusTone = 'error';
				status = result?.error
					? `Error: ${result.error}`
					: `Request failed (${response.status}). Please try again.`;
				return;
			}

			statusTone = 'success';
			status = 'Email sent!';
			name = '';
			email = '';
			message = '';
		} catch (error) {
			statusTone = 'error';
			status =
				error instanceof TypeError
					? 'Network error. Please check your internet connection and try again.'
					: 'Failed to send email. Please try again later.';
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Contact</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Get in touch with us</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Contact Info -->
		<div
			class="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
		>
			<h2 class="text-lg font-semibold">Contact Information</h2>

			<div class="space-y-4">
				<div class="flex items-start gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30"
					>
						<svg
							class="h-5 w-5 text-indigo-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</div>
					<div>
						<p class="font-medium">Address</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Nowy Sącz, Poland</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30"
					>
						<svg
							class="h-5 w-5 text-indigo-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<div>
						<p class="font-medium">Email</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">contact@example.com</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30"
					>
						<svg
							class="h-5 w-5 text-indigo-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
							/>
						</svg>
					</div>
					<div>
						<p class="font-medium">Phone</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">+48 123 456 789</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Map -->
		<div
			class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
		>
			<h2 class="mb-4 text-lg font-semibold">Our Location</h2>
			<div
				bind:this={mapContainer}
				class="h-72 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
			></div>
		</div>
	</div>

	<!-- Contact Form -->
	<div
		class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
	>
		<h2 class="mb-4 text-lg font-semibold">Send us a message</h2>
		<form class="space-y-4" on:submit|preventDefault={sendEmail}>
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label for="name" class="mb-1.5 block text-sm font-medium">Name</label>
					<input
						type="text"
						bind:value={name}
						id="name"
						name="name"
						placeholder="Your name"
						class="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
						required
					/>
				</div>
				<div>
					<label for="email" class="mb-1.5 block text-sm font-medium">Email</label>
					<input
						type="email"
						bind:value={email}
						id="email"
						name="email"
						placeholder="your@email.com"
						class="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
						required
					/>
				</div>
			</div>
			<div>
				<label for="message" class="mb-1.5 block text-sm font-medium">Message</label>
				<textarea
					id="message"
					bind:value={message}
					name="message"
					rows={4}
					placeholder="Your message..."
					class="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					required
				></textarea>
			</div>
			<button
				type="submit"
				disabled={statusTone === 'pending'}
				class="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow active:bg-indigo-800"
			>
				<svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
					/>
				</svg>
				Send Message
			</button>
			{#if status}
				<p
					class="mt-2 text-sm {statusTone === 'error'
						? 'text-red-600 dark:text-red-400'
						: statusTone === 'success'
							? 'text-emerald-600 dark:text-emerald-400'
							: 'text-gray-500 dark:text-gray-400'}"
				>
					{status}
				</p>
			{/if}
		</form>
	</div>
</div>
