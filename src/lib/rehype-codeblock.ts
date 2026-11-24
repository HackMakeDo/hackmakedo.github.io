import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

const LANG_LABELS: Record<string, string> = {
  csharp: 'C#',
  cs: 'C#',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JavaScript',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  plaintext: 'Text',
  text: 'Text',
};

function langLabel(lang: string): string {
  return LANG_LABELS[lang.toLowerCase()] ?? lang.charAt(0).toUpperCase() + lang.slice(1);
}

function isShikiPre(node: Element): boolean {
  // Shiki's own hast output keys this `class` (a plain string), not hast's usual `className`.
  const className = node.properties?.className ?? node.properties?.class;
  const classes = Array.isArray(className) ? className.map(String) : typeof className === 'string' ? className.split(/\s+/) : [];
  return node.tagName === 'pre' && classes.includes('astro-code');
}

/**
 * Wraps each Shiki-highlighted <pre> (markdown.shikiConfig.theme = 'css-variables', see
 * astro.config.mjs) in the hmd-codeblock figure — language badge, optional filename from
 * ```lang title="…" fence meta (shiki-title-transformer.ts), and the copy button — so
 * real code blocks get the same chrome as the hand-authored ones.
 */
export function rehypeCodeBlock() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (!parent || index == null || !isShikiPre(node)) return;

      const lang = String(node.properties.dataLanguage ?? 'text');
      const title = node.properties['data-title'] ? String(node.properties['data-title']) : undefined;
      delete node.properties['data-title'];
      node.properties['aria-label'] = title ? `${langLabel(lang)} code: ${title}` : `${langLabel(lang)} code`;

      // Shiki separates each `.line` span with a literal "\n" text node (so selecting/copying
      // the rendered <pre> keeps real line breaks). `.line` is already `display: block`, so
      // those text nodes just add a second, redundant line break between every line.
      const codeEl = node.children.find((child): child is Element => child.type === 'element' && child.tagName === 'code');
      if (codeEl) {
        codeEl.children = codeEl.children.filter((child) => !(child.type === 'text' && child.value.trim() === ''));
      }

      const figure: Element = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['hmd-codeblock', 'hmd-codeblock--numbered'] },
        children: [
          {
            type: 'element',
            tagName: 'figcaption',
            properties: { className: ['hmd-codeblock__bar'] },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: { className: ['hmd-codeblock__lang'] },
                children: [{ type: 'text', value: langLabel(lang) }],
              },
              ...(title
                ? [
                    {
                      type: 'element' as const,
                      tagName: 'span',
                      properties: { className: ['hmd-codeblock__file'] },
                      children: [{ type: 'text' as const, value: title }],
                    },
                  ]
                : []),
              {
                type: 'element',
                tagName: 'hmd-copy',
                properties: {},
                children: [
                  {
                    type: 'element',
                    tagName: 'button',
                    properties: { type: 'button', className: ['hmd-copybtn'], 'aria-label': `Copy code: ${title ?? langLabel(lang)}` },
                    children: [{ type: 'text', value: 'Copy' }],
                  },
                ],
              },
            ],
          },
          node,
        ],
      };

      parent.children[index] = figure;
    });
  };
}
