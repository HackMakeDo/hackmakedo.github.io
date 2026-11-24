import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, type OgImageOptions } from '../../lib/og-image';
import { OG_PAGES } from '../../data/og-pages';
import { topicLabel } from '../../data/topics';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const postPages = posts.map((post) => ({
    params: { slug: `blog/${post.id}` },
    props: {
      card: {
        eyebrow: 'Blog',
        title: post.data.title,
        meta: fmt(post.data.date),
        chips: post.data.topics.map(topicLabel),
      } satisfies OgImageOptions,
    },
  }));

  const staticPages = OG_PAGES.map(({ slug, card }) => ({ params: { slug }, props: { card } }));

  // Client case studies are gated by permission the same way their pages are (see
  // src/pages/work/[client]/index.astro) - no card is generated until a client is
  // actually publishable, so there's never a stray /og/work/<client>.png for a name
  // that isn't live yet.
  const clients = await getCollection(
    'clients',
    (c) => c.data.permission && !!c.data.caseStudySlug && c.data.caseStudySlug !== 'council-of-the-european-union',
  );
  const clientPages = clients.map((client) => ({
    params: { slug: `work/${client.data.caseStudySlug}` },
    props: { card: { eyebrow: 'Client work', title: client.data.name } satisfies OgImageOptions },
  }));

  return [...staticPages, ...postPages, ...clientPages];
}

export async function GET({ props }: APIContext) {
  const { card } = props as { card: OgImageOptions };
  const png = await renderOgImage(card);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
