import { getAllPages } from "@/features/page-builder/pages/data";
import { PagesList } from "@/features/page-builder/pages/components/PagesList";

export const dynamic = 'force-dynamic';

export default async function PagesPage() {
  const pages = await getAllPages();

  return <PagesList initialPages={pages || []} />;
}
