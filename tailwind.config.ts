import type { Config } from 'tailwindcss';
import scrollbarPlugin from 'tailwind-scrollbar'; // Import the plugin

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-rubik)', 'sans-serif'], // Set Rubik as the default sans-serif font
        amatic: ['var(--font-amatic)', 'cursive'], // Add Amatic SC utility
        'noto-serif': ['var(--font-noto-serif)', 'serif'], // Add Noto Serif Hebrew utility
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    scrollbarPlugin, // Use the imported plugin variable
  ],
}
export default config
