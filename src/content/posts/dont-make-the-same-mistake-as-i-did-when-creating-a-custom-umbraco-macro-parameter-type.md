---
title: "Don't make the same mistake as I did when creating a custom Umbraco macro parameter type"
date: 2013-07-24
topics: ["umbraco", "tutorials"]
excerpt: "In this blog post I will share with you some advice and a code example of a custom Umbraco macro parameter I built for a client Umbraco package."
draft: false
---

In this blog post I will share with you some advice and a code example of a custom Umbraco macro parameter I built for a client Umbraco package.

This needed to be able to exclude document types, but the list shown to them needed to be filtered to begin with. By hiding document types that have no templates and by also excluding a predetermined list of document types such as configuration folders etc...

So read on to find out how I achieved it with some help of my colleague Anthony Dang to help debug an issue with it, which I will discuss later on.

## What is a custom macro parameter type?

A macro parameter type is a way of defining a GUI when your content editor inserts your macro into a template or rich text editor (RTE). Some macros require parameters such as booleans, textstring and content nodes to be passed through to the macro underneath. When creating your macro there is the parameters tab where you can define custom parameters for your macro.

For each parameter there is a dropdown containing a list of macro parameter types such as boolean, textstring, content picker etc.. These types are macro parameters and my goal is to show you how to create your own custom macro parameter type to be defined in that list for you to use.

## Show me the code!

I learnt how to create a custom macro parameter type yesterday from [reading the documentation on our.umbraco.org](https://web.archive.org/web/20130907094112/http://our.umbraco.org:80/documentation/extending-umbraco/macro-parameter-editors/) and [by reading Richard S blog post on the same topic](https://web.archive.org/web/20130907100429/http://www.richardsoeteman.net:80/2010/01/04/CreateACustomMacroParameterType.aspx).

Here I will show you the class I wrote to create my filtered checkbox list of document types, only showing Document Types that have a template assigned to them.

```csharp
using System;
using System.Linq;
using System.Web.UI.WebControls;
using umbraco.cms.businesslogic.web;
using umbraco.interfaces;

namespace ClientSite.Web
{
    //Inherit from CheckboxList & IMacroGuiRendering
    public class FilteredDocTypeMacroParameter : CheckBoxList, IMacroGuiRendering
    {
        private string StoredValue = string.Empty;

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

            //Get all DocTypes that ONLY have templates
            var docTypeAliases = DocumentType.GetAllAsList().Where(x => x.HasTemplate());
           
            //Check we have no items in the collection
            if (this.Items.Count == 0)
            {
                //Get the CSV string from the StoredValue
                var selectedItems = StoredValue.Split(",".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);

                foreach (var doctype in docTypeAliases)
                {
                    //Create a list item
                    var item = new ListItem()
                    {
                        Text        = doctype.Text,
                        Value       = doctype.Id.ToString(),
                        Selected    = selectedItems.Contains(doctype.Id.ToString()) //Check if this item is in the selectedItems collection, if so check this item to be selected
                    };

                    //Add a new list item (with the name of the docType and it's ID as the value)
                    this.Items.Add(item);
                }
            }
        }

        public bool ShowCaption
        {
            get { return true; }
        }

        public string Value
        {
            get
            {
                var selectedItems = this.Items.Cast<ListItem>().Where(x => x.Selected).Select(x => x.Value);

                //Convert it to a CSV string (store the ID's of the doctype aliases as opposed to names or aliases)
                return string.Join(",", selectedItems);
            }
            
            set
            {
                //Store the value (CSV) in a private string that we can use in the OnLoad method
                StoredValue         = value;
                this.SelectedValue  = value;
            }
        }
    }
}
```

## Registering it in the database

For it to be registered in Umbraco it currently needs to add a record to a table in the Umbraco database.

The table where we need to insert our record is **cmsMacroPropertyType** which contain the following columns:

- Id
- macroPropertyTypeAlias
- macroPropertyTypeRenderAssembly
- macroPropertyTypeRenderType
- macroPropertyTypeBaseType

So for this example I need to add the following to the table:

- **macroPropertyTypeAlias (Friendly alias):** filteredDocType
- **macroPropertyTypeRenderAssembly (Namespace):** ClientSite.Web
- **macroPropertyTypeRenderType (Class Name):** FilteredDocTypeMacroParameter
- **macroPropertyTypeBaseType (Type of data stored):** String

## Using the values in a Razor macro

We are then able to use the values in our Razor macro file:

```csharp
//Get the value from the Macro Parameter
//Array of strings (1234, 4234)
var excludeNodeTypeIds  = (string) Parameter.ExcludeNodeTypeIds;      

//Split & shove them in array's (For each item in split, select the item & covert to an int)
var excludedNodeTypeIdsArray = excludeNodeTypeIds.Split(",".ToCharArray(), StringSplitOptions.RemoveEmptyEntries).Select(int.Parse);

//Filter the nodes (Untested Example)
var filteredNodes = childrenToFilter.Where(!excludedNodeTypeIdsArray.Contains(x.DocumentTypeId)));
```

## So what is the mistake you shouldn't make?

Anthony and me yesterday spent a good hour and a half to nearly trying to figure out and debug this problem, for this I want to share you with the problem we encountered so that you don't have to suffer the same pain as we did.

The problem that we came across is that the class we created for this was put into a folder called **MacroParam** so Visual studio created the namespace for the class as follows, **ClientSite.Web.MacroParam**. So the entry we put into the database for the Render Assembly was ClientSite.Web.MacroParam which is the namespace to the class containing our custom Macro Parameter. This did not work and we simply tried changing it just **ClientSite.Web** and this did not work either and we simply couldn't figure out why.

The problem was that our root namespace is **ClientSite.Web** which compiles the code down into an assembly called **ClientSite.Web.dll**. So the problem is that our assembly name did not match our namespace that contained the class with the custom macro parameter type, Umbraco could then not load it. For us to get around this we simply changed the namespace in our class file from **ClientSite.Web.MacroParam** which is the default due to the child folder we setup and changed it to **ClientSite.Web** which is the root namespace and matches the DLL filename. By doing so it was automagically picked up by Umbraco and then rendered.

Hopefully you will remember this and not make the same mistake that Anthony and I made.
Until next time.

Cheers,
Warren
