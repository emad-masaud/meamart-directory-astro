// @ts-check
import { defineConfig, envField } from 'astro/config';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import { ViteToml } from 'vite-plugin-toml';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  site: "https://meamart.com",
  integrations: [
    vue(),
    react(),
    mdx(),
    icon(),
    sitemap()
  ],
  vite: {
    // @ts-ignore - ignore tailwindcss vite plugin type mismatch
    plugins: [tailwindcss(), ViteToml()]
  },
  env: {
    schema: {
      POSTHOG_API_KEY: envField.string({ context: "client", access: "public", optional: true }),
      POSTHOG_API_HOST: envField.string({ context: "client", access: "public", optional: true }),
      NOTION_TOKEN: envField.string({ context: "server", access: "secret", optional: true })
    }
  }
});