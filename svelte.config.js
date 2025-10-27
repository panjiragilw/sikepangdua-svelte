import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/doc>
    // If your environment is not supported, or you settled on a specific envir>
    // See https://svelte.dev/docs/kit/adapters for more information about adap>
    //adapter: adapter()

        // 2. Ganti adapter() menjadi adapter-static
    adapter: adapter({
        // Tentukan folder output (penting untuk Nginx)
        pages: 'build', 
        assets: 'build',
        // Fallback untuk SPA routing (harus ada index.html di output)
        fallback: 'index.html', 
    }),
    paths: {
        // Penting: base path harus kosong jika diakses dari root IP
        base: '', 
    }
  }
};

export default config;
