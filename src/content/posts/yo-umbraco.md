---
title: "Yo Umbraco!"
date: 2014-03-24
topics: ["tooling", "javascript"]
excerpt: "No, I'm not a kid from the 90s! Yo Umbraco is a Yeoman tool that scaffolds Umbraco 7 property editors, with Grunt tasks to build, package and test them."
draft: false
---

No I am not trying to be a kid from the 90's and start every greeting off with yo, but in fact I want to introduce you to a new tool I have built called Yo Umbraco, which help boost productivity for developing property editors for Umbraco 7 & newer.

## What is Yo Umbraco?

It's a handy command line tool that will quickly generate and scaffold all the different parts you need to help build your own property editors, by asking a series of questions it will help customise your needs and give you a great starting point for that next awesome property editor you are going to build.

## How to install

If you have node already installed then you can skip over this first bit and move onto the next step.

To begin with you need to install nodejs from their website so we can then download some packages from the nodejs package library known as npm. You can think this as the equivalent of the NuGet package repository. When you install nodejs ensure you mark the option to add it to the PATH. This means you will be able to access node from any folder location in the console window.

To verify you have node installed run the following commands which should display a version number for each command.

```powershell
node -v
npm -v
```

With nodejs installed we can install the next part which is YeoMan. YeoMan is a node package on the npm repository that is a scaffolding tool and can help scaffold various different types of things from AngularJS applications to Chrome Extensions.

To install YeoMan run the following command in the console. Note the -g switch this tells node to install this package globally and not just in the directory your console is currently in.

```powershell
npm install -g yo
```

After YeoMan has finished installing we need to verify it installed by typing the following command to see its version number.

```powershell
yo -v
```

YeoMan or yo as it's known in the command line does not do anything interesting out of the box. For it to be useful you need to install addons for it, which are known as Generators. There are hundreds of generators out there ranging from helping you create a webapp to our Umbraco property generator.

The next part is install our generator from npm. To do so run the following command.

```powershell
npm install -g generator-umbraco
```

With it installed you can now happily run the following command and start working with it.

```powershell
yo umbraco
```

<figure class="hmd-figure">
  <hmd-loop class="hmd-loop">
    <video src="/images/blog/yo-umbraco/yo-umbraco.mp4" poster="/images/blog/yo-umbraco/yo-umbraco.jpg" width="672" height="516" muted loop playsinline preload="none" controls aria-label="yo-umbraco"></video>
  </hmd-loop>
</figure>

The friendly YeoMan will ask you some questions about creating your Umbraco property editor and then go off and scaffold it all for you to start building your own Umbraco property editor.

Once you have YeoMan create the Umbraco Property Editor for you you can use the power of GruntJS build tool to help build the property editor. If you have GruntJS already installed then you will not need to run the command below.

```powershell
npm install -g grunt-cli
```

## Grunt Tasks

There are several grunt tasks you can run from the folder where YeoMan has copied the folder & files for you, make sure you chaneg directory to that folder then you can run the following commands:

<figure class="hmd-figure">
  <hmd-loop class="hmd-loop">
    <video src="/images/blog/yo-umbraco/yo-umbraco-grunt.mp4" poster="/images/blog/yo-umbraco/yo-umbraco-grunt.jpg" width="752" height="1034" muted loop playsinline preload="none" controls aria-label="yo-umbraco-grunt"></video>
  </hmd-loop>
</figure>

### General Build

```powershell
grunt
```

### Build NuGet Package

```powershell
grunt nuget
```

### Build Umbraco Package

```powershell
grunt package
```

### Automatically watch & build files

This will monitor the Less, Javascript & HTML files for you and build, concat & copy them as needed every time you save a file.

```powershell
grunt watch
```

### Test with an Umbraco Site

You can easily copy your property editor to an Umbraco site to test it out. This will copy the folder that gets run when calling grunt. You simply need to specify the root of the Umbraco site by specifying a target switch.

```powershell
grunt --target=c:\inetpub\wwwroot\my-umbraco-site\
```

<figure class="hmd-figure">
  <hmd-loop class="hmd-loop">
    <video src="/images/blog/yo-umbraco/yo-umbraco-grunt-target.mp4" poster="/images/blog/yo-umbraco/yo-umbraco-grunt-target.jpg" width="752" height="1034" muted loop playsinline preload="none" controls aria-label="Yo Umbraco - Grunt with --target"></video>
  </hmd-loop>
</figure>

## Thanks

So I can't take all the credit for Yo Umbraco as i've have had the help with Tom Fulton and his experience with building Archetype the awesome property editor for Umbraco 7. So I have to give a big thank you to Tom and his colleague Taylor Smith to help improve Yo Umbraco.

So what you waiting for, download it today and start building your next Umbraco property editor. Have Fun & I look forward to seeing what you build with Yo Umbraco!
