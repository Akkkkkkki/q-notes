import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const AUTHOR_ROUTES = new Set(['/flow/', '/capture/', '/interview/', '/desk/']);

export default defineConfig({
  output: 'static',
  site: 'https://notes.qiuyue.dev',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        format: 'webp',
        quality: 80,
        sizes: [640, 960, 1280, 1600, 2000],
        resizeOptions: {
          fit: 'cover',
          position: 'center'
        }
      }
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    mdx(),
    sitemap({
      // Author workspace routes are deployed static shells, not public reading pages.
      // Match the exact pathname so a tag or post that happens to be named `desk` stays listed.
      filter: (page) => !AUTHOR_ROUTES.has(new URL(page).pathname)
    })
  ]
});
