import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { TimelineForm } from "@/features/page-builder/timeline/components/TimelineForm";
import { getTimelineItemById } from "@/features/page-builder/timeline/queries";

export const dynamic = "force-dynamic";

type EditTimelinePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditTimelinePage({ params, searchParams }: EditTimelinePageProps) {
  const { id } = await params;
  const params_searchParams = await searchParams;
  const returnTo = params_searchParams.returnTo;

  const timelineItem = await getTimelineItemById(id);

  if (!timelineItem) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="Edit Timeline Item"
          entityName={timelineItem.title}
          description="Update the timeline item details"
        />
      </div>
      <TimelineForm initialData={timelineItem} isEdit={true} returnTo={returnTo} />
    </div>
  );
}
