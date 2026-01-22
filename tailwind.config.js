/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dutch-orange': '#FF6200',
                'dutch-blue': '#2E6FD9',
                'cream': '#FFFDD0',
                'dark-bg': '#0F172A',
                'card-bg': '#1E293B',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            perspective: {
                '1000': '1000px',
            }
        },
    },
    plugins: [],
}
