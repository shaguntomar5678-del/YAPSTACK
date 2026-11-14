/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F3F6FA',
        card: '#FFFFFF',
        'vitalis-navy': '#123B82',
        'vitalis-navy-dark': '#0A2558',
        'vitalis-navy-light': '#1E4E9E',
        'vitalis-blue': '#2563EB',
        'vitalis-teal': '#0D9488',
        'vitalis-teal-dark': '#0F766E',
        'vitalis-teal-light': '#14B8A6',
        'vitalis-border': '#DCE4EF',
        'vitalis-border-light': '#E9EFF7',
        'vitalis-text': '#172B4D',
        'vitalis-muted': '#64748B',
        'vitalis-warning': '#D97706',
        'vitalis-warning-light': '#FEF3C7',
        'vitalis-critical': '#DC2626',
        'vitalis-critical-light': '#FEE2E2',
        'vitalis-success': '#059669',
        'vitalis-success-light': '#D1FAE5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(18, 59, 130, 0.04), 0 1px 2px 0 rgba(18, 59, 130, 0.02)',
        'card': '0 1px 4px 0 rgba(18, 59, 130, 0.06), 0 2px 8px -1px rgba(18, 59, 130, 0.04)',
        'elevated': '0 4px 14px 0 rgba(18, 59, 130, 0.08), 0 1px 4px 0 rgba(18, 59, 130, 0.04)',
      }
    },
  },
  plugins: [],
}
