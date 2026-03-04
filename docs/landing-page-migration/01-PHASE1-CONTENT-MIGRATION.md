# Phase 1: Content Migration

## Goal

Extract all current landing page content from the database into TypeScript content files following the funnels pattern.

## Steps

### 1.1 Define the Landing Page Content Type

Create a new content type that covers all the sections the landing page uses. The funnels `FunnelContent` type is a good starting point, but the landing page has different/additional sections:

**Current landing page sections** (in order):
- `hero` -- headline, subheadline, top banner, bottom bar, CTAs
- `header` -- title, subtitle, eyebrow, CTAs
- `logos` -- software integrations grid
- `stories` -- media gallery (videos/images)
- `features` -- feature cards with icons
- `offer` -- feature list (different layout from features)
- `testimonials` -- customer quotes with ratings
- `results` -- performance metrics (JSONB content)
- `performance` -- performance data display
- `faq` -- question/answer pairs
- `cta` -- call-to-action blocks with buttons
- `timeline` -- process steps
- `footer` -- social links, company info

We need a `LandingPageContent` type that accommodates all of these.

### 1.2 Export Current Content

Write a one-time script that:
1. Queries the current production landing page from DB
2. Fetches all sections and their child content
3. Outputs a TypeScript file with the content as a typed constant

This gives us a verified starting point -- the exact current content, just in code form.

### 1.3 Create the Content File

Place at: `src/features/landing/content/home.ts`

Structure mirrors the funnels pattern:
```
src/features/landing/
  types.ts                -- LandingPageContent type and section types
  content/
    home.ts               -- Main landing page content
    index.ts              -- Registry (for future additional landing pages)
```

### 1.4 Media References

For sections that reference media (stories, hero videos), the content file stores media IDs:

```typescript
hero: {
  // ... text content
  videoId: "uuid-from-media-table",  // fetched at render time
}
```

A single `getMediaByIds(ids[])` query replaces the complex junction table joins.

## Acceptance Criteria

- [ ] `LandingPageContent` type defined with all section types
- [ ] Current landing page content exported to TypeScript
- [ ] Content file compiles and type-checks
- [ ] All media references use media table UUIDs
- [ ] No content lost in migration (visual diff should be identical)
