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
                    dark: '#0B1E3B', // Deep Midnight Blue (Primary)
                    blue: '#1B3B6F', // Rich Ocean Blue (Secondary)
                    gold: '#D4AF37', // Metallic Gold (Accent)
                    cream: '#F4F4F5', // Off-white/Stone (Background)
                    sand: '#E6DAC3', // Subtle sand tone
                    light: '#60A5FA', // Legacy Sky Blue (Restored)
                },
                surface: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    900: '#111827',
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
                'glass': '0 8px 32px 0 rgba(11, 30, 59, 0.15)',
                'glow': '0 0 15px rgba(212, 175, 55, 0.3)', // Gold glow
                'card': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to bottom, rgba(11, 30, 59, 0.5) 0%, rgba(11, 30, 59, 0.3) 100%)',
                'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #C6A355 100%)',
                'ocean-gradient': 'linear-gradient(135deg, #0B1E3B 0%, #1B3B6F 100%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                }
            }
        },
    },
    plugins: [
        require('tailwindcss-animate')
    ],
}
