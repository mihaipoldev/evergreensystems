import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFirstPageIdBySectionId } from "@/features/page-builder/sections/queries";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the first page ID that contains this section
    const pageId = await getFirstPageIdBySectionId(id);

    if (!pageId) {
      return NextResponse.json({ error: "Section not found in any page" }, { status: 404 });
    }

    return NextResponse.json({ pageId });
  } catch (error: any) {
    console.error("Error fetching page for section:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch page for section" },
      { status: 500 }
    );
  }
}