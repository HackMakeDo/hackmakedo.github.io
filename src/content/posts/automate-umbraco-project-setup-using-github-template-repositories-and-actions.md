---
title: "Automate Umbraco Project Setup Using GitHub Template Repositories and Actions"
date: 2024-06-10
topics: ["tooling"]
excerpt: "Create an Umbraco package project from a GitHub template repository: one click, and a GitHub Action sets up the solution, RCL, test site and Vite for you."
draft: false
---

Following up from my [last blog post on using a Powershell script to automate creating an Umbraco project setup for package development](/blog/scaffold-umbraco-v14-package-development-project-with-vite-typescript-lit/). I wanted to hack and experiment to see if I could take this concept one step further, by using Github's concept of Template repositories and the power of GitHub's Actions I can then simplify this concept even further and create the same setup as before by simply just specifying a GitHub repository name.

## How do I create a new GitHub repo from this template?

You can visit the r[epository I setup to be a GitHub Template and click the Use this template green button top right of the repository page](https://github.com/warrenbuckley/Umbraco-Repo-Template), where this will kick off the GitHub Action which will create the .NET Solution, Umbraco RCL project, Umbraco test website project and the TypeScript project setup with Vite and the Umbraco CMS dev dependency all ready to go.

<figure class="hmd-figure">
  <img src="/images/blog/automate-umbraco-project-setup-using-github-template-repositories-and-actions/image-3.png" alt="" loading="lazy" />
  <figcaption>A screenshot of where to find the Use this template button on GitHub</figcaption>
</figure>

Or a [quicker alternative is to use this deeplink that simply asks for your new repository name](https://github.com/new?template_name=Umbraco-Repo-Template&template_owner=warrenbuckley) and what account or organisation to create the repository.

[Create a new Umbraco Repo](https://github.com/new?template_name=Umbraco-Repo-Template&template_owner=warrenbuckley)

If you can think of a neat shortcut domain for me to use to this deep link let me know :)

Now let's see it in action:

<hmd-video class="hmd-video" video-id="kTlXzy0uiuc">
  <a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=kTlXzy0uiuc">Watch on YouTube ↗</a>
</hmd-video>

## How does it work?

This works by having a GitHub repository with a GitHub Action YML file configured to run on every single commit, as the first time the repository is created from the template repository it will automatically run the GitHub Action for us.

However to avoid the GitHub Action running again and again after the initial commit to create the repository, we use the GitHub CLI to disable the action like so:

```yaml
# We only ever to want to run this once for the repo created from this template so we disable the workflow
- name: Disable this workflow now we are done
  run: gh workflow disable Repo-Creation
  env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

For this step in our GitHub action to work, we need to ensure the Action run has the correct permissions like so, in order for it to update the GitHub Action and the contents permission in order to do a git commit with the command line in a later on step.

```yaml
# Reference https://docs.github.com/en/actions/security-guides/automatic-token-authentication
# https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions
# Need to set the permissions to disable this action once we are done
# So its only ever run one time
permissions:
  actions: write
  contents: write
```

One final piece of the puzzle is that to add a conditional if statement to part of the GitHub Action in order to ensure only the child repositories created from the template run the action and the main template repository does not also trigger it, which is done like so:

```yaml
# We will only run this action when this repository isn't the
# template repository
if: >-
  ${{ !github.event.repository.is_template }}
```

So go forth and make your own GitHub template repositories or use this one to kick start your next Umbraco package/project idea.
