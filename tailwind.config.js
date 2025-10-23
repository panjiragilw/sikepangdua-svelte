// tailwind.config.js

const config = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    // ✅ Path Wajib Flowbite Svelte
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
    // ✅ Path Wajib Flowbite JavaScript
    './node_modules/flowbite/**/*.js' 
  ],
  plugins: [
     // ✅ Menggunakan require yang benar
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('flowbite/plugin')
  ],
};

export default config;