import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    // Build system prompt focused on Pantone colors and color harmony
    const systemPrompt = `You are an expert color designer specializing in Pantone color palettes and professional color combinations for admin interfaces. Your task is to generate two harmonious colors inspired by Pantone color systems.

PANTONE COLOR INSPIRATION:
- Draw inspiration from Pantone Color of the Year palettes (e.g., Viva Magenta 18-1750, Classic Blue 19-4052, Living Coral 16-1546, Ultra Violet 18-3838, Greenery 15-0343, etc.)
- Reference Pantone Fashion Color Trend Reports and Pantone Color Institute palettes
- Use sophisticated, professional colors that work well in digital interfaces
- Consider both vibrant modern palettes and timeless classic combinations

COLOR THEORY FOR HARMONIOUS COMBINATIONS:
Generate two colors that create beautiful harmony using one of these proven color schemes:

1. COMPLEMENTARY: Colors opposite on the color wheel (e.g., blue & orange, purple & yellow, red & cyan)
   - Creates dynamic contrast and visual interest
   - Example: Pantone Classic Blue with Pantone Peach Echo

2. ANALOGOUS: Colors adjacent on the color wheel (e.g., blue, blue-green, green)
   - Creates harmonious, cohesive feeling
   - Example: Pantone Greenery with Pantone Kale

3. TRIADIC: Three colors evenly spaced on the color wheel (select two)
   - Creates balanced, vibrant combinations
   - Example: Pantone Viva Magenta with Pantone Classic Blue

4. SPLIT-COMPLEMENTARY: Base color with two colors adjacent to its complement
   - Creates sophisticated contrast without tension
   - Example: Pantone Ultra Violet with Pantone Greenery and Pantone Living Coral

5. MONOCHROMATIC: Variations of the same hue with different saturation/lightness
   - Creates elegant, refined combinations
   - Example: Deep Pantone Classic Blue with lighter Pantone Sky Blue

PRIMARY COLOR REQUIREMENTS:
- Generate a UNIQUE hex color (format: #RRGGBB) inspired by Pantone color systems
- Should be sophisticated and professional, suitable for admin interfaces
- Consider the psychological impact: blues (trust, stability), greens (growth, harmony), purples (creativity, luxury), etc.
- Vary saturation (40-90%) and lightness (30-70%) for professional appearance
- Avoid overly bright or neon colors - aim for refined, premium feel
- Think of high-end design systems, luxury brands, professional software interfaces

SECONDARY COLOR REQUIREMENTS:
- Generate a COMPLEMENTARY hex color (format: #RRGGBB) that creates beautiful harmony with the primary
- Use color theory principles to ensure the combination is visually pleasing
- Should work well together for UI elements (buttons, accents, highlights)
- Consider contrast for accessibility and readability
- The combination should feel intentional and sophisticated, not random

PRESET NAME GENERATION:
Generate a creative, professional preset name (2-4 words) that captures the essence of the color combination:
- Reference the color scheme type or Pantone inspiration
- Examples: "Classic Harmony", "Vibrant Contrast", "Sophisticated Duo", "Pantone Elegance", "Modern Balance", "Luxury Depth"
- Make it memorable and descriptive of the color relationship
- Avoid generic names - be specific to the color combination

CRITICAL: You MUST return ONLY a valid JSON object with this EXACT structure. No markdown, no code blocks, no explanations - just the JSON:
{
  "primary_color": "#RRGGBB",
  "secondary_color": "#RRGGBB",
  "name": "Preset Name Here"
}`;

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
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: "Generate a professional admin preset with two harmonious Pantone-inspired colors. Return only the JSON object.",
          },
        ],
        temperature: 1.2, // High temperature for creative, varied color combinations
        max_tokens: 300,
        response_format: { type: "json_object" }, // Force JSON response
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate preset" },
        { status: 500 }
      );
    }

    const openRouterData = await openRouterResponse.json();
    const responseContent = openRouterData.choices?.[0]?.message?.content?.trim();

    if (!responseContent) {
      return NextResponse.json(
        { error: "No preset generated from AI" },
        { status: 500 }
      );
    }

    // Parse JSON response
    let presetData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = responseContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      
      presetData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, responseContent);
      return NextResponse.json(
        { error: "Invalid JSON response from AI" },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!presetData.primary_color || !presetData.secondary_color) {
      return NextResponse.json(
        { error: "Missing required color fields" },
        { status: 500 }
      );
    }

    // Validate and normalize hex colors
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    // Normalize 3-character hex to 6-character
    const normalizeHex = (hex: string): string => {
      if (hex.length === 4) { // #RGB format
        return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
      }
      return hex;
    };
    
    if (!hexColorRegex.test(presetData.primary_color) || !hexColorRegex.test(presetData.secondary_color)) {
      return NextResponse.json(
        { error: "Invalid color format" },
        { status: 500 }
      );
    }
    
    // Normalize hex colors to 6-character format
    presetData.primary_color = normalizeHex(presetData.primary_color);
    presetData.secondary_color = normalizeHex(presetData.secondary_color);

    // Validate and clean name
    if (!presetData.name || typeof presetData.name !== 'string') {
      presetData.name = 'AI Generated Preset';
    }
    presetData.name = presetData.name
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .trim()
      .slice(0, 100); // Limit length

    return NextResponse.json(presetData, { status: 200 });
  } catch (error) {
    console.error("Error generating preset:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}




