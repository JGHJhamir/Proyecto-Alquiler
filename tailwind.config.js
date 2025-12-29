/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                brand: {
                    blue: '#2563EB', // Royal Blue
                    dark: '#1E3A8A', // Deep Ocean
                    light: '#60A5FA', // Sky Blue
                },
                ocean: {
                    50: '#F0F9FF',
                    100: '#E0F2FE',
                    500: '#0EA5E9',
                    900: '#0C4A6E',
                },
                sand: {
                    100: '#FEFCE8', // Very light yellow
                    200: '#FFF7ED', // Warm white
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
            }
        },
    },
    plugins: [
        require('tailwindcss-animate')
    ],
}
