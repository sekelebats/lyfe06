# FZH Studio — Eleventy

Starter migration of the supplied FZH Studio HTML into Eleventy while keeping its minimal visual direction.

## Requirements

- Node.js 26 LTS (see `.nvmrc`)
- npm

## Run locally

```bash
npm install
npm run start
```

Open the local URL printed by Eleventy.

## Production build

```bash
npm run build
```

The output is generated in `_site/`. The build runs in this order:

1. Remove the previous output.
2. Copy the locally hosted Inter Variable and JetBrains Mono Variable font files.
3. Generate static HTML with Eleventy.
4. Generate the Pagefind search index in `_site/pagefind/`.

Deploy the contents of `_site/` to Netlify, Cloudflare Pages, or another static host.

## Important: set your real domain

Before deployment, update both:

- `src/_data/site.json` → `url`
- `src/robots.txt` → sitemap URL
- `eleventy.config.js` → RSS `metadata.base`

Replace `https://example.com` with the canonical origin of the production website. Also replace `hello@example.com` in `src/_data/site.json` and `src/pages/contact.njk`.

## Write a post

Create a Markdown file in `src/posts/`:

```md
---
layout: layouts/post.njk
title: Your article title
date: 2026-11-21
category: Design
tag: design
description: A short search and SEO description.
permalink: /posts/your-article-title/
---

Your first paragraph.

## A heading

- A list item
- Another list item
```

Supported tags in the starter navigation: `design`, `tech`, and `life`.

The Markdown typography is styled in `src/assets/css/site.css`, including headings, paragraphs, lists, blockquotes, inline code, code blocks, images, tables, and horizontal rules.

## Pagefind indexing

Only `.article-content` is marked with `data-pagefind-body`. The homepage listing, tag controls, article metadata, and footer are outside the indexed body. Search results therefore come from article content, not a second copy of the homepage list.

Pagefind is generated at build time and loaded only when a visitor searches. The search index is hosted locally in `/pagefind/`.

## SEO and feeds

- Canonical URL is generated from `site.url` + each page URL.
- RSS feed: `/feed.xml`
- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`
- Not found page: `/404.html`

Configure the hosting provider to serve `/404.html` for unknown routes if it does not do so automatically.

## Icons and sharing

The small inline SVGs use Lucide icon geometry (search, share-2, moon, sun, and arrow-left); no icon font or icon JavaScript bundle is loaded.

Share uses the native Web Share API where available, then falls back to clipboard. Clipboard access generally requires HTTPS or localhost.

## Design preservation

The original 720px content width, serif article/list typography, monochrome palette, spacing, tag filters, and dark/light toggle are retained. Inter Variable is used for interface text and JetBrains Mono Variable for inline and block code.