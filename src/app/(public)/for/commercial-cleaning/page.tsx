import { getActivePageBySlug } from "@/features/page-builder/pages/queries";
import { getVisibleSectionsByPageId } from "@/features/page-builder/sections/queries";
import FunnelPage from "@/features/funnels/components/FunnelPage";
import { commercialCleaningContent } from "@/features/funnels/content/commercial-cleaning";
import type { MediaWithSection } from "@/features/page-builder/media/types";

function getMainMedia(section: { media?: MediaWithSection[]; media_url?: string | null }) {
  if (!section?.media?.length) return null;
  const main = section.media.find((m) => m.section_media?.role === "main");
  return main ?? section.media[0] ?? null;
}

export default async function CommercialCleaningPage() {
  const homePage = await getActivePageBySlug("home");
  let heroVideo: {
    mainMedia: MediaWithSection | null;
    videoId: string | null;
    mediaUrl: string | null;
  } | null = null;

  if (homePage) {
    const sections = await getVisibleSectionsByPageId(homePage.id);
    const hero = sections.find((s) => s.type === "hero");
    if (hero) {
      const mainMedia = getMainMedia(hero);
      const videoId =
        mainMedia?.embed_id ??
        (mainMedia?.source_type === "wistia" && mainMedia?.embed_id ? mainMedia.embed_id : null) ??
        null;
      heroVideo = {
        mainMedia: mainMedia ?? null,
        videoId,
        mediaUrl: hero.media_url ?? null,
      };
    }
  }

  return (
    <FunnelPage content={commercialCleaningContent} heroVideo={heroVideo} />
  );
}
