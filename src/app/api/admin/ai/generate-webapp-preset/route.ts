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

    // Build system prompt focused on webapp color generation
    // First generate primary, then accent that fits perfectly
    const systemPrompt = `You are an expert color designer specializing in professional web application interfaces. Your task is to generate two colors: a primary color and an accent color that creates perfect harmony for web applications.

CONTEXT: WEB APPLICATION (NOT LANDING PAGE)
- Web applications require colors optimized for:
  * Extended viewing sessions (reduced eye strain)
  * Professional, trustworthy appearance
  * Clear visual hierarchy and contrast
  * Accessibility and readability
  * Modern, clean aesthetic suitable for dashboards, data interfaces, and productivity tools

STEP 1: PRIMARY COLOR GENERATION - BE CREATIVE AND DIVERSE!
Generate a UNIQUE primary color (hex format: #RRGGBB) that is:
- Professional and sophisticated, suitable for web application interfaces
- Versatile enough to work as the main brand color for buttons, links, and key UI elements
- Optimized for extended use (not too bright or saturated to avoid eye strain)
- CRITICAL: EXPLORE THE FULL COLOR SPECTRUM! Do NOT default to blue. Vary your choices dramatically:
  * EXPLORE PURPLES: Deep violets (#6B46C1), rich magentas (#A855F7), lavender (#9333EA), plum (#7C3AED)
  * EXPLORE GREENS: Forest greens (#059669), emerald (#10B981), sage (#65A30D), mint (#34D399)
  * EXPLORE ORANGES/REDS: Deep coral (#F97316), terracotta (#EA580C), burgundy (#991B1B), rust (#B45309)
  * EXPLORE TEALS/CYANS: Turquoise (#14B8A6), aqua (#06B6D4), seafoam (#2DD4BF)
  * EXPLORE YELLOWS/AMBERS: Golden (#F59E0B), amber (#D97706), honey (#EAB308)
  * EXPLORE PINKS/ROSES: Rose (#E11D48), fuchsia (#C026D3), salmon (#FB7185)
  * EXPLORE INDIGOS: Deep indigo (#4F46E5), royal blue (#6366F1), navy (#1E40AF)
  * EXPLORE UNIQUE COMBINATIONS: Slate (#475569), charcoal with hints of color, deep grays with subtle hue
- IMPORTANT: Rotate through different color families. If you generated blue last time, choose purple, green, orange, or another color family this time.
- Saturation: 50-85% (professional, not neon)
- Lightness: 35-65% (readable, not too dark or light)
- Avoid generic web colors like #007bff, #28a745, #ffc107, #dc3545
- Think of diverse modern webapp brands: Linear (purple), Vercel (black/white), Stripe (purple), Figma (purple/blue), Discord (blurple), Slack (purple), Notion (blue-gray), but EXPLORE BEYOND these!
- Be BOLD and CREATIVE - surprise users with unexpected but professional color choices!

STEP 2: ACCENT COLOR GENERATION
After generating the primary color, generate an ACCENT color (hex format: #RRGGBB) that:
- Creates PERFECT harmony with the primary color using color theory
- Works beautifully for secondary actions, highlights, and visual accents
- Uses one of these proven color relationships:
  1. COMPLEMENTARY: Opposite on color wheel (creates dynamic contrast)
     * Example: Blue primary → Orange/amber accent
     * Example: Purple primary → Yellow/gold accent
  2. ANALOGOUS: Adjacent colors (creates harmonious flow)
     * Example: Blue primary → Teal/cyan accent
     * Example: Green primary → Blue-green accent
  3. SPLIT-COMPLEMENTARY: Base color with colors adjacent to its complement
     * Example: Blue primary → Coral/peach accent
  4. TRIADIC: Colors evenly spaced (select one that complements primary)
     * Example: Blue primary → Purple accent
- Should be distinct enough to create clear visual hierarchy
- Should work well for hover states, badges, notifications, and secondary CTAs
- Consider contrast: if primary is dark, accent can be lighter/bright; if primary is light, accent can be deeper
- The combination should feel intentional, sophisticated, and modern

COLOR COMBINATION QUALITY:
- The two colors must work together seamlessly
- They should create a cohesive brand identity
- The accent should enhance, not compete with, the primary
- Both should be suitable for web application interfaces (professional, not flashy)

PRESET NAME GENERATION:
Generate a creative, professional preset name (2-4 words) that captures the essence of the color combination:
- Reference the color relationship or mood
- Examples: "Professional Harmony", "Modern Contrast", "Sophisticated Duo", "Tech Elegance", "Balanced Depth", "Refined Accent"
- Make it memorable and descriptive of the color relationship
- Avoid generic names - be specific to the color combination

CRITICAL: You MUST return ONLY a valid JSON object with this EXACT structure. No markdown, no code blocks, no explanations - just the JSON:
{
  "primary_color": "#RRGGBB",
  "accent_color": "#RRGGBB",
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
            content: "Generate a professional webapp preset with a primary color and an accent color that fits perfectly. BE CREATIVE - explore diverse color families (purples, greens, oranges, teals, pinks, etc.) and avoid defaulting to blue. First generate a unique primary color from a diverse color family, then generate the accent color that creates perfect harmony. Return only the JSON object.",
          },
        ],
        temperature: 1.5, // Very high temperature for maximum creativity and variety - avoid repetitive blue choices
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
    if (!presetData.primary_color || !presetData.accent_color) {
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
    
    if (!hexColorRegex.test(presetData.primary_color) || !hexColorRegex.test(presetData.accent_color)) {
      return NextResponse.json(
        { error: "Invalid color format" },
        { status: 500 }
      );
    }
    
    // Normalize hex colors to 6-character format
    presetData.primary_color = normalizeHex(presetData.primary_color);
    presetData.accent_color = normalizeHex(presetData.accent_color);

    // Verify colors are different
    if (presetData.primary_color === presetData.accent_color) {
      console.warn('[WEBAPP PRESET API] WARNING: Primary and accent colors are the same!', {
        color: presetData.primary_color
      });
    }

    console.log('[WEBAPP PRESET API] Generated colors:', {
      primary_color: presetData.primary_color,
      accent_color: presetData.accent_color,
      name: presetData.name
    });

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

