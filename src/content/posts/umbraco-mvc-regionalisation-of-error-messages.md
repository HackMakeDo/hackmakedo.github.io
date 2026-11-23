---
title: "Umbraco MVC: Regionalisation of Error Messages"
date: 2014-04-17
topics: ["tutorials", "dotnet", "umbraco"]
excerpt: "Translate ASP.NET MVC validation messages such as [Required] and [EmailAddress] on multilingual Umbraco sites, with attributes that use dictionary keys."
draft: false
---

Hello, Bonjour, Hej
However you say hello in whatever language, at The CogWorks where I work we built a lot of Umbraco Sites that are multi regional for various large brands. The common problem I have noticed we have is that when building say a simple form such as a contact form the validation & error messages that are reported back are in English rather than in the current language of the site you are in, obviously if you are using Contour then this is not a problem and can regionalise labels & error messages for you, but there are some times when you need to or want to build a custom form using the typical MVC pattern and use ASP.NETs native Model validators such as [Required], [EmailAddress], [Range] etc...

However the problem with using them is that they require you to specify a string for the error message like so:

```csharp
[Required(ErrorMessage = "The Email field is required")]
```

Obviously in another language this is not very useful, hence I created a new project on GitHub that allows us to specify dictionary keys for the validation message like so:

```csharp
[UmbracoRequired(
   ErrorMessageDictionaryKey = "Site.Contact.Required", 
   PropertyDictionaryKey = "Site.Contact.Email")]
```

It's then possible to create a whole wealth of custom validators to match your own needs, but for now I have created a simple set to begin with and then the GitHub project can take more pull requests for other common patterns for validators.

For example here is the simple validator for checking if a field is a required:

```csharp
public class UmbracoRequired : BaseUmbracoValidation, IClientValidatable
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            //String is empty - it's required
            if (string.IsNullOrEmpty(Convert.ToString(value)))
            {
                //Get the error message to return
                var error = FormatErrorMessage(validationContext.DisplayName);

                //Return error
                return new ValidationResult(error);
            }

            //All good :)
            return ValidationResult.Success;
        }

        public IEnumerable<ModelClientValidationRule> GetClientValidationRules(ModelMetadata metadata, ControllerContext context)
        {
            yield return new ModelClientValidationRequiredRule(this.FormatErrorMessage(metadata.GetDisplayName()));
        }

    }
```

So as you can see it's very easy to create your own custom validator to match your own requirements as needed. The GetClientValidationRules allows us to use the ASP.NET MVC ClientSide validation messages with jQuery.Validate & jQuery.Unobtrusive.Validate to display the messages clientside as well as serverside if JavaScript is disabled.

Below is my example ViewModel for my Contact Form that is in the source code that has an example site to show it in use.

```csharp
using UmbracoValidationAttributes;

namespace ExampleSite.ViewModels
{
    public class ContactFormViewModel
    {

        [UmbracoRequired(ErrorMessageDictionaryKey = "Site.Contact.Required", PropertyDictionaryKey = "Site.Contact.FirstName")]
        public string FirstName { get; set; }

        public string Surname { get; set; }

        [UmbracoRequired(ErrorMessageDictionaryKey = "Site.Contact.Required", PropertyDictionaryKey = "Site.Contact.Email")]
        [UmbracoEmail(ErrorMessageDictionaryKey = "Site.Contact.InvalidEmail", PropertyDictionaryKey = "Site.Contact.Email")]
        public string Email { get; set; }

        [UmbracoRequired(ErrorMessageDictionaryKey = "Site.Contact.Required", PropertyDictionaryKey = "Site.Contact.Message")]
        public string Message { get; set; }

        [UmbracoMustBeTrue(ErrorMessageDictionaryKey = "Site.Contact.Required", PropertyDictionaryKey = "Site.Contact.AgreeTerms")]
        public bool AcceptedTerms { get; set; }
    }
}
```

## Download & Contribute

You can see the code & download the entirerepo with an example site to see it in use and help contribute more Validation Attributes to the project here:
<https://github.com/warrenbuckley/Umbraco-Validation-Attributes>

## Thanks & Mentions

Only after I got almost through this I noticed there was already an existing Umbraco package that does basically the same thing, however the source code doesn't seem to be widely available, hence why I have continued on with this post & pushing out the code to GitHub.

So a BIG kudos to [UBolt Validation Attributes](https://web.archive.org/web/20200928142016/https://our.umbraco.com/packages/developer-tools/ubolt-validation-attributes/) project by Troels Larsen (archived copy).
