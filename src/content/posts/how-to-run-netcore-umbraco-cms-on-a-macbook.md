---
title: "How to run .NETCore Umbraco CMS on a MacBook"
date: 2021-09-07
topics: ["umbraco", "tutorials"]
excerpt: "Run Umbraco 9, the .NET Core edition, natively on your Mac: install the .NET SDK and the Umbraco templates, and stop running Windows in a virtual machine."
draft: false
---

Do you work at agency who build sites using Umbraco and all your colleagues use Windows machines, but you love your MacBook you end up using VMWare or Parallels to run a virtual copy of Windows on your Mac, just so you can develop alongside your colleagues. Well I have just the perfect post for you...

Let's carry on reading to take a look how easy it can be to have Umbraco 9 aka the .NETCore edition of the Microsoft .NETCore Open Source CMS running directly on your Mac !

## Install .NETCore SDK

First thing to do is to go to the Microsoft .NETCore website and download the SDK for your Mac. *As of writing the current version of .NETCore SDK to use and is recommended is 5.0*

[Download .NETCore SDK](https://dotnet.microsoft.com/en-us/download)

Once installed open your chosen terminal application and run the following command and you should see some output listing help commands so we then have verified that the .NETCore SDK is installed correctly.

```bash
dotnet --help
```

## Adding Umbraco dotnet new template pack

The next step is to add the Umbraco templates to the **dotnet new** command allowing us to easily scaffold and create new Umbraco projects.

From your terminal window use the following command to [install the Umbraco templates from Nuget.org](https://www.nuget.org/packages/Umbraco.Templates)

```bash
dotnet new --install Umbraco.Templates
```

Verify that the dotnet new Umbraco templates are installed by running the following commands. The first command lists all the currently installed dotnet new templates, within this list you should see Umbraco and Umbraco Package.

The second command displays all the arguments that the dotnet new umbraco template can support. You will see that you are able to specify connection string and username and password to do an automatic/unattended install of Umbraco without you having to click through the installer wizard, if you prefer to do so.

```
dotnet new --list

dotnet new umbraco --help
```

## Create new Umbraco project

Next step is to browse to a location on you Mac where you wish to create the project in your terminal and then use the following command. Feel free to swap the name for your own project name.

```bash
dotnet new umbraco --name UmbracoMac
```

## Open in Visual Studio Code & run

Open the newly created folder called **UmbracoMac** in [Visual Studio Code](https://code.visualstudio.com/Download). If you do not have the [C# VSCode extension already installed](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) then a prompt should auto show prompting you to download it.

VSCode may also prompt you that the required assets to build and debug the project are missing and if it does, choose the Yes option. As this will help auto generate some JSON files specific to VSCode that are placed in the .vscode folder called launch.json and tasks.json. These files help with the debugging experience  and allow you to visit the debug section in VSCode to hit the **play icon** to launch the Umbraco site and have a debugger available to inspect breakpoints.

By clicking run in the debug section of VSCode it is essentially doing the same as the **dotnet run** in your terminal and attaching the debugger.

Now Umbraco should have booted up and you are presented with the installer flow of Umbraco 9, where you can setup the super admin name, email address (used for logging in) and password. When continuing to the next step it will ask you for database credentials that you wish to use. This is where you may run into trouble...

## How do I setup a database?

If you work in a team at an agency then you workflow may be that you use a shared common database and in that case, it would be simply grabbing the connection string details such as server, username and password etc for Umbraco to connect to.

Unfortunately on a Mac we do not have the option to install Umbraco with an embedded file database, like we do for Windows where we allow a file database of SQLCE to be used. The problem is that this is only compatible for Windows.

So if you don't have access to an existing database or cant have one setup for you, be it an Azure SQL database or some other hosted location, then your only other option would be use Docker in order to have SQL server running on your Mac for a local copy of the database.

### Optional: Let's setup Docker for SQL Server



```sql
-- Create a new database called 'UmbracoMac'
-- Connect to the 'master' database to run this snippet
USE master
GO
-- Create the new database if it does not exist already
IF NOT EXISTS (
    SELECT [name]
        FROM sys.databases
        WHERE [name] = N'UmbracoMac'
)
CREATE DATABASE UmbracoMac
GO
```

Rerun the Umbraco application from VSCode and now when you get to the Umbraco database step in the installer, you will now be able to connect with the following details:

Database Type: SQL Server  
Server: localhost  
Database Name: UmbracoMac  
Login: sa  
Password: yourStrong(!)Password

## Woohoo that's it!

Now you have all the necessary parts to have Umbraco CMS V9 aka the .NETCore edition. Happy hacking

## Do I have to use VSCode?

No you certinately don't have to use VSCode, but I do find it has a nice experience with C# and .NETCore projects in my opinion. However you could simply use the terminal to run your dotnet comands such as dotnet restore, dotnet build, dotnet run etc along side your own favourite text editor. However it is unlikely you will get much extra help that perhaps VSCode would give you as a text editor.

The next best thing is to use a bigger brother IDE built for .NET and for Mac you have two options. You can use JetBrains Rider which is a full cross platform .NETCore IDE or you can alternatively use Visual Studio for Mac.

But the point is that you have many choices and options avilable to you, so choose what suits you best and have fun coding.

## Prefer to watch me setup Umbraco CMS on a MacBook?

Sometimes I know myself included,  I prefer to watch someone show me do something as opposed to read an article. If that's you then take a look at the video below...

<hmd-video class="hmd-video" video-id="lDL9tsJojfs">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=lDL9tsJojfs">Watch on YouTube ↗</a>
</hmd-video>
