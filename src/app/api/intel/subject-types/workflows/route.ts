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
    const subjectType = searchParams.get("subject_type");

    if (!subjectType || !subjectType.trim()) {
      return NextResponse.json(
        { error: "subject_type query parameter is required" },
        { status: 400 }
      );
    }

    // Fetch workflows for this subject type using the junction table
    const { data, error } = await adminSupabase
      .from("workflow_subject_types")
      .select(`
        display_order,
        workflows (
          id,
          name,
          label,
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
      .eq("subject_type", subjectType.trim())
      .order("display_order", { ascending: true });

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

