---
title: "Using Umbraco Pipeline for Member Profile URLs"
date: 2013-12-03
topics: ["tutorials", "umbraco"]
excerpt: "Give Umbraco members their own profile URLs with a custom IContentFinder in the request pipeline, a simpler option than URL rewriting or a custom route."
draft: false
---

Hello all,
I wanted to share with you all a new approach [I have learnt after reading up on the Umbraco Pipeline](https://web.archive.org/web/20131217174417/http://www.zpqrtbnk.net/TheUmbraco6RequestPipeline.pdf).

I [originally asked the question over on our.umbraco.org](https://web.archive.org/web/20131217184540/http://our.umbraco.org/forum/developers/extending-umbraco/41367-Umbraco-6-MVC-Custom-MVC-Route) on how best to achieve this and first came up with URL Rewriting to solve my solution, then the thread evolved and I was able to use a custom controller & route, but now I have found a much simpler & elegant way to deal with it, which is to use an iContentFinder class.

First lets start off with creating an custom iContentFinder which is used in the pipeline for trying to find an Umbraco node that matches the URL, if it doesn't find it it gets passed onto the next iContentFinder and so on until it gets to the bottom which is the 404 iContentFinder.

```csharp
using System;
using System.Linq;
using System.Web;
using umbraco.cms.businesslogic.member;
using Umbraco.Core;
using Umbraco.Web.Routing;

namespace MySite.BusinessLogic
{
    public class MemberProfileContentFinder : IContentFinder
    {
        public bool TryFindContent(PublishedContentRequest contentRequest)
        {
            var urlParts = contentRequest.Uri.GetAbsolutePathDecoded().Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            
            //Check if the Url Parts
            // Starts with /member/*
            if (urlParts.Length > 1 && urlParts[0].ToLower() == "member")
            {
                //Lets try & find the member
                var memberName = urlParts[1];

                //Try and find a member where the property matches the memberName
                var tryFindMember = Member.GetAll.SingleOrDefault(x => x.getProperty("profileURL").Value.ToString() == memberName);

                //Need to set the member ID or pass member object to published content
                //Will pass a null to view if not found & can display not found member message
                HttpContext.Current.Items["memberProfile"] = tryFindMember;

                //Add in string to items - for profile name user was looking for
                HttpContext.Current.Items["memberName"] = memberName;

                //Set the Published Content Node to be the /Profile node - can get properties off it & my member profile in the view
                contentRequest.PublishedContent = contentRequest.RoutingContext.UmbracoContext.ContentCache.GetByRoute("/view-profile");

                //Return true to say found something & stop pipeline & other contentFinder's from running
                return true;
            }

            //Not found any content node to display/match - so run next ContentFinder in Pipeline
            return false;
        }
    }
}
```

In this code you can see it is quite straight forward. It is getting the URL from the request and splitting the string on the URL parts such as `http://mysite.co.uk/member/john` into a string array so the variable **urlParts** will have two items in the array which are **member** and **john**.

We then next check that we have at least one URL part and that the first URL part in our array is equal to members, as we don't want to run our logic if it does not match this URL fragment.

Next part is for us to get the second item in the array which is the member profile URL we want to look up. Using the Umbraco Member API we fetch all members and using a **SingleOrDefault()** Linq query we check to see if we can find a single member where the property **memberProfileURL** on the member matches that to our variable which contains the member URL to lookup.

Moving on we add the found member (even if it returns null, aka not found a member that has that profile URL) & the member profile URL to the HTTPContext Items so that we can retrieve them from our view.

The magic part of this is the following line:

```csharp
//Set the Published Content Node to be the /Profile node - can get properties off it & my member profile in the view
contentRequest.PublishedContent = contentRequest.RoutingContext.UmbracoContext.ContentCache.GetByRoute("/view-profile");
```

By setting **PublishedContent** on the **contentRequest** object, we can choose what node in the Umbraco content tree we want to render. In our case I am using the routing context to help get me the node based from it's URL, so in this case I am fetching the node that matches the URL, **/view-profile**

The final part is that we return true, so that we let the pipeline know that we have a found a node and to stop running any further iContentFinders from being processed. By doing so we will load the view profile node and it's template.

The next part of this is to now register our content finder in the application starting event with this lovely code snippet so it can run in our site.

```csharp
using Umbraco.Core;
using Umbraco.Core.Persistence;
using Umbraco.Web.Routing;

namespace MySite.BusinessLogic
{
    public class UmbracoStartup : ApplicationEventHandler
    {
        protected override void ApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            // Insert my MemberProfileContentFinder before ContentFinderByNiceUrl
            ContentFinderResolver.Current.InsertTypeBefore<ContentFinderByNiceUrl, MemberProfileContentFinder>();
        }
    }
}
```

Now that we have our custom iContentFinder registered by Umbraco, we just need to ensure our template/view for our view profile node uses the values in the **HTTPContext.Items** collection that we set inside the iContentFinder.

```csharp
@using Member = umbraco.cms.businesslogic.member.Member
@inherits Umbraco.Web.Mvc.UmbracoTemplatePage
@{
    Layout = "Master.cshtml";

    //Get the values out of the HTTPContext that we set in the iContentFinder
    var memberProfile   = (Member)HttpContext.Current.Items["memberProfile"];
    var memberName      = (string)HttpContext.Current.Items["memberName"];

    //Bit of string replacment on the noUserFound property on the View Profile node
    //Replace it with the member name the user was trying to look for
    var notFoundMessage = Model.Content.GetProperty("noUserFound").Value.ToString();
    notFoundMessage     = notFoundMessage.Replace("##user##", memberName);
}

<h2>View Profile</h2>

@if (memberProfile == null)
{
    //Display User Not Found Message
    //Do string replacement on copy ##user## with memberName
    @Html.Raw(notFoundMessage)
}
else
{
    //We found the member - so pass the member object to our partial
    //To display the member's details etc :)
    @Html.Partial("MemberProfile", memberProfile)
}
```

In this template/view you can see I am fetching the items out of the **HTTPContext** and casting it to a string for the profile URL name and the other as an Umbraco Member object so we can get intellisense.

The next part is that I am doing some string replacement on an field that I am fetching off the View Profile node for a user not found message.

I then simply display the not found message if the member is null, because the iContentFinder did not set a value for it. Otherwise we pass the member into our partial view where we can display specific information about our member, like member name, email, profile image & any other custom fields set on the member type.

So the final part of the puzzle is the Partial View

```csharp
@inherits Umbraco.Web.Mvc.UmbracoViewPage <umbraco.cms.businesslogic.member.Member>
<h2>Member Profile Partial</h2>

<h3>Name: @Model.Text</h3>
<h3>Email: @Model.Email</h3>
<h3>Custom Field: @Model.getProperty("customField").Value</h3>
```

The only important thing to know here is that the first line is that I am setting the object type to be an Umbraco Member, which lets the model know its an Umbraco Member and gives us intellisense in Visual Studio when writing our partial view to display public information about our member.

That's it, it's really as simple as that.

Thanks to the Umbraco community & Stephane Gay for some help with the iContentFinder Pipeline stuff.
