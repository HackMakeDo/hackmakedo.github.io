---
title: "Using SignalR, IOptionsMonitor with Umbraco Bellissima for reactive .NET Options"
date: 2025-04-28
topics: ["bellissima", "dotnet", "tutorials"]
excerpt: "Combine IOptionsMonitor with a SignalR hub in an Umbraco 14+ package, so changing a .NET option switches features on or off in the backoffice with no redeploy."
draft: false
relatedWork:
  href: "/work/contentlock/"
  title: "ContentLock"
---

Hello 👋  
I have been working on a community package for Umbraco Bellissima called Content Lock, that allows users to lock content nodes and see who else is logged into the backoffice currently. Some of this work uses SignalR to give realtime updates pushed out to the backoffice UI.

For this I wanted to added some .NET Options to allow users of the package to turn certain features on or off. As I had a SignalR hub already in my package, I wondered if I could combine the use of IOptionsMonitor and a SignalR hub to allow features to be turned on and off easily without requiring a deployment and with a bit of time I have managed to achieve exactly that.

## Lets take a look at it in action

<hmd-video class="hmd-video" video-id="MZfeUKSO8h4">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=MZfeUKSO8h4">Watch on YouTube ↗</a>
</hmd-video>

## Show me the code

Below is the various files and code used to make this happen, hopefully all the various code snippets helps explains how it all glues together, but any questions feel free to hit me up in the comments or message me.

### .NET Options Class

```csharp
namespace ContentLock.Options;

public class ContentLockOptions
{
    public const string ConfigName = "ContentLock";

    /// <summary>
    /// Settings related to the feature of showing the number of online users in the backoffice
    /// </summary>
    public OnlineUsersOptions OnlineUsers { get; set; } = new();

    public class OnlineUsersOptions
    {
        /// <summary>
        /// Enable or disable the online users feature.
        /// This is used to indicate the number of online users in the backoffice
        /// and displaying the names of the users
        /// By default this is enabled
        /// </summary>
        public bool Enable { get; set; } = true;

        /// <summary>
        /// Settings to control the sounds played when a user logs in or logs out
        /// </summary>
        public SoundsOptions Sounds { get; set; } = new();
        
        public class SoundsOptions
        {
            /// <summary>
            /// Enable or disable the audio notifications for a
            /// user logging in or out of the backoffice
            /// By default this feature is enabled
            /// </summary>
            public bool Enable { get; set; } = true;

            /// <summary>
            /// Path to the login sound file
            /// This can be a relative path or an absolute URL.
            /// </summary>
            public string LoginSound { get; set; } = "/App_Plugins/ContentLock/sounds/login.mp3";

            /// <summary>
            /// Path to the logout sound file.
            /// This can be a relative path or an absolute URL.
            /// </summary>
            public string LogoutSound { get; set; } = "/App_Plugins/ContentLock/sounds/logout.mp3";
        }
    }
}
```

#### Registering Options

For my use case I have registered the Options using a Composer, but you may prefer to do it differently if you are not creating a package that is being consumed by others.

```
// Mine is placed inside ContentLockSignalRComposer
builder.Services
   .AddOptions<ContentLockOptions>()
   .Bind(builder.Config.GetSection(ContentLockOptions.ConfigName));
```

### Registering a SignalR Hub

For this part I suggest you refer to the documentation from Umbraco themselves.  
[https://docs.umbraco.com/umbraco-cms/implementation/custom-routing/signalr](https://docs.umbraco.com/umbraco-cms/extend-your-project/server-side-extensions/custom-routing/signalr)

This documentation involves and covers the following:

- Creating an interface for the SignalR Hub and its methods
- Create a sample SignalR Hub based on the interface
- Creating the route with Umbraco for the SignalR Hub
- Registering the route with Umbraco in the UmbracoPipelineFilter

### SignalR Hub with IOptionsMonitor

```csharp
using System.Collections.Concurrent;
using ContentLock.Interfaces;
using ContentLock.Options;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;

using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Extensions;

namespace ContentLock.SignalR;

[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
public class ContentLockHub : Hub<IContentLockHubEvents>
{
    private readonly IOptionsMonitor<ContentLockOptions> _options;

    public ContentLockHub(IOptionsMonitor<ContentLockOptions> options)
    {
        _contentLockService = contentLockService;
        _options = options;
        _options.OnChange(OnOptionsChanged);
    }

    private void OnOptionsChanged(ContentLockOptions options)
    {
        // Notify all connected clients of the new options values
        // As the value has been changed
        this.Clients.All.ReceiveLatestOptions(options);
    }

    public override async Task<Task> OnConnectedAsync()
    {
        await GetCurrentOptions();
        return base.OnConnectedAsync();
    }

    private async Task GetCurrentOptions()
    {
        // When a client connects do the initial lookup of options
        var currentOptions = _options.CurrentValue;

        // Send the current options to the caller
        // Did not use .All as other connected clients should have a stored state of options in an observable
        await Clients.Caller.ReceiveLatestOptions(currentOptions);
    }
}
```

### Creating a Bellissima GlobalContext

We can then use Bellissima to create a Global Context that we can register as part of our extension to Umbraco

### Global Context Manifest

```javascript
export const manifests: Array<UmbExtensionManifest> = [
    {
      name: '[Content Lock] SignalR Global Context',
      alias: 'ContentLock.GlobalContext.SignalR',
      type: 'globalContext',
      js: () => import('./contentlock.signalr.context'),
    }
  ];
```

### Global Context

```javascript
import { UmbContextBase } from "@umbraco-cms/backoffice/class-api";
import * as signalR from "@microsoft/signalr";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UmbObjectState } from "@umbraco-cms/backoffice/observable-api";
import { ContentLockOptions } from "../interfaces/ContentLockOptions";

export default class ContentLockSignalrContext extends UmbContextBase<ContentLockSignalrContext>
{
    // SignalR Hub URL endpoint
    #CONTENT_LOCK_HUB_URL = '/umbraco/ContentLockHub';

    // Currently made this public so that any place consuming the context
    // Could stop the signalR connection or listen to any .On() events etc
    public signalrConnection? : signalR.HubConnection;

    // Used to store the options for the content lock package
    // Sets the default values for the options
    #contentLockOptions = new UmbObjectState<ContentLockOptions>(
        {
            onlineUsers: {
                enable: true,
                sounds: {
                    enable: true,
                    loginSound: '/App_Plugins/ContentLock/sounds/login.mp3',
                    logoutSound: '/App_Plugins/ContentLock/sounds/logout.mp3',
                }
            }
        });

    // The entire options object as an observable
    public contentLockOptions = this.#contentLockOptions.asObservable();

    // The individual options as observables
    public EnableOnlineUsers = this.#contentLockOptions.asObservablePart(options => options.onlineUsers.enable);
    public EnableSounds = this.#contentLockOptions.asObservablePart(options => options.onlineUsers.sounds.enable);
    public LoginSound = this.#contentLockOptions.asObservablePart(options => options.onlineUsers.sounds.loginSound);
    public LogoutSound = this.#contentLockOptions.asObservablePart(options => options.onlineUsers.sounds.logoutSound);

    constructor(host: UmbControllerHost) {
        super(host, CONTENTLOCK_SIGNALR_CONTEXT);

        // Create a new SignalR connection in this context that we will expose
        // Then otherplaces can get this new'd up hub to send or receive messages

        // Need auth context to use the token to pass to SignalR hub
        this.consumeContext(UMB_AUTH_CONTEXT, async (authCtx) => {
            if (!authCtx) {
                console.error('Auth context is not available for SignalR connection');
                return;
            }

            // Create a new SignalR connection in this context that we will expose
            // Then otherplaces can get this new'd up hub to send or receive messages
            this.signalrConnection = new signalR.HubConnectionBuilder()
                .withUrl(this.#CONTENT_LOCK_HUB_URL, { 
                    accessTokenFactory: authCtx.getOpenApiConfiguration().token
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();

            this.#startHub();
        });
    }

    // Start the engines...
    async #startHub() {
        if(this.signalrConnection) {
            // Start the connection straight away
            await this.signalrConnection.start();
        
            // Listen for the SignalR C# Hub server sending us the event 'ReceiveLatestOptions'
            this.signalrConnection.on('ReceiveLatestOptions', (options:ContentLockOptions) =>{
                // Update our object where other places are observing the entire object or an observable part
                this.#contentLockOptions.setValue(options);
            });
        }
    }

    override async destroy(): Promise<void> {
        if (this.signalrConnection) {
            await this.signalrConnection.stop();
        }
    }
}

export const CONTENTLOCK_SIGNALR_CONTEXT = new UmbContextToken<ContentLockSignalrContext>('ContentLockSignalRContext');
```

### Header App

```javascript
import { customElement, html, nothing, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbHeaderAppButtonElement } from '@umbraco-cms/backoffice/components';
import ContentLockSignalrContext, { CONTENTLOCK_SIGNALR_CONTEXT } from '../globalContexts/contentlock.signalr.context';
import { UMB_MODAL_MANAGER_CONTEXT, UmbModalManagerContext } from '@umbraco-cms/backoffice/modal';
import { CONTENTLOCK_ONLINEUSERS_MODAL } from '../modals/onlineusers.modal.token';
import { observeMultiple } from '@umbraco-cms/backoffice/observable-api';

@customElement('contentlock-nousers-online-headerapp')
export class ContentLockNoUsersOnlineHeaderApp extends UmbHeaderAppButtonElement {
	
    @state()
    private _totalConnectedUsers: number | undefined;

    @state()
    private _enableOnlineUsers: boolean = true;

    #modalManagerCtx?: UmbModalManagerContext;
    

	constructor() {
		super();

        this.consumeContext(CONTENTLOCK_SIGNALR_CONTEXT, (signalrContext: ContentLockSignalrContext) => {
            this.observe(observeMultiple([signalrContext.totalConnectedUsers, signalrContext.connectedUserKeys, signalrContext.EnableOnlineUsers]), ([totalConnectedUsers, connectedUserKeys, enableOnlineUsers]) => {
                this._totalConnectedUsers = totalConnectedUsers;

                // This is an observable from SignalR watching the AppSettings/Options
                // TODO: Perhaps can retire this and use the condition approach when HeaderApps supports it
                // Now due in V16 :)
                // https://github.com/umbraco/Umbraco-CMS/issues/18979
                this._enableOnlineUsers = enableOnlineUsers;

            });
        });

        this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (modalManagerCtx) => {
            this.#modalManagerCtx = modalManagerCtx;
        });
	}

    async #openUserListModal() {
        await this.#modalManagerCtx?.open(this, CONTENTLOCK_ONLINEUSERS_MODAL);
    };

	override render() {

        // TODO: Can remove when HeaderApps support conditions in manifest
        if (!this._enableOnlineUsers) {
            return html ``;
        }

        const badgeValue = this._totalConnectedUsers !== undefined
            ? (this._totalConnectedUsers > 99 ? '99+' : this._totalConnectedUsers.toString())
            : nothing;

		return html`
            <uui-button compact label=${this.localize.term('general_help')} look="primary" @click=${this.#openUserListModal}>
				<uui-icon name="icon-users"></uui-icon>
                <uui-badge color="default" look="secondary">${badgeValue}</uui-badge>
			</uui-button>
        `;
	}

	static override styles = UmbHeaderAppButtonElement.styles;
}

export default ContentLockNoUsersOnlineHeaderApp;

declare global {
	interface HTMLElementTagNameMap {
		'contentlock-nousers-online-headerapp': ContentLockNoUsersOnlineHeaderApp;
	}
}
```

## Pull Request

If you want to see the entire code that made up this feature, then feel free to take a look at the [Pull Request for the feature on GitHub](https://github.com/warrenbuckley/Umbraco.Community.ContentLock/pull/13)



Hope this has inspired you to play around with SignalR and Bellissima.  
I would love to hear what you think of this, so leave me a comment or perhaps tell me how you would use this?

Until next time, Happy Hacking 😀
