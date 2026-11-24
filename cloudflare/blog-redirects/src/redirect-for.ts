/**
 * Where an old blog.hackmakedo.com (WordPress) URL lives on the new site. A port of `target()` in
 * content/rules.py: the lookups come from content/blog-url-map.csv (built into map.json by
 * `npm run redirects -- --build-map`), and the patterns catch URLs the map never listed, such as
 * other pages of a tag archive or a post URL with WordPress's query strings on it.
 * Anything unrecognised goes to the blog listing rather than a 404.
 */
import map from './map.json' with { type: 'json' };

export const NEW_ORIGIN = 'https://hackmakedo.com';

interface RedirectMap {
  posts: Record<string, string>; // old post slug -> new path
  ids: Record<string, string>; // ?p=<id> -> new path
  pageIds: Record<string, string>; // ?page_id=<id> -> new path
  tags: Record<string, string>; // tag slug -> post or topic path
  categories: Record<string, string>; // category slug -> topic path
  media: Record<string, string>; // path under /wp-content/uploads/ -> new path
}

const MAP = map as RedirectMap;
const BLOG = '/blog/';

function newPath(url: URL): string {
  let path = url.pathname || '/';
  // WordPress URLs end in a slash; add it unless the last segment looks like a file.
  if (!path.endsWith('/') && !path.slice(path.lastIndexOf('/') + 1).includes('.')) path += '/';
  path = path.toLowerCase();

  if (path === '/') {
    const p = url.searchParams.get('p');
    if (p && MAP.ids[p]) return MAP.ids[p];
    const pageId = url.searchParams.get('page_id');
    if (pageId && MAP.pageIds[pageId]) return MAP.pageIds[pageId];
    return BLOG;
  }

  if (path.startsWith('/wp-content/uploads/')) return MAP.media[path.slice('/wp-content/uploads/'.length)] ?? BLOG;

  let m = /^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\//.exec(path);
  if (m) return MAP.posts[m[1]] ?? BLOG; // also comment pages, attachments and per-post feeds

  if (/^\/\d{4}\/(\d{2}\/)?(page\/\d+\/)?$/.test(path)) return BLOG; // date archives
  if (/^\/page\/\d+\/$/.test(path)) return BLOG; // paged home

  m = /^\/tag\/([^/]+)\/(page\/\d+\/)?$/.exec(path);
  if (m) return MAP.tags[m[1]] ?? BLOG;

  m = /^\/category\/([^/]+)\/(page\/\d+\/)?$/.exec(path);
  if (m) return MAP.categories[m[1]] ?? BLOG;

  if (path.startsWith('/author/')) return '/about/';
  if (path.endsWith('/feed/')) return '/blog/rss.xml';
  if (path === '/contact/') return '/contact/';
  return BLOG;
}

/** The full new URL for an old blog URL. */
export function redirectFor(oldUrl: string): string {
  return NEW_ORIGIN + newPath(new URL(oldUrl));
}
