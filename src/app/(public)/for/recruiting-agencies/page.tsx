import { getMediaById } from "@/features/media/queries";
import FunnelPage from "@/features/funnels/components/FunnelPage";
import { recruitingAgenciesContent } from "@/features/funnels/content/recruiting-agencies";

const RECRUITING_AGENCIES_VIDEO_ID = "c4a55c31-051c-4d14-92c9-b566515bfd32";

export default async function RecruitingAgenciesPage() {
  const media = await getMediaById(RECRUITING_AGENCIES_VIDEO_ID);

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
    <FunnelPage content={recruitingAgenciesContent} heroVideo={heroVideo} pageSlug="for-recruiting-agencies" />
  );
}
