import { getAllMedia } from "@/features/media/data";
import { MediaLibrary } from "@/features/media/components/MediaLibrary";

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const media = await getAllMedia();

  return <MediaLibrary initialMedia={media} />;
}
