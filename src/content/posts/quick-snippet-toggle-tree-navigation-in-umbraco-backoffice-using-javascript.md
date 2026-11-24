---
title: "Quick Snippet: Toggle Tree Navigation in Umbraco Backoffice using JavaScript"
date: 2014-09-17
topics: ["javascript", "umbraco"]
excerpt: "A quick JavaScript snippet that toggles the tree navigation in the Umbraco 7 backoffice with its AngularJS services, to give a property editor more room."
draft: false
---

Hello,
Here is a very quick blog post on how to toggle the tree navigation in the Umbraco 7 (aka Belle) back office using JavaScript with some AngularJS services that the Umbraco core team has given to us to use.

First of all you may be wondering why you would want to toggle the display of the tree navigation, considering that this is the main & primary navigation when using the Umbraco backoffice, however on a project I am doing at work a new property editor that is being developed requires more screen real estate and toggling the tree navigation allows the content editor to see & use this property editor a lot easier, as it involves plotting objects on a canvas. So as much space as possible is useful in this case.

So enough of the why and I will get straight down to the very simple JavaScript code snippet that allows us to do this:

```javascript
angular.module('umbraco').controller('demo.toggler', function($scope, appState, eventsService) {
  //Create an Angular JS controller and inject Umbraco services appState & eventsService

  //Button Click - ToggleUmbracoNavigation
  $scope.toggleUmbracoNavigation = function() {

    //Get the current state of showNavigation
    var currentNavigationState = appState.getGlobalState('showNavigation');

    //console.log("currentNavigationState", currentNavigationState);
    //console.log("Inverse of currentNavigationState", !currentNavigationState);

    //Toggle the tree visibility
    appState.setGlobalState("showNavigation", !currentNavigationState);
  }

  //The eventService allows us to easily listen for any events that the Umbraco applciation fires
  //Let's listen for globalState changes...
  eventsService.on("appState.globalState.changed", function (e, args) {
    //console.log("appState.globalState.changed (args)", args);

    if (args.key === "showNavigation") {
      //console.log("showNavigation value", args.key, args.value);

      //If false (So hiding navigation)
      if(!args.value) {
        //Set css left position to 80px (width of appBar)
        document.getElementById("contentwrapper").style.left = "80px";
      }
      else {
        //Remove the CSS we set so default CSS of Umbraco kicks in
        document.getElementById("contentwrapper").style.left = "";
      }
    }
  });

});
```

Hopefully the JavaScript is commented enough and is easy to follow, but the ensence of this is that we have a button or anchor link in our view with the Angular directive of ng-click applied to it calling out method, i.e ng-click="toggleUmbracoNavigation()" this toggles the value stored in Umbraco's globabl settings in this case these values & settings are stored in an AngularJS service called appState, that allows us to get & set values stored in here. I recommend you [look at the source code on GitHub to see what other values are stored in appState](https://github.com/umbraco/Umbraco-CMS/blob/release-7.2.0/src/Umbraco.Web.UI.Client/src/common/services/appstate.service.js) for you to use in your customisations to the Umbraco back office.

I would be interested to hear what other people think of this and should this tree toggle become part of the core by doing a Pull Request and if was to become part of the main UI, where should the button go or by double clicking the grey area with the application/section icons toggle this action?

Well let me know by leaving your thoughts in the comments.

Thanks,
Warren :)
