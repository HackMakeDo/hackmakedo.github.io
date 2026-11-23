---
title: "Why I think your doing it wrong: Umbraco AltTemplate & Data Views"
date: 2013-07-16T07:27:13Z
topics: ["umbraco", "personal", "dotnet"]
excerpt: "Common sense warning Before I start this post let me outline this is my opinion and you may or may not agree with it."
draft: false
---

## Common sense warning

Before I start this post let me outline this is my opinion and you may or may not agree with it. However if you want to discuss it with me in the comments I will be more than happy to, but please respect each others opinions and views and don't start an angry flame war.

OK enough of the common sense stuff lets get to it.

I personally think you are doing it wrong if you are using alternative templates in Version 6 of Umbraco to return JSON or XML for example.
So read on to find out why and the approach I think you should be using.

## Why are you doing it wrong?

I personally feel you are now doing it wrong in V6 of Umbraco and this method is now outdated now that we have more technology and options available to us these days. I must admit I was an avid user of the [alternative template approach](https://web.archive.org/web/20131205053046/http://www.nibble.be/?p=42), allowing me to put a macro in a template and return some JSON or XML data that I needed. Which could be easily accessible via the URL instead of the ?altTemplate=getAllComments so I could do mysite.co.uk/getAllComments

I believe this was perfectly fine and is still OK to use if you want to, but I believe there is a better option. Another downside is that if you have a website with lots of data endpoints, you quickly clutter up your website with lots of templates specifically with a single macro in it, to return some data.

## How should I be doing it?

I personally think you should be using the benefits of Umbraco and MVC and harness [the power of the Web API controller which is part of the .NET 4.5 Framework](https://learn.microsoft.com/en-us/aspnet/web-api/overview/getting-started-with-aspnet-web-api/tutorial-your-first-web-api). Which allows you to handle HTTP requests such as GET, POST, PUT & DELETE all very easily. But most commonly people are using alternative templates in Umbraco to do a simple GET request and return some JSON or XML which they normally use with JavaScript in their client side code of their site.

One of the benefits of using the .NET Web API controller is that it allows you to return JSON or XML without any work required from you. This is all done automatically with the http request headers, which either requests the format to be returned is XML or JSON. So that's already saved us some time and effort already.

The main reason I believed people are using alternative templates is to allow them to have friendly URL endpoints for their data retrieval. For example mysite.co.uk/getAllComments but the same can be easily achieved with a Web API controller.

However the Umbraco core team has made it even easier for us, as they have [their own version of the Web API controller that we can use](https://web.archive.org/web/20130615094038/http://our.umbraco.org:80/documentation/reference/webapi/), that gives us some added bonuses such as access to the Umbraco API and context which would have been a lot harder to do in a normal Web API controller.

So I will wrap this post up with some code examples for you to mull over and decide whether or not Web API controllers are right for you or if you still prefer the approach of using the alternative template method.

## Show me the code!

First you will need to create a new class in your Umbraco website that is your WebApi Controller. I recommend you create the class in the Controllers folder, to follow the guidelines & patterns of ASP.NET MVC. Create a new class file and call it **BlogAPI.cs **

You will need to ensure you class inherits from the following class **Umbraco.Web.WebApi.UmbracoApiController **by doing so we get access to some of the magical Umbraco properties that will make our lives alot easier to write our API data endpoints.

```csharp
ApplicationContext ApplicationContext {get;}
ServiceContext Services {get;}
DatabaseContext DatabaseContext {get;}
UmbracoHelper Umbraco {get;}
UmbracoContext UmbracoContext {get;}
```

With these magical properties we are able to achieve most scenarios easily. So take a look through the class below which is heavily commented and see what you think.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Umbraco.Core;
using Umbraco.Web.WebApi;

namespace UmbracoUKFestival.controllers
{
    public class BlogComment
    {
        public int UmbracoNodeId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public string Message { get; set; }
    }

    public class BlogApiController : UmbracoApiController
    {
        public IEnumerable GetBlogPostComments(int umbracoNodeId)
        {
            //Get the blog post from the Umbraco Node ID
            var blogPost = Umbraco.TypedContent(umbracoNodeId);

            //List of Comments that we will store our comments in & return
            var blogComments = new List();

            //Just double check the node exists in Umbraco (as bad ID may be passed to API)
            if (blogPost != null)
            {
                //Get child nodes of the blogPost node
                var comments = blogPost.Children.Where(x => x.DocumentTypeAlias == "BlogComment");

                //Check we have comments
                if (comments.Any())
                {
                    foreach (var comment in comments)
                    {
                        //Generate a new Blog Comment object
                        var blogComment = new BlogComment();

                        //Fetch the values from the umbraco node and set them on our BlogComment object
                        blogComment.UmbracoNodeId   = comment.Id;
                        blogComment.Name            = comment.GetProperty("commentName").Value.ToString();
                        blogComment.Email           = comment.GetProperty("commentEmail").Value.ToString();
                        blogComment.Website         = comment.GetProperty("commentWebsite").Value.ToString();
                        blogComment.Message         = comment.GetProperty("commentMessage").Value.ToString();

                        //Add it to our list of comments
                        blogComments.Add(blogComment);
                    }
                }
            }

            //Return the list of comments
            return blogComments;
        }
    }
}
```

You can then do a GET request to `http://mysite.co.uk/umbraco/api/blog/GetBlogPostComments?umbracoNodeId=1234` to fetch the child BlogComment node types from the Umbraco node. It's as simple as that.

Look forward to your opinions on this.
Warren :)
