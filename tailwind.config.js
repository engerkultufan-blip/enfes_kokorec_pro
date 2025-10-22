/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Netlify'a hangi dosyaların stiller için taranacağını söylüyoruz
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}