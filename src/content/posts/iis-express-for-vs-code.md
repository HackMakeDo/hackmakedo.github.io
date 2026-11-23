---
title: "IIS Express for VS Code"
date: 2017-05-10
topics: ["tutorials", "tooling", "javascript"]
excerpt: "Version 1.0.0 of IIS Express for VS Code: run the folder open in Visual Studio Code as a website with IIS Express, now with PHP support."
draft: false
relatedWork:
  href: "/work/iis-express-code/"
  title: "IIS Express Code"
---

So time for another blog post, this time for something new (well kinda, it's been out a little while)

Today I am releasing version 1.0.0 of IIS Express for Visual Studio Code editor, after having smaller releases over the last year or so. It's time to give it a bit more polish & love and to give the release a 1.0.0 tag.

## What is it?

This extension gives you the power to run a folder open in Visual Studio Code as a website using IIS Express. Allowing websites to be quickly and easily run without having to remember the command line query to run in order to have a folder run as a website.

## Why did I create it?

I will give you some background first. I had recently flattened my machine and started re-installing development tools on my machine and needed to run a zipped up site that was sent to me and did not want to open the full blown Visual Studio 2015 editor and configuring it to be run as a Website and thus save a SLN file. At this time Visual Studio 2017 was not out and the option of opening a folder in Visual Studio was not available to just quickly run a site.

I did have other options in using something like WebMatrix, but at this point I decided I did not want to re-install this as far as I know its no longer actively maintained and seemed a bit bloated for my needs. So that particular day [I found about the IIS Express command line options](https://learn.microsoft.com/en-us/iis/extensions/using-iis-express/running-iis-express-from-the-command-line) and then ran the site using arguments to have the folder run as a website.

After a few more times doing this and having a Freedom Friday at work (The last day of a sprint, if sprint goals are met to let us do personal development) I decided to get my hands dirty and see if I could get a prototype of this working with VS Code my new favorite editor at the time & still is, in order to learn TypeScript & some parts of NodeJS along the way.

After one full day hacking at it, I had a rough prototype and a few more evenings & lunchtimes later I had created my first release 0.0.1 and pushed it out into the wild.

## What's new in 1.0.0?

This brings two big new features:

### Support for PHP: Using ApplicationHost.config

PHP can now be supported in version 1.0.0 as we now invoke IISExpress command line with a site parameter. Doing so allows for a shared webserver config changes to be made with the **ApplicationHost.config** file for IIS Express.

If you wish to use PHP with IIS Express you will need to [install PHP for Windows](https://www.php.net/downloads.php?os=windows)

After that you will need to modify the shared configuration file applicationhost.config for any site running with IIS Express.

Using a command line, you will need to change directory to where IIS Express is installed. Typically at **C:\Program Files (x86)\IIS Express\** or C:\Program Files\IIS Express

From here this folder should contain an exe called **appcmd.exe** which allows you to edit this global configuration to allow support for PHP.

#### Set System.WebServer Handler for PHP

```
appcmd set config /section:system.webServer/fastCGI /+[fullPath='"C:\Program Files (x86)\PHP\php-cgi.exe"']

appcmd set config /section:system.webServer/handlers /+[name='PHP_via_FastCGI',path='*.php',verb='*',modules='FastCgiModule',scriptProcessor='"C:\Program Files (x86)\PHP\php-cgi.exe"',resourceType='Unspecified']
```

Note you will need to change the location to **php-cgi.exe** depending on where you installed it.

#### Set index.php as default document with AppCmd

```
appcmd set config /section:system.webServer/defaultDocument /+"files.[value='index.php']"
```

After running these commands your file for IISExpress is committed to **%HOMEPATH%/documents/IISExpress/config/ApplicationHost.config**

Alternatively you may feel more comfortable editing this file manually to make any other common changes to any site that is run with IIS Express in this file, as IIS Express for VSCode uses this file from version 1.0.0

### Support for HTTPS protocol

In your IISExpress configuration file found at **.vscode/iisexpress.json** there is a new property that can be set which is called **protocol**. By default this is set to http but can equally be changed to https in version 1.0.0

In doing so you will need to ensure your port is set to a supported port range of IIS Express running as HTTPS of 44300 - 44399 otherwise the site will not work as expected.

## Where can I get it?

Visual Studio Code has a nice marketplace which is built into part of the editor allowing you to pick and choose the extensions to make the editor your perfect companion to coding & editing files.

The marketplace listing page is here which gives details on how to install the extension in VS Code
[https://marketplace.visualstudio.com/items?itemName=warren-buckley.iis-express](https://marketplace.visualstudio.com/items?itemName=warren-buckley.iis-express)

Alternatively if you wish to get involved and make the extension better for everyone, the source code is open source and available on GitHub where I am awaiting you Pull Requests
[https://github.com/warrenbuckley/IIS-Express-Code](https://github.com/warrenbuckley/IIS-Express-Code)

Speak to you all soon :)
