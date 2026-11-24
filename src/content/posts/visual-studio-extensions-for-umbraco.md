---
title: "Visual Studio Extensions for Umbraco"
date: 2013-10-14
topics: ["community", "umbraco-packages", "tooling"]
excerpt: "A Visual Studio extension of Umbraco item templates, inspired by SideWaffle, so the files you need for Umbraco work are a click away in Add New Item."
draft: false
---

Hello all,
I haven't blogged for a little while, as I have been busy [with my new pet project uHangout](https://web.archive.org/web/20140118210750/http://uhangout.co.uk:80/). If you haven't checked it out yet I highly recommend you do, as it s a weekly Google Hangout that I record and publish on YouTube with guests from the Umbraco community demoing implementations, snippets, packages or just general interviews like I did [with founder Niels Hartvig](https://web.archive.org/web/20140118210750/http://uhangout.co.uk:80/) & [Per Ploug](https://web.archive.org/web/20140118210750/http://uhangout.co.uk:80/)

So my next little lunchtime hacks has been involved in working with extending Visual Studio to make our life's easier when working with Umbraco. After recently coming across [the project SideWaffle from Sayed Hashimi and Mads Kristensen from Microsoft](https://web.archive.org/web/20131017062512/http://sidewaffle.com:80/), I was inspired by how they have added new file templates such as an AngularJS Controller and others.

So with this idea I approached Sayed for some advice on how I can create Umbraco file templates in the same way. I was given some great pointers and I am now able to present to you the

## Umbraco Community - Visual Studio Project Item Templates package for Visual Studio

You can download the extension directly inside Visual Studio from the extensions section or [on the Visual Studio Gallery website](https://marketplace.visualstudio.com/items?itemName=WarrenBuckley.UmbracoCommunity-VisualStudioProjectItems).

If you are intrigued on how it all works then[ the full source code is available on GitHub for you to look through as well](https://github.com/warrenbuckley/Umbraco-VS-Project-Items).

## But it doesn't stop there!

As I created another Visual Studio package that adds a new project template to Visual Studio. So with one click you can do File -> New Project and select the new Umbraco project template. This will install and setup Umbraco for you by fetching the latest version of Umbraco from NuGet.

Now you will be able to impress your boss as you install & setup Umbraco so quickly. 
Like before this extension can be found when searching inside Visual Studio for extensions and [the gallery website](https://marketplace.visualstudio.com/items?itemName=WarrenBuckley.UmbracoCommunity-FileNewProject) but I have also put [the source code of is extension on GitHub as well](https://github.com/warrenbuckley/Umbraco-VS-New-Project).

I have a few more ideas for Visual Studio Extensions to make our lives easier as Umbraco Developers, but I would love to hear what you think.

Cheers,
Warren :)
