---
title: "Quick Tip: Adding a Saved Search to LogViewer in Umbraco with code"
date: 2024-01-04
topics: ["tutorials", "logging"]
excerpt: "Help your package's users find its logs by adding a Saved Search to the Umbraco Log Viewer, using a package migration."
heroImage: "/images/blog/quick-tip-adding-a-saved-search-to-logviewer-in-umbraco-with-code/cznmcy1wcml2yxrll3jhd3bpegvsx2ltywdlcy93zwjzaxrlx2nvbnrlbnqvbhivchg1ntmwndmtaw1hz2uta3d2ehbndtquanbn.jpg"
draft: false
---

Heya👋  
I wanted to share a quick tip with you all, that I think more package developers in the Umbraco community should consider doing, by adding a Saved Search to the Log Viewer built inside Umbraco. Allowing users of your package to easily filter or find logs related to your package.

So let's jump into the code and see how it easy it is to do along with some suggestions of saved searches you could add to your package by using a package migration.

## Adding a Package Migration Plan

This code snippet adds a package migration plan, which is used to determine if any steps of a migration need to be performed for a package. Over time with upgrades and new versions of your package you may add one or more migrations to add database tables or run other pieces of code such as adding saved searches to the Log Viewer.

For [more information on Package Migrations take a look at the documentation from Umbraco](https://docs.umbraco.com/umbraco-cms/extend-your-project/packages/creating-a-package#package-migration).

```csharp
using QuickTipSavedLogSearch.MyPackage.Migrations;
using Umbraco.Cms.Core.Packaging;

namespace QuickTipSavedLogSearch.MyPackage
{
    public class MyPackageMigrationPlan : PackageMigrationPlan
    {
        public MyPackageMigrationPlan() : base("My Package")
        {
        }

        protected override void DefinePlan()
        {
            // Ensure you use a unique guid for your migration plan steps
            To<AddSavedSearchToLogViewer>(new Guid("7E17C412-6061-470C-A8C8-1E2A23EF3096"));
        }
    }
}
```

## Adding Saved Searches

The key thing from the code snippet below is that we inject **ILogViewerConfig** into the constructor of the PackageMigration code, so that we can use the methods such as **GetSavedSearches()** and **AddSavedSearch()**. With this we can save useful and specific Log Queries to help users of our package find logs only specific to our package code.

```csharp
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.Logging.Viewer;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Packaging;

namespace QuickTipSavedLogSearch.MyPackage.Migrations
{
    public class AddSavedSearchToLogViewer : PackageMigrationBase
    {
        private ILogViewerConfig _logViewerConfig;
        private ILogger<AddSavedSearchToLogViewer> _logger;

        public AddSavedSearchToLogViewer(
            IPackagingService packagingService, 
            IMediaService mediaService, 
            MediaFileManager mediaFileManager, 
            MediaUrlGeneratorCollection mediaUrlGenerators, 
            IShortStringHelper shortStringHelper, 
            IContentTypeBaseServiceProvider contentTypeBaseServiceProvider, 
            IMigrationContext context, 
            IOptions<PackageMigrationSettings> packageMigrationsSettings,
            ILogViewerConfig logViewerConfig,
            ILogger<AddSavedSearchToLogViewer> logger) 
            : base(packagingService, mediaService, mediaFileManager, mediaUrlGenerators, shortStringHelper, contentTypeBaseServiceProvider, context, packageMigrationsSettings)
        {
            _logViewerConfig = logViewerConfig;
            _logger = logger;
        }

        // Find all logs that are from our package that starts with our namespace 'QuickTipSavedLogSearch.MyPackage'
        const string AllLogsQuery = "StartsWith(SourceContext, 'QuickTipSavedLogSearch.MyPackage')";

        // Find all logs that are from our package that starts with our namespace 'QuickTipSavedLogSearch.MyPackage'
        // AND the log level is either Error or Fatal OR the log has an exception property
        const string ErrorLogsQuery = "StartsWith(SourceContext, 'QuickTipSavedLogSearch.MyPackage') and (@Level='Error' or @Level='Fatal' or Has(@Exception))";

        protected override void Migrate()
        {
            // Test logline to help show it in the saved search filter
            _logger.LogInformation("Adding saved searches to log viewer");

            // Check to see if the existing saved searches for the log viewer contains our searches we want to add
            var allSavedSearches = _logViewerConfig.GetSavedSearches();
            
            // If the saved searches already contains our searches, then we don't need to add them (use singleordefault null check to check)
            // Unlikely but a user may have added these searches themselves and Umbraco API for this doesn't handle it for us if we add a duplicate
            if (allSavedSearches.SingleOrDefault(x => x.Query.Equals(AllLogsQuery, StringComparison.OrdinalIgnoreCase)) != null && allSavedSearches.SingleOrDefault(x => x.Query.Equals(ErrorLogsQuery, StringComparison.OrdinalIgnoreCase)) != null)
            {
                _logger.LogInformation("Saved searches already exist, skipping adding them");
                return;
            }

            // Add the saved searches
            _logViewerConfig.AddSavedSearch("[My Awesome Package] Find all Logs", AllLogsQuery);
            _logViewerConfig.AddSavedSearch("[My Awesome Package] Find all errors", ErrorLogsQuery);

            // Test error/exception to help show it in the saved search filter
            _logger.LogError(new Exception("Some exception"), "Some error with a counter {Counter}", 40);

        }
    }
}
```

## Log Queries

Log queries is a way to search and filter with expressions to find the logs we are interesting in reading more about. We add two queries with the example code above and we can take a brief look at what they are doing.

```
StartsWith(SourceContext, 'QuickTipSavedLogSearch.MyPackage')
```

This query finds all logs where the property **SourceContext** starts with the value **QuickTipSavedLogSearch.MyPackage**. The property SourceContext is the full namespace of where the log was generated from, so we can use this to easily help find logs that are coming from our own code in the namespace of our code.

```
StartsWith(SourceContext, 'QuickTipSavedLogSearch.MyPackage') and (@Level='Error' or @Level='Fatal' or Has(@Exception))
```

This query builds upon from the one above and finds all logs where the property SourceContext starts with the value QuickTipSavedLogSearch.MyPackage AND the Log Level is Error or Fatal or the Log has an @Exception property.

Its really quite simple and can make a big difference to the quality of life for developers and users using your package, to help and find the information directly tied to your package and remove the noise of other log entries.

I hope this helps inspire you to give a little DX love and to start experimenting with creating useful Log Queries for the Log Viewer inside Umbraco.
