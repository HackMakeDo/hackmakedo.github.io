---
title: "Umbraco 7 - Creating a generic Settings editor with WebAPI & AngularJS"
date: 2013-12-12
topics: ["javascript", "tutorials", "dotnet"]
excerpt: "Build a generic settings editor for an Umbraco 7 custom section with WebAPI and AngularJS: new keys in an XML config file appear for editing automatically."
draft: false
---

Hello all,
So my adventure for creating a new Umbraco 7 package for viewing Google Analytics information. I have created a generic way to edit settings from an XML file for this new Analytic section inside Umbraco.

So if I add any new elements to my XML config file, they will automatically appear in the Umbraco backoffice for it to be edited.

So I will run you through the parts such as the WebAPI Controller, and Angular to wire this all up nicely.

Firstly here is the XML config file I want to edit & if I add any new nodes it will automatically show in Umbraco to be edited:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<Analytics>
  <ClientId label="Client ID" description="This is the Client ID key from the Google API">1234567</ClientId>
  <Username label="Username" description="The username for the Google account">warren</Username>
</Analytics>
```

So let's take a look at the WebAPI controller I created to Get & Post the settings to and from the xml.config file.

```csharp
using System.Collections.Generic;
using System.Linq;
using System.Web.Hosting;
using System.Xml;
using Analytics.Models;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace Analytics.Controllers
{
    /// <summary>
    /// Web API Controller for Fetching & Saving values from settings.config file
    /// 
    /// Example route URL to API
    /// http://localhost:62315/umbraco/Analytics/SettingsApi/GetSettings
    /// </summary>
    [PluginController("Analytics")]
    public class SettingsApiController : UmbracoAuthorizedApiController
    {
        /// <summary>
        /// Does what it says on the tin - the path to the settings.config file
        /// </summary>
        private const string ConfigPath = "~/App_Plugins/Analytics/settings.config";

        /// <summary>
        /// Gets Settings from the XML settings.config
        /// </summary>
        /// <returns>Serializes settings from XML file into a nice list of objects</returns>
        public List<SettingsValue> GetSettings()
        {
            //A list to store our settings
            var settings = new List<SettingsValue>();

            //Path to the settings.config file
            var configPath = HostingEnvironment.MapPath(ConfigPath);

            //Load settings.config XML file
            XmlDocument settingsXml = new XmlDocument();
            settingsXml.Load(configPath);

            //Get all child nodes of <Analytics> node
            XmlNodeList analayticsNode = settingsXml.SelectNodes("//Analytics");

            //Ensure we found the <Analytics> node in the config
            if (analayticsNode != null)
            {
                //Loop over child nodes inside <Analytics> node
                foreach (XmlNode settingNode in analayticsNode)
                {
                    foreach (XmlNode setting in settingNode.ChildNodes)
                    {
                        //Go & populate our model from each item in the XML file
                        var settingToAdd            = new SettingsValue();
                        settingToAdd.Key            = setting.Name;
                        settingToAdd.Label          = setting.Attributes["label"].Value;
                        settingToAdd.Description    = setting.Attributes["description"].Value;
                        settingToAdd.Value          = setting.InnerText;

                        //Add the item to the list
                        settings.Add(settingToAdd);
                    }
                }
            }

            //Return the list
            return settings;
        }

        public List<SettingsValue> PostSettings(List<SettingsValue> settings)
        {
            //Update the XML config file on disk

            //Path to the settings.config file
            var configPath = HostingEnvironment.MapPath(ConfigPath);

            //Load settings.config XML file
            XmlDocument settingsXml = new XmlDocument();
            settingsXml.Load(configPath);

            //Get all child nodes of <Analytics> node
            XmlNodeList analayticsNode = settingsXml.SelectNodes("//Analytics");

            //Loop over child nodes inside <Analytics> node
            foreach (XmlNode settingNode in analayticsNode)
            {
                foreach (XmlNode setting in settingNode.ChildNodes)
                {
                    //Go & populate our model from each item in the XML file
                    setting.InnerText = settings.SingleOrDefault(x => x.Key == setting.Name).Value;
                }
            }

            //Save the XML file back down to disk
            settingsXml.Save(configPath);

            //Return the same settings that passed in
            return settings;
        }
    }
}
```

You can see the controller is nicely commented and should be easy to follow along in what it is doing, you will notice I have a custom model/object to store the list of items so it can be serialised easily to JSON for the GET & POST requests. The model is as follows:

```csharp
namespace Analytics.Models
{
    public class SettingsValue
    {
        public string Key { get; set; }

        public string Label { get; set; }

        public string Description { get; set; }

        public string Value { get; set; }
    }
}
```

So with these parts in place we have a way with a WebAPI to fetch & post values to our XML config file. Next we need to create an Angular View, Angular Controller & Angular Resource file to consume this WebAPI.

```html
<div ng-controller="Analytics.SettingsController">
    <div class="umb-pane">
        <umb-control-group ng-repeat="setting in settings" label="{{ setting.Label }}" description="{{ setting.Description }}">
            <input type="text" name="{{ setting.Key }}" id="{{ setting.Key }}" value="{{ setting.Value }}" ng-model="setting.Value" />
        </umb-control-group>

        <div class="umb-tab-buttons">
            <div class="btn-group">
                <button ng-click="save(settings)" data-hotkey="ctrl+s" class="btn btn-success">
                    <localize key="buttons_save">Save</localize>
                </button>
            </div>
        </div>

    </div>
</div>
```

This Angular HTML view loops over the settings JSON object and repeats the markup & input field for each setting to edit within the XML file with the ng-repeat Angular data attribute.

The next part is to look at the Angular Controller file that is wired up to this view.

```javascript
angular.module("umbraco").controller("Analytics.SettingsController",

function($scope, settingsResource, notificationsService) {

    //Get all settings via settingsResource - does WebAPI GET call
    settingsResource.getall().then(function(response) {
        $scope.settings = response.data;
    });

    //Save - click...
    $scope.save = function(settings) {

        //Save settings resource - does a WebAPI POST call
        settingsResource.save(settings).then(function(response) {
            $scope.settings = response.data;

            //Display Success message
            notificationsService.success("Success settings have been saved");
        });
    };

});
```

You can see we have created a Resource to get the settings and to save the settings, which the resource file handles the GET & POST to the WebAPI controller. When the save button is clicked it POSTs the settings to the WebAPI controller and shows a nice success message with the notification service.

```javascript
angular.module("umbraco.resources")
    .factory("settingsResource", function($http) {
    return {

        getall: function() {
            return $http.get("Analytics/SettingsApi/GetSettings");
        },

        save: function(settings) {
            return $http.post("Analytics/SettingsApi/PostSettings", angular.toJson(settings));
        }
    };
}); 
```

With all these parts in place we now have a nice generic way of displaying & saving values to an XML config file and allowing easy update to the UI if we decide to add in more settings at a later date.

I hope someone finds this useful & can take something away to learn from it.

Cheers,
Warren :)
