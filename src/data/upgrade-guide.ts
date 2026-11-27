/**
 * Content for the Umbraco 13 to 17 upgrade guide (/umbraco-upgrades/13-to-17/).
 *
 * Every fact about what changed comes from Umbraco's own documentation, linked per item:
 * "Breaking Changes Overview" (docs.umbraco.com/umbraco-cms/get-started/upgrading-and-migrating/version-specific),
 * "Find your upgrade path" and "Upgrade your project", as published for Umbraco 17 (checked 26 November 2026).
 * Anything that needs Warren's own experience is marked "Placeholder" and is listed in the PR.
 */

import { findVersion, formatDate, isReleased } from './umbraco-versions';

/** When the guide's facts were last checked against Umbraco's docs. Shown as "Updated …" on the page. */
export const GUIDE_UPDATED = '2026-11-26';

const DOCS = 'https://docs.umbraco.com/umbraco-cms/get-started/upgrading-and-migrating';
export const BREAKING_CHANGES_URL = `${DOCS}/version-specific`;
export const UPGRADE_PATH_URL = `${DOCS}/find-your-upgrade-path`;
export const UPGRADE_DETAILS_URL = `${DOCS}/upgrade-details`;
/** Umbraco 18's docs on Elements and the Library section (docs.umbraco.com defaults to 18, checked 27 November 2026). */
export const ELEMENTS_DOCS_URL =
  'https://docs.umbraco.com/umbraco-cms/model-your-content/content-types-and-structure/data/defining-content/elements';

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
    summary: 'The big one. The backoffice was rebuilt with web components, and the old ways of extending with AngularJS were removed.',
    href: `${BREAKING_CHANGES_URL}#umbraco-14`,
    changes: [
      {
        title: 'A new backoffice, without AngularJS',
        html: 'The new backoffice (Bellissima) is built with web components, Lit and the Umbraco UI Library. Anything that extended the old backoffice with AngularJS, such as custom dashboards and property editors, must be updated.',
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
        title: 'XPath is removed, and Smidge is no longer included',
        html: 'XPath queries, such as in the Multinode Treepicker, need replacing. Smidge no longer bundles backoffice and package assets, and its lines in <code>_ViewImports.cshtml</code> cause an error on the front end until they are removed.',
      },
      {
        title: 'Two-factor and external logins move to the new backoffice',
        html: 'The two-factor setup screen and the “Sign in with …” button for an external login provider each need registering as a backoffice extension.',
      },
    ],
  },
  {
    version: 15,
    dotnet: '.NET 9',
    summary: 'Snapshots are removed, and a content migration for block editors can take a while on a big site.',
    href: `${BREAKING_CHANGES_URL}#umbraco-15`,
    changes: [
      {
        title: 'Snapshots are removed',
        html: 'Code that reads published content through <code>IPublishedSnapshot</code> must be updated, and Models Builder models need rebuilding.',
      },
      {
        title: 'Block editor content is migrated',
        html: 'The internal data format for block editors changes, so a content migration runs when upgrading. On a large site it can take a while, and the site is unresponsive until it finishes.',
      },
      {
        title: 'Static files are precompressed',
        html: 'ASP.NET Core 9 adds <code>.br</code> and <code>.gz</code> copies of JavaScript and CSS files, which needs turning off in the project that contains the <code>/umbraco</code> folder.',
      },
    ],
  },
  {
    version: 16,
    dotnet: '.NET 9',
    summary: 'TinyMCE is replaced by Tiptap as the rich text editor.',
    href: `${BREAKING_CHANGES_URL}#umbraco-16`,
    changes: [
      {
        title: 'TinyMCE is removed',
        html: 'Data types using TinyMCE are migrated to Tiptap during the upgrade. To keep TinyMCE, a third-party package must be installed before upgrading.',
      },
      {
        title: 'A new base class for package migrations',
        html: 'Package code that uses migrations and was built against Umbraco 15 throws a “method missing” exception on 16 until it is recompiled.',
      },
      {
        title: 'Examine is registered in a composer',
        html: 'Search customisations registered the same way are no longer guaranteed to run after Umbraco’s own setup.',
      },
    ],
  },
  {
    version: 17,
    dotnet: '.NET 10',
    summary: 'The new long-term support release. System dates move to UTC, and Umbraco expects HTTPS by default.',
    href: `${BREAKING_CHANGES_URL}#umbraco-17`,
    changes: [
      {
        title: 'System dates are stored in UTC',
        html: 'A migration converts dates stored in server time to UTC, based on the time zone it detects for the server.',
      },
      {
        title: 'InMemoryAuto has moved to its own package',
        html: 'Sites using the <code>InMemoryAuto</code> Models Builder mode, or editing templates in the backoffice, need the <code>Umbraco.Cms.DevelopmentMode.Backoffice</code> package.',
      },
      {
        title: 'HTTPS by default',
        html: 'The <code>UseHttps</code> setting now defaults to <code>true</code>, so running without HTTPS needs a configuration change.',
      },
      {
        title: 'Backoffice extensions calling the Management API',
        html: 'Authentication for the backoffice client was tightened, so custom extensions that call the Management API may need changes.',
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

/**
 * "How big is your upgrade?": each item is something about a site that makes a 13 to 17 upgrade bigger, and
 * follows from a change in VERSION_STOPS. Readers tick what applies; it sizes the job, it isn't a to-do list.
 */
export const CHECKLIST: ChecklistItem[] = [
  { id: 'packages', label: 'The site uses Umbraco packages', html: 'Each needs a version for Umbraco 17. Check the “Umbraco versions” on its <a href="https://marketplace.umbraco.com/">Umbraco Marketplace</a> page.' },
  { id: 'backoffice', label: 'You have custom backoffice code', html: 'Anything built with AngularJS or registered in a <code>package.manifest</code>, such as dashboards and property editors. All of it must be updated for the new backoffice.' },
  { id: 'editors', label: 'Content uses Nested Content or Grid Layout', html: 'Both were removed in Umbraco 14, so that content moves to Block List or Block Grid.' },
  { id: 'macros', label: 'Pages or rich text use macros', html: 'Removed in Umbraco 14, along with the legacy Media Picker.' },
  { id: 'rte', label: 'Rich text editors use TinyMCE plugins', html: 'TinyMCE was replaced by Tiptap in Umbraco 16, and TinyMCE plugins don’t work in Tiptap.' },
  { id: 'code', label: 'Your C# uses APIs that were removed', html: 'Such as <code>IPublishedSnapshot</code>, <code>UmbracoAuthorizedApiController</code> or XPath queries. Code that relied on Umbraco using Newtonsoft.Json is affected too: Umbraco 14 moved to System.Text.Json.' },
  { id: 'integrations', label: 'Other systems call your APIs or receive your webhooks', html: 'From Umbraco 14, JSON from <code>UmbracoApiController</code> and webhook payloads changes from PascalCase to camelCase.' },
  { id: 'logins', label: 'Backoffice users sign in with two-factor or an external login', html: 'Both need registering as extensions in the new backoffice.' },
  { id: 'content', label: 'The site has a lot of content', html: 'The Umbraco 15 block editor migration takes longer, and the site is unresponsive while it runs.' },
  { id: 'hosting', label: 'Your hosting or build pipeline isn’t on .NET 10 yet', html: 'Umbraco 17 runs on .NET 10.' },
];

export interface Step {
  title: string;
  /** May contain inline HTML. */
  html: string;
}

/** The shape of the work, not a how-to: what each stage involves, so readers can see the size of it. */
export const STAGES: Step[] = [
  { title: 'Size it', html: 'Find everything on the list above that applies: packages, custom backoffice code, content in removed editors, code using removed APIs. This decides how long the upgrade takes, and whether to upgrade or rebuild.' },
  { title: 'Upgrade the code', html: 'Move the project to .NET 10 and Umbraco 17, update the packages, and fix everything that no longer builds.' },
  { title: 'Migrate the content', html: 'Rehearse on a copy of the live database, where the migrations for 14 to 17 run, and move content off Nested Content, the old grid and macros.' },
  { title: 'Rebuild the backoffice', html: 'Rebuild every custom dashboard, property editor and section as web components, then test what editors do every day before going live.' },
];

/** Problems worth planning for: named, not solved (the fixes are the job). */
export const GOTCHAS: Change[] = [
  { title: 'A long first boot', html: 'The Umbraco 15 block editor migration runs when the upgraded site first starts, and the site doesn’t respond until it finishes. On a big site, that can be a long time.' },
  { title: 'A different rich text editor', html: 'TinyMCE becomes Tiptap in Umbraco 16, and rich text data types are migrated during the upgrade. TinyMCE plugins don’t work in Tiptap.' },
  { title: 'Dates that move', html: 'Umbraco 17 converts stored system dates to UTC, using the time zone it detects for the server.' },
  { title: 'Finding alternatives to packages', html: 'Some packages are no longer supported, or haven’t been updated for newer versions of Umbraco. Each one needs an alternative that does the same job, or rebuilding, or removing, and that can change the plan.' },
];

/**
 * The short FAQ answer to "17, 18 or 19?", from Umbraco's lifecycle dates (src/data/umbraco-versions.ts).
 * The full answer is written out in the guide's "Umbraco 17, 18 or 19?" section: keep the two in step.
 * Warren's view (26 November 2026): get onto 17, then keep up with the standard-term releases so the jump to the next
 * LTS is small. Backed by Umbraco's docs: skipping versions means missing the warnings for obsolete code.
 */
function whichVersionFaqAnswer(): string {
  const [v17, v21] = [17, 21].map((n) => findVersion(n)!);
  const next = isReleased(v21) ? 'Umbraco 21' : `Umbraco 21 (due ${formatDate(v21.released)})`;
  return (
    `Umbraco 17 first. It is the current long-term support release, with security fixes until ${formatDate(v17.endOfLife)}. ` +
    `After that, keep up with the standard-term releases, so the move to ${next}, the next long-term support release, won’t be so much work.`
  );
}

export const FAQ_ITEMS = [
  {
    question: 'Can I upgrade straight from Umbraco 13 to 17?',
    answer:
      'Yes. Umbraco supports upgrading from the latest Umbraco 13 release straight to Umbraco 17, but not to Umbraco 18 or later. The database migrations for 14, 15, 16 and 17 run when the upgraded site first starts. Your code, packages and backoffice extensions still need updating.',
  },
  {
    question: 'What happens if I stay on Umbraco 13?',
    answer:
      'From 14 December 2026, Umbraco releases no more security fixes for Umbraco 13, and the .NET 8 it runs on is already out of support. The site keeps working, but any vulnerability found from then on stays open.',
  },
  {
    question: 'Should I upgrade to Umbraco 17, 18 or 19?',
    answer: whichVersionFaqAnswer(),
  },
  {
    question: 'Can you do the upgrade for us?',
    answer:
      'Yes. I upgrade Umbraco sites to Umbraco 17 as a freelancer or contractor, working remotely from the UK. <a href="#contact-h">Get in touch</a> with your Umbraco version, roughly how big the site is, and the packages and custom backoffice code it uses.',
  },
  {
    question: 'How do you charge?',
    answer:
      "I work by the day, week or month. Before we start, I'll give you a rough idea of how long the work should take, so you can plan a budget. Projects often change as they go, and paying for time means we can adapt without renegotiating a quote.",
  },
  {
    question: 'How long does an upgrade from 13 to 17 take?',
    answer:
      'It depends on the site. Every Umbraco site is built differently, with its own packages and customisations, so there is no set number of days for an upgrade. A call or an email about your site is the way to find out: I look into how it is built and what it needs, and after that first call I can give you an estimate of how long it will take and what it will cost.',
  },
];
