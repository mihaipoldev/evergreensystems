import type { Media } from "./types";

/**
 * The site's videos, in code (POR-608). Each entry is the `public.media` row it was copied from on
 * 2026-10-02 (the columns the site selected); those rows are no longer read. A page names a video
 * by its id and gets it with `videoById`. Plays are tracked by that id (`analytics_events`,
 * `entity_type: "media"`), so an id never changes: a replaced video is a new entry with a new id
 * (`crypto.randomUUID()`), its file on Bunny CDN or its video on Wistia.
 */
const VIDEOS: readonly Media[] = [
  {
    // The commercial-cleaning funnel's hero (COMMERCIAL_CLEANING_VIDEO_ID).
    id: "db8e8063-4aee-4cf5-91ed-a5ceca42dc55",
    type: "video",
    source_type: "upload",
    url: "https://evergreensystems.b-cdn.net/media/temp/video_1772289310266.mp4",
    embed_id: null,
    name: null,
    thumbnail_url: "https://evergreensystems.b-cdn.net/media/temp/image_1772289322850.png",
    duration: null,
    created_at: "2026-02-28T14:35:23.389492+00:00",
    updated_at: "2026-02-28T14:35:23.389492+00:00",
  },
  {
    // The home hero's video (homeContent.hero.mainMediaId, also RECRUITING_AGENCIES_VIDEO_ID):
    // /for/recruiting-agencies, /outbound-system and /legacy.
    id: "c4a55c31-051c-4d14-92c9-b566515bfd32",
    type: "video",
    source_type: "wistia",
    url: "wistia:64vndqgnka",
    embed_id: "64vndqgnka",
    name: "asd",
    thumbnail_url: null,
    duration: null,
    created_at: "2026-06-04T12:05:33.595327+00:00",
    updated_at: "2026-06-04T12:05:33.595327+00:00",
  },
];

/** The video with this id, or null when the site has none (as a missing row was). */
export function videoById(id: string): Media | null {
  return VIDEOS.find((video) => video.id === id) ?? null;
}
