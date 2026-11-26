/**
 * Content for the Umbraco 13 to 17 upgrade guide (/umbraco-upgrades/13-to-17/).
 *
 * Every fact about what changed comes from Umbraco's own documentation, linked per item:
 * "Breaking Changes Overview" (docs.umbraco.com/umbraco-cms/get-started/upgrading-and-migrating/version-specific),
 * "Find your upgrade path" and "Upgrade your project", as published for Umbraco 17 (checked 26 November 2026).
 * Anything that needs Warren's own experience is marked "Placeholder" and is listed in the PR.
 */

/** When the guide's facts were last checked against Umbraco's docs. Shown as "Updated …" on the page. */
export const GUIDE_UPDATED = '2026-11-26';

const DOCS = 'https://docs.umbraco.com/umbraco-cms/get-started/upgrading-and-migrating';
export const BREAKING_CHANGES_URL = `${DOCS}/version-specific`;
export const UPGRADE_PATH_URL = `${DOCS}/find-your-upgrade-path`;
export const UPGRADE_DETAILS_URL = `${DOCS}/upgrade-details`;

export interface Change {
  title: string;
  /** May contain inline HTML: <code> and links. */
  html: string;
}

export interface VersionStop {
  version: number;
  dotnet: string;
  /** One plain sentence: the headline of this version for someone upgrading. */
  summary: string;
  changes: Change[];
  href: string;
}

/** What each major version between 13 and 17 changed that an upgrade has to deal with. */
export const VERSION_STOPS: VersionStop[] = [
  {
    version: 14,
    dotnet: '.NET 8',
    summary: 'The big one. The backoffice was rebuilt with web components, and the old ways of extending it were removed.',
    href: `${BREAKING_CHANGES_URL}#umbraco-14`,
    changes: [
      {
        title: 'A new backoffice, without AngularJS',
        html: 'The backoffice (codenamed Bellissima) is built with web components, Lit and the Umbraco UI Library. Custom AngularJS dashboards, property editors and sections stop working and need rebuilding.',
      },
      {
        title: '<code>package.manifest</code> is replaced',
        html: 'Extensions are registered in an <code>umbraco-package.json</code> file instead. The format is similar, and there is a JSON schema for it.',
      },
      {
        title: 'Nested Content, Grid Layout and the legacy Media Picker are removed',
        html: 'Umbraco recommends rebuilding Nested Content with Block List or Block Grid, and Grid Layout with Block Grid. Use the default Media Picker.',
      },
      {
        title: 'Macros are removed',
        html: 'Macros and partial view macros are gone. Use partial views, or blocks in the rich text editor.',
      },
      {
        title: 'Newtonsoft.Json is replaced by System.Text.Json',
        html: 'Stricter by default. <code>UmbracoApiController</code> output and webhook payloads change from PascalCase to camelCase.',
      },
      {
        title: 'Backoffice controllers are replaced by the Management API',
        html: '<code>UmbracoAuthorizedApiController</code> and <code>UmbracoAuthorizedJsonController</code> are removed. Build backoffice APIs on <code>ManagementApiControllerBase</code>.',
      },
      {
        title: 'XPath and Smidge are removed',
        html: 'Use Dynamic Roots instead of XPath in the Multinode Treepicker. Remove the Smidge lines from <code>_ViewImports.cshtml</code>.',
      },
      {
        title: 'Two-factor and external logins need registering in the backoffice',
        html: 'Through the new <code>mfaLoginProvider</code> and <code>authProvider</code> extension types.',
      },
    ],
  },
  {
    version: 15,
    dotnet: '.NET 9',
    summary: 'A new content cache, and a content migration for every block editor that can take a while on a big site.',
    href: `${BREAKING_CHANGES_URL}#umbraco-15`,
    changes: [
      {
        title: 'Snapshots are removed',
        html: 'Code using <code>IPublishedSnapshot</code> or <code>IPublishedSnapshotAccessor</code> moves to <code>IPublishedContentCache</code> and <code>IPublishedMediaCache</code>. Models Builder models need regenerating.',
      },
      {
        title: 'Block editor content is migrated',
        html: 'The internal data format of every block editor changes, and a migration converts it on first boot. The site does not respond until it finishes, so clean up old content versions first.',
      },
      {
        title: 'Static files are precompressed',
        html: 'ASP.NET Core 9 adds <code>.br</code> and <code>.gz</code> files. Set <code>&lt;CompressionEnabled&gt;false&lt;/CompressionEnabled&gt;</code> in the Umbraco project.',
      },
    ],
  },
  {
    version: 16,
    dotnet: '.NET 9',
    summary: 'TinyMCE is replaced by Tiptap. Otherwise a quiet release.',
    href: `${BREAKING_CHANGES_URL}#umbraco-16`,
    changes: [
      {
        title: 'TinyMCE is removed',
        html: 'Rich text data types are migrated to Tiptap during the upgrade, unless a third-party TinyMCE package is installed first. TinyMCE plugins and custom configuration need redoing for Tiptap.',
      },
      {
        title: 'Package migrations are asynchronous',
        html: 'Source-compatible but not binary-compatible, so packages with migrations need a version built for Umbraco 16 or later.',
      },
      {
        title: 'Examine is registered in a composer',
        html: 'Custom indexing code registered the same way is no longer guaranteed to run after Umbraco’s own setup.',
      },
    ],
  },
  {
    version: 17,
    dotnet: '.NET 10',
    summary: 'The new long-term support release. System dates move to UTC, and HTTPS is on by default.',
    href: `${BREAKING_CHANGES_URL}#umbraco-17`,
    changes: [
      {
        title: 'System dates are stored in UTC',
        html: 'A migration converts dates stored in server time to UTC. You can disable it, or tell it the server’s time zone, in <code>appsettings.json</code>.',
      },
      {
        title: 'InMemoryAuto has moved to its own package',
        html: 'If you use the <code>InMemoryAuto</code> Models Builder mode, or edit templates in the backoffice, add <code>Umbraco.Cms.DevelopmentMode.Backoffice</code>.',
      },
      {
        title: 'HTTPS is on by default',
        html: '<code>UseHttps</code> now defaults to <code>true</code>.',
      },
      {
        title: 'Backoffice extensions calling the Management API',
        html: 'Their <code>fetch</code> requests must include <code>credentials: \'include\'</code>.',
      },
      {
        title: 'URL providers and dependencies',
        html: '<code>IUrlProvider</code> gains <code>GetPreviewUrlAsync()</code> and an <code>Alias</code>. NPoco and Swashbuckle move up a major version.',
      },
    ],
  },
];

export interface ChecklistItem {
  id: string;
  label: string;
  /** Optional detail under the label. May contain inline HTML. */
  html?: string;
}

/** Before you start. Each item follows from a change above or from Umbraco's "Before you upgrade" list. */
export const CHECKLIST: ChecklistItem[] = [
  { id: 'latest-13', label: 'Update to the latest Umbraco 13 release', html: 'Umbraco’s upgrade path to 17 starts from the latest 13.' },
  { id: 'packages', label: 'Check every package has an Umbraco 17 version', html: 'Look at the “Umbraco versions” on each package’s page on the <a href="https://marketplace.umbraco.com/">Umbraco Marketplace</a>. Note any without one.' },
  { id: 'backoffice', label: 'List your custom backoffice code', html: 'Every <code>package.manifest</code>, AngularJS dashboard, property editor, section and tree.' },
  { id: 'editors', label: 'Find content using removed editors', html: 'Nested Content, Grid Layout, the legacy Media Picker and macros.' },
  { id: 'rte', label: 'Note any TinyMCE plugins or custom configuration', html: 'They need redoing for Tiptap.' },
  { id: 'code', label: 'Search your C# for removed APIs', html: '<code>IPublishedSnapshot</code>, <code>UmbracoAuthorizedApiController</code>, XPath queries and Newtonsoft.Json.' },
  { id: 'hosting', label: 'Confirm your hosting and build pipeline support .NET 10' },
  { id: 'versions', label: 'Clean up old content versions', html: 'It speeds up the Umbraco 15 block editor migration.' },
  { id: 'backup', label: 'Back up the database and files', html: 'And plan to rehearse the upgrade on a copy of the production database.' },
];

export interface Step {
  title: string;
  /** May contain inline HTML. */
  html: string;
}

export const STEPS: Step[] = [
  { title: 'Back up and branch', html: 'Back up the database and files, and do the upgrade on its own branch. Umbraco recommends upgrading offline and testing fully before going live.' },
  { title: 'Move to .NET 10', html: 'Change the target framework of each project to <code>net10.0</code>.' },
  { title: 'Update the packages', html: 'Update Umbraco Forms, Deploy and any other Umbraco packages first, then <code>Umbraco.Cms</code> itself to 17.' },
  { title: 'Tidy the startup code', html: 'Remove the Smidge lines from <code>_ViewImports.cshtml</code> and <code>u.UseInstallerEndpoints();</code> from <code>Program.cs</code>.' },
  { title: 'Fix the build', html: 'Work through the compile errors from removed APIs: snapshots, the old backoffice controllers, and anything that relied on Newtonsoft.Json.' },
  { title: 'Run it against a copy of the database', html: 'The migrations run on first boot: block editor content, TinyMCE to Tiptap, and dates to UTC. Watch the log. On a large site you may need a longer <code>startupTimeLimit</code>.' },
  { title: 'Move content off removed editors', html: 'Nested Content to Block List, Grid Layout to Block Grid, and macros to blocks or partial views.' },
  { title: 'Rebuild the backoffice extensions', html: 'Rebuild each AngularJS extension as a web component and register it in <code>umbraco-package.json</code>.' },
  { title: 'Test, then deploy', html: 'Test what editors do every day as well as the front end. The upgrade runs again on first boot in each environment.' },
];

export const FAQ_ITEMS = [
  {
    question: 'Can I upgrade straight from Umbraco 13 to 17?',
    answer:
      'Yes. Umbraco supports upgrading from the latest Umbraco 13 directly to the latest version. The database migrations for 14, 15, 16 and 17 run for you on first boot. Your code, packages and backoffice extensions still need updating.',
  },
  {
    question: 'What happens if I stay on Umbraco 13?',
    answer:
      'From 14 December 2026, Umbraco releases no more security fixes for Umbraco 13, and the .NET 8 it runs on is already out of support. The site keeps working, but any vulnerability found from then on stays open.',
  },
  {
    question: 'Should I upgrade to Umbraco 17 or 18?',
    answer:
      'Umbraco 17 for most sites. It is a long-term support release with security fixes until November 2028. Umbraco 18 is a short-term support release that reaches end of life in June 2027.',
  },
  {
    question: 'How long does an upgrade from 13 to 17 take?',
    answer: 'Placeholder: Warren to answer from experience (what it depends on, and rough ranges if he is happy to give them).',
  },
];
