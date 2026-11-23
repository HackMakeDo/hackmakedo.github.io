---
title: "Umbraco MVC: First Steps"
date: 2013-07-17T07:45:47Z
topics: ["tutorials", "umbraco"]
excerpt: "Like most people we fear change, but that should not be the case with the switch from WebForms to MVC in Umbraco. I've made the switch and am glad I have done it."
draft: false
---

Like most people we fear change, but that should not be the case with the switch from WebForms to MVC in Umbraco. I've made the switch and am glad I have done it. In this blog series I will go through common scenarios to make us all feel better about MVC with Umbraco.

So carry on reading on to find out how to take our initial baby steps towards a better and happier development life with Umbraco MVC.

## What is MVC?

I will give you the official geeky definition first from [Wikipedia off what MVC is](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller).

> **Model–view–controller** (**MVC**) is a software architecture pattern which separates the representation of information from the user's interaction with it

But in simple terms to me it's about separation of your code. Business logic and heavy lifting code is done in your controller, your view is the way to display your data with clean and readable HTML markup and the model is where you store your data and in most cases this will be the current Umbraco page node.

Hopefully I have tried to explain it in slightly clearer terms.

## Why should I care about it?

I think you should be learning the MVC approach when you build your Umbraco websites, for one coming from a front-ender background. The MVC approach allows me to have total control of markup from start to finish without ASP.NET WebForms injecting weird stuff into the page such as viewstates and weird markup for controls. After me with playing with MVC for a little while I have now fallen head over heels for it, and I think you will do once you get you head around the initial concepts. I recommend you taking a little time to read up on the [ASP.NET MVC website](https://web.archive.org/web/20130718105842/http://www.asp.net/mvc) with their great tutorials and startup information on the topic.

So to summarise, it will make your life as a developer a lot easier allowing you to have a pure 100% control over your markup of your website.

## Show me the code!

In this initial tutorial I will show you how to enable MVC mode for Umbraco and create nested templates similar to how you would with nested ASP.NET MasterPages.

First things first is to download Umbraco in your preferred method. For me it's using Visual Studio and Nuget but you may prefer a different approach. Do whatever feels comfortable for you.

Before you start the Umbraco install wizard, you will need to enable as MVC mode. This can be done very easily by changing the value in the **/config/UmbracoSettings.config** file to the following.

```xml
<!--
To switch the default rendering engine to MVC, change this 
value from WebForms to Mvc
Do not set useAspNetMasterPages to false, it is 
not relevant to MVC usage
-->
<defaultRenderingEngine>Mvc</defaultRenderingEngine>
```

Once you have done that and saved your changes you can then go through the Umbraco installer as usual.

## Creating a master template

The next step is for us to create our nested templates. From the Umbraco backoffice in the settings section right click the Templates folder and click create. Create a new template called **Master**. In this file enter in your base HTML such as and other common markup for all pages in your website.

You will notice the file that gets created is called **Master.cshtml** which is a Razor view engine file and is stored in **/Views** as opposed to your templates being created in the **/masterpages** folder.

Next we need to insert the main placeholder where child templates will inject their markup into this master template. In ASP.NET MasterPages you would have done this with an **`<asp:contentplaceholder>`** tag but in Razor, you simply need to add **@RenderBody()** instead. For additional `<asp:contentplaceholder>` tags we need to create sections for these. We do this by simply writing **@RenderSection()** which require two parameters, the first being the name of the section and the second a boolean if the section is required or not by the child template. So in the example below I have two additional sections.

Below is a very simple example of a master template:

```razor
@inherits Umbraco.Web.Mvc.UmbracoTemplatePage
@{
    Layout = null;
}

<html>
    <head>
        <title>Umbraco MVC Example</title>

        <!--
        Allow Child Templates to insert into the head (optional)
        -->
        @RenderSection("head", false)
    </head>
    <body>
        <h1>Umbraco MVC Example</h1>
        <div id="content">
            @RenderBody()
        </div>
        <div id="footer">
            <!--
            Allow Child Templates to insert into the
            Footer (Required by child templates)
            -->
            @RenderSection("footer", true)
        </div>
    </body>
</html>
```

## Creating a child template

Now that we have our master template in place, we can now create child templates that are based off this master template. From the templates folder in the Umbraco backoffice, right click and create a new template called **Home** and then from the **master template dropdown** select our template **Master** that we previously created and save the template.

```razor
@inherits Umbraco.Web.Mvc.UmbracoTemplatePage
@{
    //Notice the value here - it is set to our master
    //template file which we are basing our template off
    Layout = "Master.cshtml";
}

<!-- I get rendered where the RenderBody tag is
     on the master template -->
<h2>I am the homepage</h2>
@section head {
    <!--
    Here I could either remove the head section,
    as it is not required.
    Or I can put in specific CSS & JS files into
    the head tag that are needed for the homepage only.
    -->
}

@section footer {
    <h4>
        I am text in the footer of the homepage and I am required
    </h4>
}
```

That's it we are done and have successfully started to create nested templates using Umbraco 6 in MVC mode.

Tune in next time kids, as I continue this long running Umbraco MVC blog series, where we will take a look at Partial Views and potentially why you may start to use Macros in your website less.

Cheers,
Warren :)
