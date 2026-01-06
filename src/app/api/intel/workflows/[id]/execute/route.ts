import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workflowId } = await params;
    const body = await request.json();
    const { research_subject_id } = body;

    if (!research_subject_id) {
      return NextResponse.json(
        { error: "research_subject_id is required" },
        { status: 400 }
      );
    }

    // Use service role client to access secrets and research data
    const adminSupabase = createServiceRoleClient();

    // Fetch webhook URL from workflow_secrets
    const { data: secrets, error: secretsError } = await (adminSupabase
      .from("workflow_secrets") as any)
      .select("webhook_url")
      .eq("workflow_id", workflowId)
      .single();
    const secretsTyped = secrets as { webhook_url: string } | null;

    if (secretsError) {
      if (secretsError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Webhook URL not configured for this workflow" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch webhook: ${secretsError.message}` },
        { status: 500 }
      );
    }

    if (!secretsTyped?.webhook_url) {
      return NextResponse.json(
        { error: "Webhook URL not configured for this workflow" },
        { status: 404 }
      );
    }

    // Fetch research subject data
    const { data: researchSubject, error: researchError } = await (adminSupabase
      .from("research_subjects") as any)
      .select("name, geography, category, description")
      .eq("id", research_subject_id)
      .single();

    if (researchError) {
      if (researchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Research subject not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch research subject: ${researchError.message}` },
        { status: 500 }
      );
    }

    if (!researchSubject) {
      return NextResponse.json(
        { error: "Research subject not found" },
        { status: 404 }
      );
    }

    const researchSubjectTyped = researchSubject as { name: string; geography: string | null; category: string | null; description: string | null };

    // Prepare webhook payload
    const webhookPayload = {
      Name: researchSubjectTyped.name || "",
      Geography: researchSubjectTyped.geography || "",
      Category: researchSubjectTyped.category || "",
      Description: researchSubjectTyped.description || "",
      UserId: user.id,
    };

    // Send POST request to webhook
    try {
      const webhookResponse = await fetch(secretsTyped.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text().catch(() => "Unknown error");
        return NextResponse.json(
          {
            success: false,
            error: `Webhook returned error: ${webhookResponse.status} ${webhookResponse.statusText}`,
            details: errorText,
          },
          { status: 500 }
        );
      }

      // Try to parse response if available
      let responseData;
      try {
        responseData = await webhookResponse.json();
      } catch {
        // If response is not JSON, that's okay
        responseData = { message: "Workflow executed successfully" };
      }

      return NextResponse.json(
        {
          success: true,
          message: "Workflow executed successfully",
          data: responseData,
        },
        { status: 200 }
      );
    } catch (fetchError: any) {
      console.error("Error calling webhook:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to call webhook: ${fetchError.message || "Network error"}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error executing workflow:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

