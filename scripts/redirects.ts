/**
 * Redirects from the old WordPress blog (blog.hackmakedo.com) to this site, from cloudflare/blog-redirects/blog-url-map.csv.
 *
 *   npm run redirects -- --build-map   rebuild cloudflare/blog-redirects/src/map.json from the CSV
 *   npm run redirects                  offline: the Worker sends every old URL in the CSV to its new URL,
 *                                      and every new URL exists in dist/ (run `npm run build` first)
 *   npm run redirects -- --live        ask blog.hackmakedo.com for every old URL and check the 301 it
 *                                      returns (once the Worker is deployed)
 *   npm run redirects -- --live --targets   also check every new URL answers 200 on hackmakedo.com (after launch)
 *
 * Exit 1 on any failure. Run with Node 22.18+ (it runs TypeScript directly).
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CSV = join(ROOT, 'cloudflare/blog-redirects/blog-url-map.csv');
const MAP = join(ROOT, 'cloudflare/blog-redirects/src/map.json');
const DIST = join(ROOT, 'dist');
const args = process.argv.slice(2);

interface Row { old_url: string; new_url: string; rule: string }

async function readRows(): Promise<Row[]> {
  const [header, ...lines] = (await readFile(CSV, 'utf8')).trim().split(/\r?\n/);
  const cols = header.split(',');
  // No field in the map contains a comma or a quote, so a plain split is enough; check that stays true.
  return lines.map((line) => {
    const cells = line.split(',');
    if (cells.length !== cols.length) throw new Error(`Unexpected CSV row (commas inside a field?): ${line}`);
    return Object.fromEntries(cols.map((c, i) => [c, cells[i]])) as unknown as Row;
  });
}

const pathOf = (url: string) => new URL(url).pathname;

async function buildMap(rows: Row[]) {
  const map = { posts: {}, ids: {}, pageIds: {}, tags: {}, categories: {}, media: {} } as Record<string, Record<string, string>>;
  for (const r of rows) {
    const old = new URL(r.old_url);
    const path = old.pathname.toLowerCase();
    const to = pathOf(r.new_url);
    let m: RegExpExecArray | null;
    if (r.rule.startsWith('R03')) map.ids[old.searchParams.get('p')!] = to;
    else if (r.rule.startsWith('R04')) map.pageIds[old.searchParams.get('page_id')!] = to;
    else if (r.rule.startsWith('R05')) map.media[path.slice('/wp-content/uploads/'.length)] = to;
    else if ((m = /^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\//.exec(path))) map.posts[m[1]] = to;
    else if ((m = /^\/tag\/([^/]+)\//.exec(path))) map.tags[m[1]] = to;
    else if ((m = /^\/category\/([^/]+)\//.exec(path))) map.categories[m[1]] = to;
  }
  // Stable key order, so a rebuild with no changes leaves the file untouched.
  const sorted = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))]),
  );
  await writeFile(MAP, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Wrote ${MAP.slice(ROOT.length)}: ${Object.entries(map).map(([k, v]) => `${Object.keys(v).length} ${k}`).join(', ')}.`);
}

/** The file in dist/ that serves a new-site path. */
const distFile = (path: string) => join(DIST, path.endsWith('/') ? `${path}index.html` : path);
const exists = (file: string) => access(file).then(() => true, () => false);

async function offline(rows: Row[]) {
  const { redirectFor } = await import('../cloudflare/blog-redirects/src/redirect-for.ts');
  const failures: string[] = [];
  for (const r of rows) {
    const got = redirectFor(r.old_url);
    if (got !== r.new_url) failures.push(`  ${r.old_url}\n    Worker: ${got}\n    map:    ${r.new_url} (${r.rule})`);
  }

  const haveDist = await exists(DIST);
  if (haveDist) {
    for (const target of new Set(rows.map((r) => pathOf(r.new_url)))) {
      if (!(await exists(distFile(target)))) failures.push(`  ${target} is a redirect target but isn't in dist/`);
    }
  }

  if (failures.length) {
    console.error(`Redirect check failed:\n${failures.join('\n')}`);
    process.exit(1);
  }
  console.log(
    `Redirects: all ${rows.length} old URLs go where the map says` +
      (haveDist ? `, and all ${new Set(rows.map((r) => r.new_url)).size} targets exist in dist/.` : '. (No dist/: run `npm run build` to check the targets exist.)'),
  );
}

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => { while (queue.length) await fn(queue.shift()!); }));
}

async function live(rows: Row[], checkTargets: boolean) {
  const failures: string[] = [];
  await pool(rows, 8, async (r) => {
    const res = await fetch(r.old_url, { redirect: 'manual' }).catch((e: Error) => e);
    if (res instanceof Error) return void failures.push(`  ${r.old_url}: ${res.message}`);
    const location = res.headers.get('location');
    if (res.status !== 301 || location !== r.new_url) {
      failures.push(`  ${r.old_url}: ${res.status} ${location ?? '(no Location)'}, expected 301 ${r.new_url}`);
    }
  });
  if (checkTargets) {
    await pool([...new Set(rows.map((r) => r.new_url))], 8, async (url) => {
      const res = await fetch(url, { method: 'HEAD' }).catch((e: Error) => e);
      if (res instanceof Error || res.status !== 200) failures.push(`  ${url}: ${res instanceof Error ? res.message : res.status}`);
    });
  }
  if (failures.length) {
    console.error(`Live redirect check failed (${failures.length}):\n${failures.join('\n')}`);
    process.exit(1);
  }
  console.log(`Live: all ${rows.length} old URLs return 301 to the right place${checkTargets ? ', and every target answers 200' : ''}.`);
}

const rows = await readRows();
if (args.includes('--build-map')) await buildMap(rows);
else if (args.includes('--live')) await live(rows, args.includes('--targets'));
else await offline(rows);
