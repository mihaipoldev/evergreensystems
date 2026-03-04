# Decisions & Recommendations

## Your Questions, Answered

### 1. CTAs -- Keep in DB or move to code?

**Recommendation: Move to code.**

Analytics tracking does NOT require a database table for CTAs. Here's why:

Currently, CTA clicks are tracked in `analytics_events`. The event just needs an identifier. Instead of a UUID foreign key to `cta_buttons`, use a human-readable slug:

```typescript
// In content file
ctas: [
  { id: "hero-book-call", label: "Book a Free Call", url: "/book", style: "primary" },
  { id: "footer-get-started", label: "Get Started", url: "/start", style: "secondary" },
]

// In analytics tracking
trackEvent({ type: "cta_click", identifier: "hero-book-call", page: "/", ... });
```

Benefits:
- Slugs are MORE readable in analytics dashboards than UUIDs
- You can grep the codebase for a CTA slug and find exactly where it lives
- AI can update all CTAs at once across all pages
- No junction table complexity

**Verdict: Remove `cta_buttons` and `section_cta_buttons` tables.**

---

### 2. FAQ -- Keep in DB or move to code?

**Recommendation: Move to code.**

You nailed it -- AI makes FAQ management trivial. Instead of:
1. Go to admin
2. Click "New FAQ"
3. Fill in question field
4. Fill in answer field
5. Save
6. Go to section
7. Attach FAQ to section
8. Set position

You just say: "Add these 3 new FAQs to the home page based on common customer questions" and it's done in one prompt.

Analytics for "which FAQ gets clicked most" can still be tracked by FAQ slug:

```typescript
faqs: [
  { id: "what-is-included", question: "What's included?", answer: "..." },
  { id: "how-pricing-works", question: "How does pricing work?", answer: "..." },
]

// Track expansion
trackEvent({ type: "faq_expand", identifier: "what-is-included", page: "/" });
```

**Verdict: Remove `faq_items` and `section_faq_items` tables.**

---

### 3. Media Library -- Keep?

**Recommendation: Absolutely keep.**

The `media` table is the one thing that genuinely needs a database. Files live in Supabase Storage / Bunny CDN and need metadata tracking. Content files reference media by ID.

**Verdict: Keep `media` table and `/admin/media/` page.**

---

### 4. Social Platforms -- Keep in DB or move to code?

**Recommendation: Move to code.**

Social platform icons and URLs are completely static. They change maybe once a year. Perfect for code:

```typescript
socialPlatforms: [
  { name: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/company/..." },
  { name: "Instagram", icon: "instagram", url: "https://instagram.com/..." },
]
```

Icons can be from a library (lucide-react, react-icons) or SVGs in the project. No DB needed.

**Verdict: Remove `social_platforms` and `section_socials` tables.**

---

### 5. Testimonials -- Keep in DB or move to code?

**Recommendation: Move to code.**

Testimonials are curated content. You select which ones to show and in what order. This is exactly what a content file excels at:

```typescript
testimonials: [
  {
    id: "john-doe-acme",
    author: "John Doe",
    role: "CEO",
    company: "Acme Corp",
    quote: "Incredible results...",
    rating: 5,
    avatarUrl: "/images/testimonials/john.jpg", // or mediaId for DB media
  },
]
```

With AI, updating testimonials is: "Replace the third testimonial with this new one from Sarah at TechCo."

**Verdict: Remove `testimonials` and `section_testimonials` tables.**

---

### 6. Timeline -- Remove?

**Recommendation: Move to code (or remove entirely if not used).**

Timeline steps are static process descriptions. Perfect for code. If the landing page no longer uses a timeline section, just don't include it in the content file.

**Verdict: Remove `timeline` and `section_timeline` tables.**

---

### 7. Stories -- Keep in DB or move to code?

**Recommendation: Move to code, but reference media IDs.**

Stories are essentially a curated media gallery with captions. The media files stay in DB, but the curation (which media, what order, what captions) moves to code:

```typescript
stories: {
  items: [
    { mediaId: "uuid-1", caption: "Before & After", type: "video" },
    { mediaId: "uuid-2", caption: "Client walkthrough", type: "video" },
  ]
}
```

**Verdict: Remove `section_media` junction table. Keep `media` table. Stories reference media IDs directly.**

---

### 8. Results / Performance -- Move to code?

**Recommendation: Move to code.**

Results are already stored as JSONB blobs -- they're basically already "content as data." Moving them to TypeScript just makes them typed:

```typescript
results: {
  metrics: [
    { label: "Revenue Increase", value: "340%", description: "Average across clients" },
    { label: "Response Time", value: "< 2hrs", description: "First contact speed" },
  ]
}
```

**Verdict: Remove `results` and `section_results` tables.**

---

### 9. Software Logos -- Move to code?

**Recommendation: Move to code.**

Integration logos are static. Use project assets:

```typescript
logos: {
  items: [
    { name: "Salesforce", icon: "/images/logos/salesforce.svg" },
    { name: "HubSpot", icon: "/images/logos/hubspot.svg" },
  ]
}
```

**Verdict: Remove `softwares` and `section_softwares` tables.**

---

## Summary: What Stays vs What Goes

### KEEP (3 areas)
1. `media` table + admin page -- real file management
2. `analytics_events` -- tracking (reference CTAs/FAQs by slug)
3. `website_settings` / `website_settings_presets` / `website_colors` -- theming

### REMOVE (everything else)
- `pages`, `sections`, `page_sections`, `site_structure`
- All 9 junction tables
- `cta_buttons`, `offer_features`, `faq_items`, `testimonials`, `timeline`, `results`, `softwares`, `social_platforms`, `media_assets`
- Entire `src/features/page-builder/` module
- ~30 admin routes + ~40 API routes

### NET RESULT
- **22 tables -> 5 tables** (media, analytics_events, website_settings, website_settings_presets, website_colors)
- **12+ queries per page load -> 0-1** (only for media if needed)
- **~30 admin pages -> ~5** (media, analytics, settings, website-settings, site-preferences)
- **Content managed by AI** instead of one-field-at-a-time admin UI
