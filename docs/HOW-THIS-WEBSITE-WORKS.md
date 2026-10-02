# How This Website Works

## Architecture Overview

This is a Next.js 16 application deployed on Vercel. All content is managed as **TypeScript files** (content-as-code), not through a database admin UI. AI (Claude) is the primary content editor.

### What's in the Database

The site reads one table, `analytics_events`: page views, CTA clicks, FAQ expansions, video plays and sessions. Everything else is code, the look of every page and the videos included. The `media`, `website_settings`, `website_settings_presets` and `website_colors` rows the site used to read are still in the database, unread (POR-608).

### What's in Code (everything else)

All page content — CTAs, FAQs, features, timelines, results, testimonials, social links, logos — lives in TypeScript files under `src/features/`. Each route's look (theme, fonts, brand colours) is in `src/lib/site-look.ts`, and the videos are in `src/features/media/videos.ts`.

---

## Project Structure

```
src/
  app/
    (public)/                    # Public-facing pages
      page.tsx                   # Landing page (home)
      for/
        commercial-cleaning/     # Funnel: commercial cleaning
      outbound-system/           # Outbound system page
      sitemap.ts
      robots.ts
    admin/                       # Admin panel
      analytics/                 # Analytics dashboard + detail pages
      settings/                  # Admin account settings
      login/
    api/
      admin/
        analytics/               # Analytics API (events, stats, CTA/FAQ drill-down)
        ai/                      # Admin and web-app preset generators (no page calls them)
      auth/                      # Login/logout
  features/
    landing/                     # Home page content system
      types.ts                   # LandingPageContent type definition
      content/
        home.ts                  # All home page content (CTAs, FAQs, etc.)
        index.ts                 # Registry: getLandingContent(slug)
      adapter.ts                 # Transforms content -> component prop shapes
    funnels/                     # Funnel pages (long-form sales pages)
      types.ts                   # FunnelContent type definition
      content/
        outbound-system.ts       # Outbound system funnel content
        commercial-cleaning.ts   # Commercial cleaning funnel content
        index.ts                 # Registry: getFunnelContent(slug)
      components/                # Funnel-specific components
    media/                       # Videos, in code
      types.ts                   # Media, MediaWithSection, legacy types
      videos.ts                  # Every video the site plays, by id: videoById(id)
    analytics/                   # Analytics module
      data.ts                    # Server-side analytics data fetching
      components/                # Dashboard components
  components/
    landing/                     # Shared landing page components
      Hero.tsx, Navbar.tsx, FAQ.tsx, CTA.tsx, Offer.tsx,
      Timeline.tsx, Results.tsx, Logos.tsx, Footer.tsx, etc.
  lib/
    analytics.ts                 # Client-side event tracking (trackEvent)
    supabase/                    # Supabase client setup + auto-generated types
    seo.ts                       # SEO config, schemas, metadata
    site-look.ts                 # Each route's theme, fonts and brand colours
```

---

## The Two Content Systems

### 1. Landing Page (`src/features/landing/`)

The previous home page, kept at `/legacy`, uses the **landing content system** (the home page at `/` is the v2 design in `src/components/home/`).

**Content file**: `src/features/landing/content/home.ts`
- Exports `homeContent: LandingPageContent`
- Contains every section: header, hero, logos, offer, timeline, FAQ, results, CTA, footer

**Type definition**: `src/features/landing/types.ts`
- `LandingPageContent` — the full page shape
- Section types: `HeaderContent`, `HeroContent`, `LogosContent`, `OfferContent`, `TimelineContent`, `FAQContent`, `ResultsContent`, `CTASectionContent`, `FooterContent`
- `CTAButton` — shared across all sections

**Adapter**: `src/features/landing/adapter.ts`
- Transforms `LandingPageContent` into the prop shapes that existing components expect
- Each function (`adaptHero`, `adaptFAQ`, etc.) builds the section + data arrays
- This is a bridge layer — components still expect the old shape with `section_cta_button`, `section_feature`, etc.

**How the page renders** (`src/app/(public)/legacy/page.tsx`):
```
1. Import homeContent from content file
2. Read the background effects (dots, wave gradient, noise texture) from the `/` look in src/lib/site-look.ts
3. Get the hero video by its id from src/features/media/videos.ts
4. Run adapter functions to transform content -> component props
5. Render components with adapted data
```

**DB queries per page load: none.** Everything is code.

### 2. Funnels (`src/features/funnels/`)

Funnel pages at `/for/[slug]` and `/outbound-system` use the **funnel content system**.

**Content files**: `src/features/funnels/content/`
- `outbound-system.ts` — outbound system long-form page
- `commercial-cleaning.ts` — commercial cleaning funnel
- `index.ts` — registry with `getFunnelContent(slug)`

**Type definition**: `src/features/funnels/types.ts`
- `FunnelContent` — full funnel shape (header, hero, outcomes, benchmarks, whyOutbound, whatYouGet, comparison, timeline, pricing, FAQ, finalCta, footer)
- Funnels have their own component set in `src/features/funnels/components/`

**Key difference from landing**: Funnel components accept typed content directly (no adapter layer needed).

---

## How CTAs Work

### Content Definition

Every CTA is defined inline in its content file with a **slug ID** for analytics:

```typescript
// In src/features/landing/content/home.ts
ctas: [
  {
    id: "hero-book-qualification-call",  // slug for analytics tracking
    label: "Book a Qualification Call",
    url: "https://calendly.com/...",
    style: "primary",
    subtitle: "A short call to see if this system makes sense.",
  },
]
```

### Analytics Tracking

When a user clicks a CTA, the component calls `trackEvent()` from `src/lib/analytics.ts`:

```typescript
trackEvent({
  event_type: "link_click",
  entity_type: "cta_button",
  entity_id: "hero-book-qualification-call",  // the slug ID
  metadata: { location: "hero" },
});
```

This writes a row to `analytics_events` in Supabase. The analytics dashboard reads these events and enriches them by looking up the CTA label from `homeContent` (no DB table needed).

### All CTA IDs in the Home Page

| ID | Location | Label |
|----|----------|-------|
| `header-get-in-touch` | Header/Navbar | Get in Touch |
| `hero-book-qualification-call` | Hero section | Book a Qualification Call |
| `cta-book-strategy-call` | CTA section (bottom) | Book a Strategy Call |

---

## How FAQs Work

### Content Definition

FAQs are defined in the content file with slug IDs:

```typescript
// In src/features/landing/content/home.ts
faq: {
  title: "Frequently asked [[**questions**]]",
  eyebrow: "faq",
  faqs: [
    {
      id: "what-does-evergreen-handle",
      question: "What does Evergreen Systems actually handle?",
      answer: "Evergreen Systems builds, runs, and manages...",
    },
    // ... more FAQs
  ],
}
```

### Analytics Tracking

When a user expands a FAQ, it tracks:

```typescript
trackEvent({
  event_type: "link_click",
  entity_type: "faq_item",
  entity_id: "what-does-evergreen-handle",  // the slug ID
});
```

### Rich Text in Answers

FAQ answers support `\n` for line breaks. The component renders each line as a separate paragraph.

---

## How Media Works

Videos are code. `src/features/media/videos.ts` lists every video the site plays, each with the fields the old `media` table had: `id`, `type`, `source_type`, `url`, `embed_id`, `name`, `thumbnail_url`, `duration`. A page names its video by id (a funnel page's `…_VIDEO_ID`, or `mainMediaId` in a content file) and gets it with `videoById(id)`; nothing is fetched at render time.

### Why the id never changes

Video plays are tracked by the video's id (`analytics_events`, `entity_type: "media"`). A replaced video is a new entry with a new id (`crypto.randomUUID()`); the old entry stays until no page names it.

### Supported Media Types

- **Videos**: Wistia (`source_type: "wistia"`, its id in `embed_id`), YouTube or Vimeo (via embed ID), or a file on Bunny CDN (`source_type: "upload"`, its address in `url`, a poster in `thumbnail_url`)
- **Images**: Direct URL from Bunny CDN

---

## How Analytics Works

### Event Types

| Event | Entity Type | What It Tracks |
|-------|-------------|---------------|
| `page_view` | `page` | Page loads |
| `session_start` | `page` | New visitor sessions (30-min window) |
| `link_click` | `cta_button` | CTA button clicks |
| `link_click` | `faq_item` | FAQ item expansions |
| `link_click` | `media` | Video plays |

### Client-Side Tracking

`src/lib/analytics.ts` handles all tracking:
- Automatically manages session IDs via cookies (30-min expiration)
- Skips tracking in development mode
- Uses `keepalive` for link clicks to ensure tracking completes during navigation
- Posts to `/api/admin/analytics`

### Server-Side (Geolocation)

The API route (`src/app/api/admin/analytics/route.ts`) enriches events with:
- Country and city (from request headers / Vercel geolocation)
- Stores in `analytics_events` table

### Dashboard

`/admin/analytics` shows:
- Page views, CTA clicks, video clicks, sessions over time
- Top CTAs by clicks (with location breakdown)
- Top FAQs by clicks
- Geographic breakdown (country/city)
- Drill-down pages: `/admin/analytics/cta/[id]`, `/admin/analytics/faq/[id]`

---

## How Styling / Theming Works

### One look for the whole site, in code

Every public page has the landing page's look, the one `src/styles/home.css` defines on `.eg-home`: light, Inter, ink navy `#0C2340`, accent terracotta `#D4742C`, background `#F4F5F6`. No page, funnel or other, has a look of its own.

- `src/styles/home.css`: the landing design's tokens, used by the pages built on `.eg-home` (home, about, contact, book, insights, ROI calculator).
- `src/app/globals.css` → `.preset-landing-page`: the same palette in the shadcn tokens the other pages use (funnels, legal pages, `/legacy`). Every public page wears this class (`getFunnelPresetClass`).
- `src/lib/site-look.ts` → `SITE_LOOK`: the theme (light), the fonts (Inter), the primary and secondary colours `WebsiteColorStyle` injects, and `/legacy`'s background effects (none).

### Change the look

Change it in all three places together, so every page keeps one look, then deploy.

---

## How to Make Changes

### Update Home Page Content

Edit `src/features/landing/content/home.ts`. All sections are in one file:
- Change a CTA label/URL -> edit the `ctas` array in that section
- Add a FAQ -> add an entry to `faq.faqs` with a unique `id`
- Change hero text -> edit `hero.title` (supports `[[**gradient bold**]]` syntax)
- Change features -> edit `offer.features`

### Add a New Funnel Page

1. Create `src/features/funnels/content/my-funnel.ts` exporting a `FunnelContent` object
2. Register it in `src/features/funnels/content/index.ts`
3. Create the route at `src/app/(public)/for/my-funnel/page.tsx`

### Add/Change a Video

1. Put the file on Bunny CDN, or the video on Wistia
2. Add an entry to `src/features/media/videos.ts` with a new id (`crypto.randomUUID()`)
3. Name that id where the page names its video (a funnel page's `…_VIDEO_ID`, or `mainMediaId` in the content file)

### Update Analytics Tracking for a New CTA

Just give the CTA a unique `id` in the content file. The components automatically call `trackEvent()` with that ID. The analytics dashboard will pick it up — no configuration needed.

---

## Key Conventions

- **CTA IDs**: Use kebab-case slugs like `"hero-book-qualification-call"`. These appear in analytics dashboards.
- **FAQ IDs**: Use kebab-case slugs like `"what-does-evergreen-handle"`.
- **Rich text**: Use `[[**text**]]` for gradient+bold, `**text**` for bold, `\n` for line breaks. The `RichText` component renders these.
- **Icons**: Use FontAwesome class names like `"fa-bullseye"`. The `resolveIconFromClass()` utility in `src/lib/icon-utils.ts` resolves them.
- **Video references**: a page names a video by its id in `src/features/media/videos.ts`; its address lives only there.
