/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                'landscape': { 'raw': '(orientation: landscape)' },
                'portrait': { 'raw': '(orientation: portrait)' },
            },
        },
    },
    plugins: [],
}
