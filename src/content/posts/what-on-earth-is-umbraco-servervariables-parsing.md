---
title: "What on earth is Umbraco ServerVariables Parsing?!"
date: 2014-06-23
topics: ["tutorials", "umbraco"]
excerpt: "What on earth is Umbraco ServerVariables Parsing? What it is in Umbraco 7, why you'd use it, and how to add your own values for backoffice JavaScript."
heroImage: "/images/blog/what-on-earth-is-umbraco-servervariables-parsing/umbraco-sys-servervariables_customised.png"
draft: false
---

Hello all this is another '**What on Earth**' blog post detailing a specific feature or functionality of Umbraco that may be hidden away a little & this blog post is here to help describe & detail it.

## What is Umbraco ServerVariables Parsing?

Umbraco ServerVariables Parsing is an event that we can hook into as developers, normally in the Application Startup event of Umbraco that allows us to easily add items to a dictionary of items available to us via Javascript.

To quote from the [documentation page on our.umbraco.org](https://web.archive.org/web/20140623171633/http://our.umbraco.org:80/documentation/Extending-Umbraco/version7-assets):

> In v7 once a user is authenticated a request is made to retreive the Server Variables collection from the server which creates a global dictionary object that is accessible in JavaScript. This dictionary contains information based on the current Umbraco environment for which the JavaScript and client side needs to know about. Information such as whether the application is running in debug mode, the service API URLs, or other non-sensitive global server side variables.

## Why would I use Umbraco ServerVariables Parsing?

So know we what it is, why would we want to use this? Well there can be many use cases for this, as you can store any string or JSON object in this collection that can then be accessed globally in JavaScript. So you may have settings or configuration values you may want to store, but the most common use case is storing WebAPI URL endpoints, that your AngularJS property editors or any other component can retrieve the WebAPI URL and post directly to it.

You may wonder why you would want to store the URL to a WebAPI. A good example is that in [Umbraco introduced a breaking change based on how certain WebAPI URL endpoints are structured](https://web.archive.org/web/20140803025006/http://umbraco.com/follow-us/blog-archive/2014/1/17/heads-up,-breaking-change-coming-in-702-and-62.aspx). So depending on what version of Umbraco you are using you can on Application Startup of Umbraco detect what version and use the correct URL format for the WebAPI, as opposed to traditionally putting the URL into your AJAX JS calls and it breaking between specific versions of Umbraco.

## How do we go about using ServerVariables Parsing?

Now we know What & Why we would use ServerVariables Parsing, we can go on to know how to use this with a simple example & then followed by a more complete or real world example.

Firstly start up a latest Umbraco 7 site and login to the Umbraco back office, from here open your browser developer tools and in the console type the following: **Umbraco.Sys.ServerVariables** you will see something similar in your browser developer tools.

![umbraco.sys.servervariables](/images/blog/what-on-earth-is-umbraco-servervariables-parsing/umbraco-sys-servervariables.png)

If we expand some of the objects in the JSON then we can see further information about our Umbraco installation, with ServerVariables Parsing event, we can add item/s to this JSON object that we can then use in our JavaScript code where needed.

![umbraco.sys.servervariables_extended](/images/blog/what-on-earth-is-umbraco-servervariables-parsing/umbraco-sys-servervariables_extended.png)

So let's learn how to add to this JSON object. Create a C# class called something like UmbracoStartup.cs or similar in there we can add this code:

```csharp
public class UmbracoStartup : ApplicationEventHandler
{        
    protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
    {
       
        //When Umbraco has started up - wire up the ServerVariablesParser event
        ServerVariablesParser.Parsing += ServerVariablesParser_Parsing;
    }

    void ServerVariablesParser_Parsing(object sender, Dictionary<string, object> e)
    {
        e.Add("warrensExample", new Dictionary<string, object>
        {
            { "Name", "Bob" },
            { "Age", 28 },
            { "LikesUmbraco", true },
            { "UseYourImagination", "Will Do" }
        });
    }
}
```

If we restart our Umbraco application this code should fire & add our items into the JSON object like so:

![umbraco.sys.servervariables_customised](/images/blog/what-on-earth-is-umbraco-servervariables-parsing/umbraco-sys-servervariables_customised.png)

However the example I gave is not overly useful and a more real world example is to add WebAPI Url endpoints. This snippet below is taken from Shannon Deminick's Umbraco Blog Package Articulate which uses a URLHelper to figure out what the WebAPI Route URL will be.

```csharp
static void ServerVariablesParser_Parsing(object sender, Dictionary<string, object> e)
{
    if (HttpContext.Current == null) throw new InvalidOperationException("HttpContext is null");
    var urlHelper = new UrlHelper(new RequestContext(new HttpContextWrapper(HttpContext.Current), new RouteData()));
    e.Add("articulate", new Dictionary<string, object>
    {
        {"articulateImportBaseUrl", urlHelper.GetUmbracoApiServiceBaseUrl<ArticulateBlogImportController>(controller => controller.PostImportBlogMl(null))},
        {"articulatePropertyEditorsBaseUrl", urlHelper.GetUmbracoApiServiceBaseUrl<ArticulatePropertyEditorsController>(controller => controller.GetThemes())}
    });
}
```

Then Shannon uses it in a JavaScript Angular Property Editor like so:

```javascript
angular.module('umbraco').controller("Articulate.PropertyEditors.ThemePicker", function ($scope, umbRequestHelper, $http) {

    var url = Umbraco.Sys.ServerVariables["articulate"]["articulatePropertyEditorsBaseUrl"] + "GetThemes";

    umbRequestHelper.resourcePromise(
            $http.get(url),
            'Failed to retrieve themes for Articulate')
        .then(function (data) {
            $scope.themes = data;
        });

});
```

Hopefully now you have a better understanding of Umbraco ServerVariables Parsing along with how & why you would want to use it.

So go forth & code and make your Umbraco sites better :)
