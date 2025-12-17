import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fontOptions } from "@/lib/fonts";

export async function POST(request: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if OPENROUTER_KEY is configured
    const openRouterKey = process.env.OPENROUTER_KEY;
    if (!openRouterKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { primary_color, secondary_color, body_font, theme } = body;

    if (!primary_color || !body_font || !theme) {
      return NextResponse.json(
        { error: "primary_color, body_font, and theme are required" },
        { status: 400 }
      );
    }

    // Get human-readable font name
    const fontOption = fontOptions.find((f) => f.id === body_font);
    const fontName = fontOption?.label || body_font;

    // Build system prompt
    const systemPrompt = `Generate a creative and descriptive name (2-4 words) for a website preset with these characteristics:
- Primary color: ${primary_color}
- Secondary color: ${secondary_color || "Not set"}
- Body font: ${fontName}
- Theme: ${theme}

The name should be catchy, professional, and reflect the visual style. Return only the name, no quotes or additional text.`;

    // Call OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://evergreensystems.ai",
        "X-Title": "Evergreen Systems AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Using a cost-effective model
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: "Generate the preset name now.",
          },
        ],
        temperature: 0.8, // Slightly creative but not too random
        max_tokens: 20, // Short names only
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate preset name" },
        { status: 500 }
      );
    }

    const openRouterData = await openRouterResponse.json();
    const generatedName = openRouterData.choices?.[0]?.message?.content?.trim();

    if (!generatedName) {
      return NextResponse.json(
        { error: "No name generated from AI" },
        { status: 500 }
      );
    }

    // Clean up the name - remove quotes and extra whitespace
    const cleanName = generatedName
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .trim()
      .slice(0, 100); // Limit length

    if (!cleanName) {
      return NextResponse.json(
        { error: "Generated name is empty" },
        { status: 500 }
      );
    }

    return NextResponse.json({ name: cleanName }, { status: 200 });
  } catch (error) {
    console.error("Error generating preset name:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
