---
title: "Diagnostics for Umbraco"
date: 2013-08-20
topics: ["javascript", "umbraco-packages", "umbraco"]
excerpt: "Diagnostics, a package for Umbraco 6.1 and newer that shows your site's version, database, server, assemblies, packages and users in one place."
draft: false
---

Well after a short weeks holiday I have come back and released a new must have package for any Umbraco 6.1 site or newer. This handy little package is called Diagnostics and it does exactly what it says on the tin. It shows you diagnostical information about your Umbraco install.

## Features

This package was a bit of an experiment for me in order to learn how to write an AngularJS application. So later on this post I will cover some of the basics of what I wrote and show you some parts of the code.

- Umbraco Version, assembly & release notes
- Database type & connection string
- Server information, ASP.NET version etc...
- Assemblies along with MD5 & SHA1 Checksums
- List the packages installed
- List the Umbraco backoffice users
- List the domains in use for the site
- List all the folders and their current permissions applied to them
- List all the Umbraco events and what is attached to those events
- List the MVC Routes used in the site
- List all the Trees used within the Umbraco backoffice

## Let's see it in action

Please note this video is ever so slightly out of date and the UI has been given a little bit love rather than messy UL list's

<https://web.archive.org/web/20130915223028/http://www.screenr.com:80/0iRH>

## Download it

You can [download the Diagnostics package from the Our Umbraco project page](https://web.archive.org/web/20130823015735/http://our.umbraco.org:80/projects/developer-tools/diagnostics) and [the source code is publicly available on GitHub where you can view the source](https://github.com/warrenbuckley/Umbraco-Diagnostics) and [log any issues along with any feature requests](https://github.com/warrenbuckley/Umbraco-Diagnostics/issues).

## Show me the code!

OK so this was my first experiment into the world of AngularJS and I wanted to build a small app using it, as the new Umbraco user interface is getting overhauled in version 7 aka Belle and will be using AngularJS as well. So any head start on this would be highly beneficial.

Firstly I looked at many videos and resources before diving in. But the video I highly recommend you watch is this one from Dan Wahlin 
<hmd-video class="hmd-video" provider="youtube" video-id="i9MHigUZKEM" label="AngularJS Fundamentals In 60-ish Minutes, Dan Wahlin">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=i9MHigUZKEM">Watch on YouTube ↗</a>
</hmd-video>

Now you have watched that I can go over some parts of the code.

First let's start with the index.html page found in /App_Plugins/Diagnostics.

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Umbraco Diagnostics</title>

    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.0-rc1/css/bootstrap.min.css">
</head>
<body ng-app="umbracoDiagnosticsApp">
    
    <h1>Diagnostics</h1>
    <!-- Nav -->
    <ul class="nav nav-tabs">
        <li ng-class="{active: locationUrl == '/'}">
            <a href="#/">General</a>
        </li>
        <li ng-class="{active: locationUrl == '/packages'}">
            <a href="#/packages">Packages</a>
        </li>
        <li ng-class="{active: locationUrl == '/users'}">
            <a href="#/users">Users</a>
        </li>
        <li ng-class="{active: locationUrl == '/domains'}">
            <a href="#/domains">Domains</a>
        </li>
        <li ng-class="{active: locationUrl == '/assemblies'}">
            <a href="#/assemblies">Assemblies</a>
        </li>
        <li ng-class="{active: locationUrl == '/permissions'}">
            <a href="#/permissions">Permissions</a>
        </li>
        <li ng-class="{active: locationUrl == '/events'}">
            <a href="#/events">Events</a>
        </li>
        <li ng-class="{active: locationUrl == '/routes'}">
            <a href="#/routes">MVC Routes</a>
        </li>
        <li ng-class="{active: locationUrl == '/trees'}">
            <a href="#/trees">Trees</a>
        </li>
    </ul>

    <!-- Placeholder for views -->
    <div ng-view=""></div>
    
    <!-- JS -->
    <script type="text/javascript" src="scripts/angular1.0.7.min.js"></script>
    <script type="text/javascript" src="scripts/app.js"></script>

    <!-- Latest compiled and minified JavaScript -->
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.0-rc1/js/bootstrap.min.js"></script>
</body>
</html>
```

The things to note is the ng-app attribute on the body tag, the ng-class attributes on the LI elements and the ng-view on the div.

I will cover what these items do a bit later on.

Next we need to take a look at the app.js file in **/App_plugins/Diagnositcs/scritps/app.js**

```javascript
var umbracoDiagnosticsApp = angular.module('umbracoDiagnosticsApp', []);

umbracoDiagnosticsApp.config(function($routeProvider) {
    $routeProvider
        .when('/',
            {
                controller: 'GeneralController',
                templateUrl: 'partials/general.html'
            })
        .when('/packages',
            {
                controller: 'PackagesController',
                templateUrl: 'partials/packages.html'
            })        
        .otherwise({ redirectTo: '/' });
});


/*
=====================================
CONTROLLERS
=====================================
*/

//General Controller
umbracoDiagnosticsApp.controller('GeneralController', function ($scope, $http, $rootScope, $location) {
    $http.get('/Umbraco/Api/DiagnosticsApi/GetVersion').success(function (data) {
        $scope.version = data;
    });

    $http.get('/Umbraco/Api/DiagnosticsApi/GetVersionAssembly').success(function (data) {
        $scope.assembly = data;
    });
    
    $http.get('/Umbraco/Api/DiagnosticsApi/GetVersionComment').success(function (data) {
        $scope.comment = data;
    });
    
    $http.get('/Umbraco/Api/DiagnosticsApi/GetServerInfo').success(function (data) {
        $scope.server = data;
    });
    
    $http.get('/Umbraco/Api/DiagnosticsApi/GetDBInfo').success(function (data) {
        $scope.db = data;
    });
    
    //Pass location url value into an item on our scope object
    $rootScope.locationUrl = $location.$$url;
});

//Packages Controller
umbracoDiagnosticsApp.controller('PackagesController', function ($scope, $http, $rootScope, $location) {
    $http.get('/Umbraco/Api/DiagnosticsApi/GetPackages').success(function (data) {
        $scope.packages = data;
    });
    
    //Pass location url value into an item on our scope object
    $rootScope.locationUrl = $location.$$url;
});
```

The very first line in this app.js defines our AngularJS module and in this case it's called **umbracoDiagnosticsApp** and this needs to be in the ng-app attribute in the HTML document as shown above.

The next part of this file is to wire up the URL routes, so when the link/URL changes we can load in a different view and controller into our div with the attribute of ng-view.

So when we click on the different tabs such as Packages, it loads the URL #/packages and then maps the view /partials/packages.html and to use the packages controller.

In this controller for packages we do a HTTP WebAPI call to **/Umbraco/Api/DiagnosticsApi/GetPackages** fetch some JSON and then we store the results of the JSON into an object called **packages** which we then use in our view.

So lets take a look at the partial view for packages to see how we display the package information.

```html
<table class="table table-striped table-hover">
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Version</th>
            <th>Author</th>
            <th>Has Update?</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat="package in packages">
            <td>{{ package.Id }}</td>
            <td>{{ package.Name }}</td>
            <td>{{ package.Version }}</td>
            <td>{{ package.Author }}</td>
            <td>{{ package.HasUpdate }}</td>
        </tr>
    </tbody>
</table>
```

So we use mustache in our partial view to output the properties stored in our packages JSON we received from our WebAPI call and with the ng-repeat attribute we can easily loop over each item in the collection and output the properties stored in the JSON.

So the final piece of the puzzle is to have a WebAPI setup in Umbraco to get our information back as JSON.

```csharp
using umbraco.cms.businesslogic.web;
using Umbraco.Core.Configuration;
using umbraco.interfaces;
using Umbraco.Web.WebApi;
using umbraco.cms.presentation.Trees;
using Package = umbraco.cms.businesslogic.packager.repositories.Package;

namespace CWS.UmbracoDiagnostics.Web.Controllers
{
    public class DiagnosticsAPIController : UmbracoAuthorizedApiController
    {

        public List<PackageInstance> GetPackages()
        {
            var allPackages = new List<PackageInstance>();

            //Get packages
            var packages = InstalledPackage.GetAllInstalledPackages();

            //loop over them
            foreach (var item in packages)
            {
                allPackages.Add(item.Data);
            }

            //Return the list
            return allPackages;
        }        
    }
}
```

So in this WebAPI controller class I inherit from **UmbracoAuthorizedApiController** which only allows these requests to be made to the API if you are logged into the Umbraco backoffice to ensure this information is not publicly available.

So in a nutshell that is all the components that makes up this AngularJS Umbraco Diagnostics application.

Any questions or improvements to this then please let me know.

Thanks,
Warren
