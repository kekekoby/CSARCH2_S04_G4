import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import icon from 'astro-icon';

export default defineConfig({
  integrations: [mdx(), react(), icon()],
  site: 'https://kekekoby.github.io',
  base: '/CSARCH2_S04_G4/',
});

