import { notFound } from "next/navigation";
import { getWorkflowById } from "@/features/rag/workflows/data";
import { WorkflowDetailClient } from "./WorkflowDetailClient";

export const dynamic = "force-dynamic";

type WorkflowDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const { id } = await params;
  const workflow = await getWorkflowById(id);

  if (!workflow) {
    notFound();
  }

  return (
    <WorkflowDetailClient workflow={workflow} />
  );
}

