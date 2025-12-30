import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { SocialPlatformForm } from "@/features/page-builder/social-platforms/components/SocialPlatformForm";
import { getSocialPlatformById } from "@/features/page-builder/social-platforms/queries";

export const dynamic = "force-dynamic";

type EditSocialPlatformPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditSocialPlatformPage({ params, searchParams }: EditSocialPlatformPageProps) {
  const { id } = await params;
  const params_searchParams = await searchParams;
  const returnTo = params_searchParams.returnTo;

  const socialPlatform = await getSocialPlatformById(id);

  if (!socialPlatform) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="Edit Social Platform"
          entityName={socialPlatform.name}
          description="Update the social platform details"
        />
      </div>
      <SocialPlatformForm initialData={socialPlatform} isEdit={true} returnTo={returnTo} />
    </div>
  );
}
