---
title: "The new way to do a 404 Umbraco Handler"
date: 2013-08-07
topics: ["tutorials", "umbraco"]
excerpt: "Set up a 404 page in Umbraco 6.1 with a custom IContentFinder instead of a node ID in umbracoSettings.config, so it keeps working even if the node ID changes."
draft: false
---

Hello all,
As you may or may not be aware I have been building a new Umbraco starter kit called CWS Start. In this package I wanted to have a 404 page setup for the site. Currently the way to setup a 404 page is to put a node ID in the umbracosettings.config file. My only concern with this approach is that if you delete the node and recreate the node then the 404 will stop working.

So I decided to ask the Umbraco community how they do 404's and I got a fantastic response from the community.
[Alternatives to 404 in umbracoSettings.config](https://web.archive.org/web/20210126193401/https://our.umbraco.com/forum/developers/extending-umbraco/43866-Alternatives-to-404-in-umbracosettingsconfig) (archived copy)

Stefan & Lee K gave me some fantastic answers and filled me on the new Request pipeline in Umbraco and a way on how to add a ContentFinder to Umbraco, aka the new way of doing 404 handlers in Umbraco 6.1 and any other type of content finders.

## Show me the code!

```csharp
    public class _404iLastChanceFinder : IContentFinder
    {
        public bool TryFindContent(PublishedContentRequest contentRequest)
        {
            //Check request is a 404
            if (contentRequest.Is404)
            {
                //Get the home node
                var home = contentRequest.RoutingContext.UmbracoContext.ContentCache
                    .GetAtRoot()
                    .Single(x => x.DocumentTypeAlias == "CWS-Home");

                //Get the 404 node
                var notFoundNode = home.Children.Single(x => x.DocumentTypeAlias == "CWS-404");

                //Set Response Status to be HTTP 404
                contentRequest.SetResponseStatus(404, "404 Page Not Found");

                //Set the node to be the not found node
                contentRequest.PublishedContent = notFoundNode;
            }

            //Not sure about this line - copied from Lee K's GIST
            //https://gist.github.com/leekelleher/5966488
            return contentRequest.PublishedContent != null;
        }
    }
```

And then we need to register this in Umbraco on App Startup like so:

```csharp
        protected override void ApplicationStarting(
            UmbracoApplicationBase umbracoApplication,
            ApplicationContext applicationContext)
        {
            //On application starting event...
            //Add to the ContentFinder resolver collection our custom 404 Content Finder resolver
            ContentLastChanceFinderResolver.Current.SetFinder(new _404iLastChanceFinder());
        }
```

There are other use cases for IContentFinders and Lee K has a great little example he posted to Gist:

<hmd-gist class="hmd-gist" gist="leekelleher/5966488" label="Example of Umbraco 6.1's IContentFinder, by Lee Kelleher">
  <a class="hmd-gist__fallback" href="https://gist.github.com/leekelleher/5966488">View the gist on GitHub ↗</a>
</hmd-gist>
