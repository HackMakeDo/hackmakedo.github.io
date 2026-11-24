---
title: "My first Umbraco Bellissima Package"
date: 2024-03-18
topics: ["tutorials", "bellissima"]
excerpt: "Examine Peek, my first package for the new Umbraco 14 backoffice: built with web components, it lets you peek at what Examine stores for any content node."
heroImage: "/images/blog/my-first-umbraco-bellissima-package/pexels-photo-4498125.jpeg"
draft: false
relatedWork:
  href: "/work/examine-peek/"
  title: "Examine Peek"
---

Just a super quick blog post to share that I have created my first Umbraco V14 Package for the new Umbraco backoffice codenamed 'Belissma'.

Umbraco V14 has a totally different architecture when it comes to extending the backoffice, as its been architected on using Web Standards by using WebComponents. YAY for using the Web platform and not getting locked into a specific Javascript framework anymore !

## So what did I build?

I present to you a simple package that allows you to view a specific content nodes entry in Examine, to see what values and raw data it has stored for an Umbraco node. This is useful if you use Examine a lot along with customising the index or adding extra fields, you are then able to easily peek to see what's stored.

<figure class="hmd-figure">
  <img src="/images/blog/my-first-umbraco-bellissima-package/examinepeek.screenshot.png" alt="A screenshot of the Umbraco Package &#x27;Examine Peek&#x27;" loading="lazy" />
  <figcaption>A screenshot of the Umbraco Package &#x27;Examine Peek&#x27;</figcaption>
</figure>

So **[Examine Peek](https://github.com/warrenbuckley/Examine-Peek)** was born an Umbraco V14 Entity Action that open a dialog  from the content node Actions menu or the right click menu items from the content tree.

I hope to find some time to create a video rebuilding it from scratch to help teach you some of my findings I learnt along the way. So watch this space 👀

## Where can I get it?

You can download and install the package into your Umbraco V14 beta001 site by installing the package from Nuget or if your curious you can take a look through the source code on GitHub.

```
dotnet add package ExaminePeek --version 1.0.0-beta001
```

[Nuget](https://www.nuget.org/packages/ExaminePeek/1.0.0-beta001)
[GitHub Repo](https://github.com/warrenbuckley/Examine-Peek)
