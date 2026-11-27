---
title: "How I learnt a new programming language over Hacktoberfest: by creating an Umbraco segment for Oh My Posh"
date: 2023-10-31
topics: ["tooling"]
excerpt: "Over Hacktoberfest I learnt Go by building an Umbraco segment for Oh My Posh, so your terminal prompt shows the Umbraco version in each folder."
heroImage: "/images/blog/how-i-learnt-a-new-programming-language-over-hacktoberfest-by-creating-an-umbraco-segment-for-oh-my-posh/oh-my-posh-umbraco-terminal.png"
draft: false
---

Hello 👋 It's been a while since I blogged, but I wanted to share with you what I worked on over the Hacktoberfest period.

For those who don't know [Hacktoberfest](https://hacktoberfest.com) is where Open Source repositories and communities who are participating ask for contributions be it in the form of code pull requests, documentation, design or anything else to help that project.

For me I wanted to challenge myself a little and work on a new project or codebase that I have never worked with before, but also by contributing something that I would like to use myself day to day.

Earlier in the month I watched a [video of Scott Hanselman pair programming with Jan De Dobbeleer on building a custom segment for his terminal](https://www.youtube.com/watch?v=_meKUIm9NwA) so that he can see his blood sugar levels in real-time. Even though they at times had struggled in this livestream, it was enough to inspire me to contribute to the [Oh My Posh project](https://ohmyposh.dev).

## So What Did I Want To Build?

For my main Hacktoberfest contribution I wanted to build a custom segment for the open source project Oh My Posh to show the current version of Umbraco found in the current folder within my terminal prompt. As I regularly switch between different projects and different versions of Umbraco, I thought this would be a useful addition for myself and potentially any other Umbraco developers.

After deciding this is what I wanted to do, I cloned the GitHub project locally on my machine and tried to get straight to work by opening the project up in VSCode, however I soon realised that the Oh My Posh was written with Go and that I have never used or written anything with the Go language. This was problematic as I was unsure on what tooling and dependencies I needed installed on my machine.

I almost gave up on the idea of contributing and remembered what I saw in the video with Scott and Jan. The Oh My Posh project has a [custom DevContainer configuration](https://containers.dev) to help support new contributors such as myself and that I could easily create a GitHub CodeSpace.

Creating the [GitHub CodeSpace](https://github.com/features/codespaces) was as simple as clicking the green **Code** button on the GitHub repository page and clicking the **Codespaces **tab to Create a new codespace.

![The Codespaces tab of the Code menu on a GitHub repository, with a Create codespace on main button](/images/blog/how-i-learnt-a-new-programming-language-over-hacktoberfest-by-creating-an-umbraco-segment-for-oh-my-posh/image.png)

In doing so, the GitHub CodeSpace (DevContainer) configuration would configure a machine in the cloud and open up the project inside Visual Studio Code within the browser. What it had done for me magically behind the scenes was ensure I had the tooling and dependencies for writing with Go.

So now all I had to do was read the [detailed Contributing documentation](https://ohmyposh.dev/docs/contributing/segment) in the project and watch the video back of Scott and Jan to get some pointers on what files I needed to create.

The next stumbling part of the project for me was that I was unfamiliar with the Go language and its syntax but another GitHub product to help save the day. With the GitHub Codespace I was able to install and use[ GitHub Copilot the AI assistant](https://github.com/features/copilot) who understands code. So I was able to ask Copilot how to generate a loop or read and parse contents of an XML file, it was enough to get me started and going in the right direction with what I wanted to do.

Lots of reading, trial and error and feedback and discussions on [the PR from the maintainer Jan](https://github.com/JanDeDobbeleer/oh-my-posh/pull/4309) and I managed to finally achieve what I set out to do 🎉

## So I present to you my Hacktoberfest contribution...

A **NEW** [Umbraco segment for Oh My Posh](https://ohmyposh.dev/docs/segments/cli/umbraco), which is now available in the latest release of Oh My Posh 🎉🚀

<figure class="hmd-figure">
  <img src="/images/blog/how-i-learnt-a-new-programming-language-over-hacktoberfest-by-creating-an-umbraco-segment-for-oh-my-posh/oh-my-posh-umbraco-terminal.png" alt="A screenshot showing a terminal that highlights a new segment in the prompt software called Oh My Posh highlighting the current Umbraco version found in that folder" loading="lazy" />
  <figcaption>Here you can see the new Umbraco segment telling us the version of the Umbraco site in this folder is 12.0.1</figcaption>
</figure>

### Already use Oh My Posh?

Below is the JSON needed to add the [Umbraco segment](https://ohmyposh.dev/docs/segments/cli/umbraco) into your own Oh My Posh theme file in order to display the Umbraco segment. The below snippet is in the same style as my favourite theme **[jandedobbeleer](https://ohmyposh.dev/docs/themes#jandedobbeleer)** which is the default theme that comes from Oh My Posh.

```javascript
{
  "type": "umbraco",
  "template": " \udb81\udd49 {{ .Version }} ",
  "powerline_symbol": "\ue0b0",
  "style": "powerline",
  "background_templates": [
    "{{ if (.Modern) }}#3544B1{{ end }}",
    "{{ if not (.Modern) }}#F79C37{{ end }}"
  ],
  "foreground_templates": [
    "{{ if (.Modern) }}#ffffff{{ end }}",
    "{{ if not (.Modern) }}#000000{{ end }}"
  ]
},
```

## How do I get my own terminal like that?

If you are like me and prefer to learn by watching than reading, then have no fear. I have got you covered with this video below, if not then carry on reading to see the steps needed to get your terminal looking a lot prettier.

**VIDEO COMING SOON..**.

*Note the following steps for this tutorial are intended for Windows users*

### Install Windows Terminal

If you are on Windows 11, then Windows Terminal is now part of the operating system, but if you are running Windows 10 you may need to [install it from the Microsoft Store](https://aka.ms/terminal).

### Install Oh My Posh

The next step is to [install the prompt Oh My Posh](https://ohmyposh.dev/docs/installation/windows) for your chosen shell which is most likely to be Powershell as it comes with Windows.

You can install Oh My Posh from the Microsoft Store or using the command line with winget.

```
winget install JanDeDobbeleer.OhMyPosh -s winget
```

### Install a Font

The pretty terminal prompts you see with fancy icons, requires a custom patched font from [NerdFonts](https://www.nerdfonts.com/font-downloads). However it is possible to get Oh My Posh to help you [install the font for you by following their documentation](https://ohmyposh.dev/docs/installation/fonts) and running the command.

```
oh-my-posh font install
```

Once you have chosen your desired font, you will need to configure Windows Terminal to use it.

### Using Oh My Posh with Powershell

Next we want to tell [Powershell to use Oh My Posh as part of it's prompt](https://ohmyposh.dev/docs/installation/prompt). Use the following command to open up your Powershell profile script in Notepad.

```
notepad $PROFILE
```

If it complains of an error of the file not existing then you can run this command to create the file before running the above command again.

```
New-Item -Path $PROFILE -Type File -Force
```

With the file now open in Notepad, we need to add the following to the file and save it. After doing so restart Windows terminal and all has gone well we now have a prettier prompt in our terminal.

```
# Run oh-my-posh when a new powershell instance starts using the default oh-my-posh theme that ships
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/jandedobbeleer.omp.json" | Invoke-Expression 
```

### Adding the Umbraco Segment

You will need to make a copy of the **[jandedobbeleer.omp.json](https://ohmyposh.dev/docs/themes#jandedobbeleer)** theme and add in the Umbraco segment to the new copy. You can do this by running the command which will create the file jandedobbeleer.umbraco.omp.json at the root of your C drive.

```
oh-my-posh config export --output c:/jandedobbeleer.umbraco.omp.json
```

Using a text editor such as VSCode, we can modify this JSON file and add in our custom Umbraco segment. For me I placed the new segment after the AWS segment. If you prefer you can simply copy and paste my configuration below.

```javascript
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "version": 2,
  "final_space": true,
  "console_title_template": "{{ .Shell }} in {{ .Folder }}",
  "blocks": [
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        {
          "type": "session",
          "style": "diamond",
          "foreground": "#ffffff",
          "background": "#c386f1",
          "leading_diamond": "\ue0b6",
          "trailing_diamond": "\ue0b0",
          "template": " {{ .UserName }} "
        },
        {
          "type": "path",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#ffffff",
          "background": "#ff479c",
          "template": " \uea83  {{ .Path }} ",
          "properties": {
            "folder_separator_icon": " \ue0b1 ",
            "home_icon": "~",
            "style": "folder"
          }
        },
        {
          "type": "git",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#193549",
          "background": "#fffb38",
          "background_templates": [
            "{{ if or (.Working.Changed) (.Staging.Changed) }}#FF9248{{ end }}",
            "{{ if and (gt .Ahead 0) (gt .Behind 0) }}#ff4500{{ end }}",
            "{{ if gt .Ahead 0 }}#B388FF{{ end }}",
            "{{ if gt .Behind 0 }}#B388FF{{ end }}"
          ],
          "leading_diamond": "\ue0b6",
          "trailing_diamond": "\ue0b4",
          "template": " {{ .UpstreamIcon }}{{ .HEAD }}{{if .BranchStatus }} {{ .BranchStatus }}{{ end }}{{ if .Working.Changed }} \uf044 {{ .Working.String }}{{ end }}{{ if and (.Working.Changed) (.Staging.Changed) }} |{{ end }}{{ if .Staging.Changed }} \uf046 {{ .Staging.String }}{{ end }}{{ if gt .StashCount 0 }} \ueb4b {{ .StashCount }}{{ end }} ",
          "properties": {
            "branch_max_length": 25,
            "fetch_stash_count": true,
            "fetch_status": true,
            "fetch_upstream_icon": true
          }
        },
        {
          "type": "node",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#ffffff",
          "background": "#6CA35E",
          "template": " \ue718 {{ if .PackageManagerIcon }}{{ .PackageManagerIcon }} {{ end }}{{ .Full }} ",
          "properties": {
            "fetch_version": true
          }
        },
        {
          "type": "go",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#111111",
          "background": "#8ED1F7",
          "template": " \ue626 {{ if .Error }}{{ .Error }}{{ else }}{{ .Full }}{{ end }} ",
          "properties": {
            "fetch_version": true
          }
        },
        {
          "type": "julia",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#111111",
          "background": "#4063D8",
          "template": " \ue624 {{ if .Error }}{{ .Error }}{{ else }}{{ .Full }}{{ end }} ",
          "properties": {
            "fetch_version": true
          }
        },
        {
          "type": "python",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#111111",
          "background": "#FFDE57",
          "template": " \ue235 {{ if .Error }}{{ .Error }}{{ else }}{{ .Full }}{{ end }} ",
          "properties": {
            "display_mode": "files",
            "fetch_virtual_env": false
          }
        },
        {
          "type": "ruby",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#ffffff",
          "background": "#AE1401",
          "template": " \ue791 {{ if .Error }}{{ .Error }}{{ else }}{{ .Full }}{{ end }} ",
          "properties": {
            "display_mode": "files",
            "fetch_version": true
          }
        },
        {
          "type": "azfunc",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#ffffff",
          "background": "#FEAC19",
          "template": " \uf0e7{{ if .Error }}{{ .Error }}{{ else }}{{ .Full }}{{ end }} ",
          "properties": {
            "display_mode": "files",
            "fetch_version": false
          }
        },
        {
          "type": "aws",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#ffffff",
          "background_templates": [
            "{{if contains \"default\" .Profile}}#FFA400{{end}}",
            "{{if contains \"jan\" .Profile}}#f1184c{{end}}"
          ],
          "template": " \ue7ad {{ .Profile }}{{ if .Region }}@{{ .Region }}{{ end }} ",
          "properties": {
            "display_default": false
          }
        },
        {
          "type": "umbraco",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground_templates": [
            "{{ if (.Modern) }}#ffffff{{ end }}",
            "{{ if not (.Modern) }}#000000{{ end }}"
          ],
          "background_templates": [
            "{{ if (.Modern) }}#3544B1{{ end }}",
            "{{ if not (.Modern) }}#F79C37{{ end }}"
          ],
          "template": " \udb81\udd49 {{ .Version }} "
        },
        {
          "type": "root",
          "style": "powerline",
          "powerline_symbol": "\ue0b0",
          "foreground": "#111111",
          "background": "#ffff66",
          "template": " \uf0ad "
        },
        {
          "type": "executiontime",
          "style": "plain",
          "foreground": "#ffffff",
          "background": "#83769c",
          "template": "<transparent>\ue0b0</> \ueba2 {{ .FormattedMs }}\u2800",
          "properties": {
            "always_enabled": true
          }
        },
        {
          "type": "status",
          "style": "diamond",
          "foreground": "#ffffff",
          "background": "#00897b",
          "background_templates": [
            "{{ if gt .Code 0 }}#e91e63{{ end }}"
          ],
          "trailing_diamond": "\ue0b4",
          "template": "<parentBackground>\ue0b0</> \ue23a ",
          "properties": {
            "always_enabled": true
          }
        }
      ]
    },
    {
      "type": "rprompt",
      "segments": [
        {
          "type": "shell",
          "style": "plain",
          "foreground": "#ffffff",
          "background": "#0077c2",
          "template": "<#0077c2,transparent>\ue0b6</> \uf489 {{ .Name }} <transparent,#0077c2>\ue0b2</>"
        },
        {
          "type": "ytm",
          "style": "powerline",
          "powerline_symbol": "\ue0b2",
          "invert_powerline": true,
          "foreground": "#111111",
          "background": "#1BD760",
          "template": " \uf167 {{ .Icon }}{{ if ne .Status \"stopped\" }}{{ .Artist }} - {{ .Track }}{{ end }} ",
          "properties": {
            "paused_icon": "\uf04c ",
            "playing_icon": "\uf04b "
          }
        },
        {
          "type": "battery",
          "style": "powerline",
          "powerline_symbol": "\ue0b2",
          "invert_powerline": true,
          "foreground": "#ffffff",
          "background": "#f36943",
          "background_templates": [
            "{{if eq \"Charging\" .State.String}}#40c4ff{{end}}",
            "{{if eq \"Discharging\" .State.String}}#ff5722{{end}}",
            "{{if eq \"Full\" .State.String}}#4caf50{{end}}"
          ],
          "template": " {{ if not .Error }}{{ .Icon }}{{ .Percentage }}{{ end }}{{ .Error }}\uf295 ",
          "properties": {
            "charged_icon": "\ue22f ",
            "charging_icon": "\ue234 ",
            "discharging_icon": "\ue231 "
          }
        },
        {
          "type": "time",
          "style": "diamond",
          "invert_powerline": true,
          "foreground": "#111111",
          "background": "#2e9599",
          "leading_diamond": "\ue0b2",
          "trailing_diamond": "\ue0b4",
          "template": " {{ .CurrentDate | date .Format }} "
        }
      ]
    }
  ]
}
```

Save the changes to the JSON file and run the command to edit your Powershell profile again.

```
notepad $PROFILE
```

Then update the file to change the location of the config file we want to use.

```
oh-my-posh init pwsh --config "c:/jandedobbeleer.umbraco.omp.json" | Invoke-Expression
```

After restarting Windows terminal you should now have a lovely pretty prompt in your terminal that can display the Umbraco version if it finds it in the current folder.

## Conclusion

For me this was a fun Hacktoberfest, where I was able to challenge myself and learn a new programming language and build a useful utility to a tool I use every day.

I hope you found this useful and if you use Umbraco, I highly recommend you install and configure your terminal to make your life that bit easier.

Until next time...
