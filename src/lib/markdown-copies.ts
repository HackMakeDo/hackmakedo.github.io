/**
 * Writes a Markdown copy of every built page (`<page>/index.html.md`) after `astro build`, so agents
 * can ask for Markdown instead of scraping HTML. The Cloudflare Worker in cloudflare/markdown-negotiation
 * serves these for `Accept: text/markdown`. Pages with a hand-written copy (src/pages/**\/index.html.md.ts)
 * keep it; every other page is converted from its own HTML, so the copy always matches the page.
 *
 * Only <main> is converted. Layout chrome (navigation, buttons, icons, the contents sidebar,
 * screen-reader-only duplicates) is dropped; code blocks keep their language; video, gist and
 * looping-clip embeds become links.
 */
import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import type { Root, Element, ElementContent, Text } from 'hast';

const SITE = 'https://hackmakedo.com';
/** Built pages that never get a copy: the 404 is served at any missing address. */
const SKIP = new Set(['404.html']);

const DROP_TAGS = new Set(['script', 'style', 'svg', 'button', 'nav', 'form', 'template', 'noscript', 'hmd-copy', 'iframe']);
const DROP_CLASSES = ['hmd-sr', 'hmd-codeblock__bar', 'post__toc', 'hmd-video__play', 'hmd-gist__show', 'hmd-loop__toggle', 'hmd-backdrop'];

const classes = (el: Element): string[] => {
  const c: unknown = el.properties?.className;
  return Array.isArray(c) ? c.map(String) : typeof c === 'string' ? c.split(/\s+/) : [];
};
const text = (node: ElementContent): string =>
  node.type === 'text' ? node.value : node.type === 'element' ? node.children.map(text).join('') : '';
const el = (tagName: string, properties: Element['properties'], children: ElementContent[]): Element => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const t = (value: string): Text => ({ type: 'text', value });

function find(node: Root | Element, test: (e: Element) => boolean): Element | undefined {
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    if (test(child)) return child;
    const hit = find(child, test);
    if (hit) return hit;
  }
  return undefined;
}

/** Rewrites the tree in place: drops chrome, flattens code blocks, turns embeds into links. */
function tidy(parent: Element): void {
  const out: ElementContent[] = [];
  for (const child of parent.children) {
    if (child.type === 'comment') continue;
    if (child.type !== 'element') {
      out.push(child);
      continue;
    }
    const cls = classes(child);
    if (DROP_TAGS.has(child.tagName) || child.properties?.ariaHidden === 'true' || cls.some((c: string) => DROP_CLASSES.includes(c))) continue;

    // Shiki: one <span class="line"> per line and no newlines between them; the language is on <pre>.
    if (child.tagName === 'pre') {
      const code = find(child, (e) => e.tagName === 'code');
      const lines = code ? code.children.map(text) : [text(child)];
      const lang = String(child.properties?.dataLanguage ?? '').replace(/^plaintext$|^text$/, '');
      out.push(el('pre', {}, [el('code', { className: lang ? [`language-${lang}`] : [] }, [t(lines.join('\n'))])]));
      continue;
    }
    if (child.tagName === 'video') {
      const src = String(child.properties?.src ?? '');
      const label = String(child.properties?.ariaLabel ?? '') || 'Animation';
      if (src) out.push(el('p', {}, [el('a', { href: src }, [t(`${label} (video)`)])]));
      continue;
    }
    if (child.tagName === 'hmd-gist') {
      const link = find(child, (e) => e.tagName === 'a');
      const label = String(child.properties?.label ?? '') || 'Gist';
      if (link) out.push(el('p', {}, [el('a', { href: link.properties?.href }, [t(`${label} (GitHub Gist)`)])]));
      continue;
    }
    if (child.tagName === 'hmd-video') {
      const link = find(child, (e) => e.tagName === 'a');
      const label = String(child.properties?.label ?? '') || 'Video';
      if (link) out.push(el('p', {}, [el('a', { href: link.properties?.href }, [t(`${label} (video)`)])]));
      continue;
    }
    tidy(child);
    // Side-by-side items the page separates with CSS, not text: adjacent links (topic tags) and a
    // caption's name and role. Give them a separator so the words don't run together.
    const prev = out[out.length - 1];
    if (prev?.type === 'element' && prev.tagName === 'a' && child.tagName === 'a') out.push(t(' · '));
    else if (parent.tagName === 'figcaption' && child.tagName === 'span' && prev && !/\s$/.test(text(prev))) out.push(t(', '));
    out.push(child);
  }
  parent.children = out;
}

/** Root-relative links and images become absolute, so the copy works out of context. */
function absolutise(node: Element): void {
  for (const key of ['href', 'src'] as const) {
    const v = node.properties?.[key];
    if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//')) node.properties[key] = SITE + v;
  }
  for (const child of node.children) if (child.type === 'element') absolutise(child);
}

const yamlString = (s: string) => JSON.stringify(s); // JSON strings are valid YAML scalars

export async function htmlToMarkdown(html: string, url: string): Promise<string> {
  const tree = unified().use(rehypeParse).parse(html) as Root;
  const title = text(find(tree, (e) => e.tagName === 'title') ?? el('x', {}, [])).trim();
  const meta = find(tree, (e) => e.tagName === 'meta' && e.properties?.name === 'description');
  const description = String(meta?.properties?.content ?? '');
  const main = find(tree, (e) => e.tagName === 'main');
  if (!main) throw new Error(`No <main> in ${url}`);

  tidy(main);
  absolutise(main);
  const mdast = await unified().use(rehypeRemark).use(remarkGfm).run({ type: 'root', children: [main] } as Root);
  const body = unified()
    .use(remarkGfm)
    .use(remarkStringify, { bullet: '-', fences: true, rule: '-', emphasis: '_' })
    .stringify(mdast as never)
    .trim();

  return `---\ntitle: ${yamlString(title)}\ndescription: ${yamlString(description)}\nurl: ${url}\n---\n\n${body}\n`;
}

async function* htmlPages(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'pagefind' && entry.name !== '_astro') yield* htmlPages(full);
    } else if (entry.name.endsWith('.html')) yield full;
  }
}

const exists = (p: string) => access(p).then(() => true, () => false);

/** Writes the missing copies; returns how many were written and how many were hand-written already. */
export async function writeMarkdownCopies(distUrl: URL): Promise<{ written: number; kept: number }> {
  const dist = fileURLToPath(distUrl);
  let written = 0;
  let kept = 0;
  for await (const file of htmlPages(dist)) {
    const rel = relative(dist, file).split(sep).join('/');
    if (SKIP.has(rel)) continue;
    const target = `${file}.md`;
    if (await exists(target)) {
      kept++;
      continue;
    }
    const url = `${SITE}/${rel.replace(/index\.html$/, '')}`;
    await writeFile(target, await htmlToMarkdown(await readFile(file, 'utf8'), url));
    written++;
  }
  return { written, kept };
}
