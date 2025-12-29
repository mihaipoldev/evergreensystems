import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { SocialPlatformForm } from "@/features/page-builder/social-platforms/components/SocialPlatformForm";

export const dynamic = "force-dynamic";

type NewSocialPlatformPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function NewSocialPlatformPage({ searchParams }: NewSocialPlatformPageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New Social Platform"
          description="Create a new social media platform"
        />
      </div>
      <SocialPlatformForm isEdit={false} returnTo={returnTo} />
    </div>
  );
}
