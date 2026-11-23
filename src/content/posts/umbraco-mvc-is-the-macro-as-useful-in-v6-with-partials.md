---
title: "Umbraco MVC: Is the macro as useful in V6 with Partials?"
date: 2013-07-17T20:06:57Z
topics: ["tutorials", "umbraco"]
excerpt: "Following on from my previous blog post on Umbraco MVC, where we got MVC setup in Umbraco and created nested templates."
draft: false
---

Following on from my previous blog post on Umbraco MVC, where we got MVC setup in Umbraco and created nested templates. In this next post in this series, I will talk about adding dynamic functionality to your website such as a simple navigation and discuss that perhaps that the Umbraco Macro is no longer needed as much as we have used it before. So carry on reading to find out why that the Umbraco macro is perhaps on it last legs in my opinion.

## What is a Partial?

A partial you can think of as a small piece of functionality, such as navigations, blog post comments for example. If you are familiar with Umbraco macros then mostly all of these would be applicable as a partial. This [video on the ASP.NET MVC website covers the basics of Partial Views](https://web.archive.org/web/20130708115235/http://www.asp.net/mvc/videos/mvc-2/how-do-i/how-do-i-work-with-data-in-aspnet-mvc-partial-views)

## Why use Partials?

The purpose of using partials is to allow you to create functionality in contained files away from your main template views. It is possible to write Razor and logic directly into your templates, however I would not recommend it as it is not the correct approach to MVC. As the MVC approach is about separation of concerns, by separating your logic away from your markup for example. If you have worked with Umbraco macros before by creating, XSLT, .NET Usercontrols or the older style of Razor MacroScripts then these would all be valid examples of when to use a partial view.

## Show me the code!

In this example I will show you how to create a very simple Partial View for a navigation for your site. In your Umbraco website create a new file called **navi.cshtml** in the **/Views/Partials** folder. In here we can write our code that will display our navigation for us.

```csharp
@model IPublishedContent

@{
    //Model is our current page in this example
    
    //From the currentpage - get the root node (Select the node at level 1)
    var rootNode = Model.AncestorsOrSelf(1).FirstOrDefault();
    
    //Get the top level children for our navi (only one level under homepage)
    //Select pages where they are visible (umbracoNaviHide = false) AND the document type alias is NOT CarouselFolder
    var pages = rootNode.Children.Where(x => x.IsVisible() && x.DocumentTypeAlias != "CarouselFolder");
}

@if (pages.Any())
{
    <ul>
        <!-- Loop over the pages for our navigation -->
        @foreach (var page in pages)
        {
            <li>
                <a href="@page.Url">@page.Name</a>
            </li>
        }
    </ul>
}
```

The next part is to reference our partial view in our main master template so the navigation is visible on all pages of our website.

```csharp
//Insert our navigation into our master template,
//by passing the Current Page as the model to our partial view
@Html.Partial("navi", Model.Content)
```

The wonderful guys of [the Umbraco core team have written some great documentation on Partial Views in Umbraco when using MVC](https://web.archive.org/web/20130902025614/http://our.umbraco.org:80/documentation/Reference/Mvc/partial-views).

## So why are Macros on the way out?

OK as before this is my opinion and you may or may not agree with me, but keep in mind it is my opinion. Now it's possible to insert macro type functionality such as Navigations as in our example without the need of a macro, there is no real need for macros except in a certain few cases. But I may hear you cry what about caching, surely I need to use a macro if I want the contents to be cached and the answer is no you don't as there is a handy helper method available to us, to render out Cached Partial Views.

```csharp
//Cache MyPartialName passing through pageModel and caching the result for an hour (3600 secs)
@Html.CachedPartial("MyPartialName", pageModel, 3600)

//Here are all the options available on the extension method CachedPartial
IHtmlString CachedPartial(
    string partialViewName, 
    object model, 
    int cachedSeconds,
    bool cacheByPage = false,
    bool cacheByMember = false,
    ViewDataDictionary viewData = null)
```

The only real reason that I will see you using Umbraco macros is that you need to have the partial to be inserted inside the WYWISYG Rich Text Editor. Apart from that in my eyes the Umbraco Macro has no other use, but I may be wrong.

Next time we start to look at controllers & surface controllers and what they are used for.

Cheers,
Warren :)
