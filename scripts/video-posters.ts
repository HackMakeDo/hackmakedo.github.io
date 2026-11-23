/**
 * Saves a poster image for every <hmd-video> embed, so the poster is served from this site and
 * nothing loads from YouTube, Vimeo or TED until a visitor presses play.
 *
 *   npm run video-posters           download any poster that isn't saved yet
 *   npm run video-posters -- --check  no network: exit 1 if any poster is missing (run by `npm run build`)
 *
 * Posters live at public/images/video-posters/<provider>-<id>.jpg, the path hmd-video looks for.
 * Embeds with a `poster` attribute (an explicit image, or "none" for a plain panel) and Instagram
 * embeds (Instagram offers no public thumbnail) are skipped.
 * Run with Node 22.18+ (it runs TypeScript directly).
 */
import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const POSTER_DIR = join(ROOT, 'public/images/video-posters');
const SCAN_DIRS = ['src/content/posts', 'src/pages'];
const check = process.argv.includes('--check');

interface Embed {
  provider: 'youtube' | 'vimeo' | 'ted';
  id: string;
  file: string;
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(md|mdx|astro)$/.test(entry.name)) yield full;
  }
}

const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

async function findEmbeds(): Promise<Embed[]> {
  const found = new Map<string, Embed>();
  for (const dir of SCAN_DIRS) {
    for await (const file of walk(join(ROOT, dir))) {
      const text = await readFile(file, 'utf8');
      for (const [tag] of text.matchAll(/<hmd-video\b[^>]*>/g)) {
        const id = attr(tag, 'video-id');
        const provider = attr(tag, 'provider') ?? 'youtube';
        if (!id || attr(tag, 'poster') !== undefined) continue; // dynamic id, or an explicit poster
        if (provider !== 'youtube' && provider !== 'vimeo' && provider !== 'ted') continue; // instagram: no public thumbnail
        found.set(`${provider}-${id}`, { provider, id, file: file.slice(ROOT.length) });
      }
    }
  }
  return [...found.values()];
}

const posterPath = (e: Embed) => join(POSTER_DIR, `${e.provider}-${e.id}.jpg`);
const exists = (path: string) => access(path).then(() => true, () => false);

async function fetchImage(url: string): Promise<Buffer | undefined> {
  const res = await fetch(url);
  if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) return undefined;
  return Buffer.from(await res.arrayBuffer());
}

async function download(e: Embed): Promise<Buffer | undefined> {
  if (e.provider === 'youtube') {
    // Largest first; hqdefault always exists but is 4:3 with black bars.
    for (const size of ['maxresdefault', 'sddefault', 'hqdefault']) {
      const img = await fetchImage(`https://i.ytimg.com/vi/${encodeURIComponent(e.id)}/${size}.jpg`);
      if (img) return img;
    }
    return undefined;
  }
  const oembed =
    e.provider === 'ted'
      ? `https://www.ted.com/services/v1/oembed.json?url=${encodeURIComponent(`https://www.ted.com/talks/${e.id}`)}`
      : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${e.id}`)}&width=1280`;
  const res = await fetch(oembed);
  if (!res.ok) return undefined;
  let { thumbnail_url: thumb } = (await res.json()) as { thumbnail_url?: string };
  // TED's thumbnail URL is a resize request (560x315); ask its image service for 1280x720 instead.
  if (thumb && e.provider === 'ted') thumb = thumb.replace('c=560%2C315', 'c=1280%2C720').replace('w=560&h=315', 'w=1280&h=720');
  return thumb ? fetchImage(thumb) : undefined;
}

const embeds = await findEmbeds();
const missing: Embed[] = [];
for (const e of embeds) if (!(await exists(posterPath(e)))) missing.push(e);

if (check) {
  if (missing.length) {
    console.error(
      `Missing video posters (the page would have no thumbnail):\n${missing
        .map((e) => `  ${e.provider} ${e.id} in ${e.file}`)
        .join('\n')}\n\nRun: npm run video-posters`,
    );
    process.exit(1);
  }
  console.log(`Video posters: all ${embeds.length} saved.`);
  process.exit(0);
}

await mkdir(POSTER_DIR, { recursive: true });
let failed = 0;
for (const e of missing) {
  const img = await download(e);
  if (!img) {
    failed++;
    console.error(
      `  No thumbnail available for ${e.provider} ${e.id} (${e.file}). The video is probably private or deleted, so it won't play\n` +
        `  for visitors either: check it, then link to it or remove it. (poster="none" gives a plain panel if it does play.)`,
    );
    continue;
  }
  await writeFile(posterPath(e), img);
  console.log(`  Saved ${e.provider}-${e.id}.jpg (${Math.round(img.length / 1024)} KB) for ${e.file}`);
}
console.log(`Video posters: ${embeds.length} embeds, ${missing.length - failed} downloaded, ${embeds.length - missing.length} already saved.`);
process.exit(failed ? 1 : 0);
