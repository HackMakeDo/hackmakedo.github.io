A list of questions and answers that open in place, for the hire pages and About.

Markup: `<div class="hmd-faq">` of `<details><summary>Question?</summary><div class="hmd-faq__answer"><p>…</p></div></details>`.

- The consumer provides questions phrased the way clients search or ask an AI assistant ("Are you available as an Umbraco contractor?", "Do you work outside IR35?", "Which Umbraco versions do you work with?") and short answers that start with the direct answer, then one supporting sentence.
- Five to eight questions per page, different on each page. Answers state facts Warren confirms; never invent rates, availability or contract terms.
- Add `FAQPage` structured data with the same text. Google has shown FAQ rich results only for government and health sites since 2023, but the markup still describes the answers to other search and AI engines.
- Native `details` needs no JavaScript and works with find-in-page. The `+` turns to `−` when open.
