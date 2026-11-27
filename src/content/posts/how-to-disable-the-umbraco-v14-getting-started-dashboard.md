---
title: "How to disable the Umbraco V14 Getting Started Dashboard"
date: 2024-05-28
topics: ["tutorials", "javascript", "bellissima"]
excerpt: "You may not want the 'Getting Started' dashboard cluttering up your client's Umbraco 14+ interface. Here's how to make it vanish!"
draft: false
---

With Umbraco V14 fast approaching its release date, I wanted to share a quick tip with the wider Umbraco community on how you can disable/remove the '**Getting Started**' dashboard from Umbraco that is typically used to push marketing material, such as training or upcoming events. Whilst this is OK for us developers and agencies whilst developing a solution for a client, we typically don't want to show this information and marketing material to the end client that we deliver our solution to.

<figure class="hmd-figure">
  <img src="/images/blog/how-to-disable-the-umbraco-v14-getting-started-dashboard/image-3.png" alt="The Umbraco Content section with the Getting Started dashboard tab and its content circled in red" loading="lazy" />
  <figcaption>A screenshot of a default Umbraco V14 install showing the getting started dashboard built into Umbraco.</figcaption>
</figure>

So with these couple of files placed inside your Umbraco V14 site, you are able to disable and remove this dashboard.

## Bye bye dashboard 👋

First thing we need to do is to create a folder called **App_Plugins** at the root of our Umbraco site files and then in turn create a subdirectory called **Tweaks**.

The first file we need to create is our **package-manifest.json** with the following contents

```javascript
{
    "$schema": "../../umbraco-package-schema.json",
    "name": "Disable Getting Started Dashboard",
    "id": "disable.getting-started-dashboard.package",
    "allowTelemetry": false,
    "version": "1.0.0",
    "extensions": [
        {
            "type": "entryPoint",
            "alias": "disable.getting-started-dashboard.entrypoint",
            "name": "Disable Getting Started Dashboard Entrypoint",
            "js": "/App_Plugins/Tweaks/disable.getting-started-dashboard.js"
        }
    ]
}
```

With this package manifest file we are then instructing Umbraco to use a Javascript file as an entrypoint, where we will write our code to find the registered dashboard and then remove it.

So let's create our JavaScript file called **disable.getting-started-dashboard.js** inside the **App_Plugins/Tweaks/** folder. With this Javascript file we can then use it to remove the dashboard using the **extensionRegistry** methods **isRegistered **to check if it has been registered already and exists and if so we can then use the method **unregister** to remove it.

```javascript
export const onInit = (_host, extensionRegistry) => {
    if(extensionRegistry.isRegistered('Umb.Dashboard.UmbracoNews')){
        console.log('Remove the welcome/marketing dashboard from Umbraco backoffice');
        extensionRegistry.unregister('Umb.Dashboard.UmbracoNews');
    }
};
```

## Tada it's disappeared

And with that simple bit of magic, our party to trick to remove the marketing focused dashboard is complete.

<figure class="hmd-figure">
  <img src="/images/blog/how-to-disable-the-umbraco-v14-getting-started-dashboard/image-7.png" alt="The Umbraco Content section showing the Redirect URL Management dashboard instead, after the Getting Started dashboard is removed" loading="lazy" />
  <figcaption>A screenshot of Umbraco V14 after our code is applied to show the &#x27;Getting Started&#x27; dashaboard has been removed.</figcaption>
</figure>

So go forth and reuse this in your own solutions if you need to, or be inspired on how you can remove other extensions registered by Umbraco or other packages.

## Update

On LinkedIn I received a helpful and friendly comment from Jacob one of the developers working on the new WebComponent based backoffice who said this:

![Jacob Overgaard: Great tip, Warren. You may want to run the "exclude" function instead of "unregister" since you technically don't know if the system dashboard has been registered yet (or will be in the future). Exclude puts in a persistent filter and you don't need to check if the dashboard has already been registered](/images/blog/how-to-disable-the-umbraco-v14-getting-started-dashboard/image-8.png)

So let's update our small piece of JavaScript to do exactly that:

```javascript
export const onInit = (_host, extensionRegistry) => {
    console.log('Remove the welcome/marketing dashboard from Umbraco backoffice');
    extensionRegistry.exclude('Umb.Dashboard.UmbracoNews');
};
```

Thanks Jacob for the tip !
