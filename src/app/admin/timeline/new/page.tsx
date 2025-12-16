import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { TimelineForm } from "@/features/timeline/components/TimelineForm";

export const dynamic = "force-dynamic";

type NewTimelinePageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function NewTimelinePage({ searchParams }: NewTimelinePageProps) {
  const params = await searchParams;
  const returnTo = params.returnTo;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New Timeline Item"
          description="Create a new timeline item"
        />
      </div>
      <TimelineForm isEdit={false} returnTo={returnTo} />
    </div>
  );
}
