# Phase 3: Database & Admin Cleanup

## Goal

Remove unused database tables, admin pages, API routes, and feature modules once the landing page runs entirely from content-as-code.

## Important: Do This LAST

Only proceed with this phase after Phase 1 and 2 are complete and verified in production. Keep the old system around as a fallback until you're confident.

## What to Remove

### 3.1 Admin Routes

Remove these `src/app/admin/` directories:

```
admin/pages/          -- Page CRUD (all sub-routes)
admin/sections/       -- Section CRUD (all sub-routes)
admin/cta/            -- CTA CRUD
admin/faq/            -- FAQ CRUD
admin/features/       -- Features CRUD
admin/testimonials/   -- Testimonials CRUD
admin/timeline/       -- Timeline CRUD
admin/results/        -- Results CRUD
admin/softwares/      -- Softwares CRUD
admin/social-platforms/ -- Social platforms CRUD
admin/site-structure/ -- Site structure management
```

**Keep**:
```
admin/media/          -- Still needed for media library
admin/analytics/      -- Still needed
admin/settings/       -- Still needed
admin/website-settings/ -- Still needed (theming)
admin/site-preferences/ -- Still needed
admin/ai-knowledge/   -- Unrelated, keep
admin/kb/             -- Unrelated, keep
```

### 3.2 API Routes

Remove these `src/app/api/admin/` directories:

```
api/admin/pages/
api/admin/sections/
api/admin/cta-buttons/
api/admin/faq-items/
api/admin/offer-features/
api/admin/testimonials/
api/admin/timeline/
api/admin/results/
api/admin/softwares/
api/admin/social-platforms/
api/admin/media-assets/     -- Legacy, already unused
```

**Keep**:
```
api/admin/media/            -- Still needed
```

### 3.3 Feature Modules

Remove: `src/features/page-builder/` (entire directory)

This includes:
- `pages/` -- types, queries, hooks, components
- `sections/` -- types, queries, hooks, components (including all 11 tab components)
- `cta/`, `faq/`, `features/`, `media/`, `results/`, `testimonials/`, `timeline/`, `softwares/`, `social-platforms/`, `site-structure/`

**Note**: The media queries module may need to be preserved or moved, since we still fetch media. Evaluate what `src/features/page-builder/media/queries.ts` contains and whether `getMediaByIds` needs to live somewhere else.

### 3.4 Database Tables

Create a Supabase migration to drop tables. Order matters (junction tables first, then base tables):

```sql
-- Junction tables first
DROP TABLE IF EXISTS section_cta_buttons;
DROP TABLE IF EXISTS section_features;
DROP TABLE IF EXISTS section_testimonials;
DROP TABLE IF EXISTS section_faq_items;
DROP TABLE IF EXISTS section_timeline;
DROP TABLE IF EXISTS section_results;
DROP TABLE IF EXISTS section_softwares;
DROP TABLE IF EXISTS section_socials;
DROP TABLE IF EXISTS section_media;
DROP TABLE IF EXISTS page_sections;

-- Base content tables
DROP TABLE IF EXISTS cta_buttons;
DROP TABLE IF EXISTS offer_features;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS faq_items;
DROP TABLE IF EXISTS timeline;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS softwares;
DROP TABLE IF EXISTS social_platforms;
DROP TABLE IF EXISTS media_assets;  -- legacy

-- Structure tables
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS site_structure;
DROP TABLE IF EXISTS pages;
```

**Keep**: `media`, `website_settings`, `website_settings_presets`, `website_colors`, `analytics_events`

### 3.5 Type Definitions

Update `src/lib/supabase/types.ts` to remove type definitions for dropped tables. This file is likely auto-generated from the Supabase schema, so regenerating after the migration should handle it.

### 3.6 Admin Navigation

Update the admin sidebar/navigation to remove links to deleted admin pages.

## Acceptance Criteria

- [ ] All unused admin routes removed
- [ ] All unused API routes removed
- [ ] `page-builder` feature module removed
- [ ] Database migration created and tested
- [ ] Supabase types regenerated
- [ ] Admin navigation updated
- [ ] No broken imports or dead references
- [ ] Build passes cleanly
