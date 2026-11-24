import { visit } from 'unist-util-visit';
import type { Root, Code } from 'mdast';

/**
 * Removes indentation shared by every line of a fenced code block, so code pasted from deep
 * inside a source file (as many imported WordPress posts were) starts at the left edge instead
 * of pushing long lines into horizontal scroll. Relative indentation is kept.
 */
export function remarkDedentCode() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      const lines = node.value.replace(/\t/g, '    ').split('\n');
      const indents = lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length);
      const common = indents.length ? Math.min(...indents) : 0;
      if (common > 0) node.value = lines.map((l) => l.slice(common)).join('\n');
    });
  };
}
