import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { remarkBaseLinks } from './src/lib/remark-base-links.mjs';

/**
 * Deployment configuration.
 *
 * This site serves at the root of its custom domain
 * (https://madar-manteghi.danialrashidi.ir), so the defaults below already
 * point at the production origin with no base path. BASE_PATH / SITE_URL
 * environment variables still win when set (CI sets them explicitly), but a
 * plain `npm run build` with no env deploys correctly without any variables.
 */
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const site = process.env.SITE_URL ?? 'https://madar-manteghi.danialrashidi.ir';

export default defineConfig({
  site,
  base: basePath || '/',
  trailingSlash: 'ignore',
  build: {
    // Static by default: no adapter is configured anywhere in this template.
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  markdown: {
    gfm: true,
    // Authors always write clean `/lessons/...` links in content; the deployment
    // base is applied here so project-site builds never 404 on them.
    remarkPlugins: [[remarkBaseLinks, { base: basePath }]],
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    // MDX goes through the MDX integration's own pipeline, so the base-link
    // plugin must be registered there as well as on `markdown`.
    mdx({ remarkPlugins: [[remarkBaseLinks, { base: basePath }]] }),
    sitemap({
      // Suggest only indexable routes: the search page carries
      // `noindex, follow` and must never appear in the sitemap.
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/+$/, '');
        return pathname !== `${basePath}/search`;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@lib': '/src/lib',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@config': '/src/config',
        '@islands': '/src/islands',
      },
    },
  },
});