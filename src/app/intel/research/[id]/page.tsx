import { notFound } from "next/navigation";
import { getRunById } from "@/features/rag/runs/data";
import { RunDetailClient } from "./RunDetailClient";

export const dynamic = "force-dynamic";

type RunDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const { id } = await params;
  const run = await getRunById(id);

  if (!run) {
    notFound();
  }

  // Fetch knowledge base and workflow info
  const { createServiceRoleClient } = await import("@/lib/supabase/server");
  const supabase = createServiceRoleClient();

  const { data: kbData } = await (supabase
    .from("rag_knowledge_bases") as any)
    .select("name")
    .eq("id", run.knowledge_base_id)
    .single();

  const { data: workflowData } = run.workflow_id
    ? await (supabase
        .from("workflows") as any)
        .select("slug, name")
        .eq("id", run.workflow_id)
        .single()
    : { data: null };

  const kbDataTyped = kbData as { name: string } | null;
  const workflowDataTyped = workflowData as { slug: string; name: string } | null;

  const runWithExtras = {
    ...run,
    knowledge_base_name: kbDataTyped?.name || null,
    workflow_name: workflowDataTyped?.slug || null,
    workflow_label: workflowDataTyped?.name || null,
  };

  return <RunDetailClient run={runWithExtras} />;
}




