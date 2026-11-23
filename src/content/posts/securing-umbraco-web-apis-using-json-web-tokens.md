---
title: "Securing Umbraco Web APIs using JSON Web Tokens"
date: 2015-01-06
topics: ["dotnet", "umbraco-packages"]
excerpt: "Introducing UmbracoAuthTokens: secure Umbraco Web API controllers with JSON Web Tokens, using the same credentials as backoffice users."
draft: false
---

Hello all,
First off a very happy new year to you all. I hope you had a good time off over the festive period and relaxed.

Over this festive period in between our baby girl arriving during late night feeds and insomnia kicking in, I managed to find a little time to polish off my new pet project for the wonderful Umbraco CMS. So I herby introduce you to UmbracoAuthTokens!

## What is Umbraco Auth Tokens?

Umbraco Auth Tokens is a project that I have built that allows you to secure Umbraco WebAPI Controllers using a token based authentication using JSON Web Tokens aka JWT; pronounced jot. This is ideal for securing WebAPIs that require using a backoffice Umbraco user.

For example you may want to securely from a third party client be it a mobile application or similar create a new page or any other action that a backofficer Umbraco user may do.

## What are JWTs?

They are an auth token that allows you to send a piece of JSON encoded as a token and are the more modern approach to deal with auth in applications especially as we build applications across different devices. The videos below will do a lot better trying to explain it than I can do.

## Why do this?

I needed to create this POC for an upcoming pet project I am currently hacking & building. I needed a way to authenticate to any Umbraco backoffice using the same credentials as the Umbraco backoffice user & ensure they have access to specific section/s on that user. The user will only need to login once and we then store the auth token in local storage or cookies and use that token from storage or cookie for any future secured/protected API calls.

## More Resources on JWTs

### NG Europe talk from Auth0.com guys

<hmd-video class="hmd-video" video-id="lDb_GANDR8U">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=lDb_GANDR8U">Watch on YouTube ↗</a>
</hmd-video>

### Another good talk on JWT

<hmd-video class="hmd-video" video-id="vIGZxeQUUFU">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=vIGZxeQUUFU">Watch on YouTube ↗</a>
</hmd-video>

### Debugger tool

[http://jwt.io](https://www.jwt.io/)

### Single Class File Library & Nuget Package I use for JWT dedcoding
Authored by FireBase, Twilio & others

[http://www.nuget.org/packages/JWT/](https://www.nuget.org/packages/JWT/)
[https://github.com/jwt-dotnet/jwt](https://github.com/jwt-dotnet/jwt) (the project has since moved here from John Sheehan's account)

## Explaining how my implementation works

1. A user will do a HTTP post of their backoffice Umbraco username & password to a normal API Controller

	Controller verifies credentials
2. If a token already exists for the user (matches against user id) in custom PetaPoco DB table
3. If no token exists create a new token for the user & store in the DB table
4. Return existing or newly created token in the response

A user can then store that token say in LocalStorage or Cookie
	User calls secured API sends bearer auth token in HTTP header for request (From LocalStorage or cookie)

1. Server finds token in request
2. Tries to decode the token with secret
3. If token not encoded with same secret Send 401
4. If token can be decoded correctly find user id in JSON
5. Check if user has the same token stored in the DB
6. If so process method on API controller

User changes password in Umbraco backoffice

1. If no token exists in DB - nothing happens
2. If token exists in DB - generate new token with new datetime stamp to make it unique from last time

## Why do you not just store the username & password in the JWT?

The payload of the JSON object in the JWT can be decoded easily, paste in a token into jwt.io and you can see it easily. However the part to do with JWT is that we verify that the AuthToken is using the signed secret/string to ensure our server created the JWT & it's validity.

So in my implementation I only store the username, user ID, user role and Created Date of the token. The date ensures that the token is different every time a new one is generated for easy revoking.

## Do the tokens expire?

My implementation allows the tokens to work indefinitely until the user in the Umbraco backoffice changes their password. Which creates a new token and thus revoking access to the API for any clients or services using it.

However it is easily possible to store an expiry date in the JSON payload of the Auth Token and when decoding it verifying the expiry date on it.

## How to use this

Here are some simple instructions on how to use this to secure an API Controller in your Umbraco website with JWT Auth Tokens.

## Creating your API Controller Class

You will need to implement the following class `UmbracoAuthTokenApiController` similar to how you would use `UmbracoApiController` or `UmbracoAuthorizedApiController`

See the Umbraco Documentation for Umbraco API Controller Reference:
[http://our.umbraco.org/documentation/Reference/WebApi/](https://web.archive.org/web/20150108200319/http://our.umbraco.org:80/documentation/reference/webapi/)
[http://our.umbraco.org/documentation/Reference/WebApi/authorization](https://web.archive.org/web/20150112141932/http://our.umbraco.org:80/documentation/Reference/WebApi/authorization)

Implementing the `UmbracoAuthTokenApiController` in conjuction with the `UmbracoAuthToken`attribute to decorate the API class allows us to access a new property in the Web API controller called `AuthorisedBackofficeUser` which is the authorised Umbraco backoffice user from the JWT token, this can be used with the normal Umbraco Services APIs to Create Content and assign the correct user to the creation of that node.

## Authorising the user & obtaining a JWT token

In this project there is a built in Web API URL route for you to do a HTTP POST with the Username and Password. Your application to gain a JWT token must POST to this URL: [http://yoursite.co.uk/umbraco/TokenAuth/SecureApi/Authorise](http://yoursite.co.uk/umbraco/TokenAuth/SecureApi/Authorise)

## Secured API Controller

The following is a very simple secued Umbraco API controller, obviously your needs and uses will be much better than the very basic example shown here.

The `UmbracoAuthToken` attribute has an optional parameter `HasAccessToSections` which is an string array of Umbraco backoffice section aliases that the attempted backoffice Umbraco user should have access to.

For example this checks the following user has access to the `content` and the `settings` sections, if they do not have access to **both** sections then the WebAPI will return 401 Unauthorised HTTP Error Code.

```csharp
using System;
using System.Web.Http;
using Umbraco.Core.Models;
using Umbraco.Web.Mvc;
using UmbracoAuthTokens.Attributes;
using UmbracoAuthTokens.Controllers;

namespace UmbracoAuthTokens.TestApi
{
    [PluginController("Secured")]
    [UmbracoAuthToken("content", "settings")]
    public class ContentApiController : UmbracoAuthTokenApiController
    {
        /// <summary>
        /// A simple GET that shows the backoffice user's name & email address from the JWT Auth Token
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public string SecurePing()
        {
            return string.Format("Secure Pong from {0} {1}", AuthorisedBackofficeUser.Name, AuthorisedBackofficeUser.Email);
        }


        /// <summary>
        /// Note this is NOT a great example. As you would POST data to create a node.
        /// As opposed to a GET with this hardcoded values
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public IContent CreateNewRootNode()
        {
            var newNodeName = string.Format("New Node {0}", DateTime.Now.ToShortDateString());
            var parentNodeId = -1;
            var contentTypeAlias = "Home";

            return Services.ContentService.CreateContentWithIdentity(newNodeName, parentNodeId, contentTypeAlias, AuthorisedBackofficeUser.Id);
        }
    }
}
```

## Where can I download this?

Currently I have put this only on the NuGet package repository as I personally do not see this making sense as a normal Umbraco package, as it is aimed at Developers and will require some knowledge of CSharp, WebAPI etc...
<https://www.nuget.org/packages/UmbracoAuthTokens/>

```
Install-Package UmbracoAuthTokens
```

In addition to this NuGet package a Symbols NuGet package was uploaded to SymbolSource.org that includes the source files and PDBs which allows you to easily debug and step through the code from your solution if needed. Here is a guide on how to use SymbolSource with VisualStudio <https://web.archive.org/web/20150206074347/http://www.symbolsource.org:80/Public/Wiki/Using>

If you want to take a look at the source this project can be found over on GitHub here: <https://github.com/warrenbuckley/Umbraco-JWT-AuthTokens>
