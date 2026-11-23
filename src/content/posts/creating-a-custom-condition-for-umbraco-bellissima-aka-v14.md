---
title: "Creating a custom condition for Umbraco Bellissima aka V14+"
date: 2024-04-09
topics: ["bellissima", "tutorials", "javascript"]
excerpt: "Create a custom condition for Umbraco 14+ backoffice manifests, to control when an extension such as a workspace view appears, with code to build and use it."
draft: false
---

In this blog post I will show you how to create a custom condition for your Umbraco manifests. In this example I will show you how we can create a custom condition to show or hide our workspace view (aka previously known as Content/Context apps in previous versions of Umbraco)

**NOTE**: As Umbraco V14 is under active development this tutorial may be outdated quickly

## The problem

In previous versions of Umbraco up to the current release of V13 we have been able to register dashboards and other UI components for the Backoffice with C# and allowing us to specify custom logic on when these should be loaded and visible to logged in users. With this new evolution of the Backoffice all UI extensions are registered solely in JavaScript, hence we need to use a new extension point, bring in a new extension point called **Conditions**.

## What is a manifest condition?

A manifest condition is code that determines and evaluates custom logic to determine if another manifest extension point of Umbraco V14 should load or not.

Umbraco V14 ships with built in ones such as *(This is not an exhaustive list)*

- **Umb.Condition.SectionAlias**  
Matches against a section alias, allowing you to load other Umbraco extension points only if the current visible/loaded section alias matches
- **Umb.Condition.WorkspaceAlias**  
Similar to the SectionAlias condition above, this checks to see if the current workspace you are viewing matches the alias. For example you could be wanting to load extensions inside the Log Viewer found inside the Settings section by matching with the alias of Umb.Workspace.LogViewer
- **Umb.Condition.SectionUserPermission**  
This condition, checks if the current logged in user is allowed to have access to a section specified as part of the condition.

To see the full list of conditions available to use, you are able to browse to the **Settings** Section and navigate to the **Extensions** tree item to view all loaded extensions. This workspace has a handy filter to select the extension type **Condition**.

### An Example

You can use the **Umb.Condition.SectionAlias** condition above in a manifest for a dashboard to help decide what sections the dashboard is visible in.

```javascript
{
  "name": "My.WelcomePackage",
  "version": "0.1.0",
  "extensions": [
    {
      "type": "dashboard",
      "alias": "my.welcome.dashboard",
      "name": "My Welcome Dashboard",
      "js": "/App_Plugins/welcome-dashboard/dist/welcome-dashboard.js",
      "elementName": "my-welcome-dashboard",
      "weight": -1,
      "meta": {
        "label": "Welcome Dashboard",
        "pathname": "welcome-dashboard"
      },
      "conditions": [
        {
          "alias": "Umb.Condition.SectionAlias",
          "match": "Umb.Section.Content"
        }
      ]
    }
  ]
}
```

## What are we going to build?

Below is a condition that uses the Document Workspace Context, when you are viewing/editing a content node and is observing the value of the **templateId** property.

We use a custom configuration for our condition to have a property called **hasTemplateSet **which is a Boolean to allow the condition to be configured and the logic inversed to check if the current document does or does not have a template set.

For a condition to pass, we need to set the property **permitted** to true, that is coming from **UmbConditionBase** and **UmbExtensionCondition**

## Show me the code

```javascript
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbConditionConfigBase, UmbConditionControllerArguments, UmbExtensionCondition } from "@umbraco-cms/backoffice/extension-api";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT  } from '@umbraco-cms/backoffice/document';
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';

export class TemplateSetCondition extends UmbConditionBase<TemplateSetConditionConfig> implements UmbExtensionCondition
{
    config: TemplateSetConditionConfig;

    constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<TemplateSetConditionConfig>) {
        super(host, args);
        
        this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT , (workspaceCtx) => {

            // Observe the template ID value in the workspace context
            // So that when it changes value we can re-evaluate the condition
            this.observe(workspaceCtx.templateId, (templateId) => {

                // No template set === null
                // Tempate set we get a GUID back

                // Config says it passes if template IS set (aka NOT null)
                if(this.config.hasTemplateSet && templateId !== null) {
                    this.permitted = true;
                    return;
                }

                // Config says it passes if template is NOT set (aka IS null)
                if(this.config.hasTemplateSet === false && templateId === null) {
                    this.permitted = true;
                    return;
                }

                this.permitted = false;
            });
		});
    }
}

export type TemplateSetConditionConfig = UmbConditionConfigBase<'MyThing.Condition.TemplateSet'> & {
    /**
     * HasTemplateSet
	 * Decide if the current document should have a template set or not
	 *
	 * @example
	 * true
	 */
    hasTemplateSet: boolean;
};
```

### Consuming our Condition

Now we have created our condition and registered it with Umbraco, either with an umbraco-package.json or using an entrypoint file and registering the extension with **extensionRegistry.registerMany()**

We need a way to tell our WorkspaceView aka the Content/Context app in our content node to be only visible if it has a template set.

```javascript
import { ManifestWorkspaceView } from "@umbraco-cms/backoffice/extension-registry";
import { TemplateSetConditionConfig } from "../Conditions/mything.condition.templateset.js";

const workspaceView: ManifestWorkspaceView = {
    alias: 'mything.workspaceview',
    name: 'My Thing Workspace View',
    type: 'workspaceView',
    js: () => import('./mything.workspaceview.element.js'),
    weight: 190,
    meta: {
        icon: 'icon-people',
        label: 'My Thing',
        pathname: 'my-thing'
    },
    conditions: [
        {
            alias: 'Umb.Condition.WorkspaceAlias',
            match: 'Umb.Workspace.Document',
        },
        {
            alias: 'MyThing.Condition.TemplateSet',
            hasTemplateSet: true
        } as TemplateSetConditionConfig
    ],
}
export const manifests = [workspaceView];
```

## Summary

I hope this has inspired you to create your own custom conditions for the upcoming Umbraco V14 and help understand how you will add custom logic to show/hide your new Umbraco extension points without the concept of C# to register UI with business logic to control when they show.
