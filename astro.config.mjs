// @ts-check
import { defineConfig, envField } from 'astro/config';
import vue from '@astrojs/vue';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import { ViteToml } from 'vite-plugin-toml';
import tailwindcss from '@tailwindcss/vite';
import remarkEmoji from 'remark-emoji';

import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  site: "https://meamart.com",
  markdown: {
    remarkPlugins: [remarkEmoji],
  },
  integrations: [
    vue(),
    mdx(),
    icon(),
    sitemap(),
    keystatic()
  ],
  vite: {
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