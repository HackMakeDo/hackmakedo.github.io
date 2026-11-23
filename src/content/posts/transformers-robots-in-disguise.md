---
title: "Transformers! Robots in Disguise"
date: 2013-07-12T19:57:59Z
topics: ["community", "umbraco-packages"]
excerpt: "Transformers, robots in disguise! Meet Optimus, an Umbraco package by Tim Geyssens and me for creating bundles and dynamic files in the backoffice."
heroImage: "/images/blog/transformers-robots-in-disguise/optimus-prime.jpg"
draft: false
---

Transformers, robots in disguise! Was part of the classic 80's cartoon Transformers theme tune and has been inspiration for [Tim Geyssens](https://web.archive.org/web/20130608060838/http://www.nibble.be/) and mine latest Umbraco package, aptly named Optimus. After Optimus Prime, the lead transformers of the Autobots.

So what is Optimus and why did you call it that? Well read on to find out!

## So what is Optimus?

Optimus is a package built for Umbraco, that allows non devs and fronted devs to create bundles for their website along with working with dynamic files via the Umbraco back office user interface.

## So why is it called Optimus?

Well me and Tim both thought there were too many uWhatever type packages that seem to have flooded the our.umbraco.org package section, which makes it extremely hard to find a a package now. So we decided to give it a more unique and easier name to remember.

We came up with Optimus as it kind of looks like a short hand way of writing optimisation, which is what this packages does, by creating bundles for the ASP.NET Web Optimisation Framework in addition, Optimus is a transformer and under the hood we are using an [OpenSource package called BundleTransformer](https://web.archive.org/web/20130702195617/http://bundletransformer.codeplex.com:80/) that allows you to create dynamic files via the back office editor such as [Sass](https://sass-lang.com/), [Less](https://lesscss.org/) and [CoffeeScript](https://coffeescript.org/) files for example. Hence the decision to name it after Optimus Prime from the Transformers.

## What is a bundle?

A bundle in the ASP.NET Web Optimisation Framework allows you to group certain resources together to be compressed and minimised into one resource. For example you could create a bundle of all your CSS files into one bundle and load that instead, or alternatively create smaller bundles to group JavaScript and corresponding CSS together in a bundle for jQuery plugins such as ColorBox or similar. These minified and compressed resources allows your website to load and respond faster for end users, which make for happy users using your website.

I recommend you[ read up and learn more about ASP.NET Web Optimisation Framework](https://learn.microsoft.com/en-us/aspnet/mvc/overview/performance/bundling-and-minification) so you can harness the power of bundles, but with the ease of Optimus to generate those bundles for you via the backoffice of Umbraco.

## Where can I get Optimus?

Well the best place to get [Optimus is from the package section on our.umbraco.org](https://web.archive.org/web/20130711181553/http://our.umbraco.org:80/projects/developer-tools/optimus), where you can vote the project up if you like it, along with reporting any issues on bugs on the dedicated project forum we have setup for it.

However if you wish to see how Optimus works, or would like to contribute to the code base then you can [download the Git repo from GitHub](https://github.com/TimGeyssens/BundlingAndMinificationForTheMasses).

So until next time.
AUTOBOTS ROLL OUT!!

<hmd-video class="hmd-video" provider="youtube" video-id="nLS2N9mHWaw" label="Transformers opening theme">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=nLS2N9mHWaw">Watch on YouTube ↗</a>
</hmd-video>
