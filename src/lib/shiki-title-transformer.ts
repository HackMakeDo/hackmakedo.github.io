import type { ShikiTransformer } from 'shiki';

/**
 * Reads `title="…"` out of a fenced code block's meta string (```csharp title="Foo.cs")
 * and stashes it as a `data-title` attribute on the <pre>, for rehype-codeblock to move
 * into the CodeBlock figure's filename slot.
 */
export function transformerTitle(): ShikiTransformer {
  return {
    name: 'hmd:title',
    pre(node) {
      const raw = this.options.meta?.__raw;
      if (!raw) return;
      const match = raw.match(/title="([^"]+)"/);
      if (match) {
        node.properties['data-title'] = match[1];
      }
    },
  };
}
