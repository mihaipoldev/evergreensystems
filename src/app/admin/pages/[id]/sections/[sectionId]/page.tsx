import { redirect } from "next/navigation";

type SectionPageProps = {
  params: Promise<{ id: string; sectionId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SectionPage({ params, searchParams }: SectionPageProps) {
  const { id: pageId, sectionId } = await params;
  const searchParamsObj = await searchParams;
  
  // Build query string from search params (preserve tab and other params)
  const queryParams = new URLSearchParams();
  queryParams.set("pageId", pageId);
  
  // Preserve existing query params (like tab)
  Object.entries(searchParamsObj).forEach(([key, value]) => {
    if (key !== "pageId" && value) {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.set(key, value);
      }
    }
  });
  
  // Redirect to new URL structure
  redirect(`/admin/sections/${sectionId}?${queryParams.toString()}`);
}
