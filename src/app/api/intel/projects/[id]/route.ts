import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

export async function GET(
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
    const { data: project, error: projectError } = await adminSupabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single<Database["public"]["Tables"]["projects"]["Row"]>();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get workspace KB info
    const { data: kb, error: kbError } = await adminSupabase
      .from("rag_knowledge_bases")
      .select("id, name, type")
      .eq("id", project.kb_id)
      .single();

    if (kbError) {
      return NextResponse.json({ error: kbError.message }, { status: 500 });
    }

    const data = {
      ...project,
      rag_knowledge_bases: kb,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { 
      project_type_id,
      client_name, 
      name,
      status, 
      description,
      geography,
      category
    } = body;

    // Get current project to determine type
    const { data: currentProject } = await adminSupabase
      .from("projects")
      .select("project_type_id")
      .eq("id", id)
      .single();

    if (!currentProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get project type
    const typedCurrentProject = currentProject as { project_type_id: string | null } | null;
    const effectiveProjectTypeId = project_type_id || typedCurrentProject?.project_type_id;
    const { data: projectType } = await adminSupabase
      .from("project_types")
      .select("name")
      .eq("id", effectiveProjectTypeId)
      .single();

    const typedProjectType = projectType as { name: string } | null;
    const isClientType = typedProjectType?.name === "client";
    const isNicheType = typedProjectType?.name === "niche";

    const updateData: Database["public"]["Tables"]["projects"]["Update"] & {
      project_type_id?: string;
      geography?: string | null;
      category?: string | null;
    } = {};
    
    // Update project_type_id if provided
    if (project_type_id !== undefined) updateData.project_type_id = project_type_id;
    
    // Update type-specific fields
    if (isClientType) {
      if (client_name !== undefined) {
        updateData.client_name = client_name;
        updateData.name = client_name; // Keep name in sync
      }
      if (status !== undefined) updateData.status = status;
    } else if (isNicheType) {
      if (name !== undefined) {
        updateData.name = name;
        updateData.client_name = name; // Keep client_name for backward compatibility
      }
      if (geography !== undefined) updateData.geography = geography || null;
      if (category !== undefined) updateData.category = category || null;
      // Niche research projects default to "active" status
      if (status !== undefined) updateData.status = status;
    }
    
    if (description !== undefined) updateData.description = description || null;
    // Note: kb_id is not updatable - workspace KB is immutable

    const { data, error } = await (adminSupabase
      .from("projects") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
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
    
    const { error } = await adminSupabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

