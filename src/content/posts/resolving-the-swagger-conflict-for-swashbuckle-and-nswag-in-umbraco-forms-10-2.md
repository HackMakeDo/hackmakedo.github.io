---
title: "Resolving the Swagger conflict for Swashbuckle and NSwag in Umbraco Forms 10.2+"
date: 2023-01-03
topics: ["tutorials", "dotnet", "umbraco-forms"]
excerpt: "Fix the Swagger UI conflict between Swashbuckle and NSwag on Umbraco sites running Umbraco Forms 10.2. Umbraco has since fixed it in Forms 10.2.2 and 11.0.1."
draft: false
---

Hello  
I have been helping a member of our Umbraco community who has recently run into a problem of trying to get their Swagger UI to document their API inside their Umbraco site when using Umbraco Forms 10.2+.

Carry on reading to find out how I helped them resolve this issue.

## Update

> Umbraco Forms has been updated to include a fix to this problem and can be found in Forms **10.2.2** and **11.0.1**

## What's the problem?

The problem comes from [Umbraco Forms 10.2 shipping an OpenAPI spec and Swagger UI to browse the API for Headless/AJAX based forms](https://docs.umbraco.com/umbraco-forms/developer/ajaxforms#api-definition), which is using NSwag version 13.7.0.

NSwag is an alternative package to use to add the Swagger UI and OpenAPI json to document your APIs. However, this community member was using Swashbuckle

## What's the fix?

After a bit of experimenting and trial and error. The way to fix the problem was to use app.UseSwagger() with a configuration property that is specific to the Swashbuckle instance as opposed to the NSwag version of app.UseSwagger() to resolve the ambiguity between the two methods.

## Show me the code

**Startup.cs - ConfigureServices**  
Here we configure the two different versions of our API we want to document with OpenAPI spec and be available for the SwaggerUI in the UseSwaggerUI method later on.

```csharp
// Startup.cs - ConfigureServices
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v2", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "My API", 
        Version = "v2",
        Contact = new OpenApiContact
        {
            Name = "Warren",
            Email = "warren@umbraco.com",
        }
    });
    
    c.SwaggerDoc("v3", new OpenApiInfo { Title = "My API - V3", Version = "v3" });
    
});
```

**Startup.cs - Configure**  
Next, we are customising what URL the Swagger/OpenAPI JSON api file is located, along with updating the URL for the Swagger UI to view the API docs.

```csharp
// Startup.cs - Configure
app.UseSwagger(c =>
{
    c.RouteTemplate = "api-docs/{documentName}/swagger.json";
});

app.UseSwaggerUI(c =>
{
    // Define multiple API versions
    c.SwaggerEndpoint("/api-docs/v2/swagger.json", "My API V2");
    c.SwaggerEndpoint("/api-docs/v3/swagger.json", "My API V3");

    // Change the Swagger UI to respond to /api-docs
    // as opposed to /swagger
    c.RoutePrefix = "api-docs";
});
```

**ExampleController.cs**  
Here I have a controller with two different HTTP GET endpoints but each of them is used in the different API versions.

```csharp
[Route("example")]
public class ExampleController : Controller
{
    [HttpGet("Ping")]
    [ApiExplorerSettings(GroupName = "v2")]
    public IActionResult Ping()
    {
        return Content("pong");
    }

    [HttpGet("DoSomething")]
    [ApiExplorerSettings(GroupName = "v3")]
    public IActionResult GetThings()
    {
        // Do some logic stuff


        // Return 200 result
        return Ok();
    }
}
```

Happy hacking and building lovely self-documenting API's for your Umbraco implementations.  
  
Warren  
Hack, Make, Do
