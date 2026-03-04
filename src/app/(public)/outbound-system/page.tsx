import { getMediaById } from "@/features/media/queries";
import FunnelPage from "@/features/funnels/components/FunnelPage";
import { outboundSystemContent } from "@/features/funnels/content/outbound-system";
import { homeContent } from "@/features/landing/content/home";

export default async function OutboundSystemPage() {
  // Reuse the hero media ID from the landing page content
  const media = await getMediaById(homeContent.hero.mainMediaId).catch(() => null);

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
    <FunnelPage content={outboundSystemContent} heroVideo={heroVideo} />
  );
}
