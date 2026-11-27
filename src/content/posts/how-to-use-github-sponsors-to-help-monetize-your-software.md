---
title: "How to use GitHub Sponsors to help monetize your software"
date: 2021-01-08
topics: ["tooling"]
excerpt: "Use the GitHub Sponsors GraphQL API to check whether someone sponsors you, then show a friendly sponsorware message or unlock premium features in your software."
draft: false
---

Hi it's been a while since I have written a blog post, but with the typical new year, new me, new year resolutions I'll try to blog a bit more often. Anyway what I want to talk about is, how last year I used GitHub Sponsors with GraphQL to create a sponsorware message in my Visual Studio Code Extension - IIS Express to give a friendly reminder.

Carrying on reading and I will show you how you could use GitHub Sponsors to help monetize some of your software projects either with a sponsorware style message or to add some premium features.

## Querying GitHub API

[Github has a GraphQL API](https://docs.github.com/en/graphql/guides/introduction-to-graphql) which we can use to query if a GitHub username is sponsoring us using the [GitHub Sponsorship service](https://github.com/open-source/sponsors)

### GraphQL Query

This is the GraphQL query I run against GitHub when the logged in & authenticated user against the GitHub GraphQL API.

It would be possible to create a query that would allow us to check who sponsors me and use my own authentication token with the GraphQL API, however when doing this I was not able to query private sponsorships and I had no way to know that the user supplying a simple string of a GitHub username, is who they say they are and was not impersonating someone else. Hence I took the approach to perform the query against the authenticated user instead.

```javascript
query isUserASponsor($orgToCheck: String!) {
  viewer {
    login
    organization(login: $orgToCheck) {
      viewerIsAMember
    }
    repositoriesContributedTo(first: 100, contributionTypes: [COMMIT]) {
      nodes {
        name
        nameWithOwner
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
    sponsorshipsAsSponsor(first: 100) {
      nodes {
        sponsorable {
          __typename
          ... on User {
            login
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
}
```

### Query Variables

As you can see from the above GraphQL query that it expects a query variable of **orgToCheck **that is required to perform the query.

```javascript
{
  "orgToCheck": "umbraco"
}
```

### Sample result

Here is a sample of data that the GraphQL query above would return to us, which we can then use to validate if a user who will see the sponsorware message or not.

```javascript
{
  "data": {
    "viewer": {
      "login": "warrenbuckley",
      "organization": {
        "viewerIsAMember": true
      },
      "repositoriesContributedTo": {
        "nodes": [
          {
            "name": "UmbracoDocs",
            "nameWithOwner": "umbraco/UmbracoDocs"
          },
          {
            "name": "OurUmbraco",
            "nameWithOwner": "umbraco/OurUmbraco"
          },
          {
            "name": "Umbraco-CMS",
            "nameWithOwner": "umbraco/Umbraco-CMS"
          },
          {
            "name": "Forms",
            "nameWithOwner": "umbraco/Forms"
          },
          {
            "name": "serilog-sinks-azuretablestorage",
            "nameWithOwner": "serilog/serilog-sinks-azuretablestorage"
          },
          {
            "name": "vscode-docs",
            "nameWithOwner": "microsoft/vscode-docs"
          },
          {
            "name": "Umbraco-Deploy",
            "nameWithOwner": "umbraco/Umbraco-Deploy"
          },
          {
            "name": "octokit.graphql.net",
            "nameWithOwner": "octokit/octokit.graphql.net"
          },
          {
            "name": "Umbraco.Deploy.Contrib",
            "nameWithOwner": "umbraco/Umbraco.Deploy.Contrib"
          },
          {
            "name": "The-Starter-Kit",
            "nameWithOwner": "umbraco/The-Starter-Kit"
          },
          {
            "name": "umbraco-themes",
            "nameWithOwner": "umbraco/umbraco-themes"
          },
          {
            "name": "codegarden-2020-group-image",
            "nameWithOwner": "lars-erik/codegarden-2020-group-image"
          },
          {
            "name": "CodePatch",
            "nameWithOwner": "CandidContributions/CodePatch"
          },
          {
            "name": "backoffice-poc",
            "nameWithOwner": "filipbech/backoffice-poc"
          },
          {
            "name": "CanConUmbrackathon",
            "nameWithOwner": "CandidContributions/CanConUmbrackathon"
          }
        ],
        "pageInfo": {
          "hasNextPage": false,
          "endCursor": "Y3Vyc29yOnYyOpHOEgmJ0Q=="
        },
        "totalCount": 15
      },
      "sponsorshipsAsSponsor": {
        "nodes": [
          {
            "sponsorable": {
              "__typename": "User",
              "login": "leekelleher",
              "name": "Lee Kelleher"
            }
          },
          {
            "sponsorable": {
              "__typename": "User",
              "login": "Shazwazza",
              "name": "Shannon Deminick"
            }
          }
        ],
        "pageInfo": {
          "hasNextPage": false,
          "endCursor": "Mg"
        },
        "totalCount": 2
      }
    }
  }
}
```

## How to check if the user is a sponsor or contributor

We can use the result from the GraphQL query above and then we can check for the following:

✅ Is it yourself ?  
✅ Is the user a member of an organization - that you want to allow **all** members of to have access  
✅ Check all repos that the logged in user has contributed to see if they have contributed with a commit  
✅Check all sponsors of the logged in user to see if they are an active sponsor

```javascript
const repos = [];
const sponsors = [];

// Add all repos to the array
query.viewer.repositoriesContributedTo.nodes.forEach(repo => {
    // Ensure unique items added to array only
    const tryFindRepo = repos.findIndex(x => x.name === repo.name && x.nameWithOwner === repo.nameWithOwner);
    if (tryFindRepo === -1) {
        repos.push({
            name: repo.name,
            nameWithOwner: repo.nameWithOwner
        });
    }
});

// Add all sponsors to the array
query.viewer.sponsorshipsAsSponsor.nodes.forEach(sponsor => {
    // Ensure unique items added to array only
    const tryFindSponsor = sponsors.findIndex(x => x.name === sponsor.sponsorable.name && x.login === sponsor.sponsorable.login);
    if (tryFindSponsor === -1) {
        sponsors.push({
            name: sponsor.sponsorable.name,
            login: sponsor.sponsorable.login
        });
    }
});

// Who is this ?
const login = query.viewer.login;

// Is the user yourself ?
const isYourself = login.toLocaleLowerCase() === 'warrenbuckley';

// Is the user a member of the Umbraco org ?
// If the org does not exist at all then the viewerIsAMember prop will be null
const isOrgMember = query.viewer.organization?.viewerIsAMember ? query.viewer.organization?.viewerIsAMember : false;

// Does the list of contrib repos contain our repo ?
const contributedToRepo = repos.findIndex(repo => repo.nameWithOwner.toLocaleLowerCase() === 'warrenbuckley/iis-express-code') > 0;

// Does the list of all sponsors contain 'Warrenbuckley' ?
const isASponsor = sponsors.findIndex(sponsor => sponsor.login.toLocaleLowerCase() === 'warrenbuckley') > 0;
```

## Getting a GitHub token for VSCode extension

So now we are able to query the GitHub API for sponsors as ourselves, we need to make our VS Code extension, in my case my own [IIS Express for VSCode extension](https://marketplace.visualstudio.com/items?itemName=warren-buckley.iis-express) be aware of what GitHub user is using the extension and verify if they are a valid sponsor or not.

[VSCode recently added an extension API](https://github.com/microsoft/vscode-extension-samples/tree/main/github-authentication-sample) that done the hardwork for me, that prompts the user to authenticate to GitHub and VSCode would expose an GitHub auth token we can use against the [GraphQL API that requires authentication](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql#authenticating-with-graphql).

```javascript
// The GitHub Authentication Provider accepts the scopes described here:
// https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/
const SCOPES = ['read:user', 'read:org'];
const GITHUB_AUTH_PROVIDER_ID = 'github';

const session = await vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, { createIfNone: showPrompt });
```

## Displaying sponsorware or disabling features for non sponsors

I created a hosted [HTTP Trigger Azure Function](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview) written in TypeScript for NodeJS that takes a users GitHub token from the VSCode extension and then does a POST to the Azure Function which in turn performs the GraphQL query with their token and then performs the checks to see if the user is a valid sponsor and returns a simple boolean response.

So my for scenario in IIS Express for VSCode every time a user launches a website from VSCode with my extension will keep a track of the number times it has been launched along with if the authenticated GitHub user is a valid sponsor or not by making a HTTP POST request to my Azure function. If the threshold is met and they are not a valid sponsor then I am displaying a friendly sponsorware message to encourage users to become a GitHub sponsor to remove the message.

<figure class="hmd-figure">
  <img src="/images/blog/how-to-use-github-sponsors-to-help-monetize-your-software/github-sponsorwaremessage.png" alt="The IIS Express extension in VS Code showing its sponsorware message: you have used IIS Express 24 times, with buttons to sponsor Warren Buckley on GitHub or log in to GitHub" loading="lazy" />
  <figcaption>An example of the sponsorware message shown to users who are not GitHub sponsors of the IIS Express for VSCode extension</figcaption>
</figure>

You could use the same approach in your own software projects be it to display sponsorware messages or to add a specific feature behind a paywall. Whatever you decide I hope this article has been useful in inspiring you to add some monetization option with GitHub Sponsors and a cheeky sidenote plug if that you found this article useful or you intend to try this approach out in your own projects and [sponsor me on GitHub](https://github.com/sponsors/warrenbuckley/) 🥰

## Where's the source?

Well luckily for you I have made the code for checking if a user is a sponsor into a generic Azure Function that you could deploy to your own Azure account and can be configured easily with a few environment variables to check if a user is a sponsor or contributor to one of your own repositories.

[Is Github Sponsor - Azure Function Source Code](https://github.com/warrenbuckley/Is-Github-Sponsor)
