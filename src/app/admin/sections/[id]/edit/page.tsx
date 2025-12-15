import { notFound, redirect } from "next/navigation";
import { getFirstPageIdBySectionId } from "@/lib/supabase/queries";

type EditSectionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSectionPage({ params }: EditSectionPageProps) {
  const { id } = await params;
  
  // Get the first page ID that contains this section
  const pageId = await getFirstPageIdBySectionId(id);
  
  if (!pageId) {
    notFound();
  }

  // Redirect to new URL structure with query param
  redirect(`/admin/pages/${pageId}/sections/${id}?tab=edit`);
}
