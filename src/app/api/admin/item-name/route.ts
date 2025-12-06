import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");
    const slug = searchParams.get("slug");

    if (!resource || !slug) {
      return NextResponse.json(
        { error: "resource and slug are required" },
        { status: 400 }
      );
    }

    let name: string | null = null;

    switch (resource) {
      case "testimonials": {
        const { data, error } = await supabase
          .from("testimonials")
          .select("author_name")
          .eq("id", slug)
          .single() as { data: { author_name: string } | null; error: any };

        if (error || !data) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        name = data.author_name;
        break;
      }
      case "faq": {
        const { data, error } = await supabase
          .from("faq_items")
          .select("question")
          .eq("id", slug)
          .single() as { data: { question: string } | null; error: any };

        if (error || !data) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        name = data.question;
        break;
      }
      case "features": {
        const { data, error } = await supabase
          .from("offer_features")
          .select("title")
          .eq("id", slug)
          .single() as { data: { title: string } | null; error: any };

        if (error || !data) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        name = data.title;
        break;
      }
      case "sections": {
        const { data, error } = await supabase
          .from("sections")
          .select("admin_title, title")
          .eq("id", slug)
          .single() as { data: { admin_title: string | null; title: string | null } | null; error: any };

        if (error || !data) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        name = data.admin_title || data.title || "Section";
        break;
      }
      case "pages": {
        const { data, error } = await supabase
          .from("pages")
          .select("title")
          .eq("id", slug)
          .single() as { data: { title: string } | null; error: any };

        if (error || !data) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        name = data.title;
        break;
      }
      default:
        return NextResponse.json(
          { error: "Unknown resource" },
          { status: 400 }
        );
    }

    return NextResponse.json({ name }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
