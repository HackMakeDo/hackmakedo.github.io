---
title: "Peek inside Umbraco V8+ NuCache files with the NuCache Explorer tool"
date: 2018-07-30
topics: ["umbraco-packages", "umbraco"]
excerpt: "NuCache Explorer is a small desktop app that shows what Umbraco 8+ stores in its binary NuCache files, as readable JSON."
draft: false
---

Hello again!
Let's jump straight into the guts of this post and talk about NuCache and Umbraco V8+

## What is NuCache

Well that is a harder topic for me to explain and is probably best explained by the creator himself, Stephan.
**Fast forward to 22m:47s to learn all about NuCache**
<hmd-video class="hmd-video" provider="vimeo" video-id="183478499" label="Good Morning and Welcome to CG16, from 22m 47s" start="1367">
  <a class="hmd-video__fallback" href="https://vimeo.com/183478499#t=22m47s">Watch on Vimeo ↗</a>
</hmd-video>

## What is NuCache Explorer?

It's a small desktop application that I have built to help you explore and view documents inside NuCache with a JSON representation of what is stored for a document in the NuCache.

I saw a need for this because unlike previous versions of Umbraco the cache of the website was stored in an XML file that could be opened in a simple text editor, with NuCache the files are generated with a dictionary package that saves binary files to disk. So trying to open a NuCache file in a text editor would not allow you to see what is inside your website cache.
I wanted a way to see and confirm what values are being published to variants so hence the need for this tool was born.

### Features

OK so here is a quick lowdown of features:

- Drag and Drop to open NuCache files
- Native Windows file association to NuCache .db files
- View document as JSON
- Save/export all documents to JSON
- Find/goto document by its integer ID or unique guid
- Goto line, find, find next and find previous in JSON document
- Recent document support via Windows taskbar
- Set your own theme for the JSON viewer

![](/images/blog/peek-inside-umbraco-v8-nucache-files-with-the-nucache-explorer-tool/screenshot.png)

### Where do I download it?

Go [jump on over to GitHub and visit the releases page](https://github.com/warrenbuckley/Nucache.Explorer/releases/tag/v1.1.0) where you can download the 1.1.0 installer.exe which will get you all setup and ready to start inspecting V8 NuCache files if you are experimenting with V8 or have been attending the V8 hackathons.

### Thanks

A couple of thanks. [One to Stephan for creating NuCache](https://twitter.com/zpqrtbnk) and lending me some of his code from a command line tool which powers this application in a more UI friendly way. So kudos Stephan!

Next thanks is to another fellow HQ colleage, [this time Rune in giving me some pointers](https://twitter.com/hemraker), ideas and making the UI hella-lot better to look at, so thanks Rune!

## Next time...

For the next blog post, I plan to try and talk about how this little utility app works and how maybe you can start making your own tools too, so watch this space shortly...

For the curious hackers and impatient people, I am sure you can jump over to the GitHub repository and look through the source code to see how it was built.
