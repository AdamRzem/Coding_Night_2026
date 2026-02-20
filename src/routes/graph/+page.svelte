<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart as ChartType } from 'chart.js';

	let { data } = $props();
	let canvas: HTMLCanvasElement;
	let chart: ChartType | null = null;

	function processData(dates: string[]) {
		const counts: Record<string, number> = {};

		const now = new Date();
		let earliest = new Date();

		if (dates.length > 0) {
			earliest = new Date(dates[0]);
		} else {
			earliest.setDate(now.getDate() - 6);
		}

		// Fill all dates in range with 0
		const current = new Date(earliest);
		current.setHours(0, 0, 0, 0);
		const end = new Date(now);
		end.setHours(0, 0, 0, 0);

		while (current <= end) {
			counts[current.toISOString().split('T')[0]] = 0;
			current.setDate(current.getDate() + 1);
		}

		// Count posts per day
		for (const date of dates) {
			if (date) {
				const day = new Date(date).toISOString().split('T')[0];
				counts[day] = (counts[day] || 0) + 1;
			}
		}

		const labels = Object.keys(counts).sort();
		const values = labels.map((l) => counts[l]);

		return { labels, values };
	}

	onMount(() => {
		let chartInstance: ChartType | null = null;

		(async () => { // żeby mieć line zamiast bar to trzeba zamienić każde bar na line
			const {
				Chart,
				LineController,
				LineElement,
				PointElement, 
                CategoryScale,
				LinearScale,
				Tooltip,
				Legend,
				Title,
                Filler // bez jak bar
			} = await import('chart.js');
			Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title, Filler);

			const { labels, values } = processData(data.postDates);
			const isDark = document.documentElement.classList.contains('dark');

			chartInstance = new Chart(canvas, {
			type: 'line',
			data: {
				labels: labels.map((l) =>
					new Date(l + 'T00:00:00').toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric'
					})
				),
				datasets: [
					{
						label: 'Posts',
						data: values,
						backgroundColor: isDark
							? 'rgba(129, 140, 248, 0.6)'
							: 'rgba(99, 102, 241, 0.7)',
						borderColor: isDark ? 'rgb(129, 140, 248)' : 'rgb(99, 102, 241)',
						borderWidth: 1,
                        pointBackgroundColor: isDark ? 'rgb(129, 140, 248)' : 'rgb(99, 102, 241)', // bez jak bar
                        pointRadius: 4, // bez jak bar
                        pointHoverRadius: 6, // bez jak bar
                        tension: 0.4, // bez jak bar
						// borderRadius: 8,
						// borderSkipped: false, te dwa są do bar żeby mieć zaokrąglone słupki, ale line i tak jest ładniejsze więc zostawiam bez tego
						fill: true              
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					title: {
						display: false
					},
					tooltip: {
						backgroundColor: isDark ? '#1f2937' : '#fff',
						titleColor: isDark ? '#e5e7eb' : '#111827',
						bodyColor: isDark ? '#9ca3af' : '#6b7280',
						borderColor: isDark ? '#374151' : '#e5e7eb',
						borderWidth: 1,
						cornerRadius: 12,
						padding: 12
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							stepSize: 1,
							color: isDark ? '#6b7280' : '#9ca3af',
							font: { size: 12 }
						},
						grid: {
							color: isDark ? 'rgba(55,65,81,0.4)' : 'rgba(243,244,246,1)'
						},
						border: { display: false }
					},
					x: {
						ticks: {
							color: isDark ? '#6b7280' : '#9ca3af',
							font: { size: 12 }
						},
						grid: { display: false },
						border: { display: false }
					}
				}
				}
			});
			chart = chartInstance;
		})();

		return () => chartInstance?.destroy();
	});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Activity Graph</h1>
		<p class="mt-1 text-gray-500 dark:text-gray-400">Posts added over time</p>
	</div>

	<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold">Posts Per Day</h2>
			<span class="text-sm text-gray-400 dark:text-gray-500">
				{data.postDates.length} total post{data.postDates.length !== 1 ? 's' : ''}
			</span>
		</div>
		<div class="h-80">
			<canvas bind:this={canvas}></canvas>
		</div>
	</div>

	<div class="grid sm:grid-cols-3 gap-4">
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
			<p class="text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
			<p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{data.postDates.length}</p>
		</div>
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
			<p class="text-sm text-gray-500 dark:text-gray-400">First Post</p>
			<p class="text-lg font-semibold mt-1">
				{#if data.postDates.length > 0}
					{new Date(data.postDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
				{:else}
					<span class="text-gray-300 dark:text-gray-600">—</span>
				{/if}
			</p>
		</div>
		<div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
			<p class="text-sm text-gray-500 dark:text-gray-400">Latest Post</p>
			<p class="text-lg font-semibold mt-1">
				{#if data.postDates.length > 0}
					{new Date(data.postDates[data.postDates.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
				{:else}
					<span class="text-gray-300 dark:text-gray-600">—</span>
				{/if}
			</p>
		</div>
	</div>
</div>
