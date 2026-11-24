# Post-launch: Umbraco versions on blog posts

Planned 22 November 2026, to start after launch. Goal: no post leaves a reader, or an AI assistant, with old or
wrong information about which Umbraco versions a technique works on. **Every version claim must be proven from
Umbraco's source, its official docs or the compiled package. Nothing from memory; anything unproven is marked.**

## The plan

1. **Tag every Umbraco-specific post with the versions it was written for** (a version range in the post's
   frontmatter, e.g. `7–7` or `14+`). Personal/community posts and non-Umbraco tooling posts (21 of 64) get no tag.
2. **Show a notice at the top of each tagged post, worked out at build time** from `src/data/umbraco-versions.ts`
   (the same data as the upgrades page), so it changes by itself when a version reaches end of life:
   - out of support: "Written for Umbraco 7, which reached end of life in 2023. Umbraco has changed a lot since,
     so this code may not work in current versions."
   - current: a small "Written for Umbraco 14 and later" label.
   The notice is in the page, so it is also in the Markdown copy agents get; add the version to the post's
   JSON-LD too.
3. **Verify each post in batches of five** (as with the excerpts): which versions it really works on, with evidence,
   and what changed. Warren reviews each batch.
4. **Where the technique still holds but the code changed, add an "Updating for Umbraco 17" section** (17 is the
   current LTS):
   - a dated note at the top linking to it ("Updated <month year>: the code below is for Umbraco 13. For Umbraco 17,
     see Updating for Umbraco 17");
   - the original post left as it is;
   - the new section with the changed code and a sentence or two on what changed and why;
   - the post's `updated:` frontmatter set (shows "Updated …" and `dateModified`).
   Drafted in Warren's voice, approved by him. **The new code is compiled** against the Umbraco 17.7.1 NuGet
   packages (and 18.x where cheap) with warnings as errors, so nothing obsolete slips in. Compiling proves the API,
   not behaviour: say so where behaviour matters.
5. Posts whose technique no longer exists (AngularJS backoffice, UserControl Wrapper, ApplicationEventHandler…)
   only get the out-of-support notice; rewriting them would be new posts.

## How to verify (tools that worked)

- **Umbraco CMS source**: local clone at `/Users/warren/Code/Contrib/Umbraco-CMS` (fork; has `release-*` tags for
  13.x to 18.x). Compare versions without checking out: `git ls-tree -r --name-only release-17.7.1 | grep …` and
  `git show "${TAG}:path/File.cs"`. In zsh write `"${TAG}:path"` with braces: `$TAG:s…` is a zsh modifier.
  `git fetch --tags` first for newer releases.
- **Umbraco docs**: sparse clone of `github.com/umbraco/UmbracoDocs` (folders per version: `13/umbraco-cms`,
  `17/umbraco-cms`, `17/umbraco-forms` …).
- **Closed-source packages (Umbraco Forms) and community packages**: download the `.nupkg` from
  `api.nuget.org/v3-flatcontainer/<id>/<version>/<id>.<version>.nupkg` and read type definitions with a small
  `System.Reflection.Metadata` console app (`dotnet` 10 SDK is installed). NuGet registration API gives a package's
  declared Umbraco dependency range.
- **Compile proof for new code**: a throwaway project referencing `Umbraco.Cms` 17.7.1, `TreatWarningsAsErrors`.

## Already verified (22 November 2026)

### `umbraco-community-runtime-validators` (March 2024): still current, Umbraco 10–17
- NuGet: one release, 1.0.0.8 (2024-03-05), `net6.0`, depends on `Umbraco.Cms.Core`/`Infrastructure` `[10.1.0, )`.
- Package source (github.com/Gibe/Umbraco.Community.RuntimeValidators) uses `IRuntimeModeValidator`,
  `HostingSettings.LocalTempStorageLocation`/`LocalTempStorage.EnvironmentTemp`, `GlobalSettings.MainDomLock`
  (`"FileSystemMainDomLock"`), `IndexCreatorSettings.LuceneDirectoryFactory` (`SyncedTempFileSystemDirectoryFactory`,
  `TempFileSystemDirectoryFactory`), `IServerRoleAccessor`/`ServerRole`. All identical (signature, namespace,
  assembly) in release-13.16.2 and release-17.7.1.
- Umbraco 17 docs (`17/umbraco-cms/run-in-production/infrastructure-and-ops/server-setup/load-balancing/azure-web-apps.md`)
  recommend exactly the values the package checks.
- **Outdated in the post**: its list of Umbraco's built-in validators includes `RuntimeMinification`, removed in
  **16.0.0** (present 13.16.2, 14.0.0, 15.0.0). Umbraco 17.0.0 added `InMemoryModelsBuilderModeValidator`.
  JITOptimizer, ModelsBuilderMode ("Nothing" in production), UmbracoApplicationUrl, UseHttps still exist in 17.
- To do: short correction note in the post; tag `10+`.

### `quick-tip-adding-a-saved-search-to-logviewer-in-umbraco-with-code` (January 2024): written for 13
| Version | Post's code |
|---|---|
| 13 | both APIs current |
| 14–15 | `ILogViewerConfig` `[Obsolete("Use ILogViewerService instead. Scheduled for removal in Umbraco 15.")]` from 14.0.0 (still present in 17.7.1 and 18.2.1) |
| 16–17 | `PackageMigrationBase` also `[Obsolete("Use AsyncPackageMigrationBase instead. Scheduled for removal in Umbraco 18.")]` from 16.0.0 |
| 18 | `PackageMigrationBase` **removed** (release-18.2.1): does not compile |
- Modern APIs (17.7.1): `AsyncPackageMigrationBase`; `ILogViewerService.GetSavedLogQueriesAsync`,
  `GetSavedLogQueryByNameAsync`, `AddSavedLogQueryAsync`, `DeleteSavedLogQueryAsync`.
- To do: **pilot post** for the "Updating for Umbraco 17" section; tag `13`.

### `quick-tip-how-to-prevent-html-in-umbraco-form-fields` (April 2025): still current, Forms 10–18
- Type definitions read from the compiled `Umbraco.Forms.Core.dll` in the latest release of every major 10–18
  (10.5.7 … 18.3.1): `Umbraco.Forms.Core.Services.Notifications.FormValidateNotification` (`Form`, `Context`,
  `ModelState`), `Umbraco.Forms.Core.Models.Form.AllFields`, `Field.Id`, unchanged in all nine.
- Forms 13 and 17 docs (`developer/extending/adding-an-event-handler.md`) show the same usage.
- The post's premise holds: the Forms 17 docs have no setting that rejects HTML in submitted values (the HTML
  settings are about rendering/encoding output).
- To do: tag `Forms 10+`; no code change needed.

## The other posts (first pass by date and keywords, to verify)

- **Umbraco 14+ (Bellissima)**, likely current but backoffice APIs changed between 14 and 17, check carefully:
  custom condition, SVG icon pack, Getting Started dashboard, Save & Publish button, refresh content tree,
  Examine Peek (my first Bellissima package), scaffold with Vite/TypeScript/Lit, GitHub template repo,
  SignalR + IOptionsMonitor, why I've stuck around (personal, mentions 14).
- **Umbraco 13**: custom webhook type, login screen (covers 13 and 14+).
- **Umbraco 9–12**: .NET Core on a MacBook (9), IPasswordValidator (9+, Startup.cs style), Swagger conflict
  (Forms 10.2; fixed in 10.2.2 and 11.0.1).
- **Umbraco 8**: Components (bye bye ApplicationEventHandler), Serilog switcheroo, NuCache Explorer (NuCache
  replaced in later versions: verify which).
- **Umbraco 6 and 7** (22 posts, 2013 to 2015): MVC series (first steps, macros with partials, surface
  controller, AltTemplate & data views), PetaPoco comments, 404 IContentFinder, member profile URLs, CWS member
  type, macro parameter type, restrict media file size (UserControl Wrapper), regionalisation of error messages,
  JWT web APIs, Contour + Slack, extension methods, Optimus / CodeMirror, custom section, doctype icons, settings
  editor, ServerVariables parsing, toggle tree, Belle property editor, Yo Umbraco, Diagnostics, Visual Studio
  item templates, We are Umbraco Craftsmen. Some concepts survive (surface controllers, IContentFinder) with
  different code: verify each rather than assume.
- **No version tag** (personal/community or not Umbraco code): its good to be back, year in review, Tea Commerce,
  the wonderful assistant, Google Hangouts, Thanks!, Thank you Umbraco community, time to say goodbye, uHangout,
  Examine course, development setup, TeamCity (two posts), Android emulator, GitHub Sponsors, IIS Express,
  Oh My Posh.
