import { getMediaById } from "@/features/page-builder/media/queries";
import FunnelPage from "@/features/funnels/components/FunnelPage";
import { commercialCleaningContent } from "@/features/funnels/content/commercial-cleaning";

const COMMERCIAL_CLEANING_VIDEO_ID = "db8e8063-4aee-4cf5-91ed-a5ceca42dc55";

export default async function CommercialCleaningPage() {
  const media = await getMediaById(COMMERCIAL_CLEANING_VIDEO_ID);

  const heroVideo = media
    ? {
        mainMedia: {
          ...media,
          section_media: {
            id: media.id,
            role: "main",
            sort_order: 0,
            status: "published" as const,
            created_at: media.created_at,
          },
        },
        videoId: media.embed_id ?? null,
        mediaUrl: media.url,
      }
    : null;

  return (
    <FunnelPage content={commercialCleaningContent} heroVideo={heroVideo} />
  );
}
