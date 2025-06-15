import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createTheme() {
	const { subscribe, set } = writable(false);

	return {
		subscribe,
		toggle: () => {
			if (browser) {
				const isDark = document.documentElement.classList.contains('dark');
				const newMode = !isDark;

				if (newMode) {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}

				localStorage.setItem('darkMode', String(newMode));
				set(newMode);
			}
		},
		init: () => {
			if (browser) {
				const stored = localStorage.getItem('darkMode');
				const isDark =
					stored === 'true' ||
					(!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);

				if (isDark) {
					document.documentElement.classList.add('dark');
				}
				set(isDark);
			}
		}
	};
}

export const theme = createTheme();
