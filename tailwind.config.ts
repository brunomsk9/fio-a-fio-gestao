import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: '#e2e8f0',
				input: '#e2e8f0',
				ring: '#3b82f6',
				background: '#f8fafc',
				foreground: '#1e293b',
				primary: {
					DEFAULT: '#3b82f6',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#16a34a',
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f1f5f9',
					foreground: '#64748b'
				},
				accent: {
					DEFAULT: '#8b5cf6',
					foreground: '#ffffff'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#1e293b'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#1e293b'
				}
			},
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
