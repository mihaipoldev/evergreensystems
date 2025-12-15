import { getAllSocialPlatforms } from "@/features/social-platforms/data";
import { SocialPlatformsList } from "@/features/social-platforms/components/SocialPlatformsList";

export default async function SocialPlatformsPage() {
  const socialPlatforms = await getAllSocialPlatforms();

  return <SocialPlatformsList initialSocialPlatforms={socialPlatforms} />;
}
