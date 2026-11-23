---
title: "Umbraco V8 - Swapping Log4Net for Serilog with this switcheroo magic trick"
date: 2018-07-03
topics: ["logging", "umbraco"]
excerpt: "Swap Umbraco 8's Log4Net logging for Serilog, and why structured logging makes your logs far easier to query and filter."
draft: false
---

So in this blog post I will perform a switcheroo trick and swap the logging framework used in Umbraco V8 from Log4Net to use Serilog, however I will be one of those awful magicians from that crumby late 90's show that revealed magician's secrets to tricks.

<figure class="hmd-figure">
  <img src="/images/blog/umbraco-v8-swapping-log4net-for-serilog-with-this-switcheroo-magic-trick/secret-magician1.jpg" alt="" width="1200" height="675" loading="lazy" />
  <figcaption>That 90&#x27;s show where the magician would show how tricks were done</figcaption>
</figure>

But first up let me try and tell you why I even decided to try and do this in the first place...

## Why bother doing a switcheroo with logging frameworks?

I will try my best to explain why I wanted to switch out the current default Logging Framework used for Umbraco which is Log4Net for a Logging Framework called Serilog.

Serilog is a Logging framework that enables structured logging, which is a way to provide more additional meta information to your log with properties versus Log4Net's approach which simply logs out the given string to a text file or other endpoint.

The main benefit that I see with structured logging, it allows you to query and find log items a lot easier than trawling through an arbitrary text log file, looking for clues and how log items may or may not relate to one another.

For example you could find all Log messages from a given class/type very quickly, find a group of related log items for member id 1234 and perhaps even add the environment in which the log came from such as Development, Staging or Live. Having this extra metadata of properties to search & filter on gives you some great tools & insights into looking through logs in a more organised fashion.

If you use Serilog's Sinks, a term which is a datastore for logs, then you are able to output the logs to several places at once such as traditional text files, databases or perhaps more useful tools like ElasticSearch or even [Serilog's author companion tool Seq](https://datalust.co/) which allows you to visually, perform complex searches & queries to get an insight into your logs.

<figure class="hmd-figure">
  <img src="/images/blog/umbraco-v8-swapping-log4net-for-serilog-with-this-switcheroo-magic-trick/seq-screenshot.png" alt="" width="1400" height="723" loading="lazy" />
  <figcaption>A screenshot from Seq, a tool to visually filter &amp; query logs</figcaption>
</figure>

I think I may have done a terrible job of trying to explain this in a short summary, but least I tried ¯\_(ツ)_/¯

### Find my explanation a little lacking?!

Then you can watch the creator [Nicholas Blumhardt](https://nblumhardt.com/) talk about [structured logging, Serilog](https://serilog.net/) & [Seq](https://datalust.co/) from his 2017 NDC talk explain it much better than I can.
<hmd-video class="hmd-video" provider="youtube" video-id="OhmNp8UPEEg" label="Serilog: Instrumentation that Works for You, Nicholas Blumhardt">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=OhmNp8UPEEg">Watch on YouTube ↗</a>
</hmd-video>

## OK enough why, just show me how to do the magic

So in Umbraco V8 you can create a new class that inherits from the class `Umbraco.Web.UmbracoApplication`, in doing so you are then able to override the method called `GetLogger` to return an implementation of Umbraco's ILogger interface, where we can proxy calls to the Umbraco logger to use an underlying Serilog ILogger. With this then done to get Umbraco to use this we simply need to update the Global.asax file on disk to inherit from our new class that is overriding the UmbracoApplication GetLogger method.

### Some prerequisites

So for the code example below to work you will need the following Nuget packages installed and a [copy of Seq installed, which has a FREE single-user license to run Seq locally](https://datalust.co/Pricing)

- [Serilog](https://www.nuget.org/packages/Serilog)
- [Serilog.Sinks.RollingFile](https://www.nuget.org/packages/Serilog.Sinks.RollingFile)
- [Serilog.Sinks.Seq](https://www.nuget.org/packages/Serilog.Sinks.Seq)
- [Serilog.Enrichers.Process](https://www.nuget.org/packages/Serilog.Enrichers.Process)
- [Serilog.Enrichers.Thread](https://www.nuget.org/packages/Serilog.Enrichers.Thread)

### Get to the code

```csharp
using System;
using Serilog;
using Serilog.Core;
using Umbraco.Web;
using ILogger = Umbraco.Core.Logging.ILogger;

namespace MyProject
{
    public class SwapLogging : UmbracoApplication
    {
        protected override ILogger GetLogger()
        {
            var customLogger = new SeriLogger();
            return customLogger;
        }
    }

    /// <summary>
    /// Not the nicest but we need to implement Umbraco's own ILogger
    /// To call/wrap the underlying Serilog calls
    /// </summary>
    public class SeriLogger : ILogger
    {
        private Logger _seriLogger;

        public SeriLogger()
        {
            var basedir = AppDomain.CurrentDomain.BaseDirectory;
            var appDomainId = AppDomain.CurrentDomain.Id;

            //Configure & setup SeriLogger with Sinks & Enrichers
            //Sinks are where we want to push log data to
            //Enrichers add extra properties/information to enhance the log item
            //TODO: Move to a config file - https://github.com/serilog/serilog/wiki/AppSettings
            _seriLogger = new LoggerConfiguration()
                .MinimumLevel.Verbose()
                .Enrich.WithProcessId()
                .Enrich.WithProcessName()
                .Enrich.WithThreadId()
                .Enrich.WithProperty("DomainId", appDomainId) //We can add our own properties to logs
                .Enrich.WithProperty("BaseDirectory", basedir)
                .WriteTo.RollingFile(basedir + "\\logs\\New-UmbracoLogFile-{Date}.txt",
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [P{ProcessId}/D{DomainId}/T{ThreadId}] {Level:u} {SourceContext} - {Message}{NewLine}{Exception}") //We can define what format we want the text logfile to be output as
                .WriteTo.Seq("http://localhost:5341")
                .CreateLogger();
        }

        public void Error(Type reporting, string message, Exception exception = null)
        {
            _seriLogger
                .ForContext(reporting)
                .Error(exception, message);
        }

        public void Warn(Type reporting, string message)
        {
            _seriLogger
                .ForContext(reporting)
                .Warning(message);
        }

        public void Warn(Type reporting, Func messageBuilder)
        {
            _seriLogger
                .ForContext(reporting)
                .Warning(messageBuilder());
        }

        public void Warn(Type reporting, Exception exception, string message)
        {
            _seriLogger
                .ForContext(reporting)
                .Warning(exception, message);
        }

        public void Warn(Type reporting, Exception exception, Func messageBuilder)
        {
            _seriLogger
                .ForContext(reporting)
                .Warning(exception, messageBuilder());
        }

        public void Info(Type reporting, string message)
        {
            _seriLogger
                .ForContext(reporting)
                .Information(message);
        }

        public void Info(Type reporting, Func messageBuilder)
        {
            _seriLogger
                .ForContext(reporting)
                .Information(messageBuilder());
        }

        public void Debug(Type reporting, string message)
        {
            _seriLogger
                .ForContext(reporting)
                .Debug(message);
        }

        public void Debug(Type reporting, Func messageBuilder)
        {
            _seriLogger
                .ForContext(reporting)
                .Debug(messageBuilder());
        }
    }
}
```

## I'm not convinced, show me it works!

With all magic tricks there is some skepticism, so to be fully transparent and to ensure you its working here is a view of logs coming from Umbraco V8 in my local copy of Seq.

<figure class="hmd-figure">
  <img src="/images/blog/umbraco-v8-swapping-log4net-for-serilog-with-this-switcheroo-magic-trick/seq-umbraco-screenshot.png" alt="" width="1307" height="822" loading="lazy" />
  <figcaption>A quick screenshot of my local copy of Seq with Umbraco V8 logs and additional properties pushed in</figcaption>
</figure>

## Tada!

OK so now you know how the magic is done, I would like to hear back via twitter or comments on this post, if this is something useful to have learnt or was this is just a pointless experiment, either way I would love to hear back from you.

Thanks,
Warren :)

<figure class="hmd-figure">
  <hmd-loop class="hmd-loop">
    <video src="/images/blog/umbraco-v8-swapping-log4net-for-serilog-with-this-switcheroo-magic-trick/shia-magic.mp4" poster="/images/blog/umbraco-v8-swapping-log4net-for-serilog-with-this-switcheroo-magic-trick/shia-magic.jpg" width="560" height="314" muted loop playsinline preload="none" controls></video>
  </hmd-loop>
</figure>
