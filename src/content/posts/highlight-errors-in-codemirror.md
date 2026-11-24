---
title: "Highlight Errors in CodeMirror"
date: 2013-07-15T13:59:48Z
topics: ["javascript", "umbraco-packages"]
excerpt: "How Optimus for Umbraco highlights the exact line of a compile error in the backoffice's CodeMirror code editor, with a short JavaScript snippet."
draft: false
---

Hello all,
With [the release of Optimus for Umbraco that me & Tim Geyssens](https://web.archive.org/web/20130711181553/http://our.umbraco.org:80/projects/developer-tools/optimus) have built that allows you to create bundles and write Sass, Less, CoffeeScript & TypeScript files directly inside Umbraco.

We wanted a way to highlight any compiling errors with your code that you write, by highlighting the line number in the editor of the Umbraco back office.

The code editor inside Umbraco, uses the [highly popular HTML & JavaScript code editor CodeMirror](https://codemirror.net/). My goal was to highlight the exact line number in the editor so we can visually highlight to the user where in their code that is the problem.

So I will take you through the small code snippet that was used to achieve this:

## Highlighting the line in JavaScript

In the [FileEditor.aspx page](https://github.com/TimGeyssens/BundlingAndMinificationForTheMasses/blob/master/BundlingAndMinificationForTheMasses/Umbraco/Pages/FileEditor.aspx) that we have I wrote the following JavaScript function

```javascript
    function highlightLine(lineNumber) {

        //Line number is zero based index
        var actualLineNumber = lineNumber - 1;

        //Select editor loaded in the DOM
        var myEditor = $("#body_EditorSource .CodeMirror");

        //Write the item to the console window, for debugging
        console.log(myEditor);

        //Select the first item (zero index) just incase more than one found & get the CodeMirror JS object
        var codeMirrorEditor = myEditor[0].CodeMirror;

        //Write the item to the console window, for debugging
        console.log(myEditor[0].CodeMirror);

        //Set line CSS class to the line number & affecting the background of the line
        //with the css class of line-error
        codeMirrorEditor.setLineClass(actualLineNumber, 'background', 'line-error');
    }
```

## Styling the error line

In addition to this I need a small chunk of CSS in order to style the error line in red for it to be easily noticed.

```html
<style>
        .line-error {
            background: #FBC2C4 !important;
            color: #8a1f11 !important;
        }

</style>
```

## Finding the error line when saving

The final thing that needs for this all to come together and work, is that when [the save button is hit on our custom code editor page](https://github.com/TimGeyssens/BundlingAndMinificationForTheMasses/blob/master/BundlingAndMinificationForTheMasses/Umbraco/Pages/FileEditor.aspx.cs), that we check for any errors from the transformers such as Sass & CoffeeScript for example. Parse the line number and pass that to our Javascript function highlightLine().

```csharp
        private bool SaveConfigFile(string filename, string contents)
        {
           //This gets the filename of the Sass, Less, CoffeeScript or TypeScript file
            var path = Request.QueryString["path"] + filename;

            //This gets the full path to the file (Server MapPath'd)
            var fullPath = Server.MapPath(Request.QueryString["path"]) + filename;

            //Open up the file on disk
            using (var text = File.CreateText(fullPath))
            {
                //Save the file contents
                text.Write(contents);

                //Close the text reader, as we are done with it
                text.Close();

                //Check the translation for errors
                var errors = transCore.ValidateTranslation(path);

                //If no errors then...
                if (errors == null || !errors.Any())
                {
                    //Save the translation to disk
                    transCore.SaveTranslation(path);
                    return true;
                }
                else
                {
                    //Get the first exception message out of the collection
                    var exceptionMessage = errors.First().Message;

                    //Set the panel on the page - it's an error type & show the exception message
                    Feedback.type = Feedback.feedbacktype.error;
                    Feedback.Text = exceptionMessage;
                    Feedback.Visible = true;

                    //Get Line number from the exception message - presumes messages always ends with
                    //Line number: 3
                    var lineNumber = exceptionMessage.Split(' ').Last().Replace("\r", "").Replace("\n", "");
                    int.TryParse(lineNumber, out ErrorLineNumber);

                    return false;
                }
            }
```

So that's all the parts of our code that enables us to highlight the line number in the CodeMirror editor.

There is plenty more that could be done with the editor, as [there are many options available to us when we have the CodeMirror object selected in JavaScript](https://codemirror.net/2/doc/manual.html). So let your imagination go wild and start playing around with the code editor inside Umbraco.

Any questions please leave them in the comments.

Thanks,
Warren :)
