---
title: "Restrict Umbraco Media Filesize with JS"
date: 2013-09-23
topics: ["tutorials", "javascript"]
excerpt: "For Umbraco 6 and earlier: restrict media upload file sizes and show a friendly error, with a .NET user control in the UserControl Wrapper and some JavaScript."
draft: false
---

Hello all,
This is a very quick & brief blog post for a quick code snippet. I had a requirement today to at [The CogWorks](https://www.wearecogworks.com/) restrict file size upload for media items in Umbraco and to display a friendly error message.

For this to work easily, I created a .NET usercontrol with the following in:

```csharp
<script type="text/javascript">
 //Go get file size from .config value in bytes
 var fileSizeToCheck = <%= ((HttpRuntimeSection) ConfigurationManager.GetSection("system.web/httpRuntime")).MaxRequestLength %>
</script>
<script type="text/javascript" src="/usercontrols/MediaFileSize/MediaFileSizeValidation.js"></script>

<div id="fileSize"></div>
```

The next part was to create a custom document type in Umbraco using the UserControl Wrapper method and pointing the datatype to my newly created usercontrol.

The next step was to assign this document type as a property on my image media type. I gave it name like FileSize Check, however this name does not matter as I do not use the property value at all, it's only purpose is to run the custom Javascript inside it, which is as follows:

```javascript
//When DOM ready
$(function () {
    
    //Get the File Size DOM element & hide it's label & property area
    $('#fileSize').closest('.propertypane').hide();

    //On form submit
    $("form").on("submit", function (event) {

        //Get the file input type
        var fileInput = $("input[type=file]")[0];

        console.log(fileInput);
        console.log(fileSizeToCheck);

        //Validate filesize
        if (!validateFileSize(fileInput, fileSizeToCheck)) {
            
            //Show validtion message
            UmbClientMgr.mainWindow().UmbSpeechBubble.ShowMessage('error', 'File Size', 'The file chosen is too big, please choose a smaller file than ' + fileSizeToCheck/1024 + 'kb');
            
            //Cancel form event
            event.preventDefault();
        }        
    });
});

///http://deepeshdarshan.wordpress.com/2012/06/20/how-to-validate-upload-file-size-and-file-extension-using-javascript/
function validateFileSize(component, maxSize) {
    
    if (navigator.appName == "Microsoft Internet Explorer") {
        if (component.value) {
            var oas = new ActiveXObject("Scripting.FileSystemObject");
            var e = oas.getFile(component.value);
            var size = e.size;
        }
    }
    else {
        if (component.files[0] != undefined) {
            size = component.files[0].size;
        }
    }
    
    if (size != undefined && size > maxSize) {
        component.value = "";
        component.focus();
        
        return false;
    }
    else {
        return true;
    }
}
```

As you can see from the JavaScript I first hide the property from the Umbraco backoffice UI, as we don't need to show a label and an emtpy box for the media UI, but the main part of the code hooks into the form on submit event and then grabs the file input type and passes it to the validateFileSize function(). If the file is too big then we display an error message using the Umbraco message notification bubble in the bottom right hand corner.

Well that's all there is to it.
Hopefully this little snippet will have helped you out.

Cheers,
Warren :)
