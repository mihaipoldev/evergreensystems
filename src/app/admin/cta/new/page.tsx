import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import dynamicImport from "next/dynamic";

const CTAButtonForm = dynamicImport(
  () => import("@/features/page-builder/cta/components/CTAButtonForm").then((mod) => mod.CTAButtonForm)
);

export const dynamic = "force-dynamic";

type NewCTAPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function NewCTAPage({ searchParams }: NewCTAPageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New CTA Button"
          description="Create a new call-to-action button"
        />
      </div>
      <CTAButtonForm isEdit={false} returnTo={returnTo} />
    </div>
  );
}
