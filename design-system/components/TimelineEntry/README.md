One entry on the career timeline: a year pill on a vertical spine, a typed marker, a title, a short paragraph and links.

Markup: `<article class="hmd-entry">` with `.hmd-entry__spine` (holding the `hmd-year` pill) and a content column: `.hmd-entry__type` (marker plus type name), an `h3`, a paragraph, and `hmd-link` links.

- The consumer provides year or range, type (Role, Award, Project or Community), title, a one-to-three-sentence description and zero to two links. Describe what happened and why it matters, not adjectives.
- Every Project entry that has a case study links to it first ("Read the case study"), then to GitHub or the Marketplace.
- Award entries show the official Umbraco MVP badge beside the title: wrap the type line and badge in `.hmd-entry__head` and give the `<img class="hmd-entry__badge">` alt text "Official Umbraco MVP <year> badge".
- Give each entry's `h3` an `id` (`2025-contentlock`) so case studies and posts can link to the moment on the timeline.
- Filtering and sort order come from FilterBar.
- Order is chosen by the page (oldest first by default, with a toggle to newest first). Do not reorder inside a year without telling the reader.
- The spine is `rule`, decorative. Entries stay readable without it.
- Body copy is `body`, limited to 40em. Do not put more than one paragraph in an entry; link out for the rest.
