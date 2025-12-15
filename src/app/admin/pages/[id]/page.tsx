import { redirect } from "next/navigation";

export default async function PagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Redirect to sections tab (client will handle tab restoration from localStorage)
  redirect(`/admin/pages/${id}/sections?tab=sections`);
}
