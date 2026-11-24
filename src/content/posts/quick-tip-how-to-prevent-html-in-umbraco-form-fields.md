---
title: "Quick Tip: How to prevent HTML in Umbraco Form fields"
date: 2025-04-09
topics: ["tutorials", "umbraco-forms"]
excerpt: "Stop HTML being submitted through Umbraco Forms fields, using a FormValidateNotification handler and a regular expression."
draft: false
---

Howdy  
I just wanted to shared a quick code snippet with you all. I have been working for a client where they needed to ensure no HTML could be submitted to a form using Umbraco forms.

Unfortunately out of the box, Umbraco Forms does not support this feature, but with the documentation and extension points available to us, we are able to ensure we apply validation to prevent HTML being submitted into an Umbraco Form.

But with [Umbraco Forms FormValidateNotification](https://docs.umbraco.com/umbraco-forms/developer/extending/adding-an-event-handler#form-validation-notification) we are able to validate the value being submitted to a form field and using RegEx ensure that it does not contain HTML, if so it will return a validation error message back to the user on the form.

## Show me the code

### Forms Validate Notification Handler

```csharp
/// <summary>
/// Referred from Docs
/// https://docs.umbraco.com/umbraco-forms/developer/extending/adding-an-event-handler
/// </summary>
public class FormValidateNotificationHandler : INotificationHandler<FormValidateNotification>
{
	public void Handle(FormValidateNotification notification)
	{

		var form = notification.Form;
		var httpCtx = notification.Context;

		if (notification.ModelState.IsValid == false)
		{
			return;
		}

		if (httpCtx.Request.HasFormContentType is false)
		{
			return;
		}

		foreach(var field in form.AllFields)
		{
			if(field is not null)
			{
				if (FormDoesNotContainField(field, httpCtx))
				{
					continue;
				}

				var postedValue = httpCtx.Request.Form[field.Id.ToString()].ToString().Trim();

				if (ContainsHtml(postedValue))
				{
					notification.ModelState.AddModelError(field.Id.ToString(), "HTML is not allowed");
				}
			}
		}
	}

	private bool FormDoesNotContainField(Field field, HttpContext httpCtx) => httpCtx.Request.Form.Keys.Contains(field.Id.ToString()) is false;

	// https://uibakery.io/regex-library/html-regex-csharp
	private readonly static Regex _htmlTagRegex = new Regex("<(?:\"[^\"]*\"['\"]*|'[^']*'['\"]*|[^'\">])+>", RegexOptions.Compiled);

	private bool ContainsHtml(string input) => _htmlTagRegex.IsMatch(input);
}
```
