import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-dynamic";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: runOutput, error } = await supabase
    .from("rag_run_outputs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !runOutput) {
    notFound();
  }

  // Parse output JSON if it's a string
  let outputData: any = (runOutput as any).output_json || {};

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/intel/dashboard">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Report Output</h1>
          
          {(runOutput as any).markdown_storage_path ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground">
                Markdown content available at: {(runOutput as any).markdown_storage_path}
              </p>
              {/* TODO: Fetch and display markdown content if available */}
            </div>
          ) : (
            <div className="space-y-4">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(outputData, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border flex items-center gap-4">
            <Button variant="outline" asChild>
              <a href="#" onClick={(e) => { e.preventDefault(); window.print(); }}>
                Print
              </a>
            </Button>
            {/* TODO: Add PDF download functionality */}
          </div>
        </div>
      </div>
    </div>
  );
}

