---
title: "Using TeamCity for Continuous Integration with NodeJS and Grunt"
date: 2014-02-19
topics: ["javascript", "tooling"]
excerpt: "Note: This is a cross post from my blog post over at Work's blog at CogWorks, this is a cross post to keep a record of my findings. What is TeamCity and Continuous Integration?"
draft: false
---

*Note: This is a cross post from [my blog post over at Work's blog at CogWorks](https://www.wearecogworks.com/innerworks/cogworks-blog-archive/using-teamcity-for-continuous-integration-with-nodejs-and-grunt), this is a cross post to keep a record of my findings.*

## What is TeamCity and Continuous Integration?

[TeamCity is a tool developed by JetBrains to run a continuous integration environment](https://www.jetbrains.com/teamcity/). This allows the development team to push to a Git repository and for the TeamCity tool to monitor the Git repository and perform a series of build steps in order for the website to be built and deployed to a webserver. In our case at [The Cogworks](https://www.wearecogworks.com/), a website in our development environment.

This allows the code to be checked ensuring the code compiles and builds, as it would inside Visual Studio. You can then be sure that a working site is deployed.

With TeamCity you can be as simple or fancy as you like, involving build steps that copy files from one place to another or running complex tasks such as utilising tools to help you migrate databases from one environment to another. There are plenty of scenarios and ideas that can be setup to fit your team's development workflow.

## What are NodeJS, Compass, Grunt and Bower?

Before I go onto explain this, I'd just like to add a disclaimer that I claim to be no expert in this field and someone with more experience with these tools may give a better explanation of their use. So as I am still new to these frontend tool sets I'll try my best to explain them.

### NodeJS

So let's start with NodeJS. This is a Javascript application framework which allows you to build a whole range of applications ranging from a HTTP server written in Javascript, to slightly more geeky things such as [controlling Parrot's AR Drone](https://web.archive.org/web/20140208014352/http://nodecopter.com/). Some clever bods have also written Grunt and Bower in NodeJS hence the need for it in this scenario. So from what I can tell your imagination is the only limit with NodeJS and it's worth [browsing the NPM repository](https://www.npmjs.org/), to see what other people are up to.

### Compass

Next onto [Compass](https://web.archive.org/web/20140218201822/http://compass-style.org:80/), this is seen as a common and useful extension to the popular CSS preprocessor Sass. It also gives some extra functionality to your Sass files for example providing the power to [automatically create a sprite image and use it in your CSS](https://web.archive.org/web/20140221185321/http://compass-style.org:80/help/tutorials/spriting/) - It's voodoo magic!!

### Grunt

[Grunt is whats all the front-end devs are getting excited](https://gruntjs.com/) about at the moment. This is because Grunt is a task runner for their front-end workflows. You can compare this as an equivalent to your C# MSBuild workflows. So front-end devs can run tasks such as 'Watch', which will automatically monitor file changes to Sass and CoffeeScript source files which are then automatically re-compiled into CSS and JavaScript files and then the browser is reloaded. Other common workflows are to use it is a build runner, and for CSS and JS files to be minified and concatenated together, along with tasks such as running all images though an image minifier to ensure all images are optimised and compressed for the best browsing experience. Again there are a whole heap of uses for front end devs and it will be exciting to see what the future holds for Grunt.

### Bower

Finally, [Bower is a front end package manager](https://bower.io/) which is built by the guys over at Twitter and runs on NodeJS. This fetches other front end tools you may wish to use. For example you may use Bower to install and fetch the latest version of jquery, jquery-ui and jquery.cookies along with a range of other client side dependencies. This is similar to the NodeJS NPM repository, but instead is aimed at web dependencies from jQuery to handlebars.

## Why do we need all these frameworks?

All these tools basically allow us to write better front end code. It allows us to compress images, minify large JS and CSS files and hel pus improve the overall quality of the browsing experience on as many devices and connection speeds as possible automatically.

They help us take some of the hard work out of this by allowing us to automate a lot of the front end build processes. You can think of Grunt as the front end developer equivalent of a build process like we do as .NET Developers.

## Installing

So I recently went through this process and made some detailed notes about how I installed and setup what was needed to get all these apps working nicely with TeamCity. So here goes:

### Git

First install Git and go through the installer. The most important steps are as follows:

![Git Install](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/git-install-4.png)

From the screenshot above, you must ensure you chose the option to run Git from the Windows command prompt. This ensures that you can type Git in any console window as it has been added to your computers PATH. Without doing this you will make your life hard if you work with things like bower.io where it expects Git to be in the PATH.

The next thing to ensure your life is easier in the future is that you choose the Windows line ending from this step in the installer:

![Git Install - Windows Format](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/git-install-5.png)

Now that we have Git installed, let's quickly check and ensure it is actually installed correctly.

From a console window type the following **git -v** and hit enter. You should see a version number displayed if git has been successfully installed.

### NodeJS

The next part that I needed to install on the server was NodeJS which allows a whole heap of extensions to be installed via NPM (Node Package Manager). Think of this as the equivalent of NuGet in the .NET world but just specifically for NodeJS.

Again as with the Git install, there is an important step to ensure the following commands node and npm are available in your console window globally by ensuring NodeJS and NPM are installed in your PATH.

![nodejs-install-4](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/nodejs-install-4.png)

Once the NodeJS installer has finished lets test and ensure that NodeJS has been installed and available globally in our Windows console.

Type **node -v** into the console and hit 'Enter'. You should see the version number displayed if it has been successfully installed into your PATH, next try **npm -v** and see if that also returns a version number too.

### Bower

![bower-logo](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/bower-logo.png)

Bower is a front end package manager from the Twitter team and uses Git to consume the packages. To install Bower we need to install it from the node package manager (npm). In the console window type the following command **npm install -g bower** this tells npm to install the Bower package globally. This allows us to use the command 'Bower' in our console window from any location. Similar to how Git and NodeJS was added to our PATH.

This is where you will see your console window go nuts as the NPM goes and downloads Bower and it's dependencies. Do not panic you will soon get used to the number of dependencies any NPM package has.

![cmd-npm-grunt-install](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/cmd-npm-grunt-install.png)

Again to test that Bower has been installed successfully use the **bower -v** command.

Bower is not a requirement but as our front-enders were using Bower in their workflow we needed to install it too on our build server as well.

### Grunt

![grunt-logo](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/grunt-logo.png)

The next thing we need to install and setup for our workflow is to install GruntJS which is the task runner or the equivalent as the front-enders build steps.

To install this we need to install Grunt from NPM with this following command **npm install -g grunt-cli** which tells node to install the Grunt command line runner globally and make it accessible from any console window.

To verify it installed all OK lets run the obligatory command of **grunt -v** this will list a version number and most likely will give you a warning message that it can't find a local grunt in your folder. Don't panic this is normal as its trying to look for a **gruntfile.js**

### Ruby

The next part we need to install is Ruby, this allows us to use other packages that are specifically written for Ruby. We use Ruby in our setup because our front enders are using a front end tool called Compass which is an extension for the CSS preprocessor Sass.

So we need to download and [install the Ruby installer from rubyinstaller.org](https://rubyinstaller.org/).

![ruby-install-2](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/ruby-install-2.png)

As before with all installs, we need to ensure that Ruby gets installed correctly and we need to make sure it gets installed into our PATH.

Once installed let's verify it installed correctly by typing **ruby -v** and also **gem -v** to test it out. As with NodeJS, Ruby has it's own package manager and it's called gem. So we can download packages such as compass from gem.

### Compass

The final thing to install for our front end tools is Compass, which is a tool for the CSS preprocessor Sass, which helps give Sass some extra power with some helpers and extensions.

To install Compass we need to run the following commands in the console.
**gem --update system** followed by **gem install sass** and finally **gem install compass**

We can then do our usual version check and run **sass -v** and then **compass -v
**For Compass to be installed we need to ensure Sass is installed first, hence the order above for the commands is important.

Ok we have everything all setup and ready for the front end workflow that our front-enders are using, the last thing to setup is the TeamCity plugin to use NodeJS and Grunt in the build steps.

## Installing the NodeJS TeamCity Plugin

The next part of this workflow is to download and install the NodeJS TeamCity plugin written by Eugene Petrenko from Germany. This plugin is open source and posted on GitHub here - [https://github.com/jonnyzzz/TeamCity.Node](https://github.com/jonnyzzz/TeamCity.Node)

However rather than going over to the GitHub repo you need to head over to the JetBrains own TeamCity where it hosts this project. [http://teamcity.jetbrains.com/viewType.html?buildTypeId=bt434](http://teamcity.jetbrains.com/viewType.html?buildTypeId=bt434)

This url will prompt you to login, however do not panic just click the link to login as a guest under the login box. Here you will see the most recent builds for the TeamCity NodeJS plugin. To download the plugin click the '**View artifacts**' button next to the most recent build and download the **jonnyzzz.node.zip** file. At the time of this post the most current version is 1.0.46

To install the plugin you need to stop the build runner and the main web interface services on the build server. Once they are stopped you need to copy the downloaded zip file to **TeamCityDataDirectory/plugins**, note you do not need to unzip the file, simply copy it to the plugins folder. Once the plugin has been copied restart the two services for TeamCity backup on the build server.

If you were like me and were unsure where the **TeamCityDataDirectory** is, then before you stop the services, go to the Administration settings page in TeamCity to point you to the folder location path.

Now that you have the plugin installed and have restarted TeamCity, go to **Settings** followed by **Plugin List** which should show the NodeJS plugin in the list if it's installed correctly.

![teamcity-plugin-list](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/teamcity-plugin-list.png)

## Adding the Build Steps

Each call/command line is its own step, so we can easily see where the build fails to help us debug the problem. Each step we add here outputs information allowing us to keep an eye at all times what is going on with our build.

### Run: npm install and npm update

![teamcity-npm-step](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/teamcity-npm-step.png)

### Run: bower update

![teamcity-bower-step](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/teamcity-bower-step.png)

### Run: npm install grunt-cli

![teamcity-grunt-cli-step](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/teamcity-grunt-cli-step.png)

### Run: grunt build

![teamcity-grunt-step](/images/blog/using-teamcity-for-continuous-integration-with-nodejs-and-grunt/teamcity-grunt-step.png)

## Build Log

So when the build is running on TeamCity we can see the build log and the output of each of these steps to give us an insight into what is happening and if any errors are occurring. The order of these build steps is important so that they run in the specific order as defined above. This is to ensure if one step fails it stops and the other steps cannot continue to run.

## Gotcha's

There were a few gotcha's that caught me out which I'd like to share with you which may also catch you out on your journey to front end workflow nirvana.

Bower uses Git to go off and consume packages from Git repositories nine times out of ten it would work fine, however there may be one dependency it was trying to download where it would fail with a weird error message of '**ECMDERR Failed to execute**'. After some Googling I found the solution was best to change how Git was fetching contents of a repo. So in the console window run the following command to ensure it uses https:// protocol as opposed to git:// urls and this error went away.

`git config --global url."https://".insteadOf git://`

The second gotcha happened when I received some strange errors back from NPM. It took a while for me to figure out why I was experiencing these errors. However the solution for us was to run the Teamcity service on the server under the Administrator user specifically. After doing so the errors went away and we managed to get the Grunt workflow all sorted out for our frontenders.

## The End…

Hopefully this has been useful to you and now you too can get up and running with integrating Grunt and the world of NodeJS into your TeamCity Continuous Build processes.

Now Front End Developers and .NET developers can live happily together and can stop arguing with one another! (maybe!!)

Hope this helps you,
Warren :)
