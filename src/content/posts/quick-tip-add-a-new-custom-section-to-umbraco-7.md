---
title: "Quick Tip: Add a new custom section to Umbraco 7+"
date: 2013-12-10
topics: ["tutorials", "umbraco"]
excerpt: "A quick tip for Umbraco 7: create a custom backoffice section on application startup with the new Section Service, for your own site or a package."
draft: false
---

Hello all,
I have just come across a quick, simple & neat way to add a section to your Umbraco website/application be it for your own use or as a package developer.

So rather than talk about it for ages I will just jump straight into it.

```csharp
    public class UmbracoStartup : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            //Get SectionService
            var sectionService = applicationContext.Services.SectionService;

            //Try & find a section with the alias of "mySection"
            var mySection = sectionService.GetSections().SingleOrDefault(x => x.Alias == "mySection");

            //If we can't find the section - doesn't exist
            if (mySection == null)
            {
                //So let's create it the section
                sectionService.MakeNew("My Section", "mySection ", "icon-users");
            }
        }
    }
```

So what this is doing on an application startup of Umbraco using [the new Section Service](https://web.archive.org/web/20131123215220/http://our.umbraco.org:80/documentation/reference/management-v6/services/SectionService) checking to see if there a section with the alias of **mySection** already created, if not then using the section service it goes and creates it.

That's it, it really is that simple.
Enjoy :)
