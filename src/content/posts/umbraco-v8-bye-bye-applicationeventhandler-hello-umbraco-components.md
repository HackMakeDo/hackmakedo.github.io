---
title: "Umbraco V8 - Bye bye ApplicationEventHandler, Hello Umbraco Components!"
date: 2018-06-15
topics: ["tutorials", "umbraco"]
excerpt: "Umbraco 8 replaces ApplicationEventHandler with components: the same event handler written both ways, why it changed and what the new approach gives you."
draft: false
---

Hello all,
OK I wanted to get the ball rolling on trying to get some bits on Umbraco V8 out into the wild and for the tinkerers, hackers and early adopters to play & experiment.

So here is something NEW in Umbraco V8 that you most likely will be using a lot. If you ever used one of Umbraco Services event handlers such as ContentService.Saved or similar, then you would most likely [set this up using a class that inherits ApplicationEventHandler](https://web.archive.org/web/20160529181458/https://our.umbraco.org/Documentation/Reference/Events/application-startup).

## Show me an example!

I will show a brief example of the old approach using ApplicationEventHandler and then doing the exact same with a shiny new Umbraco Component approach.

### Old approach - ApplicationEventHandler

```csharp
using Umbraco.Core;
using Umbraco.Core.Events;
using Umbraco.Core.Logging;
using Umbraco.Core.Models;
using Umbraco.Core.Services;

namespace MyProject.EventHandlers
{
    public class RegisterEvents : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            //Listen for when content is being saved
            ContentService.Saving += ContentService_Saving;     
        }
        
        /// <summary>
        /// Listen for when content is being saved, check if it is a new item and fill in some
        /// default data.
        /// </summary>
        private void ContentService_Saving(IContentService sender, SaveEventArgs e)
        {                
            foreach (var content in e.SavedEntities
                //Check if the content item type has a specific alias
                .Where(c => c.Alias.InvariantEquals("MyContentType"))
                //Check if it is a new item
                .Where(c => c.IsNewEntity()))
            {
                //check if the item has a property called 'richText'
                if (content.HasProperty("richText"))
                {
                    //get the rich text value
                    var val = c.GetValue("richText");
                    
                    //if there is a rich text value, set a default value in a 
                    // field called 'excerpt' that is the first
                    // 200 characters of the rich text value
                    c.SetValue("excerpt", val == null
                        ? string.Empty 
                        : string.Join("", val.StripHtml().StripNewLines().Take(200)));
                }
            }
        }
    }
}
```

### New approach - Umbraco Components

```csharp
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Components;
using Umbraco.Core.Events;
using Umbraco.Core.Models;
using Umbraco.Core.Services;
using Umbraco.Core.Services.Implement;

namespace MyProject.Components
{
    /// <summary>
    /// All IUmbracoUserComponents run after all IUmbracoCoreComponent have run
    /// This way we can ensure Umbraco is all setup and stuff is available for us to use
    /// </summary>
    public class ExampleComponent : UmbracoComponentBase, IUmbracoUserComponent
    {
        public void Initialize()
        {
            ContentService.Saving += ContentService_Saving;
        }

        /// <summary>
        /// Listen for when content is being saved, check if it is a 
        /// new item and fill in some default data.
        /// </summary>
        private void ContentService_Saving(IContentService sender, SaveEventArgs e)
        {
            foreach (var content in e.SavedEntities
                //Check if the content item type has a specific alias
                .Where(c => c.ContentType.Alias.InvariantEquals("MyContentType"))
                //Check if it is a new item
                .Where(c => c.IsNewEntity()))
            {
                //check if the item has a property called 'richText'
                if (content.HasProperty("richText"))
                {
                    //get the rich text value
                    var val = content.GetValue("richText");

                    //if there is a rich text value, set a default value in a 
                    // field called 'excerpt' that is the first
                    // 200 characters of the rich text value
                    content.SetValue("excerpt", val == null
                        ? string.Empty
                        : string.Join("", val.StripHtml().StripNewLines().Take(200)));
                }
            }
        }
    }
}
```

You can see very little has changed to the code, where we inherit from **UmbracoComponentBase** and **IUmbracoUserComponentinstead** instead of ApplicationEventHandler.

## Why has it changed?

I will try my best to explain this, after I chatted with the brains behind it aka Stephan. This is mostly to help with the future and to avoid some confusion.

> because app event handler means... "**handles events**" and although it's true, it's misleading. a component is a part of the whole app, so you add components to "**compose**" your ideal application - your component can handle events if they want - it's just a more general notion

## What benefits does it have over the old approach?

Again after a quick chat with Stephan on trying to get to know the in's & out's of how this works.

> For ex when you wanted to change how things where composed (register a new finder etc) you would have to remember to do it in the proper "event" - and people were always confused - now there's the **Compose**method explicitly for this usage - same for **Initialize**, more explicit + manages dependencies & injection
>
> Also components can depend on each other and this ensures they run one after another, whereas ApplicationEventHandlers were in random order and are easy to enable/disable components, which could not be done with app handlers.
>
> oh and components also **terminate** meaning they are notified when Umbraco stops

So an example that Stephan explained to me could be

> so you create a component, and in **Compose ** you tell Umbraco that it should use **MyCache **as a content cache. In **Initialize** you load your cache from wherever you want. In **Terminate** you flush changes to disk.

## Further Examples

Here is an example of a component registering my own custom LastChanceFinder

```csharp
using Umbraco.Core.Components;

namespace MyProject.Components
{
    /// <summary>
    /// All IUmbracoUserComponents run after all IUmbracoCoreComponent have run
    /// This way we can ensure Umbraco is all setup and stuff is available for us to use
    /// </summary>
    public class MyLastChanceFinderComponent : UmbracoComponentBase, IUmbracoUserComponent
    {
        public override void Compose(Composition composition)
        {
            base.Compose(composition);
            composition.SetContentLastChanceFinder();
        }
    }
}
```

So that's it for now and I will share more insights into Umbraco V8 when I can or that I know that code for a piece of functionality is unlikely to change after checking with the brains of the project aka Stephan or Shannon :)

[Thanks again Stephan](https://twitter.com/zpqrtbnk) for the 101 questions I have had on this!

Until next time, happy hacking & exploring !
