# Landing Page Migration: Database-Driven -> Content-as-Code

## The Vision

Migrate the landing page from a complex database-driven page-builder to the simpler **funnels pattern** (content-as-TypeScript). AI (Claude) becomes the primary content editor instead of the admin UI.

## Why

1. **The admin UI is slower than AI** -- editing one field at a time vs. "change all testimonials" in one prompt
2. **12+ database queries per page load** vs. zero queries (content is bundled at build time)
3. **22 database tables** for landing page content alone -- massive complexity for minimal benefit
4. **The funnels pattern already works** -- `src/features/funnels/` proves the simpler approach

## Current State (What Exists Today)

### Database Tables (22 total for landing page)

| Category | Tables | Purpose |
|----------|--------|---------|
| **Structure** | `pages`, `sections`, `page_sections`, `site_structure` | Page/section hierarchy |
| **CTAs** | `cta_buttons`, `section_cta_buttons` | Call-to-action buttons |
| **Features** | `offer_features`, `section_features` | Feature lists |
| **Testimonials** | `testimonials`, `section_testimonials` | Customer quotes |
| **FAQ** | `faq_items`, `section_faq_items` | Q&A pairs |
| **Timeline** | `timeline`, `section_timeline` | Process steps |
| **Results** | `results`, `section_results` | Performance metrics |
| **Media** | `media`, `section_media`, `media_assets` | Images/videos/files |
| **Software** | `softwares`, `section_softwares` | Integration logos |
| **Social** | `social_platforms`, `section_socials` | Social media links |
| **Settings** | `website_settings`, `website_settings_presets`, `website_colors` | Theming |

### Admin Pages (~40 routes)

Full CRUD for: pages, sections, CTAs, FAQ, features, testimonials, timeline, results, softwares, social platforms, media, site-structure, website-settings.

### Landing Page Data Flow (Current)

```
site_structure -> pages -> page_sections -> sections
                                              |
                         +--------------------+--------------------+
                         |          |         |         |          |
                    cta_buttons  faq_items  media  testimonials  ... (9 more)
                    (via junction tables)
```

**Result**: 12+ Supabase queries per page load, cached for 60s.

### Funnels Pattern (Target)

```
TypeScript content file -> FunnelPage component -> Section components
```

**Result**: 0 database queries for content. One typed object has everything.

## Execution Strategy

**Do it in one focused session. Don't spread it across days.**

1. **Build new alongside old** -- Create `src/features/landing/` with types + content files. Extract current DB content into TypeScript. Nothing in production changes yet.
2. **Swap the data source** -- Update `page.tsx` to import from content files instead of querying DB. Test thoroughly (every section, mobile, analytics).
3. **Deploy** -- Landing page now runs from code. Old admin/tables still exist but are orphaned.
4. **Cleanup (days later)** -- Delete admin routes, API routes, `page-builder` module. Just removing files.
5. **Drop tables (weeks later)** -- Only after full confidence. Tables cost nothing sitting in Supabase.

**Critical rule**: Never delete DB tables before deploying the new code. Build new first, ship, verify, THEN clean up. Tables are your rollback safety net.

## Detailed Phase Docs

See individual documents for implementation details:

1. [Phase 1: Content Migration](./01-PHASE1-CONTENT-MIGRATION.md) -- Move landing page content to TypeScript
2. [Phase 2: Component Adaptation](./02-PHASE2-COMPONENT-ADAPTATION.md) -- Adapt landing components to accept typed props
3. [Phase 3: Database Cleanup](./03-PHASE3-DATABASE-CLEANUP.md) -- Remove unused tables and admin pages
4. [Phase 4: Media Strategy](./04-PHASE4-MEDIA-STRATEGY.md) -- How to handle media (the one thing that stays in DB)
5. [Decisions & Recommendations](./05-DECISIONS-AND-RECOMMENDATIONS.md) -- Answers to every "keep or remove?" question

## What STAYS in the Database

| Item | Why |
|------|-----|
| **`media` table** | Media files live in Supabase Storage / Bunny CDN. We need the DB to track URLs, types, thumbnails. |
| **`analytics_events`** | Tracking must persist in DB |
| **`website_settings` / `website_settings_presets`** | Theme/color config per environment -- useful to keep |

## What MOVES to Content-as-Code

| Item | Current Location | New Location |
|------|-----------------|--------------|
| Page structure | `pages` + `site_structure` + `page_sections` | Route files + content TS files |
| Section content | `sections` table | Typed objects in content files |
| CTAs | `cta_buttons` + junction | Inline in content, tracked by name/slug for analytics |
| FAQ | `faq_items` + junction | Inline in content (AI generates from analysis) |
| Features | `offer_features` + junction | Inline in content |
| Testimonials | `testimonials` + junction | Inline in content |
| Timeline | `timeline` + junction | Inline in content |
| Results | `results` + junction | Inline in content |
| Software logos | `softwares` + junction | Inline in content (icons in project) |
| Social platforms | `social_platforms` + junction | Inline in content (icons in project) |

## What Gets REMOVED

### Database Tables (to drop eventually)
- `pages`, `sections`, `page_sections`, `site_structure`
- All 9 junction tables (`section_cta_buttons`, `section_features`, etc.)
- `cta_buttons`, `offer_features`, `faq_items`, `timeline`, `results`, `softwares`, `social_platforms`
- `media_assets` (legacy, already unused)

### Admin Routes (to remove)
- `/admin/pages/` (all sub-routes)
- `/admin/sections/` (all sub-routes)
- `/admin/cta/`, `/admin/faq/`, `/admin/features/`, `/admin/testimonials/`
- `/admin/timeline/`, `/admin/results/`, `/admin/softwares/`, `/admin/social-platforms/`
- `/admin/site-structure/`
- All corresponding API routes under `/api/admin/`

### Feature Modules (to remove)
- `src/features/page-builder/` (entire directory)

## CTA Analytics Strategy

CTAs currently live in DB partly for analytics tracking. New approach:

```typescript
// Each CTA has a trackable identifier
const cta = {
  id: "hero-book-call",       // unique slug for analytics
  label: "Book a Free Call",
  url: "/book",
  style: "primary",
};
```

Analytics events reference the CTA `id` (slug) instead of a database foreign key. The `analytics_events` table stays, but references string identifiers instead of UUIDs. This is actually more readable in analytics dashboards.

## Stories / Media Binding

Stories that reference media will use media IDs from the `media` table:

```typescript
const stories = {
  items: [
    { mediaId: "uuid-from-media-table", caption: "..." },
    { mediaId: "uuid-from-media-table", caption: "..." },
  ]
};
```

The `media` table stays. Content files just reference media IDs. A simple utility fetches media by IDs at render time (single query instead of junction table joins).

## Decision Log

| Decision | Reasoning |
|----------|-----------|
| Keep `media` table | Files in Supabase Storage / Bunny CDN need DB tracking |
| Remove `pages` / `sections` tables | No longer needed when content lives in code |
| CTA tracking by slug | More readable, no DB dependency, still trackable |
| FAQ in code, not DB | AI can regenerate from analysis; no admin needed |
| Keep `website_settings` | Environment-specific theming is still useful |
| Remove all admin CRUD for content entities | AI replaces the admin UI for content management |
