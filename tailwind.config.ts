import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {},
		fontFamily: {
		  	'ubuntu': ['Ubuntu Mono', 'monospace']
		},
	},

	plugins: []
} as Config;
