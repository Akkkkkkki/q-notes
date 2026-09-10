import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const AUTHOR_ROUTES = ['/flow/', '/capture/', '/interview/', '/desk/'];

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
      filter: (page) => !AUTHOR_ROUTES.some((route) => page.includes(route))
    })
  ]
});
