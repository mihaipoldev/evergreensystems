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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = adminSupabase
      .from("projects")
      .select("*")
      .is("archived_at", null);

    if (status) {
      query = query.eq("status", status);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = query.ilike("client_name", searchPattern);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get document counts for each project
    const projectsWithCounts = await Promise.all(
      (data || []).map(async (project: any) => {
        // Count linked documents (from junction table - research documents)
        const { count: linkedCount } = await adminSupabase
          .from("project_documents")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        // Count workspace documents (documents in project's workspace KB)
        const { count: workspaceCount } = await adminSupabase
          .from("rag_documents")
          .select("*", { count: "exact", head: true })
          .eq("knowledge_base_id", project.kb_id)
          .is("deleted_at", null);

        return {
          ...project,
          document_count: (linkedCount || 0) + (workspaceCount || 0),
        };
      })
    );

    return NextResponse.json(projectsWithCounts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createServiceRoleClient();

    const body = await request.json();
    const { client_name, status, description } = body;

    if (!client_name) {
      return NextResponse.json(
        { error: "client_name is required" },
        { status: 400 }
      );
    }

    // Generate slug from client_name
    const slug = client_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug already exists
    const { data: existing } = await adminSupabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .single();

    let finalSlug = slug;
    if (existing) {
      // Add timestamp to make it unique
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Step 1: Create workspace KB for this project
    const { data: kb, error: kbError } = await (adminSupabase
      .from("rag_knowledge_bases") as any)
      .insert({
        name: `${client_name} Workspace`,
        description: `Workspace for ${client_name} project`,
        type: "project",
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (kbError) {
      return NextResponse.json({ error: kbError.message }, { status: 500 });
    }

    if (!kb) {
      return NextResponse.json(
        { error: "Failed to create workspace KB" },
        { status: 500 }
      );
    }

    // Step 2: Create project with reference to workspace KB
    const { data, error } = await (adminSupabase
      .from("projects") as any)
      .insert({
        client_name,
        slug: finalSlug,
        status: status || "active",
        description: description || null,
        kb_id: kb.id, // Required - links to workspace KB
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      // If project creation fails, clean up the KB we just created
      await adminSupabase.from("rag_knowledge_bases").delete().eq("id", kb.id);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

