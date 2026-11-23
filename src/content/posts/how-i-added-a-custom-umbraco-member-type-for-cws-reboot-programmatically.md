---
title: "How I added a Custom Umbraco Member Type for CWS Reboot programmatically"
date: 2013-07-26
topics: ["umbraco-packages", "umbraco", "tutorials"]
excerpt: "How CWS Reboot creates its custom Umbraco member type and properties in code on startup, because member types can't be included in an Umbraco package."
draft: false
---

Hello all,  
I am currently in the progress of rebuilding and rebooting the CWS Starter Kit project for Umbraco built in MVC on Umbraco 6. For this it will contain a members area and there is no way currently to package up member types and its custom properties.So read on how to find out how I managed to come up with a solution to this problem.

So I solved this problem by writing some code that checks if the Member Type exists on startup of Umbraco using the application event hooks and if it does not exist then to simply create it along with the properties on the Member Type. It was really that simple. So this will auto install the member type the first time the package is run.

## Show me the code!

OK enough already just show us the code, I hear you saying. Well OK here it is - enjoy

```csharp
using umbraco.BusinessLogic;
using umbraco.cms.businesslogic.member;
using Umbraco.Core;

namespace CWSStart.Web.CWSExtensions
{

    public class RegisterStartupEvents : ApplicationEventHandler
    {
        private const int LabelDataTypeID       = -92;
        private const int TextStringDataTypeID  = -88;
        private const int BooleanDataTypeID     = -49;

        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            //Umbraco App has started

            //Ensure our custom member type & it's properties are setup in Umbraco
            //If not let's create it
            MemberGroup checkMemberGroup = MemberGroup.GetByName("CWS-Members");

            //Doesn't exist
            if (checkMemberGroup == null)
            {
                //Add custom member group to Umbraco install
                AddCustomMemberGroup();
            }

            //Ensure our custom member type & it's properties are setup in Umbraco
            //If not let's create it
            MemberType checkMemberType = MemberType.GetByAlias("CWS-Member");

            //Doesn't exist
            if (checkMemberType == null)
            {
                //Add custom member type to Umbraco install
                AddCustomMemberType();
            }
        }

        protected void AddCustomMemberGroup()
        {
            //Admin user
            var adminUser = new User("admin");

            //Let's add our Member Group
            var customMemberGroup = MemberGroup.MakeNew("CWS-Members", adminUser);
            
            //Save it
            customMemberGroup.Save();
        }


        protected void AddCustomMemberType()
        {
            //Admin user
            var adminUser = new User("admin");

            //So let's add it...
            var customMemberType    = MemberType.MakeNew(adminUser, "CWS-Member");
            customMemberType.Text   = "[CWS] Member";
            customMemberType.Alias  = "CWS-Member";

            //Our DataType's (Have to be verbose with namespace, due to conflict with Umbraco.Core.Models)
            var labelDataType       = new umbraco.cms.businesslogic.datatype.DataTypeDefinition(LabelDataTypeID);
            var textstringDataType  = new umbraco.cms.businesslogic.datatype.DataTypeDefinition(TextStringDataTypeID);
            var boolDataType        = new umbraco.cms.businesslogic.datatype.DataTypeDefinition(BooleanDataTypeID);

            //Add the custom properties to our member type
            //Label properties
            customMemberType.AddPropertyType(labelDataType, "resetGUID", "Reset GUID");
            customMemberType.AddPropertyType(labelDataType, "emailVerifyGUID", "Email Verify GUID");
            customMemberType.AddPropertyType(labelDataType, "numberOfLogins", "Number of Logins");
            customMemberType.AddPropertyType(labelDataType, "lastLoggedIn", "Last logged in");
            customMemberType.AddPropertyType(labelDataType, "numberOfProfileViews", "Number of Profile views");            
            customMemberType.AddPropertyType(labelDataType, "hostNameOfLastLogin", "Hostname of last login");
            customMemberType.AddPropertyType(labelDataType, "IPofLastLogin", "IP of last login");
            customMemberType.AddPropertyType(labelDataType, "profileURL", "Profile URL");
            customMemberType.AddPropertyType(labelDataType, "joinedDate", "Joined Date");

            //Boolean properties
            customMemberType.AddPropertyType(boolDataType, "hasVerifiedEmail", "Has Verified Email");

            //Textsring properties
            customMemberType.AddPropertyType(textstringDataType, "description", "Description");
            customMemberType.AddPropertyType(textstringDataType, "twitter", "Twitter");
            customMemberType.AddPropertyType(textstringDataType, "linkedIn", "LinkedIn");
            customMemberType.AddPropertyType(textstringDataType, "skype", "Skype");
            
            //Save the changes
            customMemberType.Save();
        }
        
    }
}
```
