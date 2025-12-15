import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
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
    const adminSupabase = createServiceRoleClient();

    const { data, error } = await adminSupabase
      .from("section_testimonials")
      .select(`
        *,
        testimonials (*)
      `)
      .eq("section_id", sectionId)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const testimonials = (data || [])
      .filter((item: any) => item.testimonials !== null)
      .map((item: any) => ({
        ...item.testimonials,
        section_testimonial: {
          id: item.id,
          position: item.position,
          status: item.status,
          created_at: item.created_at,
        },
      }));

    return NextResponse.json(testimonials, { status: 200 });
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
    const { testimonial_id, position } = body;

    if (!testimonial_id) {
      return NextResponse.json(
        { error: "testimonial_id is required" },
        { status: 400 }
      );
    }

    // Check if testimonial is already connected to this section
    const { data: existing } = await supabase
      .from("section_testimonials")
      .select("id")
      .eq("section_id", sectionId)
      .eq("testimonial_id", testimonial_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Testimonial is already connected to this section" },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase
      .from("section_testimonials") as any)
      .insert({
        section_id: sectionId,
        testimonial_id,
        position: position ?? 0,
      })
      .select(`
        *,
        testimonials (*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const testimonialWithSection = data && (data as any).testimonials ? {
      ...(data as any).testimonials,
      section_testimonial: {
        id: (data as any).id,
        position: (data as any).position,
        created_at: (data as any).created_at,
      },
    } : null;

    revalidateTag("testimonials", "max");
    revalidateTag("sections", "max");

    return NextResponse.json(testimonialWithSection, { status: 201 });
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
    const sectionTestimonialId = searchParams.get("section_testimonial_id");
    const adminSupabase = createServiceRoleClient();

    if (!sectionTestimonialId) {
      return NextResponse.json(
        { error: "section_testimonial_id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("section_testimonials")
      .delete()
      .eq("id", sectionTestimonialId)
      .eq("section_id", sectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("testimonials", "max");
    revalidateTag("sections", "max");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
