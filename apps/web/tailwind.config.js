/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				display: ['var(--font-display)'],
				sans: ['var(--font-sans)'],
				label: ['var(--font-label)'],
			},
			fontSize: {
				'step--2': 'var(--step--2)',
				'step--1': 'var(--step--1)',
				'step-0': 'var(--step-0)',
				'step-1': 'var(--step-1)',
				'step-2': 'var(--step-2)',
				'step-3': 'var(--step-3)',
				'step-4': 'var(--step-4)',
				'step-5': 'var(--step-5)',
			},
			spacing: {
				'space-s': 'var(--space-s)',
				'space-m': 'var(--space-m)',
				'space-l': 'var(--space-l)',
				'space-xl': 'var(--space-xl)',
				'space-2xl': 'var(--space-2xl)',
				'space-3xl': 'var(--space-3xl)',
				tap: 'var(--tap)',
			},
			colors: {
				evo: {
					ink: 'var(--ink-900)',
					deep: 'var(--ink-950)',
					slate: 'var(--slate-800)',
					raised: 'var(--slate-700)',
					navy: 'var(--navy-700)',
					cyan: 'var(--cyan-400)',
					'cyan-light': 'var(--cyan-300)',
					paper: 'var(--paper)',
					mist: 'var(--mist)',
					fog: 'var(--fog)',
					rule: 'var(--rule)',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
