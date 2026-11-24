---
title: "Scaffold Umbraco V14+ Package Development Project with Vite, TypeScript & Lit"
date: 2024-06-03
topics: ["tutorials", "javascript", "tooling", "bellissima"]
excerpt: "This PowerShell script magically sets up an Umbraco V14+ project with Vite, TypeScript & Lit, summoned in one go. Hocus Pocus!"
draft: false
---

Heya 👋  
I wanted to share a quick Powershell script I created to help me scaffold a new project for Umbraco packages developed for V14.

As there are quite a few steps to create the projects and setup the client side tooling with Vite and removing unnecessary files & npm scripts that are not needed.

## Just show me the script already

```powershell
## Setup of an Umbraco V14+ project with Vite, TypeScript & Lit
## Author: Warren Buckley
## HackMakeDo.com

## if project name is not provided, ask for it
if (-not $ProjectName) {
    $ProjectName = Read-Host "Enter a project name"
}

## Variables
$ProjectName = $ProjectName.Replace(" ", ".")
$ProjectNameLower = $ProjectName.ToLower()
$WebsiteProjectName = $ProjectName + '.Website'
$WebsiteProjectCSProj = $WebsiteProjectName + '.csproj'
$RCLProjectName = $ProjectName
$RCLProjectCSProj = $RCLProjectName + '.csproj'
$ClientProjectName = $ProjectName + '.Client'

## Folder Paths
$RootFolder = $PSScriptRoot
$WebsiteProjectPath = Join-Path -Path $PSScriptRoot -ChildPath $WebsiteProjectName
$WebsiteCSProjPath = Join-Path -Path $WebsiteProjectPath -ChildPath $WebsiteProjectCSProj
$RCLProjectPath = Join-Path -Path $PSScriptRoot -ChildPath $RCLProjectName
$RCLCSProjPath = Join-Path -Path $RCLProjectPath -ChildPath $RCLProjectCSProj
$ClientProjectPath = Join-Path -Path $PSScriptRoot -ChildPath $ClientProjectName

## LETS GO !!
## Create a default gitignore file
dotnet new gitignore

## Create a new solution
dotnet new sln -n $ProjectName

## Install Umbraco Templates
dotnet new install Umbraco.Templates

## Create a new project that is a website
dotnet new umbraco -n $WebsiteProjectName

## Create the RCL project for the C# and clienside stuff
dotnet new umbracopackage-rcl -n $ProjectName

## Add the website project to the solution
dotnet sln add $WebsiteCSProjPath

## Add the RCL project to the solution
dotnet sln add $RCLCSProjPath

## Delete the wwwroot/umbraco-package.json file
## The Vite setup will add this file from the client folder stuff
Remove-Item -Path "$RCLProjectPath/wwwroot/umbraco-package.json"

## Add the RCL project to the Website project as a project reference
dotnet add $WebsiteCSProjPath reference $RCLCSProjPath

## Create Vite TypeScript & Lit setup
## For vite to be happy it needs to be lowercase
npx create-vite@latest $ClientProjectName.ToLower() --template lit-ts

## Delete the files from vite setup we dont need
Remove-Item -Path "$ClientProjectPath/public/vite.svg"
Remove-Item -Path "$ClientProjectPath/src/assets" -Recurse
Remove-Item -Path "$ClientProjectPath/src/index.css"
Remove-Item -Path "$ClientProjectPath/src/my-element.ts"
Remove-Item -Path "$ClientProjectPath/index.html"

## create vite.config.ts
$ViteConfig = @"
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts", // Entrypoint file (registers other manifests)
            formats: ["es"],
            fileName: "$ProjectNameLower",
        },
        outDir: "../$RCLProjectName/wwwroot", // your web component will be saved to the RCL project location and the RCL sets the path as App_Plugins/$ProjectName
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
});
"@
$ViteConfigPath = Join-Path -Path $ClientProjectPath -ChildPath "vite.config.ts"
$ViteConfig | Out-File -FilePath $ViteConfigPath -Encoding utf8

## create umbraco-package.json
$UmbracoPackageJson = @"
{
    "`$schema": "../../$WebsiteProjectName/umbraco-package-schema.json",
    "id": "$ProjectNameLower",
    "name": "$ProjectName",
    "allowPackageTelemetry": true,
    "version": "1.0.0",
    "extensions": [
        {
          "name": "$ProjectName EntryPoint",
          "alias": "$ProjectNameLower.entrypoint",
          "type": "backofficeEntryPoint",
          "js": "/app_plugins/$RCLProjectName/$ProjectNameLower.js"
        }
      ]
}
"@
$UmbracoPackageJsonPath = Join-Path -Path $ClientProjectPath -ChildPath "/public/umbraco-package.json"
$UmbracoPackageJson | Out-File -FilePath $UmbracoPackageJsonPath -Encoding utf8

## inside src folder create index.ts
## Its an entrypoint file to register manifests
$IndexTs = @"
import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
export const onInit: UmbEntryPointOnInit = (_host, _extensionRegistry) => {

    console.log('Hello from $ProjectName!');

    // We can register many manifests at once via code 
    // as opposed to a long umbraco-package.json file
    // _extensionRegistry.registerMany([
    //     ...entityActionManifests,
    //     ...modalManifests
    // ]);
};
"@
$IndexTsPath = Join-Path -Path $ClientProjectPath -ChildPath "src/index.ts"
$IndexTs | Out-File -FilePath $IndexTsPath -Encoding utf8

## Add .vscode folder and recommended lit extension
New-Item -Path "$ClientProjectPath/.vscode" -ItemType Directory
$ExtensionsJson = @"
{
    "recommendations": [
        "runem.lit-plugin"
    ]
}
"@
$ExtensionsJsonPath = Join-Path -Path $ClientProjectPath -ChildPath ".vscode/extensions.json"
$ExtensionsJson | Out-File -FilePath $ExtensionsJsonPath -Encoding utf8


## update package.json scripts section
## Remove 'dev' and 'preview' scripts
## Add 'watch' script with 'vite build --watch'
$PackageJsonPath = Join-Path -Path $ClientProjectPath -ChildPath "package.json"
$PackageJson = Get-Content -Path $PackageJsonPath | ConvertFrom-Json
$PackageJson.scripts.PSObject.Properties.Remove("dev")
$PackageJson.scripts.PSObject.Properties.Remove("preview")
$PackageJson.scripts | Add-Member -MemberType NoteProperty -Name "watch" -Value "vite build --watch" -Force
$PackageJson | ConvertTo-Json | Out-File -FilePath $PackageJsonPath -Encoding utf8

## Change directory to JS proj
Set-Location -Path $ClientProjectPath

## Need to run 'npm install --save-dev @umbraco-cms/backoffice'
npm install --save-dev @umbraco-cms/backoffice

## Compile the TS to JS & it will copy it out to the RCL project in the wwwroot folder
npm run build

## Build the VS solution (building will generate the JSON schema for umbraco-package.json that we reference)
Set-Location -Path $RootFolder
dotnet build
```

The PowerShell script is available as a GitHub Gist:

<hmd-gist class="hmd-gist" gist="warrenbuckley/a799a14562a8d8f5be2bf7c6671dc547" label="PowerShell script to scaffold an Umbraco v14 package project">
  <a class="hmd-gist__fallback" href="https://gist.github.com/warrenbuckley/a799a14562a8d8f5be2bf7c6671dc547">View the gist on GitHub ↗</a>
</hmd-gist>

## What does it do?

Hopefully the comments within the script are kinda self explanatory, however as a quick overview it does the following

- Creates a gitignore file
- Creates a new Solution named from the project input given to the script
- Installs the latest Umbraco.Templates from Nuget so its always upto date
- Creates a new Umbraco Website project named ProjectName.Website that we will use as the testing site of our package code
- Creates a new Umbraco RCL project called ProjectName
- Remove the umbraco=package.json file from the RCL project as we will use Vite and the Javascript client to copy this in
- Adds the two projects to the Solution
- Adds a reference to the RCL project to the Website project to help test out our work
- Uses Vite to scaffold a template for using Lit with TypeScript
- Removes files we do not need from Vite, such as their SVG logo and other files
- Creates a vite.config.ts to tell Vite about our entrypoint file and to place the build output into the RCL projects wwwroot folder
- Creates an umbraco-package.json file that will be copied to the RCL wwwroot folder that uses the entrypoint approach of registering further manifests with code
- Creates the index.ts entrypoint file which allows us to register more manifests into Umbraco
- Removes the dev and preview NPM scripts from Vite template
- Adds a new NPM script to watch the TypeScript files and to recompile the bundle as needed
- Installs the @umbraco-cms/backoffice NPM package to get completions and typings for our codebase
- And finally does a build of the dotnet solution
- Phew.... that was a lot of steps

As you can see its quite a few steps to get up and running hence the script was born.
