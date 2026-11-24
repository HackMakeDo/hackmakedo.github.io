---
title: "How to Overwrite the Save & Publish button and more in Umbraco V14"
date: 2024-07-12
topics: ["tutorials", "bellissima"]
excerpt: "Overwrite the Save and Publish button in the Umbraco 14+ backoffice with your own workspace action, in this example one that plays a sound and shows confetti."
draft: false
---

With Umbraco V14+ and the new updated WebComponent based extensible backoffice, we have the power and flexibility to override and swap out existing functionality with our own.

For this example I will show how we can update the Save and Publish button on a content node with own implementation. For this we will replace the button so that when the user clicks the save and publish button that it will play a sound display some confetti 🎊

## Here is what we are building

<hmd-video class="hmd-video" video-id="Y6pHPU8NxpU">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=Y6pHPU8NxpU">Watch on YouTube ↗</a>
</hmd-video>

## Just show me the code

### Manifest

```javascript
import { UMB_ENTITY_IS_NOT_TRASHED_CONDITION_ALIAS } from '@umbraco-cms/backoffice/recycle-bin';
import type { ManifestWorkspaceActions } from '@umbraco-cms/backoffice/extension-registry';

export const manifests: Array<ManifestWorkspaceActions> = [
	{
		type: 'workspaceAction',
        kind: 'default',
        overwrites: 'Umb.WorkspaceAction.Document.SaveAndPublish', // Alias of thing you want to overwrite
        alias: 'Tada.WorkspaceAction.Document.SaveAndPublish',
        name: '[Tada] SaManifestve And Publish Document Workspace Action',
        api: () => import('./tada.save-and-publish.action.js'), // Our implementation
        weight: 70,
        meta: {
            look: 'primary',
            color: 'positive',
            label: 'Awesome Save & Publish' // Update the text of the button
        },
        conditions: [
            {
                alias: 'Umb.Condition.WorkspaceAlias',
                match: 'Umb.Workspace.Document',  // Only show for Document workspace
            },
            {
                alias: UMB_ENTITY_IS_NOT_TRASHED_CONDITION_ALIAS, // Ensure the item is not in trash
            },
        ]
	},	
];
```

#### Workspace Action

```javascript
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/document';
import { UmbWorkspaceActionBase } from '@umbraco-cms/backoffice/workspace';
import { launchConfetti } from '../Confetti';

export default class TadaDocumentSaveAndPublishWorkspaceAction extends UmbWorkspaceActionBase {

    async execute() {
        try {
             // Get the workspace context
            const workspaceContext = await this.getContext(UMB_DOCUMENT_WORKSPACE_CONTEXT);

            // Load in drumroll
            const audio = new Audio('https://hackmakedo.com/audio/drumroll.mp3');

            // Define a flag to ensure the specific code runs only once
            let codeExecuted = false;

            audio.addEventListener('timeupdate', async () => {
                console.log('Current time:', audio.currentTime);

                // Check if the current time is at least 5 seconds and the specific code hasn't run yet
                if (audio.currentTime >= 1.5 && !codeExecuted) {
                     // Save and publish the document
		            await workspaceContext.saveAndPublish();

                    // Confetti time
                    launchConfetti();
    
                    // Ensure the code doesn't run again
                    // As the timeupdate event is fired lots as sfx  plays
                    codeExecuted = true;
                }
            });

            // Play the drumroll
            audio.play();
        }
        catch (error) {
            console.error('Failed to save and publish document', error);
        }
    }
}
```

> So the key thing to learn here is that by specifying the alias of the extension you want to overwrite as a the overwrites property in the new extension manifest.

### A quick note

Currently there is a small bug/issue with replacing the Save & Publish button as this then removes the child popver menu items such as Unpublish, Schedule Publish etc...

The[ issue has been reported on GitHub](https://github.com/umbraco/Umbraco-CMS/issues/16700) and has been acknowledged as a reproducible bug by Umbraco HQ.

## Want to take a further look

Well if you want to take a look at the source code, you can view the GitHub repository or if you prefer you can install it in your Umbraco site 🎉

[GitHub Repo](https://github.com/warrenbuckley/Tada)
[MarketPlace](https://marketplace.umbraco.com/package/umbraco.community.tada)

### **Go have fun, experiment and see what you can replace**

*Confetti time !* ([GIF ↗](https://giphy.com/embed/s2qXK8wAvkHTO))
