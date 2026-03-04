# Phase 2: Component Adaptation

## Goal

Adapt existing landing page components (`src/components/landing/`) to accept typed content props instead of database-fetched section objects.

## Current vs Target

### Current (database-driven)
```tsx
// page.tsx fetches from DB, passes loose objects
<Hero section={section} ctaButtons={section.ctaButtons} />

// Hero.tsx receives untyped section + separate arrays
function Hero({ section, ctaButtons }: { section: SectionWithContent; ctaButtons: CTAButton[] }) {
  const title = section.title;
  const content = section.content as { topBanner?: {...} };
  // ...
}
```

### Target (content-as-code)
```tsx
// page.tsx imports content, passes typed slice
<Hero content={landingContent.hero} />

// Hero.tsx receives strongly typed content
function Hero({ content }: { content: HeroContent }) {
  const { title, topBanner, ctas } = content;
  // ...
}
```

## Steps

### 2.1 Adapter Approach (Gradual Migration)

Rather than rewriting all 13 landing components at once, we can:

1. Create a thin adapter that transforms `LandingPageContent` sections into the shape each component currently expects
2. Swap the data source in `page.tsx` from DB queries to content import + adapter
3. Gradually refactor each component to accept the new typed props directly
4. Remove adapters once all components are updated

### 2.2 Update page.tsx

The main landing page (`src/app/(public)/page.tsx`) changes from:

```tsx
// Before: 12+ DB queries
const homePage = await getActivePageBySlug('home');
const sections = await getVisibleSectionsByPageId(homePage.id);
// render loop with switch on section.type
```

To:

```tsx
// After: import content, maybe 1 query for media
import { homeContent } from '@/features/landing/content/home';

const mediaIds = extractMediaIds(homeContent);
const media = await getMediaByIds(mediaIds); // single query

return <LandingPage content={homeContent} media={media} />;
```

### 2.3 Component Refactoring Priority

Order by complexity and dependencies:

1. **Simple text sections** (low risk): Header, CTA, Footer
2. **List sections** (medium): FAQ, Timeline, Features, Offer, Testimonials, Results
3. **Media sections** (needs media fetch): Hero, Stories, Performance
4. **Interactive**: Logos (software icons), Navbar

### 2.4 Shared Components

Some landing components are used by both the landing page and funnels. Consider:
- Can we unify the component libraries? (Funnels has its own FAQ, Timeline, Footer, etc.)
- Or keep them separate but both accepting typed props?

Decision: Evaluate during implementation. If components are similar enough, unify. If significantly different, keep separate.

## Acceptance Criteria

- [ ] `LandingPage` component created (similar to `FunnelPage`)
- [ ] `page.tsx` imports content from TypeScript instead of DB
- [ ] All 13 section components accept typed props
- [ ] Media fetching consolidated to single query
- [ ] Visual output identical to current (no regressions)
- [ ] Analytics tracking still works for CTAs
