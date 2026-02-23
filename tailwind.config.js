module.exports = {
    content: [
        './node_modules/flotiq-components-react/dist/**/*.{js,jsx,ts,tsx}', 
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './layouts/**/*.{js,ts,jsx,tsx}',
        './sections/**/*.{js,ts,jsx,tsx}',
        './templates/**/*.{js,jsx,ts,tsx}',

    ],
    theme: {
        extend: {
            colors: {
                primary: '#000000', 
                secondary: '#D4AF37', 
                'olive-green': '#A3B562',
                gray: { 
                    100: '#F9F9F9', 
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280', 
                    600: '#4B5563',
                    700: '#374151', 
                    800: '#1F2937',
                    900: '#111827',
                },
                'light-gray': '#F9F9F9', 
            },
        },
        fontFamily: {
            poppins: ['var(--font-poppins)', 'sans-serif'],
            sora: ['var(--font-sora)', 'sans-serif'],
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/line-clamp'), 
    ],
    presets: [

        require('./node_modules/flotiq-components-react/dist/tailwind.preset'),
    ],
};