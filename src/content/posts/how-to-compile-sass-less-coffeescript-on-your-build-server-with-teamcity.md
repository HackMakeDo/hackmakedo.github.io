---
title: "How to compile Sass, Less & CoffeeScript on your build server with TeamCity"
date: 2013-08-01
topics: ["javascript", "tooling"]
excerpt: "A PowerShell build step for TeamCity that compiles Sass, Less and CoffeeScript on the build server, so compiled files never get out of sync in source control."
draft: false
---

Hiya this post will be relatively quick & brief and will show you how I wrote a PowerShell file to help us dynamically compile Sass, Less & CoffeeScript files from our web projects, so that we never have to compile them locally on our machines and commit the ouput of the file to source control, as this has caused a few issues before with the team where the files have strangely got out of sync.

## Show me the code!

OK so the Powershell file is something we run as a build step in our project on the TeamCity build server. I am sure other build servers will allow you to run PowerShell as well.

This code is heavily commented, so you should be able to see quite easily what is going on, but any questions ask away in the comments.
One more thing to note that the command line tool that we are using to compile these files comes with a [Visual Studio addin called Mindscape Web WorkBench](http://www.mindscapehq.com/products/web-workbench) and is easily worth the $40 or so for the license.

```powershell
#Powershell file to compile Sass, Less & CoffeeScript files

#Have to pass in the filename of the txt file to read
Param(
	[Parameter(Mandatory=$true, HelpMessage="You must pass the full path to the .txt file that has the list of files to compile.")]
	$preProcessorFile,
	[Parameter(Mandatory=$true, HelpMessage="You must pass the full path to the folder where the web root files live.")]
	$webRootFolder
	)

#Hardcoded Param Values
#$preProcessorFile = "C:\inetpub\wwwroot\CogWorks\SASS-Test\Build\preprocessors.txt"
#$webRootFolder = "C:\inetpub\wwwroot\CogWorks\SASS-Test\Source\SASSCompileTest.Web"

#Output some variables for debuggin
Write-Host "`n**********************************************************" -ForegroundColor Magenta 
Write-Host "*" -ForegroundColor Magenta -nonewline; Write-Host " Parameters"
Write-Host "*" -ForegroundColor Magenta -nonewline; Write-Host " File Name:`t`t" -nonewline; Write-Host "$preProcessorFile" -ForegroundColor DarkGreen
Write-Host "*" -ForegroundColor Magenta -nonewline; Write-Host " Web Root Folder:`t`t" -nonewline; Write-Host "$webRootFolder" -ForegroundColor DarkGreen

#Check that the preprocessors.txt file exists
if (Test-Path  ($preProcessorFile))
{

	#Set the location to be the web root folder
	Set-Location $webRootFolder

	#Get the file contents of the .txt file
	$preProcessorsContents = Get-Content $preProcessorFile

	#Path to CommandLine exe
	[string]$pathToExe = "C:\Program Files (x86)\Mindscape\Web Workbench\Command Line\wwcmd.exe"


	#Function to GetArgs and put them into a string array
	function GetArgs
	{
		$argArray = @()

		$line.Split(" ") | ForEach {
	    	#Write-Host "Token: $_" -ForegroundColor Red
			$argArray += $_
	 	}

	  	return ,$argArray
	}


	#Ouput some more params
	Write-Host "*" -ForegroundColor Magenta -nonewline; Write-Host " Path to EXE:`t`t" -nonewline; Write-Host "$pathToExe" -ForegroundColor DarkGreen
	Write-Host "*" -ForegroundColor Magenta -nonewline; Write-Host " Pre Processors File Contents`t`t" -nonewline; Write-Host "$preProcessorsContents" -ForegroundColor DarkGreen
	Write-Host "*" -ForegroundColor Magenta -nonewline; Write-Host "Start For Each"


	#for each line in the text file...
	foreach ($line in $preProcessorsContents) {
		#Lets output for debugging what is on each line
		Write-Host "*" -ForegroundColor Red -nonewline; Write-Host " Line:`t`t" -nonewline; Write-Host "$line" -ForegroundColor DarkGreen
			
		#Run Function....
		$args = GetArgs
		
		#Lets output for debugging what is on each line
		Write-Host "*" -ForegroundColor Red -nonewline; Write-Host " Get Args (Array)`t`t" -nonewline; Write-Host "$args" -ForegroundColor DarkGreen
		
		#Get just the path to file in the array
		$pathToPreProcessorFile = $args[0]
		
		#Lets output for debugging what is on each line
		Write-Host "*" -ForegroundColor Red -nonewline; Write-Host " Path to Preprocessor File`t`t" -nonewline; Write-Host "$pathToPreProcessorFile" -ForegroundColor DarkGreen
		
		#Concat the filepath to a string
		$absolutePathToPreProcessorFile = [string]::Concat($webRootFolder,$pathToPreProcessorFile)
		
		#Lets output for debugging what is on each line
		Write-Host "*" -ForegroundColor Red -nonewline; Write-Host " Absolute Path to Preprocessor File`t`t" -nonewline; Write-Host "$absolutePathToPreProcessorFile" -ForegroundColor DarkGreen
		
		#Update first item in the array now we have absolute path
		$args[0] = $absolutePathToPreProcessorFile
		
		#Lets output for debugging what is on each line
		Write-Host "*" -ForegroundColor Red -nonewline; Write-Host " Args (Array) `t`t" -nonewline; Write-Host "$args" -ForegroundColor DarkGreen	
		
		
		#Let's run the command
		& $pathToExe $args
	}

	Write-Host "*" -ForegroundColor Magenta -nonewline; Write-Host " End For Each"
}
else {
	Write-Host "*" -ForegroundColor Magenta -nonewline; Write-Host " Preprocessors txt file not found"
}

Write-Host "`n**********************************************************" -ForegroundColor Magenta
```

Then in our preprocessors.txt file that we commit into the repo, we can specify which files we want to compile and pass in any compiling options such as minify or show debug info we can pass those in as well.

```
\css\sass\site.scss /debuginfo /m 
\css\sass\about.scss /m
\scripts\coffee\test.coffee /m
```
