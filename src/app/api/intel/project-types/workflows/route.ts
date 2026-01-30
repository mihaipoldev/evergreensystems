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
    const projectTypeId = searchParams.get("project_type_id");
    const projectType = searchParams.get("project_type"); // Fallback for backward compatibility
    // Keep backward compatibility with old parameter names
    const subjectTypeId = searchParams.get("subject_type_id");
    const subjectType = searchParams.get("subject_type");

    // Prefer project_type_id, then project_type, then fallback to old names
    const effectiveProjectTypeId = projectTypeId || subjectTypeId;
    const effectiveProjectType = projectType || subjectType;

    if (!effectiveProjectTypeId && !effectiveProjectType) {
      return NextResponse.json(
        { error: "project_type_id or project_type query parameter is required" },
        { status: 400 }
      );
    }

    // Map project_type_id/project_type to project_type_id
    let resolvedProjectTypeId: string | null = null;
    
    if (effectiveProjectTypeId) {
      // Try to find project_type by ID or name
      const { data: projectTypeData } = await adminSupabase
        .from("project_types")
        .select("id")
        .or(`id.eq.${effectiveProjectTypeId.trim()},name.eq.${effectiveProjectTypeId.trim()}`)
        .single();
      
      resolvedProjectTypeId = (projectTypeData as { id: string } | null)?.id || null;
    } else if (effectiveProjectType) {
      // Find project_type by name
      const { data: projectTypeData } = await adminSupabase
        .from("project_types")
        .select("id")
        .eq("name", effectiveProjectType.trim())
        .single();
      
      resolvedProjectTypeId = (projectTypeData as { id: string } | null)?.id || null;
    }

    if (!resolvedProjectTypeId) {
      return NextResponse.json(
        { error: "Invalid project_type_id or project_type" },
        { status: 400 }
      );
    }

    // Query project_type_workflows
    const query = adminSupabase
      .from("project_type_workflows")
      .select(`
        display_order,
        workflows (
          id,
          slug,
          name,
          description,
          icon,
          estimated_cost,
          estimated_time_minutes,
          input_schema,
          enabled,
          created_at,
          updated_at
        )
      `)
      .eq("project_type_id", resolvedProjectTypeId);

    const { data, error } = await query.order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract workflows from the nested structure, filter enabled ones, and preserve display_order
    const workflows = (data || [])
      .filter((item: any) => item.workflows !== null && item.workflows.enabled === true)
      .map((item: any) => ({
        ...item.workflows,
        display_order: item.display_order,
      }));

    return NextResponse.json(workflows, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

