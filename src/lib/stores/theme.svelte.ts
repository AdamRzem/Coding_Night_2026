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
				document.cookie = `theme=${v}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
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
				document.cookie = `theme=${mode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
				document.documentElement.classList.toggle('dark', mode === 'dark');
			}
		}
	};
}

export const theme = createThemeStore();
