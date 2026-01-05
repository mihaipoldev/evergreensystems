import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();

    const { id } = await params;
    const body = await request.json();
    const { document_ids } = body;

    if (!Array.isArray(document_ids)) {
      return NextResponse.json(
        { error: "document_ids must be an array" },
        { status: 400 }
      );
    }

    if (document_ids.length === 0) {
      return NextResponse.json({ message: "No documents to link" }, { status: 200 });
    }

    // Insert records into junction table
    const records = document_ids.map((docId: string) => ({
      project_id: id,
      document_id: docId,
    }));

    const { data, error } = await (adminSupabase
      .from("project_documents") as any)
      .insert(records)
      .select();

    if (error) {
      // If error is due to duplicate, that's okay - document already linked
      if (error.code === "23505") {
        return NextResponse.json({ message: "Documents linked (some may have been already linked)" }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: "Documents linked successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();

    const { id } = await params;
    const body = await request.json();
    const { document_ids } = body;

    if (!Array.isArray(document_ids)) {
      return NextResponse.json(
        { error: "document_ids must be an array" },
        { status: 400 }
      );
    }

    if (document_ids.length === 0) {
      return NextResponse.json({ message: "No documents to unlink" }, { status: 200 });
    }

    // Delete records from junction table
    const { error } = await adminSupabase
      .from("project_documents")
      .delete()
      .eq("project_id", id)
      .in("document_id", document_ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Documents unlinked successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

