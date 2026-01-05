import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { knowledge_base_id, document_id } = body;

    if (!knowledge_base_id || !document_id) {
      return NextResponse.json(
        { error: "knowledge_base_id and document_id are required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const adminSupabase = createServiceRoleClient();

    // Check if document exists and is not already deleted
    const { data: document, error: fetchError } = await (adminSupabase
      .from("rag_documents") as any)
      .select("id, deleted_at")
      .eq("id", document_id)
      .eq("knowledge_base_id", knowledge_base_id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Soft delete: update deleted_at timestamp
    const { error: updateError } = await (adminSupabase
      .from("rag_documents") as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", document_id)
      .eq("knowledge_base_id", knowledge_base_id)
      .is("deleted_at", null); // Only update if not already deleted

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to delete document: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Hard delete: remove all associated chunks from rag_chunks table
    const { error: chunksDeleteError } = await (adminSupabase
      .from("rag_chunks") as any)
      .delete()
      .eq("document_id", document_id);

    if (chunksDeleteError) {
      // Log error but don't fail the request - document is already soft-deleted
      console.error("Failed to delete chunks for document:", document_id, chunksDeleteError);
      // Continue execution - operation is partially successful
    }

    // Optionally notify n8n webhook (fire-and-forget) if needed
    const webhookUrl = process.env.N8N_RAG_REMOVE_DOCUMENT_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledge_base_id,
          document_id,
        }),
      }).catch((error) => {
        console.error("Failed to trigger n8n webhook (non-blocking):", error);
        // Don't fail the request - document is already soft-deleted
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error removing document:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove document" },
      { status: 500 }
    );
  }
}

