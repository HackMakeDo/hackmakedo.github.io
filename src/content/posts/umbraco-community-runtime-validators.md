---
title: "Umbraco Community Runtime Validators"
date: 2024-03-06
topics: ["tooling", "dotnet", "umbraco-packages"]
excerpt: "Umbraco Community Runtime Validators stops a misconfigured Umbraco site from booting in production, starting with Azure load balancing. Built with Gibe Digital."
heroImage: "/images/blog/umbraco-community-runtime-validators/cathryn-lavery-fmd_cru6otk-unsplash.jpg"
draft: false
---

This is a short but sweet blog post, to let you know about the Umbraco Community Runtime Validators package is out and available for you to use.

This little package came about working with the lovely lot over at [Gibe Digital](https://gibe.digital/) and I suggested that perhaps the code for a specific client project be reused and turned into this project where the wider Umbraco community can benefit from it.

So a BIG thanks to the Gibe development team for peer reviewing the work and collaborating with me on it.

## What is an Umbraco Runtime Validator?

This is some code that can run to determine if the Umbraco environment is configured correctly, typically for a Production environment and prevent it from booting and giving you a verbose reason as to why. This makes sure you have all the optimal settings needed to run your Umbraco site in a production environment.

Umbraco ships with the following Runtime Validators to help make your site ready and optimal for use in production.

- **JITOptimizer**  
The application is built and published in Release mode (with JIT optimization enabled)
- **ModelsBuilderMode**  
The config value **Umbraco:CMS:ModelsBuilder:ModelsMode** is set to **Nothing**
- **RuntimeMinfication**  
The config value **Umbraco:CMS:RuntimeMinification:CacheBuster** is set to a fixed cache buster like **Version **or **AppDomain**
- **UmbracoApplicationUrl**  
The config value **Umbraco:CMS:WebRouting:UmbracoApplicationUr**l is configured
- **UseHttps**  
The config value **Umbraco:CMS:Global:UseHttps** is set to true

To learn more about [Runtime Validators you can read the official documentation](https://docs.umbraco.com/umbraco-cms/run-in-production/runtime-modes) on what they are and [how to write your own Umbraco Runtime Validator](https://docs.umbraco.com/umbraco-cms/run-in-production/runtime-modes#customize-extend-runtime-mode-validation).

## What's in Umbraco Community Runtime Validators ?

This first release out to the wild, focuses on ensuring your production environment is configured correctly if you are hosting your Umbraco site in Azure in a load balanced environment and ships these Runtime Validators

- **AzureLoadBalancing.ExamineValidator**  
This checks to see if [Examine is using the correct LuceneDirectoryFactory](https://docs.umbraco.com/umbraco-cms/run-in-production/infrastructure-and-ops/server-setup/load-balancing/azure-web-apps#lucene-examine-configuration)
- **AzureLoadBalancing.HostSyncValidator**  
This checks to see if the [MainDom is configured correctly](https://docs.umbraco.com/umbraco-cms/run-in-production/infrastructure-and-ops/server-setup/load-balancing/azure-web-apps#host-synchronization)
- **AzureLoadBalancing.TempFilesValidator**  
This checks to see if the [LocalTempStorageLocation is set to EnvironmentTemp](https://docs.umbraco.com/umbraco-cms/run-in-production/infrastructure-and-ops/server-setup/load-balancing/azure-web-apps#umbraco-temp-files)

## Alright already... just tell me how to set it up

Well you can find the [package over on Umbraco Marketplace](https://marketplace.umbraco.com/package/umbraco.community.runtimevalidators) with a lovely readme on how to get setup and running.

But the quick TL:DR version is

```
dotnet add package Umbraco.Community.RuntimeValidators
```

Create an Umbraco Composer that updates the **RuntimeModeValidators** collection

```csharp
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Community.RuntimeValidators.Validators.AzureLoadBalancing;
using Umbraco.Extensions;

namespace YourProject.Website

public class RuntimeValidatorsComposer : IComposer
{
	public void Compose(IUmbracoBuilder builder)
	{
		builder.RuntimeModeValidators()
			.Add<TempFilesValidator>()
			.Add<HostSyncValidator>()
			.Add<ExamineValidator>();
	}
}
```

### Got an idea for a Runtime Validator

Then please [submit an issue on the GitHub repository](https://github.com/Gibe/Umbraco.Community.RuntimeValidators/issues) with your super duper fab idea and lets get the conversation going and have a [useful community repo of Runtime Validators](https://github.com/Gibe/Umbraco.Community.RuntimeValidators) to make all our Umbraco sites that much better !

[Marketplace](https://marketplace.umbraco.com/package/umbraco.community.runtimevalidators)
[Github Repo](https://github.com/Gibe/Umbraco.Community.RuntimeValidators)
