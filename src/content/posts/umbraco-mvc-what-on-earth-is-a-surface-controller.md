---
title: "Umbraco MVC: What on earth is a surface controller?"
date: 2013-07-22
topics: ["tutorials", "umbraco"]
excerpt: "What on earth is an Umbraco surface controller, and why should you care? Find out, then build one: a view model, a controller and a form in a partial view."
draft: false
---

Continuing the Umbraco MVC blog post series we will look at Surface controllers in this post and find out what the heck they are why they are so important when building Umbraco MVC websites.

Read on to find out how to implement your very own surface controllers.

## So what the heck is a surface controller?

A surface controller is an Umbraco specific version of a normal MVC controller with the added benefits of the surface controller knowing about your Umbraco site.

## So why should I care about SurfaceControllers?

Without surface controllers, we would be unable to have any form of interactivity on our website. For example such as contact forms, login form, edit profile form and many other various types of forms where we accept input from a user. Without a surface controller none of this would be possible. A surface controller is a bit more powerful than a normal MVC controller as it knows a lot more about Umbraco, the current page and other contexts than a regular old ASP.NET MVC controller would not know.

## Show me the code!

As always with these blog posts I try not to ramble on too much and rather just show you how to do things with heavily commented code examples rather than a ton of theory that no one can ever remember!

In this example the form we will use in our surface controller example is a simple contact form. Posting a name, email address and a message which we will send out as a message.
So lets cover the basics.

A surface controller comprises of three things, a model or to be more precise a view model for our form data/fields, a controller in our case a surface controller and finally a view to display the form and success message.

## Creating the view model

So lets start off with the very basics and create a view model for our form. You will need a form of Visual Studio for this be it the free express edition or any other addition as this code will need to be compiled into a dll for the website. So right click and create a new folder called **Models** and in there create a new class called **ContactFormViewModel.cs**

In this file we can add the fields or properties to this class that we want to show up in our contact form.

```csharp
public class ContactFormViewModel
{
   public string Name { get; set; }

   public string Email { get; set; }

   public string Message { get; set; }
}
```

As you can see the class is very simple with three string properties. We can make our lives easier by adding validation by using a native [ASP.NET MVC data attributes for validation](https://learn.microsoft.com/en-us/previous-versions/aspnet/ee256141(v=vs.98)).

So lets take a look at the updated model with our data attributes added in.

```csharp
public class ContactFormViewModel
{
   [Required]
   public string Name { get; set; }

   [Required]
   [EmailAddress]
   public string Email { get; set; }

   [Required]
   public string Message { get; set; }
}
```

## Creating the surface controller

Step two, lets create our actual surface controller. Create a folder called **Controllers** and in there create a new class called **ContactFormSurfaceController.cs** for this to automagically work and wire into Umbraco, the file needs to always end in **SurfaceController.cs**.This class needs to inherit from **SurfaceController (Umbraco.Web.Mvc.SurfaceController)**

```csharp
public class ContactFormSurfaceController : SurfaceController
{
   //Our ActionResult code will go here (to handle the view & one to handle the form POST)
}
```

We next need to add an ActionResult into our controller. Which will handle the form rendering on our page. So lets add the following to our controller.

```csharp
/// <summary>
/// Renders the Contact Form
/// @Html.Action("RenderContactForm","ContactFormSurface");
/// </summary>
/// <returns></returns>
public ActionResult RenderContactForm()
{
    //Return a partial view ContactForm.cshtml in /views/ContactFormSurface/ContactForm.cshtml
    //With an empty/new ContactFormViewModel
    return PartialView("ContactForm", new ContactFormViewModel());
}
```

With this ActionResult in place, we need a second one to deal with the contact form HTTP POST method.

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public ActionResult HandleContactForm(ContactFormViewModel model)
{
    //Check if the dat posted is valid (All required's & email set in email field)
    if (!ModelState.IsValid)
    {
        //Not valid - so lets return the user back to the view with the data they entered still prepopulated
        return CurrentUmbracoPage();
    }

    //Generate an email message object to send
    MailMessage email   = new MailMessage(model.Email, "you@yoursite.co.uk");
    email.Subject       = "Contact Form Request";
    email.Body          = model.Message;

    try
    {
        //Connect to SMTP credentials set in web.config
        SmtpClient smtp = new SmtpClient();

        //Try & send the email with the SMTP settings
        smtp.Send(email);
    }
    catch (Exception ex)
    {
        //Throw an exception if there is a problem sending the email
        throw ex;
    }

    //Update success flag (in a TempData key)
    TempData["IsSuccessful"] = true;

    //All done - lets redirect to the current page & show our thanks/success message
    return RedirectToCurrentUmbracoPage();
}
```

Hopefully the code is heavily commented enough to understand what is going on.

## Rendering the form in a partial view

The final piece of our puzzle is that we need a partial view to render our contact form to allow our users to view and post a message via our contact form.

```razor
@using ExampleSite.Controllers
@using ExampleSite.Models
@model ContactFormViewModel

@{
    Html.EnableClientValidation(true);
    Html.EnableUnobtrusiveJavaScript(true);
}

@if (Convert.ToBoolean(TempData["IsSuccessful"]))
{
    <h1>YAY!</h1>
    <p>Thanks for sending your message, we will get back to you shortly.</p>
}
else
{
    using (Html.BeginUmbracoForm<ContactFormSurfaceController>("HandleContactForm"))
    {
        @Html.ValidationSummary(true)
        @Html.AntiForgeryToken()

        @Html.TextBoxFor(model => model.Name, new { placeholder = "Your Name" })
        @Html.ValidationMessageFor(model => model.Name)

        @Html.TextBoxFor(model => model.Email, new { placeholder = "Email Address" })
        @Html.ValidationMessageFor(model => model.Email)

        @Html.TextBoxFor(model => model.Message, new { placeholder = "Your Message" })
        @Html.ValidationMessageFor(model => model.Message)

        <input type="submit" value="Send" />
    }
}
```

## Where next?

We could easily expand on this example by using the knowledge learnt from the PetaPoco tutorial blog post I wrote earlier to create a DB table to store the contact form entries as a log, and then create a simple dashboard control to view these items in the Umbraco back office.

In the future with Umbraco belle aka V7 coming up in the future we could use the notification service and signalR to give a live notification that the contact form has been filled in when a user to the Umbraco back-office is logged in.

Next time I will be looking into other things we can do with surface controllers such as membership, with registration, login, forgotten password and reset password options.
