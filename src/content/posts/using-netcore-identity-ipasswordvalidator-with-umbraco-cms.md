---
title: "Using .NETCore Identity IPasswordValidator with Umbraco CMS"
date: 2021-09-09
topics: ["dotnet", "tutorials"]
excerpt: "Use .NET Core Identity's IPasswordValidator in Umbraco to enforce strong passwords for backoffice users and members, and reject any found on Have I Been Pwned."
draft: false
---

In this blog post I will cover how you can use the power of .NETCore Identity that is part of the Open Source .NET CMS Umbraco and how you can write a few bits of code to prevent your backoffice CMS users and members on your public facing website to use strong passwords or check that it has not been compromised in conjunction with the API provided from [HaveIBeenPwnd.com](https://haveibeenpwned.com/) So read on to see how simple it can all be.

## Say No To Easy Passwords

This simple example shows how to write a custom IPasswordvalidator where you can see that we prevent backoffice CMS users to Umbraco using a password that contains the word **password **in it. Along with this we can show we can use Umbraco's language files to ensure the error message is translated into the correct language.

### SayNoToEasyPasswordValidator.cs

```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Umbraco.Cms.Core.Security;

namespace Umbraco.Cms.Web.UI.NetCore
{
    public class SayNoToEasyPasswordsValidator : IPasswordValidator<BackOfficeIdentityUser>
    {
        private MyCustomIdentityErrorDescriber _errors;

        public SayNoToEasyPasswordsValidator(MyCustomIdentityErrorDescriber errors)
        {
            _errors = errors;
        }

        public Task<IdentityResult> ValidateAsync(UserManager<BackOfficeIdentityUser> manager, BackOfficeIdentityUser user, string password)
        {
            if (password.ToLowerInvariant().Contains("password"))
            {
                return Task.FromResult(IdentityResult.Failed(_errors.PasswordTooEasy()));
            }

            return Task.FromResult(IdentityResult.Success);
        }
    }
}
```

### MyCustomIdentityErrorDescriber.cs

```csharp
using Microsoft.AspNetCore.Identity;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Umbraco.Cms.Web.UI.NetCore
{
    public class MyCustomIdentityErrorDescriber : BackOfficeErrorDescriber
    {
        private ILocalizedTextService _textService;

        public MyCustomIdentityErrorDescriber(ILocalizedTextService textService) : base(textService)
        {
            _textService = textService;
        }

        public IdentityError PasswordTooEasy()
        {
            // Note we use Umbraco TextService to help localize this message
            return new IdentityError
            {
                Code = "SayNoToEasyPasswords",
                Description = _textService.Localize("validation", "passwordTooEasy")
            };
        }
    }
}
```

### **en_us.user.xml**

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<!-- Place User override lang files at /config/lang/en_us.user.xml -->
<language alias="en_us" intName="English (US)" localName="English (US)" lcid="" culture="en-US">
  <creator>
    <name>Warren Buckley</name>
    <link>https://hackmakedo.com/</link>
  </creator>
  <area alias="validation">
    <key alias="passwordTooEasy">You cannot use the word 'password' as part of your password</key>
  </area>
</language>
```

### Startup.cs

```csharp
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Security;
using Umbraco.Extensions;

namespace Umbraco.Cms.Web.UI.NetCore
{
    public class Startup
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        /// <summary>
        /// Initializes a new instance of the <see cref="Startup"/> class.
        /// </summary>
        /// <param name="webHostEnvironment">The Web Host Environment</param>
        /// <param name="config">The Configuration</param>
        /// <remarks>
        /// Only a few services are possible to be injected here https://github.com/dotnet/aspnetcore/issues/9337
        /// </remarks>
        public Startup(IWebHostEnvironment webHostEnvironment, IConfiguration config)
        {
            _env = webHostEnvironment ?? throw new ArgumentNullException(nameof(webHostEnvironment));
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }

        /// <summary>
        /// Configures the services
        /// </summary>
        /// <remarks>
        /// This method gets called by the runtime. Use this method to add services to the container.
        /// For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        /// </remarks>
        public void ConfigureServices(IServiceCollection services)
        {
#pragma warning disable IDE0022 // Use expression body for methods
            services.AddUmbraco(_env, _config)
                .AddBackOffice()
                .AddWebsite()
                .AddComposers()
                .Build();
#pragma warning restore IDE0022 // Use expression body for methods

            // Added the following to the existing Startup class
            // generated from the Umbraco dotnet new Umbraco template
            var backofficeIdentityBuilder = new BackOfficeIdentityBuilder(services);
            backofficeIdentityBuilder.AddPasswordValidator<SayNoToEasyPasswordsValidator>();
            backofficeIdentityBuilder.AddErrorDescriber<MyCustomIdentityErrorDescriber>();

        }

        /// <summary>
        /// Configures the application
        /// </summary>
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseUmbraco()
                .WithMiddleware(u =>
                {
                    u.WithBackOffice();
                    u.WithWebsite();
                })
                .WithEndpoints(u =>
                {
                    u.UseInstallerEndpoints();
                    u.UseBackOfficeEndpoints();
                    u.UseWebsiteEndpoints();
                });
        }
    }
}
```

## Prefer to watch?

<hmd-video class="hmd-video" video-id="I2QVf-pw0cE">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=I2QVf-pw0cE">Watch on YouTube ↗</a>
</hmd-video>

## More Resources

Take a look at these GitHub Repositories from Andrew Lock and look at the source code to see how he has implemented his code to check for common passwords from a common top 100 passwords list or how he is using the HaveIBeenPwned API to verify the password you are using has not been compromised.



## Homework

With what you have learnt here, you should be able to follow along with the same steps and see if you can achieve the following things:



## Big thanks !

A HUGE thanks has got to go out to Andrew Lock and his [fantastic blog post that originally taught me about IPasswordValidators and IUserValidators](https://andrewlock.net/creating-custom-password-validators-for-asp-net-core-identity-2/). Got to keep the .NET Community karma love alive.

I hope you found this blog post & video useful.  
Have fun and happy hacking !
