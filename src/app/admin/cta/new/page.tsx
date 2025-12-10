import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import dynamicImport from "next/dynamic";

const CTAButtonForm = dynamicImport(
  () => import("@/features/cta/components/CTAButtonForm").then((mod) => mod.CTAButtonForm)
);

export const dynamic = "force-dynamic";

export default async function NewCTAPage() {
  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
        <AdminPageTitle
          title="New CTA Button"
          description="Create a new call-to-action button"
        />
      </div>
      <CTAButtonForm isEdit={false} />
    </div>
  );
}
