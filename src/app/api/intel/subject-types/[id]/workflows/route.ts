import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminSupabase = createServiceRoleClient();

    const body = await request.json();
    const { workflows } = body;

    if (!Array.isArray(workflows)) {
      return NextResponse.json(
        { error: "workflows must be an array" },
        { status: 400 }
      );
    }

    // Get the subject type to get its name
    const { data: subjectType, error: subjectTypeError } = await adminSupabase
      .from("subject_types")
      .select("name")
      .eq("id", id)
      .single() as { data: { name: string } | null; error: any };

    if (subjectTypeError || !subjectType) {
      return NextResponse.json(
        { error: "Subject type not found" },
        { status: 404 }
      );
    }

    // Delete all existing workflow_subject_types for this subject_type
    const { error: deleteError } = await adminSupabase
      .from("workflow_subject_types")
      .delete()
      .eq("subject_type", subjectType.name);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Insert new workflow_subject_types if any
    if (workflows.length > 0) {
      // Validate workflow IDs exist
      const workflowIds = workflows.map((w: any) => w.workflow_id);
      const { data: existingWorkflows, error: workflowsError } = await adminSupabase
        .from("workflows")
        .select("id")
        .in("id", workflowIds) as { data: { id: string }[] | null; error: any };

      if (workflowsError) {
        return NextResponse.json(
          { error: workflowsError.message },
          { status: 500 }
        );
      }

      const existingWorkflowIds = new Set((existingWorkflows || []).map((w) => w.id));
      const invalidIds = workflowIds.filter((id: string) => !existingWorkflowIds.has(id));

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid workflow IDs: ${invalidIds.join(", ")}` },
          { status: 400 }
        );
      }

      // Insert new workflow_subject_types
      const workflowSubjectTypesToInsert = workflows.map((w: any) => ({
        workflow_id: w.workflow_id,
        subject_type: subjectType.name,
        display_order: w.display_order,
      }));

      const { error: insertError } = await adminSupabase
        .from("workflow_subject_types")
        .insert(workflowSubjectTypesToInsert as any);

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

