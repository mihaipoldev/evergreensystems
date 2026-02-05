import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Validate and parse JSON string for optional fields (empty = null) */
function parseJsonOptional(value: string): { data: unknown; error: null } | { data: null; error: string } {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "") return { data: null, error: null };
  try {
    return { data: JSON.parse(value) as unknown, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({})) as {
      run_id: string;
      output_json?: string | Record<string, any>;
      pdf_storage_path?: string | null;
      ui_schema?: string | Record<string, any> | null;
    };

    if (!body.run_id) {
      return NextResponse.json({ error: "run_id is required" }, { status: 400 });
    }

    const outputJson =
      body.output_json === undefined
        ? {}
        : typeof body.output_json === "string"
          ? (() => {
              const r = parseJsonOptional(body.output_json);
              if (r.error) {
                throw new Error(r.error);
              }
              return (r.data as Record<string, any>) ?? {};
            })()
          : body.output_json;

    let uiSchema: Record<string, any> | null = null;
    if (body.ui_schema !== undefined && body.ui_schema !== null && body.ui_schema !== "") {
      const raw =
        typeof body.ui_schema === "string" ? body.ui_schema : JSON.stringify(body.ui_schema);
      const r = parseJsonOptional(raw);
      if (r.error) {
        return NextResponse.json({ error: `ui_schema: ${r.error}` }, { status: 400 });
      }
      uiSchema = r.data as Record<string, any>;
    }

    const { createRunOutput } = await import("@/features/rag/runs-outputs/data");
    const created = await createRunOutput({
      run_id: body.run_id,
      output_json: outputJson,
      pdf_storage_path: body.pdf_storage_path ?? null,
      ui_schema: uiSchema,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

