import { getAllMedia } from "@/features/page-builder/media/data";
import { MediaLibrary } from "@/features/page-builder/media/components/MediaLibrary";

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const media = await getAllMedia();

  return <MediaLibrary initialMedia={media} />;
}
