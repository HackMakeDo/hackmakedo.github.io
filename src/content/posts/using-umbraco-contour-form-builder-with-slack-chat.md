---
title: "Using Umbraco Contour form builder with Slack Chat"
date: 2014-08-08
topics: ["umbraco-forms"]
excerpt: "Hiya all, I have written a blog post for a little while. So I thought I would create a package for Umbraco Contour."
heroImage: "/images/blog/using-umbraco-contour-form-builder-with-slack-chat/slack-logo.png"
draft: false
---

Hiya all,
I have written a blog post for a little while. So I thought I would create a package for Umbraco Contour. If you do not know what Umbraco Contour is, surely you have been living under a rock?!

## Umbraco Contour

Umbraco contour is a great little commercial package written by the guys from the Umbraco HQ, that allows anyone to simply create forms and complex forms very easily using a visual editor in the Umbraco backoffice to create forms in.

Contour ships with a ton of default workflow items, that are tasks that run when the form is completed and submitted. For example post the form contents to an email address, or post the form as a new content node in the Umbraco site. There are many different ideas and ways to use the data after it has been submitted.

This is where I came up with the idea of creating a new Contour workflow item for Slack!

## Slack

If you are one of the hipster companies already using Slack in favour of emails then you will already know what it is. However for those who have yet to make the switch, Slack is a great multi platform chat system, that is good at searching and archiving documents and is great for team or project chats and its something we have adopted at The CogWorks where I work, in favour of email.

![Slack Screenshot](/images/blog/using-umbraco-contour-form-builder-with-slack-chat/slack-screenshot.png)

We have a chat room or in Slack's terminology a channel for each project so we can keep all development and project management messages about that particular project in a central place that is easy to search.

I came up with the idea for the Slack Contour workflow item, as I personally hate email & do not check it that often. So I wanted a way to receive the same notification of a form being filled in simply posted to a specific channel in our Slack account.

The use-case is that I want to have the speaker request submissions for the upcoming Umbraco UK Festival conference posted into a specific channel to do with organising the conference, so that these submissions get seen easily by everyone in the team.

So I present to you....

## Slack.Contour

You can[ see the code over on the GitHub repo,](https://github.com/warrenbuckley/Slack-Contour) but as it is so simple I will paste the single class here in this post.

You can [download the project on NuGet](https://www.nuget.org/packages/Slack.Contour/) and as a normal [Umbraco Package ZIP file from Our.Umbraco.org](https://web.archive.org/web/20140820065943/http://our.umbraco.org:80/projects/backoffice-extensions/slack-contour) as well.

I have to thank [Tim Geyssens for inspiration with his implementation recently of a Contour workflow posting to a Podio workspace](https://web.archive.org/web/20140719055721/http://www.nibble.be/?p=424).

To get this to work you need an API token from Slack. You can get one by going to [Slack's API site](https://docs.slack.dev/)

With the token, you need to specify the Username/Bot name you want to post the message as, along with the Channel name you wish to post into and finally a full URL including HTTP to an image to use as the bot's avatar next to the posted message in slack.

## Show me the code

The code should be relatively easy to read & understand but if you have any questions then please ask away in the comments.

```csharp
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net;
using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Attributes;
using Umbraco.Forms.Core.Enums;

namespace Slack.Contour
{
    public class SlackContourWorkflow : WorkflowType
    {
        [Setting("API Token", description = "Slack API token", control = "Umbraco.Forms.Core.FieldSetting.TextField")]
        public string Token { get; set; }

        [Setting("Channel", description = "Slack channel to post to", control = "Umbraco.Forms.Core.FieldSetting.TextField")]
        public string Channel { get; set; }

        [Setting("Username", description = "The username/bot to post as", control = "Umbraco.Forms.Core.FieldSetting.TextField")]
        public string Username { get; set; }

        [Setting("Avatar URL", description = "The full url including http to the avatar image", control = "Umbraco.Forms.Core.FieldSetting.TextField")]
        public string AvatarUrl { get; set; }


        public SlackContourWorkflow()
        {
            this.Id             = new Guid("3edfcb87-4498-4dad-ab16-ba47abe3c8f4");
            this.Name           = "Post form to Slack Chat";
            this.Description    = "Posts the form data to a specific channel on Slack Chat";
        }


        public override WorkflowExecutionStatus Execute(Record record, RecordEventArgs e)
        {
            //Tokenise message with values in form
            var message = string.Format("Someone has posted the form '{0}' at {1}{2}", e.Form.Name, record.Created.ToString("dd/MM/yy @ HH:mm:ss"), Environment.NewLine);
            
            //Loop over fields & add to our message
            foreach (var field in record.RecordFields)
            {
                //Record field item
                var fieldItem   = field.Value;
                var fieldName   = fieldItem.Field.Caption;
                var fieldValue  = fieldItem.ValuesAsString();

                //Add the field name & value to the message string
                message += string.Format("{0}: {1}{2}", fieldName, fieldValue, Environment.NewLine);
            }


            //Ensure Channel starts with #
            if (!Channel.StartsWith("#"))
            {
                Channel = string.Format("#{0}", Channel);
            }


            using (var client = new WebClient())
            {
                //Set the form data values
                var values = new NameValueCollection();
                values.Add("channel", Channel);
                values.Add("token", Token);
                values.Add("username", Username);
                values.Add("icon_url", AvatarUrl);
                values.Add("text", message);

                try
                {
                    //Post the data to Slack API
                    var data = client.UploadValues("https://slack.com/api/chat.postMessage", "POST", values);

                    //Try & decode the JSOn string back from Slack API
                    var response = client.Encoding.GetString(data);

                    //Log the response from Slack
                    Umbraco.Core.Logging.LogHelper.Debug<SlackContourWorkflow>("Slack.Contour - Return API Value:" + response);


                    //All is OK return as completed
                    return WorkflowExecutionStatus.Completed;
                }
                catch (WebException ex)
                {
                    //Log the exception/error
                    Umbraco.Core.Logging.LogHelper.Error<SlackContourWorkflow>("Error in Slack.Contour", ex);

                    //Notify Contour that Workflow Failed
                    return WorkflowExecutionStatus.Failed;
                }
            }
        }

        public override List<Exception> ValidateSettings()
        {
            var errors = new List<Exception>();

            if (string.IsNullOrEmpty(Token))
            {
                errors.Add(new Exception("'API Token' setting has not been set"));
            }

            if (string.IsNullOrEmpty(Channel))
            {
                errors.Add(new Exception("'Channel' setting has not been set"));
            }

            if (!Channel.StartsWith("#"))
            {
                errors.Add(new Exception("'Channel' is missing # at beginning"));
            }

            if (string.IsNullOrEmpty(Username))
            {
                errors.Add(new Exception("'Username' setting has not been set"));
            }

            if (string.IsNullOrEmpty(AvatarUrl))
            {
                errors.Add(new Exception("'Avatar URL' setting has not been set"));
            }

            return errors;
        }
    }
}
```
