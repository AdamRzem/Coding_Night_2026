function createThemeStore() {
	let mode = $state<'light' | 'dark'>('light');

	return {
		get mode() {
			return mode;
		},
		set mode(v: 'light' | 'dark') {
			mode = v;
			if (typeof window !== 'undefined') {
				localStorage.setItem('theme', v);
				document.documentElement.classList.toggle('dark', v === 'dark');
			}
		},
		init() {
			if (typeof window !== 'undefined') {
				const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
				if (saved) {
					mode = saved;
				} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
					mode = 'dark';
				}
				document.documentElement.classList.toggle('dark', mode === 'dark');
			}
		}
	};
}

export const theme = createThemeStore();
