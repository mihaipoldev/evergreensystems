# Phase 4: Media Strategy

## Goal

Define how media (images, videos, files) works in the new content-as-code system.

## Why Media Stays in the Database

Media files are stored in **Supabase Storage** and served via **Bunny CDN**. The `media` table tracks:
- File URLs (Supabase Storage or external)
- Type (image/video/file)
- Source type (upload/wistia/youtube/vimeo/external_url)
- Embed IDs (for video platforms)
- Thumbnails
- Duration (for videos)

This is genuinely useful metadata that belongs in a database, not in code.

## How Content Files Reference Media

### Simple approach: direct URLs

For static images that won't change (logos, icons, backgrounds):

```typescript
hero: {
  backgroundImage: "/images/hero-bg.jpg",  // static asset in public/
}
```

### Database approach: media IDs

For dynamic media (videos, galleries, uploaded content):

```typescript
stories: {
  items: [
    { mediaId: "550e8400-e29b-41d4-a716-446655440000", caption: "Client success story" },
    { mediaId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", caption: "Platform demo" },
  ]
}
```

### Fetching media at render time

```typescript
// In page.tsx (server component)
import { homeContent } from '@/features/landing/content/home';
import { getMediaByIds } from '@/lib/media/queries';

// Extract all media IDs from content
const mediaIds = extractMediaIds(homeContent);
const mediaMap = await getMediaByIds(mediaIds); // single query, returns Map<id, Media>

return <LandingPage content={homeContent} media={mediaMap} />;
```

This replaces 9 junction table joins with **1 simple query**: `SELECT * FROM media WHERE id IN (...)`.

## Media Library Admin

The `/admin/media/` page stays. It's still the place to:
- Upload new files to Supabase Storage
- View all media assets
- Get media IDs to reference in content files
- Manage Wistia/YouTube embeds

## What Changes for Media

| Before | After |
|--------|-------|
| `section_media` junction table | Media IDs in content file |
| Media attached per-section in admin | Media IDs copied from media library |
| `role` and `sort_order` in junction | Order defined by array position in content |
| Complex query joins | Single `WHERE id IN (...)` query |

## Acceptance Criteria

- [ ] `getMediaByIds` utility function created
- [ ] `extractMediaIds` helper that walks content tree for media references
- [ ] Media library admin page preserved
- [ ] All `section_media` junction table references removed
- [ ] Wistia/YouTube embed handling still works
