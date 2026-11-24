---
title: "Umbraco Extension Methods Community Project"
date: 2013-07-15T15:15:38Z
topics: ["community", "umbraco-packages", "tooling"]
excerpt: "The Umbraco Extension Methods community project on GitHub: one place to share the extension methods and helpers that make Umbraco sites faster to build."
draft: false
---

Hello,
I want to bring to your attention a small community project I have started on GitHub to help extend [the ASP.NET Open Source CMS Umbraco](https://umbraco.com/).

## Say hello to...

Say hello to the [Umbraco Extension Methods Community Project hosted on GitHub](https://github.com/warrenbuckley/UmbracoExtensionMethods). A place where we can all come together and contribute in a central repository and share our extension methods to help making write Umbraco sites a lot easier & faster with these extension methods & helpers. The idea is to become a project like uComponents where it is a must have addon for all your Umbraco websites that you build, with the possibility of teaming up with the uComponent guys and getting into there to reach a broader audience perhaps.

## What is the Umbraco Extension Methods project?

This project is simply a bunch of classes that contain extension methods to allow us to simplify our Razor files for our Umbraco sites and return values for common scenarios.

A few examples are:

```csharp
@CurrentModel.GetPropertyValue("uploadImage").ImageGenUrl(height: 200, width: 200)
@CurrentModel.GetPropertyValue("eventDate").IsWeekend()
@CurrentModel.GetPropertyValue("youTubeVideoID").GetYouTubeThumbnail()
// And many many more...
```

## Why contribute to the project?

Why should you contribute to the project? Well simply it's fun to contribute to a project and learn from one another about different coding styles and techniques and personally this is the way I have learnt most of my coding tips & tricks is by collaborating with others and understanding each others code, by doing so it has made me a better programmer and if you join in you can too. However you should not be scared or worried that your code is not very good, you should see my code :-P

The whole point of collaborating is that someone else may be able to give you some advice or pointers on how to approach the problem in a different way and in the same time you are learning new styles and gaining some great contacts & developer friends to ask for advice or knowledge sharing.

## What's in the project already?

Well we currently have quite a few classes created in the project already, ranging from Vimeo & YouTube helpers to more general string and DateTime extension methods., but probably the most useful one to date is the ImageGenUrl extension methods that allow you to pass in options to easily generate the ImageGen URL that you need  in order to resize your image with your required parameters. But we still have plenty more to add and are open to suggestions and contributions so please fork the repo and send in a pull request so we can get your changes merged into the project so everyone can benefit from your additions.

## Many thanks already to

I have got to give a **BIG thankyou** to these contributors to the project already, who helped move the project along quite fast:

- [Jeavon Leopold](https://github.com/Jeavon)
- [João Antão](https://github.com/antao)
- [Stefan Kip](https://github.com/kipusoep)
- [Anders Bjerner](https://github.com/abjerner)
- [Ajmal vh](https://github.com/AjmalVh)

So what are you waiting for[ get over to the GitHub project and start contributing today](https://github.com/warrenbuckley/UmbracoExtensionMethods) with your own Extension Methods.

Cheers,
Warren :)
