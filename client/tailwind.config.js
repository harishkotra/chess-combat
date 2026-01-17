/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'chess-dark': '#262421',
                'chess-light': '#f0d9b5',
                'chess-brown': '#b58863',
            }
        },
    },
    plugins: [],
}
