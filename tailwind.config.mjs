const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
        sans: ['Gabarito', 'Noto Kufi Arabic', 'sans-serif'],
      },
			colors: {
				primary: {
					DEFAULT: '#00008B',
					50: '#e6e6f9',
					100: '#ccccf4',
					200: '#9999e9',
					300: '#6666df',
					400: '#3333d4',
					500: '#00008B',
					600: '#000070',
					700: '#000053',
					800: '#000038',
					900: '#00001c',
				},
				gray: colors.zinc,
				background: 'var(--background)',
				foreground: 'var(--foreground)',
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
