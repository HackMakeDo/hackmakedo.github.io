---
title: "How I built my first property editor for Umbraco Belle"
date: 2013-08-23
topics: ["javascript", "tutorials"]
excerpt: "After recently building my first AngularJS project, Diagnostics for Umbraco so I can learn the framework as Umbraco Belle is built with Angular."
draft: false
---

After recently building my first AngularJS project, Diagnostics for Umbraco so I can learn the framework as Umbraco Belle is built with Angular.

So my next step was to learn how to build an Umbraco property editor for Belle, before [me and my colleagues at The CogWorks along with lead Belle developer Per Ploug to host a Belle hands on workshop](https://web.archive.org/web/20130909081001/http://umbraco-belle-workshop-es2.eventbrite.co.uk:80/).

Currently [Per has written a fantastic tutorial for creating your first property editor in where you create a markdown property editor which is a great tutorial](http://umbraco.github.io/Belle/#/tutorials/CreatingAPropertyEditor) that I followed.

But for me to ensure I learnt the skills properly then I decided to create my first property editor by myself.

If you remember when [I was working at the HQ I wrote a blog tutorial on creating a property editor which was a RGBA colour picker](https://web.archive.org/web/20130214013557/http://umbraco.com/follow-us/blog-archive/2012/1/26/creating-my-first-v5-package.aspx). In this tutorial I will be recreating the same property editor for Belle.

So first thing first is to create a folder called **RGBAEditor in App_Plugins** in an **Umbraco Belle installation**. This is where we store the HTML, JS and package manifest file for our property editor.

```javascript
{
    propertyEditors: [      
        {
            id: "B2FE9CFE-50FC-42A5-9DFE-35DE84953C67",
            name: "(CWS) RGBA Colour Picker",
            editor: {
                view: "~/App_Plugins/RGBAEditor/rgba-editor.html"
            }
        }
    ]
    ,
    javascript: [
        '~/App_Plugins/RGBAEditor/rgba.controller.js'
    ]
}
```

In this JSON, we give our property a unique GUID, a friendly name for our property editor so we can choose it from the back office and then we define the HTML Angular JS view for our property editor in this case it's **rgba-editor.html** and finally we define our Javascript we need to load for this property editor which in this case is our AngularJS controller file - **rgba.controller.js**

Next we need to our HTML for our property editor, in this case it will contain three sliders and an element to show a live preview of the RGBA colour. So in rgba-editor.html file we need the following.

```html
<div ng-controller="CWS.RGBAController">

    <div class="row">
        <!-- SLIDERS -->
        <div class="sliders span8">
            <!-- RED -->
            <div class="control-group">
                 <label class="control-label" for="rgba-red">Red</label>
                <div class="controls">
                     <input type="text" name="rgba-red" ng-model="renderModel.red" class="slider red" data-slider-min="0" data-slider-max="255" data-slider-step="1" data-slider-value="255" data-slider-orientation="horizontal" data-slider-selection="after" data-slider-tooltip="show"/>
                </div>
            </div>

            <!-- GREEN -->
            <div class="control-group">
                 <label class="control-label" for="rgba-green">Green</label>
                <div class="controls">
                     <input type="text" name="rgba-green" ng-model="renderModel.green" class="slider green" data-slider-min="0" data-slider-max="255" data-slider-step="1" data-slider-value="0" data-slider-orientation="horizontal" data-slider-selection="after" data-slider-tooltip="show"/>
                </div>
            </div>

            <!-- BLUE -->
            <div class="control-group">
                 <label class="control-label" for="rgba-blue">Blue</label>
                <div class="controls">
                     <input type="text" name="rgba-blue" ng-model="renderModel.blue" class="slider blue" data-slider-min="0" data-slider-max="255" data-slider-step="1" data-slider-value="0" data-slider-orientation="horizontal" data-slider-selection="after" data-slider-tooltip="show"/>
                </div>
            </div>

            <!-- ALPHA -->
            <div class="control-group">
                 <label class="control-label" for="rgba-alpha">Alpha (%)</label>
                <div class="controls">
                     <input type="text" name="rgba-alpha" ng-model="renderModel.alpha" class="slider alpha" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="100" data-slider-orientation="horizontal" data-slider-selection="after" data-slider-tooltip="show"/>
                </div>
            </div>
        </div>

        <!-- PREVIEW -->
        <div class="preview span4">
            <!-- This will show a live preview of the RGBA colour based on jQuery UI sliders below -->
            <div id="rgba-preview-{{model.alias }}"><span ng-style="{background: preview}"></span></div>
            {{ renderModel.red }} {{ renderModel.green }} {{ renderModel.blue }} {{ renderModel.alpha }}
        </div>
    </div>

    <hr/>

    <h6>Debug JSON</h6>
    {{ model | json }}

</div>
```

In this HTML I am using the Bootstrap CSS styles to help create a simple layout as Belle uses Twitter Bootstrap for it's styling. The ng-controller attribute on the opening div is used to map our AngularJS controller to our view. We then have lots of data attributes on our inputs, this is because we are using a jQuery plugin for Bootstrap styled sliders that require these attributes to be present on the text input field.

The slider plugin that I am using for this is the [Eyecon.ro Bootstrap Slider](https://web.archive.org/web/20131105105029/http://www.eyecon.ro/bootstrap-slider/). In addition in this view you will see we use some custom properties that we store on the scope such as red, green, blue etc so that when the slider is updated our AngularJS controller knows about it and finally we use the ng-style attribute to update the CSS background property on the element from the concatenated value of preview stored on our scope in our controller.

Lets now move onto our JS controller to see the final piece of the puzzle.

```javascript
angular.module("umbraco").controller("CWS.RGBAController", function ($scope, $log, assetsService) {

    //tell the assetsService to load the bootstrap slider
    //libs from the plugin folder
    assetsService
        .loadJs("/app_plugins/RGBAEditor/lib/bootstrap-slider/bootstrap-slider.js")
        .then(function () {

            //Initiate sliders
            $('.slider').slider();

            //Update the preview DIV function...
            var RGBChange = function () {
                //Log...
                $log.log("Fired RGBCHange()");

                $scope.$apply(function () {
                    //Divide by 100 to get decimal needed for RGBA css
                    var alpha = a.getValue() / 100;

                    //Store the value as a CSV
                    $scope.model.value = [r.getValue(), g.getValue(), b.getValue(), alpha].join();

                    //Set the preview value, so we can update the view
                    $scope.preview = 'rgba(' + $scope.model.value + ')';
                });
            };

            //Slider values stored in data object
            var r = $('.red').slider().on('slideStop', RGBChange).data('slider');
            var g = $('.green').slider().on('slideStop', RGBChange).data('slider');
            var b = $('.blue').slider().on('slideStop', RGBChange).data('slider');
            var a = $('.alpha').slider().on('slideStop', RGBChange).data('slider');

            //this will be comma delimited 'r,g,b,a'
            if ($scope.model.value && (typeof $scope.model.value === "string")) {
                var splitVals = $scope.model.value.split(",");

                //Get values from split and set the sliders
                r.setValue(splitVals[0].trim());
                g.setValue(splitVals[1].trim());
                b.setValue(splitVals[2].trim());

                //Alpha convert back to full %
                var alphaConvert = splitVals[3].trim() * 100;
                a.setValue(alphaConvert);

                //set the preview background value
                $scope.preview = 'rgba(' + $scope.model.value + ')';
            }
        });

    //load the seperate css for the editor to avoid it blocking our js loading
    assetsService.loadCss("/app_plugins/RGBAEditor/lib/CWS-rgba.css");
    assetsService.loadCss("/app_plugins/RGBAEditor/lib/bootstrap-slider/slider.css");

});
```

The code is heavily commented above and should make sense, but I will go over some key points in it. First we define our controller **CWS.RGBAController** which is the same as the **ng-controller attribute** in our view. Next key point is the assetsService which the Umbraco guys have made that allows us to load in external Javascript dependencies. In this case I am loading in the Eyecon.ro Bootstrap Slider library so that I can use it. Once it's loaded we can work with it inside the **.then** function.

In here we initiate our sliders and then have a function for every time one of the sliders is updated we update our scope values, the most important being **$scope.model.value** as this is what will be saved back into Umbraco when the user clicks save on the document and in addition we update the preview as well on the scope so that we can allow the colour preview to be updated in the HTML view. We store the RGBA value in Umbraco as a CSV string r,g,b,a.

The final part to this is to get the values when the property editor is initially loaded and set the sliders to those values. Which we will need to do for when we come back to the node when the values have been saved by doing a simple split of the values and then setting the sliders back to those values from the CSV string stored in Umbraco.

It's as easy as that to create a property editor for Umbraco Belle, no Visual Studio needed. No compiling down to DLLs and writing C# code. This is so easy to do that your front-end developer can start writing property editors for Umbraco. Which is fantastic news :)

Here's to a bright and happy future with Umbraco Belle.
