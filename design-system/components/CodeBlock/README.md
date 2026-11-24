Code for posts and case studies: a panel with a header bar showing the language and an optional filename, a copy button, syntax colours for any language, optional line numbers, highlighted lines and diffs.

Markup:

```html
<figure class="hmd-codeblock hmd-codeblock--numbered">
  <figcaption class="hmd-codeblock__bar">
    <span class="hmd-codeblock__lang">C#</span>
    <span class="hmd-codeblock__file">ContentLockHub.cs</span>
    <hmd-copy><button type="button" class="hmd-copybtn" aria-label="Copy code: ContentLockHub.cs">Copy</button></hmd-copy>
  </figcaption>
  <pre tabindex="0" aria-label="C# code: ContentLockHub.cs"><code><span class="line">…</span>
<span class="line">…</span></code></pre>
</figure>
```

- The consumer provides the code (HTML-escaped), the language label and, when the file path matters, the filename. Omit `hmd-codeblock__file` for snippets that are not a whole file.
- Language labels, written as people say them: C#, TypeScript, JavaScript, JSON, Razor, HTML, CSS, SCSS, XML, YAML, Bash, PowerShell, SQL, Markdown, Diff, Text. The label sits in a small pink tag (`on-pink` on `pink`, 9.9:1).
- Copy: `hmd-copy` with no `value` copies the block's code, leaving out lines removed in a diff, and announces "Code copied" to screen readers. Give each button an `aria-label` naming the file or language when a page has several blocks. Without JavaScript the button stays hidden and the code is still selectable.
- Each line is a `span.line`, which is exactly what Shiki outputs. Add `hmd-codeblock--numbered` for line numbers (not copied), `.highlighted` on a line to draw attention to it, and `.diff.add` or `.diff.remove` for changes, which show + and − markers so a change never relies on colour alone.
- Highlighting is done at build time, never in the browser. In Astro set `markdown.shikiConfig.theme` to `'css-variables'`; the block maps Shiki's `--astro-code-token-*` variables onto the brand tokens (keywords `type-role`, strings `type-community`, comments `ink-muted`, constants and numbers `accent-text`). Wrap each fence in this figure with a small rehype step that reads the fence's language and its `title="…"` meta, and use Shiki's notation transformers for `// [!code highlight]` and `// [!code ++]`. Expressive Code is a ready-made alternative that does the same with less setup; style it to these tokens.
- Hand-written blocks use the short classes: `.k` keyword, `.s` string, `.c` comment, `.n` number or constant, `.t` type name, `.p` property or JSON key, `.o` punctuation.
- Every colour reads at 4.5:1 or better on `panel` in both themes, including on highlighted lines. Code scrolls sideways; it never wraps mid-token. The `pre` takes `tabindex="0"` so keyboard users can scroll it.
- Short inline code uses `<code>` inside Prose (or `code.hmd-inline`). The bare `pre.hmd-code` remains for one-line snippets that need no header.
