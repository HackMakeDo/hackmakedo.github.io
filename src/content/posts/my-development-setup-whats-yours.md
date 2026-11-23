---
title: "My Development Setup. What's yours?"
date: 2014-10-12
topics: ["tooling"]
excerpt: "My 2014 development setup: why I run Windows in virtual machines on a Mac for Umbraco and .NET work, how they're set up, and a question for you: what's yours?"
draft: false
---

Hello all,
It's a Sunday evening and I am sipping an ice cold G&T now that my DIY bits are done for the weekend.

I saw a tweet from my good friend & [Aussie Peter Gregory](https://web.archive.org/web/20141018185022/http://www.littlewebempire.com:80/) today, saying:

> Am i the only one who gets major lag running VS2013 on win8 on a mac using parallels 10? [#Inception](https://twitter.com/hashtag/Inception?src=hash) [#dreamiscollapsing](https://twitter.com/hashtag/dreamiscollapsing?src=hash) [#timeforbootcamp](https://twitter.com/hashtag/timeforbootcamp?src=hash)?
>
> — Peter Gregory (@pgregorynz) [October 12, 2014](https://twitter.com/pgregorynz/status/521225642143006720)

I replied to Pete saying I have never had any issues and that I would write about my experiences, hence this post.

Pete and other people have asked me before about my setup of my machine I use for coding and I want to discuss about my particular setup and start a wider discussion with the community about their setups.

## Before I begin...

*I want to say that this is supposed to be a helpful post and these views are my personal opinion on the subject and everyone is different. Also this post is no way intended to come across as elitist or start a flame war. So let's all be nice.*

### My current setup

So my current development machine is a laptop as opposed to a desktop machine, due to me having to travel back and forth from my home and work in London and I personally prefer laptop machines and over the years laptops have become more  and more powerful for me never to own a desktop machine ever again.

So my machine is a UniBody 15" Retina MacBook Pro with 16GB SSD RAM & 2.3GHz Intel Core i7 processor.

I personally Like MacBook's due to the great build quality & sturdyness, in comparison to other laptops I have seen or used over the years. In addition I personally like OSX for my personal OS, along with the possibility of developing an iOS app potentially in the future for fun which requires a Mac.

At work, where I do the most of my development I have the added luxury of two external monitors plugged into the laptop, with the laptop display acting as a third display. Which adds a lot of screen real estate and can make me a little more productive to debug on one window and have the source code on the other, the third normally has Spotify or similar running on it, to keep me happy when doing dev work.

### Virtual Machines

I use Virtual Machine's aka VM's using the piece of software called VMWare Fusion. I use VM's to allow me to run several different operating systems on my machine. I have a Windows 8.1 VM where I do my work's development on, which has the essentials on it I need. Visual Studio 2013, Sublime Text, IIS, Git/SourceTree and a few other bits & pieces.

To keep Visual Studio 2013 snappy I try not to install 101 different extensions and again keep it to the bare minimum with ReSharper and a few others that I use. This way I keep my work development machine as clean as possible, and in return I get a whizzy & performant machine/VM to work on.

With VM's it allows me to have multiple environments. So I have a Windows 8.1 for Work and a second Windows 8.1 VM for personal dev & hacking. This is where I install more tools or experiment more in the safety away from my day to day work VM that is critical that keeps it working and a third final VM that is running Windows 10 and has allowed me to go nuts and experiment with tools such as the upcoming ASP vNext and very alpha/beta-ish Visual Studio 14. The thought of running beta software such as VS14 on the same machine

### Why I like VM's

I like Virtual Machines personally over using a native partition to boot into, as I can use a few OSX apps for my day to day bits and switch between more than one VM easily. Allowing me to compare some code say from my personal dev VM where I have hacked on a project and use or apply that same bit of code easily into my work VM and seamlessly switch between the VM's with a swipe gesture on my trackpad.

Another benefit I use with VM's is that all these great OS's are just a single file. Meaning I can copy it, back it up easily and with things like Time Machine easily roll back the file and my OS, if I was to accidentally blow up my Windows machine by installing anything I shouldn't have done. So that extra peace of mind is great for me.

I know VM's are not for everyone but for me, that great & give me the convenience I require the reassurance of being able to move my VM to new a machine quickly if my laptop was to blow up. If my job was to do video rendering or heavy Photoshopping and I liked the Windows tools over OSX then I would of course go back to the bare metal and use the full power of my machine and boot natively into Windows.

As I said many times it's just my personal preference.

### What is my VM setup?

So I am running VMWare Fusion 6.0.4, however there is a newer version released ready for the upcoming OSX Yosemite release.

My main work Windows 8.1 VM runs with the following settings. 4 Processor Cores out of the possible 8 on my machine.
8GB of RAM out of the 16Gb so OSX can still operate nicely if I want to do anything more strenuous at the same time.

With these settings & ensuring I don't clog up my main work VM with beta or experimental code/software too much. It runs just great for me. If I want to try new software or experiment I use the safety of the other VMs to do that.

## What is your setup?

So I have talked about my setup and how I like to use my machine to do development work. So I would love to hear from you in the comments about your setup and why you like to work in that way. Be it a piece of hardware, software or something else that makes you really happy and productive when doing development. I would love to hear from you.

A comment, a link to a blog post with your setup or a simple photo/tweet with the same would all be cool.

So I hope this was useful to you and you can find the time to tell me about your setup.

Cheers,
Warren :)
