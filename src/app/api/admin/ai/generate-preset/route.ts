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

    // Build comprehensive font list with descriptions for AI
    const fontList = fontOptions.map(f => {
      const descriptions: Record<string, string> = {
        "roboto": "clean, geometric sans-serif - versatile and modern",
        "lato": "humanist sans-serif - warm and friendly",
        "open-sans": "neutral, friendly sans-serif - highly readable",
        "montserrat": "geometric sans-serif - urban and contemporary",
        "dm-sans": "geometric sans-serif - modern and clean",
        "source-code-pro": "monospace - technical and precise",
        "space-grotesk": "geometric sans-serif - futuristic and bold",
        "josefin-sans": "geometric sans-serif - elegant and refined",
        "rubik": "rounded sans-serif - friendly and approachable",
        "inter": "humanist sans-serif - professional and versatile",
        "poppins": "geometric sans-serif - modern and geometric",
        "raleway": "elegant sans-serif - sophisticated and refined",
        "nunito-sans": "rounded sans-serif - friendly and warm",
        "jost": "geometric sans-serif - clean and modern",
        "playfair-display": "elegant serif - sophisticated and classic",
        "merriweather": "serif - traditional and readable",
        "lora": "serif - elegant and literary",
        "eb-garamond": "classic serif - traditional and refined",
        "gotham": "geometric sans-serif - bold and professional",
        "geist-sans": "modern sans-serif - clean and contemporary",
        "geist-mono": "monospace - technical and modern",
      };
      return `${f.id} (${f.label}) - ${descriptions[f.id] || "versatile font"}`;
    }).join(", ");

    // Build comprehensive system prompt
    const systemPrompt = `You are an expert web designer creating professional, modern website presets for businesses. Your task is to generate complete preset configurations that are thoughtful, sophisticated, and visually compelling. Be CREATIVE and VARIED - create a diverse range of presets, from vibrant and energetic to calm and minimal.

COLOR REQUIREMENTS - BE CREATIVE, VARIED, AND THOUGHTFUL:
Think deeply about color psychology and create presets with personality. Vary your approach:
- VIBRANT PRESETS: Bold, energetic colors that convey innovation and energy. Think electric violets (#7C3AED, #9333EA), vibrant cyans (#0891B2, #0D9488), rich emeralds (#10B981, #059669), or bold corals (#F97316, #EA580C). High saturation (60-90%), medium to high lightness.
- CALM/CHILL PRESETS: Softer, more muted colors that convey tranquility and sophistication. Think sage greens (#65A30D, #84CC16), dusty roses (#BE185D, #DB2777), muted teals (#14B8A6, #0D9488), or warm grays with subtle color (#78716C, #57534E). Medium saturation (40-60%), varied lightness.
- SOPHISTICATED PRESETS: Deep, rich colors that convey luxury and professionalism. Think deep indigos (#4F46E5, #6366F1), burgundy reds (#991B1B, #B91C1C), forest greens (#065F46, #047857), or charcoal with accent colors. Medium to high saturation (50-80%), lower lightness (20-50%).

Primary color: Generate a UNIQUE hex color (format: #RRGGBB) that stands out. AVOID generic web colors like #007bff, #28a745, #ffc107, #dc3545. Instead, be creative:
  * Nature-inspired: sunset oranges, forest emeralds, ocean teals, lavender purples, sage greens, desert sands
  * Modern bold: electric violets, amber golds, deep roses, vibrant cyans, mint greens
  * Sophisticated: deep magentas, rich burgundies, charcoal blues, warm terracottas
  * The color should have CHARACTER and PERSONALITY. Think of premium brands, art galleries, high-end design studios, or unique natural phenomena.
  * Vary saturation (30-90%) and lightness (20-80%) based on the preset style you're creating.

Secondary color: Generate a COMPLEMENTARY hex color (format: #RRGGBB) that creates beautiful harmony. Be thoughtful:
  * Use color theory: complementary (opposite), analogous (adjacent), triadic, or split-complementary schemes
  * For vibrant presets: create exciting contrast - warm with cool, bright with deep
  * For calm presets: use harmonious, analogous colors or soft complements
  * For sophisticated presets: use deep, rich complements or elegant monochromatic variations
  * Consider unexpected but beautiful pairings: deep purple with golden yellow, teal with coral, emerald with rose, sage with terracotta

THEME SELECTION:
- Analyze the lightness and overall feel of your primary color. If the primary color has low lightness (dark, < 50%), choose 'dark' theme. If it has high lightness (light, > 50%), choose 'light' theme. The theme should ensure excellent contrast and readability. Never choose 'system' - only 'light' or 'dark'. Consider the overall mood: vibrant presets might favor dark themes for drama, calm presets might favor light themes for airiness.

FONT SELECTION - BE CREATIVE AND USE DIVERSE FONTS:
Available fonts with descriptions: ${fontList}

IMPORTANT: DO NOT default to "open-sans" or "lato". Explore the full range of fonts thoughtfully:
- For VIBRANT/BOLD presets: Consider "space-grotesk", "montserrat", "poppins", "rubik" for headings; "inter", "dm-sans", "jost" for body
- For CALM/MINIMAL presets: Consider "raleway", "josefin-sans", "nunito-sans" for headings; "inter", "lato", "open-sans" for body
- For SOPHISTICATED/ELEGANT presets: Consider "playfair-display", "lora", "eb-garamond", "merriweather" for headings; "raleway", "josefin-sans", "inter" for body
- For MODERN/TECH presets: Consider "geist-sans", "inter", "space-grotesk" for headings; "inter", "dm-sans", "geist-sans" for body
- For FRIENDLY/APPROACHABLE presets: Consider "nunito-sans", "rubik", "lato" for headings; "nunito-sans", "lato", "open-sans" for body

Heading font: Select ONE font ID that matches the preset's personality. Be thoughtful - match the font to the color scheme and overall vibe. Don't just pick the same fonts every time.

Body font: Select ONE font ID that pairs beautifully with your heading font. Ensure excellent readability. Create interesting but harmonious pairings - serif headings with sans-serif body, or contrasting sans-serif styles. Avoid matching the heading and body fonts unless it truly fits the design.

STYLING OPTIONS (choose thoughtfully based on preset style):
- dots_enabled: ALWAYS set to false. Do not enable dots decoration.
- wave_gradient_enabled:
  * true for: very vibrant presets with bold colors, modern/experimental designs
  * false for: calm presets, minimal designs, professional/corporate aesthetics
- noise_texture_enabled:
  * true for: minimal/sophisticated presets, designs that need subtle depth
  * false for: vibrant/bold presets, clean/crisp modern designs

NAME GENERATION:
Generate a creative, professional preset name (2-4 words) that captures the essence of the color scheme, font choices, and overall aesthetic. Be thoughtful and varied:
- For vibrant presets: "Electric Dreams", "Bold Horizon", "Vibrant Pulse", "Energy Wave"
- For calm presets: "Serene Mist", "Gentle Breeze", "Quiet Elegance", "Soft Horizon"
- For sophisticated presets: "Midnight Elegance", "Royal Depth", "Luxury Noir", "Refined Classic"
- For modern/tech presets: "Future Forward", "Digital Edge", "Tech Modern", "Urban Pulse"
Make it memorable, catchy, and business-appropriate. Avoid generic names.

CRITICAL: You MUST return ONLY a valid JSON object with this EXACT structure. No markdown, no code blocks, no explanations - just the JSON:
{
  "primary_color": "#RRGGBB",
  "secondary_color": "#RRGGBB",
  "theme": "light" or "dark",
  "heading_font": "font-id-from-list",
  "body_font": "font-id-from-list",
  "dots_enabled": false (always),
  "wave_gradient_enabled": true or false,
  "noise_texture_enabled": true or false,
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
            content: "Generate a complete preset configuration now. Return only the JSON object.",
          },
        ],
        temperature: 1.3, // Higher temperature for more creative, varied, and thoughtful choices
        max_tokens: 500,
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

    // Validate theme
    if (!['light', 'dark', 'system'].includes(presetData.theme)) {
      presetData.theme = 'dark'; // Default fallback
    }

    // Validate fonts - ensure they exist in fontOptions
    const validFontIds = fontOptions.map(f => f.id);
    if (!validFontIds.includes(presetData.heading_font)) {
      presetData.heading_font = 'inter'; // Default fallback
    }
    if (!validFontIds.includes(presetData.body_font)) {
      presetData.body_font = 'inter'; // Default fallback
    }

    // Validate boolean fields
    // Always set dots_enabled to false (regardless of AI response)
    presetData.dots_enabled = false;
    presetData.wave_gradient_enabled = Boolean(presetData.wave_gradient_enabled);
    presetData.noise_texture_enabled = Boolean(presetData.noise_texture_enabled);

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
