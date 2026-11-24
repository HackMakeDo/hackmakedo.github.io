A boxed note inside long-form content: a tip, a warning, or the archive notice on posts written for an older Umbraco version.

Markup: `<aside class="hmd-callout"><span class="hmd-callout__label">Tip</span><p>…</p></aside>`; add `hmd-callout--archive` for the old-version notice.

- The consumer provides a label word (Tip, Note, Heads up, Archive) and one or two sentences. The label is always written out, so meaning never depends on colour.
- The archive notice reads: "Written for Umbraco 7. The approach may differ in current versions." and links to a newer post where one exists.
- One callout per screen at most. Full outline in `border-strong`; never a coloured left border.
