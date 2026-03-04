# How This Website Works

## Architecture Overview

This is a Next.js 16 application deployed on Vercel. All content is managed as **TypeScript files** (content-as-code), not through a database admin UI. AI (Claude) is the primary content editor.

### What's in the Database (5 tables)

| Table | Purpose |
|-------|---------|
| `media` | Images/videos stored in Bunny CDN. Tracked by URL, type, thumbnail, duration. |
| `analytics_events` | All user tracking: page views, CTA clicks, FAQ expansions, sessions. |
| `website_settings` | Per-environment route config (links routes to styling presets). |
| `website_settings_presets` | Styling presets (colors, visual effects like dots/wave/noise). |
| `website_colors` | Color palette definitions. |

### What's in Code (everything else)

All page content — CTAs, FAQs, features, timelines, results, testimonials, social links, logos — lives in TypeScript files under `src/features/`.

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
      media/                     # Media library (upload/manage videos & images)
      settings/                  # Admin settings (appearance)
      website-settings/          # Website styling presets
      login/
    api/
      admin/
        analytics/               # Analytics API (events, stats, CTA/FAQ drill-down)
        media/                   # Media CRUD API
        upload/                  # File upload to Bunny CDN
        ai/                      # AI preset generation
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
    media/                       # Media module (DB-backed)
      types.ts                   # Media, MediaWithSection, legacy types
      queries.ts                 # getMediaById, getAllMedia, createMedia, etc.
      hooks/                     # useMedia React Query hook
      components/                # MediaLibrary, MediaForm, MediaSelector
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
```

---

## The Two Content Systems

### 1. Landing Page (`src/features/landing/`)

The home page at `/` uses the **landing content system**.

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

**How the page renders** (`src/app/(public)/page.tsx`):
```
1. Import homeContent from content file
2. Fetch styling options from DB (dots, wave gradient, noise texture)
3. Fetch hero media by ID from DB (single query)
4. Run adapter functions to transform content -> component props
5. Render components with adapted data
```

**DB queries per page load: 2** (styling preset + hero media). Everything else is from code.

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

Media is the **one thing that stays in the database**. Files are uploaded to Bunny CDN, and the `media` table tracks metadata.

### Media Flow

1. Upload via admin (`/admin/media`) -> Bunny CDN
2. `media` table stores: `id`, `type`, `source_type`, `url`, `embed_id`, `name`, `thumbnail_url`, `duration`
3. Content files reference media by UUID: `mainMediaId: "c75d439e-00de-40ae-a874-30a7acb9d0ef"`
4. At render time, `getMediaById(id)` fetches the media record (single query)

### Supported Media Types

- **Videos**: Wistia, YouTube, Vimeo (via embed ID), or direct URL
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

### Per-Environment Presets

`website_settings` links a route + environment to a preset:
- Route `/` in `production` -> preset with specific colors & effects
- Route `/` in `development` -> can have different preset

### Visual Effects

Each preset's `styling_options` JSON controls:
- `dots_enabled` — dot pattern background
- `wave_gradient_enabled` — radial gradient wave effect
- `noise_texture_enabled` — noise texture overlay

### Admin UI

`/admin/settings` — appearance/theme settings
`/admin/website-settings` — per-route preset assignment

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

### Add/Change Media

1. Go to `/admin/media`
2. Upload new media (goes to Bunny CDN)
3. Copy the media UUID
4. Reference it in the content file: `mainMediaId: "the-uuid"`

### Update Analytics Tracking for a New CTA

Just give the CTA a unique `id` in the content file. The components automatically call `trackEvent()` with that ID. The analytics dashboard will pick it up — no configuration needed.

---

## Key Conventions

- **CTA IDs**: Use kebab-case slugs like `"hero-book-qualification-call"`. These appear in analytics dashboards.
- **FAQ IDs**: Use kebab-case slugs like `"what-does-evergreen-handle"`.
- **Rich text**: Use `[[**text**]]` for gradient+bold, `**text**` for bold, `\n` for line breaks. The `RichText` component renders these.
- **Icons**: Use FontAwesome class names like `"fa-bullseye"`. The `resolveIconFromClass()` utility in `src/lib/icon-utils.ts` resolves them.
- **Media references**: Always use the UUID from the `media` table, never hardcode URLs.
