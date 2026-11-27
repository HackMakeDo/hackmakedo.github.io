import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Collections are defined now so later sessions can populate them; none are used by this session's pages yet.

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    /**
     * Optional shorter title for search results (the <title> tag) when `title` is over 70 characters.
     * Written by Warren, never generated. Also used for og:title; the page heading, the OG image and structured data keep `title`.
     */
    seoTitle: z.string().max(70).optional(),
    date: z.date(),
    updated: z.date().optional(),
    topics: z.array(z.string()),
    excerpt: z.string(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    /**
     * Set only when this post is genuinely *about* a specific case study (the post
     * walks through building that package/project), not just related by topic -
     * shown first in "Keep reading" alongside the usual by-topic related posts.
     * Never inferred automatically: a post mentioning a project in passing isn't
     * "about" it, so this stays a deliberate, hand-set opt-in per post.
     */
    relatedWork: z.object({ href: z.string(), title: z.string() }).optional(),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    kind: z.enum(['client', 'project']),
    title: z.string(),
    client: z.string().optional(),
    summary: z.string(),
    facts: z.record(z.string(), z.string()),
    order: z.number().default(0),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string().optional(),
    linkedinUrl: z.url().optional(),
    quote: z.array(z.string()),
    usedOn: z.array(z.string()),
  }),
});

const clients = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/clients' }),
  schema: z.object({
    name: z.string(),
    permission: z.boolean(),
    /** Only set when this client has its own /work/<slug>/ case study page (so far, only Council of the EU). */
    caseStudySlug: z.string().optional(),
    /** Agency the work was done through, if any, e.g. "Gibe Digital". Direct engagements omit this. */
    agency: z.string().optional(),
    summary: z.string().optional(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    quote: z.object({ text: z.string(), name: z.string(), role: z.string() }).optional(),
    /** Named projects delivered, shown in place of a quote when there isn't one yet (e.g. the combined Gibe Digital card). */
    projects: z.array(z.string()).optional(),
    /** Display order on /work/ and the homepage, lowest first. Ties (or no order set) fall back to name order. */
    order: z.number().default(0),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/timeline' }),
  schema: z.object({
    year: z.number(),
    yearLabel: z.string(),
    type: z.enum(['role', 'award', 'project', 'community']),
    title: z.string(),
    body: z.string(),
    badge: z.number().optional(),
    /** Show the Umbraco Certified Master badge (src/data/certification.ts) instead of an MVP badge. */
    certificationBadge: z.boolean().default(false),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    order: z.number().default(0),
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faqs' }),
  schema: z.object({
    page: z.enum(['freelancer', 'contractor', 'about', 'contact']),
    question: z.string(),
    answer: z.string(),
  }),
});

export const collections = { posts, caseStudies, testimonials, clients, timeline, faqs };
