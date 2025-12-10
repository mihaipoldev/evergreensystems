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

    const { id } = await params;
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

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

    const { id } = await params;
    const body = await request.json();
    const { slug, title, description } = body;

    // Get old slug before update for cache invalidation
    let oldSlug: string | null = null;
    if (slug !== undefined) {
      const { data: oldPage } = await supabase
        .from("pages")
        .select("slug")
        .eq("id", id)
        .single();
      oldSlug = (oldPage as any)?.slug || null;
    }

    const updateData: Record<string, unknown> = {};
    if (slug !== undefined) updateData.slug = slug;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const { data, error } = await (supabase
      .from("pages") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache for pages
    revalidateTag("pages", "max");
    if (data?.slug) {
      revalidateTag(`page-${data.slug}`, "max");
    }
    // Also invalidate old slug if it changed
    if (oldSlug && oldSlug !== data?.slug) {
      revalidateTag(`page-${oldSlug}`, "max");
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

    const { id } = await params;
    
    // Get page slug before deletion for cache invalidation
    const { data: pageData } = await supabase
      .from("pages")
      .select("slug")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("pages")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Invalidate cache for pages
    revalidateTag("pages", "max");
    if ((pageData as any)?.slug) {
      revalidateTag(`page-${(pageData as any).slug}`, "max");
    }

    return NextResponse.json({ message: "Page deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
