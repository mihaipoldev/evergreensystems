import { getAllPages } from "@/features/pages/data";
import { PagesList } from "@/features/pages/components/PagesList";

export default async function PagesPage() {
  const pages = await getAllPages();

  return <PagesList initialPages={pages || []} />;
}
