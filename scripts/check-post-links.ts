/**
 * Checks every external link in the blog posts and fixes the ones that rot.
 *
 *   npm run check:links             report only
 *   npm run check:links -- --write  apply the safe fixes, then review the diff
 *
 * What --write changes:
 *   - links to the old blogs (creativewebspecialist.co.uk, blog.hackmakedo.com) -> the post on this site
 *   - http links whose https address is the same page -> https
 *   - dead links (4xx/5xx, no such site) and links that now redirect to a home page instead of
 *     the page they named -> the Web Archive copy closest to the post's date
 * Links that redirect somewhere specific are only listed: the page may have moved, or not.
 * Twitter/X blocks automated checks, so those links are listed as unchecked.
 * Code blocks are skipped. Run with Node 22.18+ (it runs TypeScript directly).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const POSTS = new URL('../src/content/posts/', import.meta.url).pathname;
const write = process.argv.includes('--write');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const OLD_BLOGS = ['creativewebspecialist.co.uk', 'www.creativewebspecialist.co.uk', 'blog.hackmakedo.com', 'creativewebspecialist.wordpress.com'];
const UNCHECKABLE = ['twitter.com', 'www.twitter.com', 'x.com', 'mobile.twitter.com'];
/** Placeholder addresses used as examples in the text, not real links. */
const EXAMPLES = /(^|\.)(mysite|yoursite|example)\.(co\.uk|com|org)$|^localhost$/;
/** Domains that lapsed and now belong to someone else: always use the archive copy. */
const TAKEN_OVER = ['compass-style.org', 'teacommerce.net'];

interface Post { file: string; slug: string; date: string; text: string }
type Verdict =
  | { kind: 'ok' }
  | { kind: 'https'; to: string }
  | { kind: 'internal'; to: string }
  | { kind: 'archive'; to: string; why: string }
  | { kind: 'dead'; why: string }
  | { kind: 'moved'; to: string }
  | { kind: 'unchecked'; why: string };

const posts: Post[] = [];
for (const name of (await readdir(POSTS)).filter((n) => n.endsWith('.md'))) {
  const text = await readFile(join(POSTS, name), 'utf8');
  const date = /^date:\s*(\d{4}-\d{2}-\d{2})/m.exec(text)?.[1] ?? '2013-01-01';
  posts.push({ file: name, slug: name.replace(/\.md$/, ''), date, text });
}
const slugs = new Set(posts.map((p) => p.slug));

/** External links outside code fences: [text](url), <url> and href="url". */
function linksIn(text: string): string[] {
  const body = text.replace(/^---[\s\S]*?^---/m, '').replace(/^```[\s\S]*?^```/gm, '');
  const found = new Set<string>();
  for (const m of body.matchAll(/\]\((https?:\/\/(?:[^()\s]|\([^()\s]*\))+)\)|<(https?:\/\/[^>\s]+)>|href="(https?:\/\/[^"]+)"/g)) {
    found.add((m[1] ?? m[2] ?? m[3]).trim());
  }
  return [...found];
}

const segments = (u: URL) => u.pathname.split('/').filter(Boolean).length;

/** Fetches with retries. `gone` means the site itself no longer exists (DNS or refused). */
async function get(url: string): Promise<{ status: number; final: string } | { gone: boolean }> {
  let gone = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
      // A "successful" HTML page with almost nothing in it (no <title>, a few bytes) is a dead
      // site still answering requests, as nibble.be does: report it as gone.
      if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
        const body = await res.text();
        if (body.length < 512 && !/<title>\s*\S/i.test(body)) return { status: 410, final: res.url };
        // A web host's "this domain has no site" placeholder (cPanel and similar).
        if (/defaultwebpage\.cgi|domain (is )?parked|this domain (may be|is) for sale/i.test(body)) return { status: 410, final: res.url };
      } else await res.body?.cancel();
      return { status: res.status, final: res.url };
    } catch (err) {
      const code = (err as { cause?: { code?: string } }).cause?.code ?? '';
      gone = ['ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN', 'ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED', 'DEPTH_ZERO_SELF_SIGNED_CERT'].includes(code);
      if (code === 'ENOTFOUND') break;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return { gone };
}

async function archiveCopy(url: string, date: string): Promise<string | undefined> {
  const stamp = date.replace(/-/g, '');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}&timestamp=${stamp}`, {
        signal: AbortSignal.timeout(45000),
      });
      const data = (await res.json()) as { archived_snapshots?: { closest?: { available: boolean; status: string; url: string } } };
      const snap = data.archived_snapshots?.closest;
      return snap?.available && snap.status === '200' ? snap.url.replace(/^http:\/\//, 'https://') : undefined;
    } catch {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return undefined;
}

/** "creativewebspecialist.co.uk/2013/07/16/some-post/" -> "/blog/some-post/" when that post exists here. */
function internal(u: URL): string | undefined {
  const last = u.pathname.split('/').filter(Boolean).pop();
  if (!last) return '/blog/';
  return slugs.has(last) ? `/blog/${last}/` : undefined;
}

async function judge(url: string, date: string): Promise<Verdict> {
  let u: URL;
  try { u = new URL(url); } catch { return { kind: 'dead', why: 'not a valid URL' }; }
  if (u.hostname === 'web.archive.org') return { kind: 'ok' };
  if (EXAMPLES.test(u.hostname) || !u.hostname.includes('.')) return { kind: 'ok' };
  if (UNCHECKABLE.includes(u.hostname)) return { kind: 'unchecked', why: 'Twitter/X blocks automated checks' };
  if (OLD_BLOGS.includes(u.hostname)) {
    const to = internal(u);
    return to ? { kind: 'internal', to } : { kind: 'dead', why: 'old blog address with no matching post here' };
  }

  const res = await get(url);
  const archive = async (why: string): Promise<Verdict> => {
    const to = await archiveCopy(url, date);
    return to ? { kind: 'archive', to, why } : { kind: 'dead', why: `${why}, and no Web Archive copy` };
  };
  if (TAKEN_OVER.includes(u.hostname.replace(/^www\./, ''))) return archive('domain now belongs to someone else');
  if ('gone' in res) return res.gone ? archive('the site no longer exists') : { kind: 'unchecked', why: 'no response after 3 tries' };
  if (res.status === 403 || res.status === 429) return { kind: 'unchecked', why: `HTTP ${res.status}: the site refuses automated checks` };
  if (res.status >= 400) return archive(`HTTP ${res.status}`);

  const final = new URL(res.final);
  if (final.href === u.href) return { kind: 'ok' };
  // Same page, only the scheme or a trailing slash/www differs.
  const norm = (x: URL) => x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/$/, '') + x.search;
  if (norm(final) === norm(u)) return u.protocol === 'http:' && final.protocol === 'https:' ? { kind: 'https', to: final.href } : { kind: 'ok' };
  // Redirected from a specific page to a site's home or a near-empty path: the page is gone.
  // A page that now lands on a site's home, a 404 page, or a shallower page with nothing
  // identifying it (no query, different last segment) is gone, not moved.
  const last = (x: URL) => x.pathname.split('/').filter(Boolean).pop()?.toLowerCase();
  const shallower = segments(final) < segments(u) && !final.search && last(final) !== last(u);
  if (segments(u) >= 1 && (segments(final) === 0 || /404/.test(final.pathname) || shallower))
    return archive(`now redirects to ${final.origin}${final.pathname}`);
  if (/\/(login|signin|auth)\b/.test(final.pathname)) return { kind: 'unchecked', why: 'redirects to a sign-in page' };
  return { kind: 'moved', to: final.href };
}

// Check each distinct (url, post date) once, a few at a time.
const jobs = posts.flatMap((p) => linksIn(p.text).map((url) => ({ post: p, url })));
const verdicts = new Map<string, Verdict>();
const queue = [...jobs];
let done = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const key = `${job.url} ${job.post.date}`;
      if (!verdicts.has(key)) verdicts.set(key, await judge(job.url, job.post.date));
      if (++done % 25 === 0) process.stderr.write(`  checked ${done} of ${jobs.length}\n`);
    }
  }),
);

// Several different pages that now all land on the same address were not moved one-to-one:
// that address is a generic landing page, so treat them as gone.
const landings = new Map<string, Set<string>>();
for (const [key, v] of verdicts) if (v.kind === 'moved') landings.set(v.to, (landings.get(v.to) ?? new Set()).add(key.split(' ')[0].replace(/#.*$/, '')));
for (const [key, v] of verdicts) {
  if (v.kind !== 'moved' || (landings.get(v.to)?.size ?? 0) < 2) continue;
  const [url, date] = key.split(' ');
  if (segments(new URL(url)) === 0) continue; // a home page moving to a home page is a rename
  const to = await archiveCopy(url, date);
  verdicts.set(key, to ? { kind: 'archive', to, why: `now lands on a generic page, ${v.to}` } : { kind: 'dead', why: 'generic landing page, and no Web Archive copy' });
}

const groups: Record<Verdict['kind'], string[]> = { ok: [], https: [], internal: [], archive: [], dead: [], moved: [], unchecked: [] };
const edits = new Map<string, [string, string][]>();
for (const { post, url } of jobs) {
  const v = verdicts.get(`${url} ${post.date}`)!;
  const where = `${post.slug}`;
  if (v.kind === 'ok') { groups.ok.push(url); continue; }
  if (v.kind === 'https' || v.kind === 'internal' || v.kind === 'archive') {
    groups[v.kind].push(`${url}\n      -> ${v.to}${v.kind === 'archive' ? `  (${v.why})` : ''}\n      in ${where}`);
    edits.set(post.file, [...(edits.get(post.file) ?? []), [url, v.to]]);
  } else if (v.kind === 'moved') groups.moved.push(`${url}\n      -> ${v.to}\n      in ${where}`);
  else groups[v.kind].push(`${url}  (${v.why})\n      in ${where}`);
}

const heading: Record<Verdict['kind'], string> = {
  ok: 'Working',
  https: 'Switch to https (same page)',
  internal: 'Old blog address -> post on this site',
  archive: 'Dead or redirected to a home page -> Web Archive copy nearest the post date',
  moved: 'Redirects somewhere specific: review by hand (not changed)',
  dead: 'Dead with no archive copy: review by hand (not changed)',
  unchecked: 'Could not be checked automatically',
};
for (const kind of ['internal', 'https', 'archive', 'moved', 'dead', 'unchecked'] as const) {
  if (!groups[kind].length) continue;
  console.log(`\n## ${heading[kind]} (${groups[kind].length})\n`);
  for (const line of groups[kind]) console.log(`  ${line}`);
}
console.log(`\n${jobs.length} links in ${posts.length} posts: ${groups.ok.length} working, ${groups.https.length + groups.internal.length + groups.archive.length} fixable, ${groups.moved.length + groups.dead.length} to review, ${groups.unchecked.length} unchecked.`);

if (write) {
  for (const [file, pairs] of edits) {
    let text = await readFile(join(POSTS, file), 'utf8');
    for (const [from, to] of pairs) {
      // Only replace the URL where it is a link target, never inside code.
      text = text.split(`](${from})`).join(`](${to})`).split(`<${from}>`).join(`<${to}>`).split(`href="${from}"`).join(`href="${to}"`);
    }
    await writeFile(join(POSTS, file), text);
  }
  console.log(`Updated ${edits.size} posts. Review the diff before committing.`);
}
