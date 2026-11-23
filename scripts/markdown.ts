/**
 * Markdown for agents (cloudflare/markdown-negotiation).
 *
 *   npm run markdown            offline: every built page has a Markdown copy, and the Worker's logic, run
 *                               against dist/, answers Accept: text/markdown with it (run `npm run build` first)
 *   npm run markdown -- --live  ask hackmakedo.com itself, once the Worker is deployed
 *
 * Exit 1 on any failure. Run with Node 22.18+ (it runs TypeScript directly).
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { join, relative, sep, extname } from 'node:path';
import { negotiate } from '../cloudflare/markdown-negotiation/src/negotiate.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const SITE = 'https://hackmakedo.com';
const failures: string[] = [];
const check = (ok: boolean, message: string) => void (ok || failures.push(`  ${message}`));
const exists = (p: string) => access(p).then(() => true, () => false);

const BROWSER = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
const AGENT = 'text/markdown, text/html;q=0.9, */*;q=0.1';

async function* htmlPages(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'pagefind' && entry.name !== '_astro') yield* htmlPages(full);
    } else if (entry.name.endsWith('.html')) yield full;
  }
}

const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png', '.xml': 'application/xml' };

/** Stands in for GitHub Pages: serves dist/, with /x/ -> /x/index.html and a 404 for anything missing. */
async function fromDist(input: Request | string): Promise<Response> {
  const path = decodeURIComponent(new URL(typeof input === 'string' ? input : input.url).pathname);
  const file = join(DIST, path.endsWith('/') ? `${path}index.html` : path);
  if (!(await exists(file))) return new Response('Not found', { status: 404, headers: { 'content-type': TYPES['.html'] } });
  return new Response(await readFile(file), { headers: { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' } });
}

async function offline() {
  if (!(await exists(DIST))) {
    console.error('No dist/: run `npm run build` first.');
    process.exit(1);
  }
  let pages = 0;
  for await (const file of htmlPages(DIST)) {
    const rel = relative(DIST, file).split(sep).join('/');
    if (rel === '404.html') continue;
    pages++;
    check(await exists(`${file}.md`), `/${rel} has no Markdown copy (${rel}.md)`);
  }

  const ask = (path: string, accept: string, method = 'GET') =>
    negotiate(new Request(SITE + path, { method, headers: { accept } }), fromDist);

  const post = '/blog/the-new-way-to-do-a-404-umbraco-handler/';
  for (const path of ['/', '/about/', post, post.slice(0, -1), '/umbraco-upgrades/']) {
    const res = await ask(path, AGENT);
    const body = await res.text();
    check(res.headers.get('content-type')?.startsWith('text/markdown') ?? false, `${path} with Accept: text/markdown should be Markdown, got ${res.headers.get('content-type')}`);
    check(/^(---|# )/.test(body), `${path} Markdown should start with front matter or a heading`);
    check(Number(res.headers.get('x-markdown-tokens')) > 0, `${path} should send x-markdown-tokens`);
    check(/accept/i.test(res.headers.get('vary') ?? ''), `${path} Markdown should send Vary: Accept`);
  }
  const head = await ask(post, AGENT, 'HEAD');
  check(head.headers.get('content-type')?.startsWith('text/markdown') ?? false, 'HEAD with Accept: text/markdown should be Markdown');

  const html = await ask(post, BROWSER);
  check(html.headers.get('content-type')?.startsWith('text/html') ?? false, 'a browser should still get HTML');
  check(/accept/i.test(html.headers.get('vary') ?? ''), 'HTML should send Vary: Accept');

  const home = await ask('/', BROWSER);
  const links = home.headers.get('link') ?? '';
  check(/<\/llms\.txt>;\s*rel="describedby"/.test(links), `the homepage should send Link: </llms.txt>; rel="describedby", got "${links}"`);
  check(/<\/index\.html\.md>;\s*rel="alternate"/.test(links), 'the homepage should send a Link to its Markdown copy');
  check(/rel="alternate"/.test(html.headers.get('link') ?? ''), 'a post should send a Link to its Markdown copy');

  const missing = await ask('/no-such-page/', AGENT);
  check(missing.status === 404, `a missing page with Accept: text/markdown should stay a 404, got ${missing.status}`);
  const image = await ask('/og/home.png', AGENT);
  check(image.headers.get('content-type') === 'image/png', 'files that are not pages pass straight through');

  report(`Markdown: all ${pages} pages have a copy, and the Worker answers Accept: text/markdown with it.`);
}

async function live() {
  const post = `${SITE}/blog/the-new-way-to-do-a-404-umbraco-handler/`;
  for (const url of [`${SITE}/`, post, `${SITE}/umbraco-freelancer/`]) {
    const res = await fetch(url, { headers: { accept: 'text/markdown' } });
    check(res.ok && (res.headers.get('content-type') ?? '').startsWith('text/markdown'), `${url}: ${res.status} ${res.headers.get('content-type')}, expected Markdown`);
    check(Number(res.headers.get('x-markdown-tokens')) > 0, `${url}: no x-markdown-tokens header`);
  }
  const html = await fetch(post, { headers: { accept: BROWSER } });
  check((html.headers.get('content-type') ?? '').startsWith('text/html'), `${post}: a browser got ${html.headers.get('content-type')}`);
  check(/accept/i.test(html.headers.get('vary') ?? ''), `${post}: HTML has no Vary: Accept (is the Worker deployed?)`);
  const home = await fetch(`${SITE}/`, { headers: { accept: BROWSER } });
  check(/rel="describedby"/.test(home.headers.get('link') ?? ''), `${SITE}/: no Link rel="describedby" header`);
  report('Live: hackmakedo.com answers Accept: text/markdown with Markdown, and browsers with HTML.');
}

function report(ok: string) {
  if (failures.length) {
    console.error(`Markdown check failed:\n${failures.join('\n')}`);
    process.exit(1);
  }
  console.log(ok);
}

await (process.argv.includes('--live') ? live() : offline());
