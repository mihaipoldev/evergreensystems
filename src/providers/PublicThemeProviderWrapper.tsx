import { createClient } from "@/lib/supabase/server";
import { PublicThemeProvider } from "./PublicThemeProvider";

export async function PublicThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  let theme = "dark"; // Default theme
  
  try {
    const supabase = await createClient();
    
    // Determine environment based on NODE_ENV
    const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';
    
    // Get website settings with preset join (public read access, no auth required)
    const { data: settings } = await (supabase
      .from("website_settings") as any)
      .select(`
        preset_id,
        website_settings_presets (
          theme
        )
      `)
      .eq("environment", environment)
      .maybeSingle();

    // Get theme from preset
    // Supabase returns the joined table as an object (not array) when using single/maybeSingle
    let presetTheme = null;
    if (settings?.website_settings_presets) {
      const preset = Array.isArray(settings.website_settings_presets) 
        ? settings.website_settings_presets[0] 
        : settings.website_settings_presets;
      presetTheme = preset?.theme;
    }

    if (presetTheme) {
      theme = presetTheme;
    }
  } catch (error) {
    // Silently fail and use default theme
    console.warn("Failed to load website theme:", error);
  }

  return (
    <PublicThemeProvider initialTheme={theme}>
      {children}
    </PublicThemeProvider>
  );
}
