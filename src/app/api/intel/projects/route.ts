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
    const projectTypeId = searchParams.get("project_type_id");

    let query = adminSupabase
      .from("projects")
      .select("*")
      .is("archived_at", null);

    if (status) {
      query = query.eq("status", status);
    }

    if (projectTypeId) {
      query = query.eq("project_type_id", projectTypeId);
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
        // Count linked documents (from junction table - project documents)
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
    const { 
      project_type_id, 
      client_name, 
      name, 
      status, 
      description, 
      geography, 
      category 
    } = body;

    // Validate project_type_id
    if (!project_type_id) {
      return NextResponse.json(
        { error: "project_type_id is required" },
        { status: 400 }
      );
    }

    // Get project type to determine which fields are required
    const { data: projectType } = await adminSupabase
      .from("project_types")
      .select("name")
      .eq("id", project_type_id)
      .single();

    if (!projectType) {
      return NextResponse.json(
        { error: "Invalid project_type_id" },
        { status: 400 }
      );
    }

    const typedProjectType = projectType as { name: string };
    const isClientType = typedProjectType.name === "client";
    const isNicheType = typedProjectType.name === "niche";

    // Validate based on project type
    if (isClientType && !client_name) {
      return NextResponse.json(
        { error: "client_name is required for client projects" },
        { status: 400 }
      );
    }

    if (isNicheType && !name) {
      return NextResponse.json(
        { error: "name is required for niche research projects" },
        { status: 400 }
      );
    }

    // Determine display name for KB
    const displayName = isClientType ? client_name : name;

    // Step 1: Create workspace KB for this project
    const kbName = isClientType 
      ? `${client_name} Knowledge Base`
      : `${name} Knowledge Base`;
    
    const { data: kb, error: kbError } = await (adminSupabase
      .from("rag_knowledge_bases") as any)
      .insert({
        name: kbName,
        description: `Knowledge Base for ${displayName} project`,
        type: "project",
        kb_type: isClientType ? "client" : "project",
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
    const projectData: any = {
      project_type_id,
      status: status || "active",
      description: description || null,
      kb_id: kb.id, // Required - links to workspace KB
      created_by: user.id,
    };

    // Add type-specific fields
    if (isClientType) {
      projectData.client_name = client_name;
      projectData.name = client_name; // Set name to client_name for consistency
    } else if (isNicheType) {
      projectData.name = name;
      projectData.geography = geography || null;
      projectData.category = category || null;
      projectData.client_name = name; // Set client_name to name for backward compatibility
    }

    const { data, error } = await (adminSupabase
      .from("projects") as any)
      .insert(projectData)
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

