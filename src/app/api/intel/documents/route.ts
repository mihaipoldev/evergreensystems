import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const kbId = searchParams.get("kb_id"); // Project's workspace KB ID to exclude

    // If project_id and kb_id are provided, return linkable documents (for project linking)
    // Otherwise, return all documents (for general documents page)
    if (!projectId || !kbId) {
      // Return all documents for general documents page
      const { data: allDocuments, error: docsError } = await adminSupabase
        .from("rag_documents")
        .select(`
          *,
          rag_knowledge_bases (
            id,
            name
          )
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (docsError) {
        return NextResponse.json({ error: docsError.message }, { status: 500 });
      }

      // Add KB name to each document
      const documentsWithKB = (allDocuments || []).map((doc: any) => {
        const kbData = Array.isArray(doc.rag_knowledge_bases) 
          ? doc.rag_knowledge_bases[0] 
          : doc.rag_knowledge_bases;
        return {
          ...doc,
          rag_knowledge_bases: undefined, // Remove nested object
          knowledge_base_name: kbData?.name || null,
        };
      });

      return NextResponse.json(
        documentsWithKB, // Return as array for documents page
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );
    }

    // Get all documents already linked to this project
    const { data: linkedDocs } = await adminSupabase
      .from("project_documents")
      .select("document_id")
      .eq("project_id", projectId);

    const linkedDocumentIds = new Set(
      (linkedDocs || []).map((link: any) => link.document_id)
    );

    // Fetch all documents from all knowledge bases
    // Exclude documents from the project's workspace KB and already linked documents
    const { data: allDocuments, error: docsError } = await adminSupabase
      .from("rag_documents")
      .select(`
        *,
        rag_knowledge_bases (
          id,
          name
        )
      `)
      .neq("knowledge_base_id", kbId) // Exclude project's workspace KB
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (docsError) {
      return NextResponse.json({ error: docsError.message }, { status: 500 });
    }

    // Filter out already linked documents and add KB name
    const linkableDocuments = (allDocuments || [])
      .filter((doc: any) => !linkedDocumentIds.has(doc.id))
      .map((doc: any) => {
        const kbData = Array.isArray(doc.rag_knowledge_bases) 
          ? doc.rag_knowledge_bases[0] 
          : doc.rag_knowledge_bases;
        return {
          ...doc,
          rag_knowledge_bases: undefined, // Remove nested object
          knowledge_base_name: kbData?.name || null,
        };
      });

    return NextResponse.json(
      { documents: linkableDocuments },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
