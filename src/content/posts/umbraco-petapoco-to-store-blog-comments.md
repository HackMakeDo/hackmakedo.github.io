---
title: "Umbraco & PetaPoco to store blog comments"
date: 2013-07-16T08:02:54Z
topics: ["dotnet"]
excerpt: "Use PetaPoco, the micro ORM in Umbraco, to store blog comments in your own database table instead of as content nodes, with simple CRUD code to match."
draft: false
---

## What is PetaPoco?

[PetaPoco is defined as tiny micro ORM (Object Relational Mapping)](https://github.com/CollaboratingPlatypus/PetaPoco) but for the non techy people like myself all this means is that we have an easy way to map objects in our code to custom tables in our database, to be able to do simple CRUD (Create, Read, Update & Delete) operations on that data in a very simple manner.

Read on to find out why you should use it and how you can use it in your Umbraco websites.

## Why should I use it?

So you may ask yourself why would I ever use this and why would it benefit me? Well let's take a scenario to help explain it better. If we have a blog site built on Umbraco and want to store comments for our blog posts. You may store them as child nodes of your blog post node in the content tree, but if your blog grows quickly or you have a lot of blog posts or comments then you will content tree will start to grow at a very rapid pace. Instead we could create a custom database table in our Umbraco website, where we could store our comments in and will keep our Umbraco content tree a lot more tidier. But there are many use cases for storing information in custom database tables as opposed to content nodes directly inside Umbraco.

## How do I use it?

Rather than try to explain it without any code, I would much prefer to show you with some heavily commented working examples for you to read over.
So let's carry on to the next section and show you the code!

## Show me the code!

Firstly create a folder in your Umbraco website called **pocos** and add a class file called **BlogComment.cs**

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

//These are the main namespaces we need to use
using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.DatabaseAnnotations;

namespace MyWebsite.pocos
{
    [TableName("BlogComments")]
    [PrimaryKey("BlogCommentId", autoIncrement = true)]
    [ExplicitColumns]
    public class BlogComment
    {
        [Column("id")]
        [PrimaryKeyColumn(AutoIncrement = true)]
        public int BlogCommentId { get; set; }

        [Column("BlogPostUmbracoId")]
        public int BlogPostUmbracoId { get; set; }

        [Column("Name")]
        public string Name { get; set; }

        [Column("Email")]
        public string Email { get; set; }

        [Column("Website")]
        public string Website { get; set; }

        [Column("Message")]
        [SpecialDbType(SpecialDbTypes.NTEXT)]
        public string Message { get; set; }
    }
}
```

Next create a class file called **RegisterEvents.cs** this is used to hook into the Application Startup event of Umbraco, which will allow us to check if the custom database table exists or not and if it doesn't then to create it for us.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using umbraco.cms.presentation;
using Umbraco.Core;
using umbraco.BusinessLogic;
using umbraco.cms.businesslogic;
using umbraco.cms.businesslogic.web;
using Umbraco.Core.Persistence;
using MyWebsite.pocos;

namespace MyWebsite
{
    public class RegisterEvents : ApplicationEventHandler
    {
        //This happens everytime the Umbraco Application starts
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            //Get the Umbraco Database context
            var db = applicationContext.DatabaseContext.Database;

            //Check if the DB table does NOT exist
            if (!db.TableExist("BlogComments"))
            {
                //Create DB table - and set overwrite to false
                db.CreateTable<BlogComment>(false);
            }

            //Example of other events (such as before publish)
            Document.BeforePublish += Document_BeforePublish;
        }

        //Example Before Publish Event
        private void Document_BeforePublish(Document sender, PublishEventArgs e)
        {
            //Do what you need to do. In this case logging to the Umbraco log
            Log.Add(LogTypes.Debug, sender.Id, "the document " + sender.Text + " is about to be published");

            //cancel the publishing if you want.
            e.Cancel = true;
        }
    }
}
```

The final part is for us to insert records into our custom database table and retrieve those values as well. There may be a few different approaches to this but normally in your Controllers or in our case with Umbraco it would be SurfaceControllers we would have a few methods in a controller to deal with a blog comment form post and also another for listing out the blog post comments to a partial view.

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Umbraco.Web.Mvc;

namespace MyWebsite.controllers.SurfaceControllers
{
    // I don't encourage you to put your viewmodel class in your surface controller, only done for this example for readability
    public class BlogPostViewModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Url]
        public string Website { get; set; }

        [Required]
        public string Message { get; set; }
    }

    public class BlogSurfaceController : SurfaceController
    {
        [HttpGet]
        public ActionResult RenderComments()
        {
            //Connect to the Umbraco DB
            var db = ApplicationContext.DatabaseContext.Database;

            //Get the current Umbraco Node ID
            var currentNodeId = UmbracoContext.PageId.Value;

            //Get an IENumberable of BlogComment objects to iterate over
            var comments = db.Query("SELECT * FROM BlogComments WHERE BlogPostUmbracoId=@0", currentNodeId);

            //Return the view with our model and comments
            return PartialView("viewComments", comments);
        }

        [HttpPost]
        public ActionResult HandleCommentPost(BlogPostViewModel model)
        {
            //Check if the data on the model is valid
            if (!ModelState.IsValid)
            {
                //There was a validation error with the data
                return CurrentUmbracoPage();
            }

            //Continue processing the data...

            //Create new Blog Post object
            var blogPostToAdd = new BlogComment();

            //Set values from view model & grab the current node ID
            blogPostToAdd.UmbracoNodeId = UmbracoContext.PageId.Value;
            blogPostToAdd.Name          = model.Name;
            blogPostToAdd.Email         = model.Email;
            blogPostToAdd.Website       = model.Website;
            blogPostToAdd.Message       = model.Message;

            //Get the Umbraco db
            var db = ApplicationContext.DatabaseContext.Database;

            //Add the object to the DB
            db.Insert(blogPostToAdd);

            //All done - redirect to the page
            return RedirectToCurrentUmbracoPage();
        }
    }
}
```

Well that's it apart from a Razor Partial View to loop over the IENumberable of Blog Comments so they can be displayed on the client side of the site.

Would love to hear your thoughts & ideas on this.

Thanks,
Warren :)
