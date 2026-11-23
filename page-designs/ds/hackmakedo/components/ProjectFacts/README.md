The fact row under a case study's PageHeader: role, dates, stack, compatibility and links, as a definition list.

Markup: `<dl class="hmd-facts">` of `<div><dt>Role</dt><dd>Creator and maintainer</dd></div>` items.

- The consumer provides four to six facts: Role, First released, Built with, Works with (Umbraco versions), Licence, Links (GitHub, Umbraco Marketplace, VS Code Marketplace). Pull counts such as GitHub stars or downloads at build time, or leave them out; never type a number that will go stale.
- Keep each value under about eight words.
- Mirror the same facts in the page's `SoftwareSourceCode` structured data (`codeRepository`, `programmingLanguage`, `license`, `dateCreated`).
- Labels are uppercase `label` text in `ink-muted`; values are `ink`, links `accent-text`.
