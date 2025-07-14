import { defineStore } from "pinia";
import { ref } from "vue";


type Theme = 'light' | 'dark'
export const useThemeStore = defineStore("theme", () => {
	const currentTheme = ref<Theme>('light');
	const setTheme = (theme: Theme) => {
		currentTheme.value = theme;
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(theme);
		localStorage.setItem('theme', theme);
	};

	const toggleTheme = () => {
		const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
	};

	const initTheme = () => {
		const savedTheme = localStorage.getItem('theme') as Theme | null;
		if (savedTheme) {
			setTheme(savedTheme);
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			setTheme(prefersDark ? 'dark' : 'light');
		}
	}

	return {
		currentTheme,
		setTheme,
		toggleTheme,
		initTheme
	}
})