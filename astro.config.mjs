import { rm, copyFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers';
import { transformerTitle } from './src/lib/shiki-title-transformer.ts';
import { rehypeCodeBlock } from './src/lib/rehype-codeblock.ts';
import { remarkDedentCode } from './src/lib/remark-dedent-code.ts';
import { HELD_CASE_STUDIES } from './src/data/case-studies.ts';
import { writeMarkdownCopies } from './src/lib/markdown-copies.ts';

export default defineConfig({
  site: 'https://hackmakedo.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    // /styleguide/ is a design-system reference for `npm run dev` only: drop it from the production build.
    {
      name: 'hmd-drop-styleguide',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          await rm(new URL('styleguide/', dir), { recursive: true, force: true });
        },
      },
    },
    // Case studies not yet in PUBLISHED_CASE_STUDIES (src/data/case-studies.ts) stay viewable in
    // `npm run dev` but leave the production build, with their share images.
    {
      name: 'hmd-hold-case-studies',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          for (const slug of HELD_CASE_STUDIES) {
            await rm(new URL(`work/${slug}/`, dir), { recursive: true, force: true });
            await rm(new URL(`og/work/${slug}.png`, dir), { force: true });
          }
        },
      },
    },
    sitemap({
      filter: (page) =>
        !page.includes('/styleguide') &&
        !page.endsWith('/404.html') &&
        !HELD_CASE_STUDIES.some((slug) => page.endsWith(`/work/${slug}/`)),
    }),
    // The old site's sitemap was /sitemap.xml, and Search Console may still have it on file: serve the
    // sitemap index there too. After sitemap() so the index exists.
    {
      name: 'hmd-legacy-sitemap',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
        },
      },
    },
    // A Markdown copy of every page (<page>/index.html.md) for agents that send Accept: text/markdown
    // (served by cloudflare/markdown-negotiation). Hand-written copies win; the rest come from each page's HTML.
    // Last, so held case studies are already gone.
    {
      name: 'hmd-markdown-copies',
      hooks: {
        'astro:build:done': async ({ dir, logger }) => {
          const { written, kept } = await writeMarkdownCopies(dir);
          logger.info(`Markdown copies: ${written} written from HTML, ${kept} hand-written.`);
        },
      },
    },
  ],
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      transformers: [transformerNotationHighlight(), transformerNotationDiff(), transformerTitle()],
    },
    processor: unified({ remarkPlugins: [remarkDedentCode], rehypePlugins: [rehypeCodeBlock] }),
  },
});
