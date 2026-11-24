---
title: "How to use Visual Studio Android Emulator on VMWare Fusion"
date: 2015-07-22
topics: ["tooling"]
excerpt: "A workaround from the Visual Studio team to run the Visual Studio 2015 Android Emulator in Windows under VMware Fusion on a Mac, where it fails to start."
draft: false
---

Hello
I thought I would share a quick blog post for others who may have recently downloaded Visual Studio 2015 this week who use a Mac as their main machine & VMWare Fusion to run a copy of Windows on it.

So after downloading the new Visual Studio 2015 release, I am quite keen to do some mobile development so I was keen to look at the Visual Studio Android Emulator, but upon opening the application & starting one of the emulators that are already come pre installed, I was greeted with an error.

The error was as follows:

![Visual Studio Android Emulator](/images/blog/how-to-use-visual-studio-android-emulator-on-vmware-fusion/vs-andorid-emulator-error.png)

So the first thing I done was hit the lovely smiley face in the main window, to give the Visual Studio team feedback on this and within 3 to 4 hours I received a reply on how to resolve this.

## So what's the solution?

The following solution is not a supported & official response from the Visual Studio Team but does allow you to use it inside of VMWare Fusion.

He is the response from Visual Studio team:

> Hi Warren
> Thanks for using our emulator. Our emulator is not officially supported in a nested virtualization environment (like when running under VMWare Fusion).
>
> You can try to enable it if you do not need OpenGL support, but running in this mode is unsupported as some features are not functional in this mode.
>
> In VMWare Fusion, under General settings, for the OS Type, you’ll need to change it from Windows 8.1 to “Hyper-V (unsupported)”. I would also suggest at least 2 processors and 4gb of ram (6gb is better depending on the Android VMs you want to run)
>
> In Windows, you’ll need to edit the **c:\program files (x86)\Microsoft XDE\10.0.10240.0\skus\android\xdesku.xml** file and remove the following line from the file: **GuestDisplayProvider="VsEmulator.OpenGLGuestDisplay"**

Well I have done that & managed to get the emulator to spin up and work. Hopefully this will change in the future and that this modification will no longer be needed, we will just have to wait & see.
