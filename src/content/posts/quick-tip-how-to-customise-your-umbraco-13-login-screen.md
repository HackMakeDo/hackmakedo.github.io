---
title: "Quick Tip: How to customise your Umbraco 13+ login screen"
date: 2023-11-20
topics: ["tutorials"]
excerpt: "Brand the new Umbraco 13 backoffice login screen with your client's own background image and logo, using a few settings in appsettings.json."
heroImage: "/images/blog/quick-tip-how-to-customise-your-umbraco-13-login-screen/umbraco-v13-new-login-screen.png"
draft: false
---

With the new [Umbraco V13 due out soon-ish, December 14th according to the LTS release plan](https://umbraco.com/products/knowledge-center/long-term-support-and-end-of-life/) there is a snazzy new back-office login screen that has been built that you can see below.

<figure class="hmd-figure">
  <img src="/images/blog/quick-tip-how-to-customise-your-umbraco-13-login-screen/umbraco-v13-new-login-screen.png" alt="A screenshot of the new Umbraco V13 modern login screen" loading="lazy" />
  <figcaption>A fresh modern new login screen to the Umbraco CMS application</figcaption>
</figure>

This new login screen for the Umbraco backoffice has been built using WebComponents and the Umbraco UI library, the same technologies which is planned for the rewrite of the entire Umbraco backoffice for V14.

## What can I customise?

So you may be wondering what can you customise of this new Umbraco backoffice login screen. We can replace the main image of a lady typing on a laptop in her bed, along with the logo that overlays the image.

You can see from the screenshot below what we can customise with the pink outlined boxes.

<figure class="hmd-figure">
  <img src="/images/blog/quick-tip-how-to-customise-your-umbraco-13-login-screen/umbraco-v13-new-login-screen-annotated.png" alt="The default Umbraco 13 login screen, with the background image and the Umbraco logo outlined in pink" loading="lazy" />
  <figcaption>The pink outlined boxes show what we can easily customise on the new Umbraco login screen</figcaption>
</figure>



## How do I customise it?

If you need to change or customise the login screen for your client, so the CMS is more branded to their corporate look and feel then you can still do so, like you have done in previous versions of Umbraco.

This is done with configuration settings and can be set with appsettings.json, environment variables or any configuration method you prefer for your .NET applications. But for this example we will use the appsettings.json file that Umbraco ships with.

I have set the three properties under the **Umbraco:CMS:Content** configuration section with paths to the main image and the logo I want to use. I have placed the files I wanted to use for this customisation inside **wwwroot/img** so the files can be served from the application.

```javascript
"Umbraco": {
 "CMS": {
  "Content": {
   "LoginBackgroundImage": "/img/my-brand-photo.jpg",
   "LoginLogoImage": "/img/my-logo.svg",
   "LoginLogoImageAlternative": "/img/my-logo-small.svg"
  },
 }
}
```

<figure class="hmd-figure">
  <img src="/images/blog/quick-tip-how-to-customise-your-umbraco-13-login-screen/umbraco-v13-customised.png" alt="The customised Umbraco 13 login screen, with an illustration of unicorns working at a laptop in place of the default image and logo" loading="lazy" />
  <figcaption>A customised V13+ Umbraco login screen for Coding Unicorns</figcaption>
</figure>

That's it, it really was a quick tip on customising the new Umbraco login screen, be it if you prefer to change it to a photo of the Umbraco community, a different stock photo or something to match the brand, you now know how to do it 🥰

## Update

After speaking with Jacob the lead of Umbraco HQ Frontend Development team, we chatted and disucss a couple of pain points and how this could be improved.

**Code Changes PR**  
[https://github.com/umbraco/Umbraco-CMS/pull/15285](https://github.com/umbraco/Umbraco-CMS/pull/15285)  
  
**Docs Related PR**  
[https://github.com/umbraco/UmbracoDocs/pull/5650](https://github.com/umbraco/UmbracoDocs/pull/5650)

I am glad to say that Jacob took on the feedback and has improved the customisation of the login screen, by allowing a custom CSS file to be loaded in and then allow further control of how this looks.

### More CSS Control

It is now possible with the latest changes made by Jacob to add a CSS file to customise the look and feel further with your own CSS styling. To do this you can add a CSS file into a Package folder such as **/App_Plugins/MyLoginScreen/styles.css** and you will then need to add a **package.manifest** file to register the CSS placed at **/App_Plugins/MyLoginScreen/package.manifest**

```javascript
{
  "css": [
    "~/App_Plugins/MyLoginScreen/styles.css"
  ],
  "bundleOptions": "None"
}
```

With this we are able to use some of the CSS variables that this login WebComponent exposes and can control hiding the pink curved SVG shape over the image and various other parts of the design and layout.

```css
:root {
  // Hide the SVG shaped curves
  --umb-login-curves-display: none;

  // Set the color and transparency of the SVG shape
  --umb-login-curves-color: rgba(0, 0, 0, 0.4); 
}
```

The [full list of CSS properties is available in the documentation](https://docs.umbraco.com/umbraco-cms/v/13.latest-lts/fundamentals/backoffice/login#custom-css-properties-reference).

Here is an example that tries to make the login screen look like previous versions

```css
umb-auth {
        --umb-login-image-display: none;
        --umb-login-content-display: flex;
        --umb-login-content-width: 500px;
        --umb-login-content-background: rgba(255, 255, 255, 0.95);
        --umb-login-content-height: fit-content;
        --umb-login-align-items: center;
        --umb-login-background: url(https://raw.githubusercontent.com/umbraco/Umbraco-CMS/release-10.7.0/src/Umbraco.Web.UI.Client/src/assets/img/login.jpg) no-repeat center center/cover;
}
```

### Add the quirky days of the week greetings back

The language keys still can be loaded for a more personalised message for every day of the week, but Umbraco will ship the same login message. To customise this you can add [Umbraco language files](https://docs.umbraco.com/umbraco-cms/fundamentals/backoffice/login#greeting) . This needs to be a file at **/config/lang/en_us.user.xml** and add the following keys to have the quirky days of the weeks greetings back or alternatively change them to suit your own needs.

*Note: You can not override these values shipped from Umbraco core by creating a language XML file in App_Plugins package folder.*

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<language alias="en_us" intName="English (US)" localName="English (US)" lcid="" culture="en-US">
  <creator>
    <name>The Umbraco community</name>
    <link>https://docs.umbraco.com/umbraco-cms/extending/language-files</link>
  </creator>
  <area alias="login">
    <key alias="greeting0">Happy super Sunday</key>
    <key alias="greeting1">Happy marvelous Monday</key>
    <key alias="greeting2">Happy tubular Tuesday</key>
    <key alias="greeting3">Happy wonderful Wednesday</key>
    <key alias="greeting4">Happy thunderous Thursday</key>
    <key alias="greeting5">Happy funky Friday</key>
    <key alias="greeting6">Happy Caturday</key>
  </area>
</language>
```
