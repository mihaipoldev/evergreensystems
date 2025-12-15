import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

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

    const { id: sectionId } = await params;

    const { data, error } = await supabase
      .from("section_results")
      .select(`
        *,
        results (*)
      `)
      .eq("section_id", sectionId)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = (data || [])
      .filter((item: any) => item.results !== null)
      .map((item: any) => ({
        ...item.results,
        section_result: {
          id: item.id,
          position: item.position,
          created_at: item.created_at,
        },
      }));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

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

    const { id: sectionId } = await params;
    const body = await request.json();
    const { result_id, position } = body;

    if (!result_id) {
      return NextResponse.json(
        { error: "result_id is required" },
        { status: 400 }
      );
    }

    // Check if result is already connected to this section
    const { data: existing } = await supabase
      .from("section_results")
      .select("id")
      .eq("section_id", sectionId)
      .eq("result_id", result_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Result is already connected to this section" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase
      .from("section_results") as any)
      .insert({
        section_id: sectionId,
        result_id,
        position: position ?? 0,
      })
      .select(`
        *,
        results (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const resultWithSection = data && (data as any).results ? {
      ...(data as any).results,
      section_result: {
        id: (data as any).id,
        position: (data as any).position,
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("results", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(resultWithSection, { status: 201 });
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

    const { id: sectionId } = await params;
    const { searchParams } = new URL(request.url);
    const sectionResultId = searchParams.get("section_result_id");

    if (!sectionResultId) {
      return NextResponse.json(
        { error: "section_result_id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("section_results")
      .delete()
      .eq("id", sectionResultId)
      .eq("section_id", sectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("results", "max");
    revalidateTag("sections", "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
