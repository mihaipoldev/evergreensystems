import { getAllSocialPlatforms } from "@/features/page-builder/social-platforms/data";
import { SocialPlatformsList } from "@/features/page-builder/social-platforms/components/SocialPlatformsList";

export default async function SocialPlatformsPage() {
  const socialPlatforms = await getAllSocialPlatforms();

  return <SocialPlatformsList initialSocialPlatforms={socialPlatforms} />;
}
