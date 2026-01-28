"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { Moon, Sun, Monitor, Palette, Edit2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hexToHsl, hslToCssString, hslToCssHsl } from "@/lib/color-utils";
import { ColorModal } from "./ColorModal";
import { cn } from "@/lib/utils";
import { serializeFontFamily, getDefaultFontFamily } from "@/lib/font-utils";
import { useToast } from "@/hooks/use-toast";

// Color type from database
type DatabaseColor = {
  id: string;
  user_id: string;
  name: string;
  hex: string;
  hsl_h: number;
  hsl_s: number;
  hsl_l: number;
};

// Color type for component
type Color = {
  id: string;
  name: string;
  hex: string;
  hsl: { h: number; s: number; l: number };
  value: string; // CSS HSL string
};

type UserTheme = {
  id: string;
  name: string;
  primary_color_id: string;
  secondary_color_id: string;
  accent_color_id: string;
};

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userColors, setUserColors] = useState<Color[]>([]);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userThemes, setUserThemes] = useState<UserTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [isGeneratingPreset, setIsGeneratingPreset] = useState(false);

  // Convert database color to component color
  const dbColorToComponent = (dbColor: DatabaseColor): Color => {
    return {
      id: dbColor.id,
      name: dbColor.name,
      hex: dbColor.hex,
      hsl: {
        h: dbColor.hsl_h,
        s: dbColor.hsl_s,
        l: dbColor.hsl_l,
      },
      value: hslToCssHsl(dbColor.hsl_h, dbColor.hsl_s, dbColor.hsl_l),
    };
  };

  // Apply color to CSS variable
  const applyColorToCSS = (color: Color | null) => {
    if (!color || typeof document === "undefined") {
      console.log('[COLOR DEBUG] AppearanceSettings.applyColorToCSS - Called with null/undefined color or no document');
      return;
    }
    const cssValue = hslToCssString(color.hsl.h, color.hsl.s, color.hsl.l);
    console.log('[COLOR DEBUG] AppearanceSettings.applyColorToCSS - Applying color:', {
      hex: color.hex,
      hsl: { h: color.hsl.h, s: color.hsl.s, l: color.hsl.l },
      cssValue: cssValue
    });
    
    // Use a function to apply the style, and ensure it runs after any pending DOM operations
    const applyStyle = () => {
      try {
        // Create the style content with highest specificity
        // Use :root and html.preset-admin for maximum coverage
        const styleText = `html.preset-admin,html.preset-admin.dark,html.preset-admin *,html.preset-admin.dark *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${color.hsl.h}!important;--brand-s:${color.hsl.s}!important;--brand-l:${color.hsl.l}!important;--primary:${cssValue}!important;}`;
        
        // Remove old primary-color-client if it exists (to avoid duplicates)
        const oldStyle = document.getElementById("primary-color-client");
        if (oldStyle) {
          console.log('[COLOR DEBUG] AppearanceSettings.applyStyle - Removing old primary-color-client style tag');
          try {
            if (oldStyle.parentNode) {
              oldStyle.remove();
            }
          } catch (e) {
            // Ignore removal errors
            console.error('[COLOR DEBUG] AppearanceSettings.applyStyle - Error removing old style:', e);
          }
        }
        
        // Create new style and add to END of head (ensures it comes after server styles)
        const style = document.createElement("style");
        style.id = "primary-color-client";
        style.textContent = styleText;
        
        console.log('[COLOR DEBUG] AppearanceSettings.applyStyle - Creating new primary-color-client style tag');
        
        if (document.head) {
          document.head.appendChild(style);
          
          // Also update primary-color-session if it exists (for InstantColorApply)
          const sessionStyle = document.getElementById("primary-color-session");
          if (sessionStyle) {
            try {
              sessionStyle.textContent = styleText;
              console.log('[COLOR DEBUG] AppearanceSettings.applyStyle - Updated primary-color-session style tag');
            } catch (e) {
              // Ignore update errors
              console.error('[COLOR DEBUG] AppearanceSettings.applyStyle - Error updating session style:', e);
            }
          }
          
          // Log computed values after applying
          setTimeout(() => {
            try {
              const computedStyle = window.getComputedStyle(document.documentElement);
              const brandH = computedStyle.getPropertyValue('--brand-h').trim();
              const brandS = computedStyle.getPropertyValue('--brand-s').trim();
              const brandL = computedStyle.getPropertyValue('--brand-l').trim();
              const primary = computedStyle.getPropertyValue('--primary').trim();
              console.log('[COLOR DEBUG] AppearanceSettings.applyStyle - Computed CSS values after apply:', {
                '--brand-h': brandH,
                '--brand-s': brandS,
                '--brand-l': brandL,
                '--primary': primary,
                'expected': cssValue
              });
            } catch (e) {
              console.error('[COLOR DEBUG] AppearanceSettings.applyStyle - Error reading computed styles:', e);
            }
          }, 10);
        }
      } catch (error) {
        console.error('[COLOR DEBUG] AppearanceSettings.applyStyle - Error applying color to CSS:', error);
      }
    };
    
    // Apply immediately
    console.log('[COLOR DEBUG] AppearanceSettings.applyColorToCSS - Calling applyStyle() immediately');
    applyStyle();
    
    // Also apply after a short delay to ensure it overrides any server styles that load late
    console.log('[COLOR DEBUG] AppearanceSettings.applyColorToCSS - Scheduling applyStyle() with setTimeout(0)');
    setTimeout(applyStyle, 0);
    
    // Save to sessionStorage for InstantColorApply fallback
    try {
      sessionStorage.setItem("primary-color-hsl", cssValue);
    } catch (e) {
      // sessionStorage not available
    }
    
    // Save to cookie for instant access on next page load (server-side)
    // Cookie expires in 1 year
    console.log('[COLOR DEBUG] AppearanceSettings.setColor - Setting cookies:', {
      cssValue,
      colorHsl: color.hsl
    });
    try {
      // CRITICAL: Delete old cookies with all possible attribute combinations
      // Try multiple variations to ensure deletion
      const cookieNames = ['primary-color-hsl', 'accent-color-hsl', 'brand-color-h', 'brand-color-s', 'brand-color-l'];
      const deletionStrategies = [
        '',  // No attributes
        '; path=/',
        '; path=/; domain=localhost',
        '; path=/; domain=' + window.location.hostname,
        '; path=/; SameSite=Lax',
        '; path=/; SameSite=None; Secure',
      ];
      
      cookieNames.forEach(name => {
        deletionStrategies.forEach(attrs => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${attrs}`;
        });
      });
      
      console.log('[COLOR DEBUG] AppearanceSettings.setColor - Deleted all old cookie variations');
      
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      // CRITICAL: Don't URL-encode HSL values - they're safe for cookies and encoding breaks Next.js cookie parser
      document.cookie = `primary-color-hsl=${cssValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      console.log('[COLOR DEBUG] AppearanceSettings.setColor - Primary cookie set (after deleting old):', `primary-color-hsl=${cssValue}`);
      
      // Also save brand color variables to cookies (numbers don't need encoding)
      document.cookie = `brand-color-h=${color.hsl.h}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = `brand-color-s=${color.hsl.s}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = `brand-color-l=${color.hsl.l}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      
      // Verify cookie was set
      const allCookies = document.cookie;
      const primaryCookie = allCookies.match(/primary-color-hsl=([^;]*)/);
      console.log('[COLOR DEBUG] AppearanceSettings.setColor - Cookie verification:', {
        found: !!primaryCookie,
        value: primaryCookie ? decodeURIComponent(primaryCookie[1]) : 'NOT FOUND'
      });
    } catch (e) {
      console.log('[COLOR DEBUG] AppearanceSettings.setColor - Cookie setting failed:', e);
    }
  };

  // Load colors from database
  useEffect(() => {
    const loadColors = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          setMounted(true);
          return;
        }

        setUserId(user.id);

        // Load user colors
        const { data: colors, error } = await (supabase
          .from("user_colors") as any)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading colors:", error);
          setLoading(false);
          setMounted(true);
          return;
        }

        const componentColors = (colors || []).map(dbColorToComponent);
        setUserColors(componentColors);

        // Load all user themes
        const { data: themes, error: themesError } = await (supabase
          .from("user_themes") as any)
          .select("id, name, primary_color_id, secondary_color_id, accent_color_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!themesError && themes) {
          setUserThemes(themes);
        }

        // Try to load selected color and fonts from user_settings
        const { data: settings } = await (supabase
          .from("user_settings") as any)
          .select("active_theme_id")
          .eq("user_id", user.id)
          .single();

        console.log('[COLOR DEBUG] AppearanceSettings - User settings:', {
          hasSettings: !!settings,
          activeThemeId: settings?.active_theme_id || null
        });

        if (settings?.active_theme_id) {
          console.log('[COLOR DEBUG] AppearanceSettings - Loading active theme:', settings.active_theme_id);
          setActiveThemeId(settings.active_theme_id);
          const { data: theme } = await (supabase
            .from("user_themes") as any)
            .select("primary_color_id")
            .eq("id", settings.active_theme_id)
            .single();

          console.log('[COLOR DEBUG] AppearanceSettings - Theme loaded:', {
            hasTheme: !!theme,
            primaryColorId: theme?.primary_color_id || null
          });

          if (theme) {
            // Load color
            if (theme.primary_color_id) {
            console.log('[COLOR DEBUG] AppearanceSettings - Loading color:', theme.primary_color_id);
            const { data: color } = await (supabase
              .from("user_colors") as any)
              .select("*")
              .eq("id", theme.primary_color_id)
              .single();

            console.log('[COLOR DEBUG] AppearanceSettings - Color loaded:', {
              hasColor: !!color,
              hex: color?.hex || null,
              name: color?.name || null
            });

            if (color) {
              const selected = dbColorToComponent(color);
              setSelectedColor(selected);
              applyColorToCSS(selected);
              console.log('[COLOR DEBUG] AppearanceSettings - ✅ Applied color from active theme:', selected.hex);
            } else {
              console.log('[COLOR DEBUG] AppearanceSettings - ⚠️ Color not found for theme');
            }
            // Don't fallback to first color if color not found - let user select manually
            }
          }
        } else {
          console.log('[COLOR DEBUG] AppearanceSettings - No active theme, checking Default Theme...');
          // No active theme - check if "Default Theme" exists
          const { data: defaultTheme } = await (supabase
            .from("user_themes") as any)
            .select("id, primary_color_id")
            .eq("user_id", user.id)
            .eq("name", "Default Theme")
            .maybeSingle();

          console.log('[COLOR DEBUG] AppearanceSettings - Default Theme check:', {
            hasDefaultTheme: !!defaultTheme,
            defaultThemeId: defaultTheme?.id || null,
            primaryColorId: defaultTheme?.primary_color_id || null
          });

          if (defaultTheme?.primary_color_id) {
            console.log('[COLOR DEBUG] AppearanceSettings - Loading color from Default Theme:', defaultTheme.primary_color_id);
            const { data: color } = await (supabase
              .from("user_colors") as any)
              .select("*")
              .eq("id", defaultTheme.primary_color_id)
              .single();

            console.log('[COLOR DEBUG] AppearanceSettings - Color from Default Theme:', {
              hasColor: !!color,
              hex: color?.hex || null,
              name: color?.name || null
            });

            if (color) {
              const selected = dbColorToComponent(color);
              setSelectedColor(selected);
              applyColorToCSS(selected);
              setActiveThemeId(defaultTheme.id);
              console.log('[COLOR DEBUG] AppearanceSettings - ✅ Applied color from Default Theme:', selected.hex);
              
              // Set this theme as active since it exists
              await (supabase
                .from("user_settings") as any)
                .upsert(
                  {
                    user_id: user.id,
                    active_theme_id: defaultTheme.id,
                  },
                  {
                    onConflict: "user_id",
                  }
                );
              console.log('[COLOR DEBUG] AppearanceSettings - Set Default Theme as active');
            }
          } else {
            console.log('[COLOR DEBUG] AppearanceSettings - ❌ No Default Theme found');
          }
          // Don't automatically apply first color - let user select manually
        }
      } catch (error) {
        console.error("Error loading colors:", error);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    loadColors();
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handlePresetChange = async (themeId: string) => {
    if (!userId) return;

    try {
      const supabase = createClient();

      // Get the theme to apply its colors
      const { data: theme } = await (supabase
        .from("user_themes") as any)
        .select("primary_color_id, secondary_color_id, accent_color_id")
        .eq("id", themeId)
        .single();

      if (!theme) {
        toast({
          title: "Theme not found",
          description: "The selected theme could not be found.",
          variant: "destructive",
        });
        return;
      }

      // Load the primary color
      const { data: color } = await (supabase
        .from("user_colors") as any)
        .select("*")
        .eq("id", theme.primary_color_id)
        .single();

      let selected = null;
      if (color) {
        selected = dbColorToComponent(color);
        setSelectedColor(selected);
        applyColorToCSS(selected);
      }

      // Update user_settings with the new active_theme_id
      const { error: settingsError } = await (supabase
        .from("user_settings") as any)
        .upsert(
          {
            user_id: userId,
            active_theme_id: themeId,
          },
          {
            onConflict: "user_id",
          }
        );

      if (settingsError) throw settingsError;

      console.log('[COLOR DEBUG] AppearanceSettings - Theme selected:', {
        themeId,
        selectedColor: selected
      });
      
      setActiveThemeId(themeId);

      toast({
        title: "Preset applied",
        description: "The preset has been successfully applied.",
      });
    } catch (error) {
      console.error("Error switching preset:", error);
      toast({
        title: "Failed to switch preset",
        description: "An error occurred while switching the preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleColorChange = async (color: Color) => {
    setSelectedColor(color);
    applyColorToCSS(color);
    
    // Automatically save to database
    if (!userId) return;
    
    try {
      const supabase = createClient();
      const colorId = color.id;

      // Create or update theme
      const { data: existingTheme } = await (supabase
        .from("user_themes") as any)
        .select("id")
        .eq("user_id", userId)
        .eq("name", "Default Theme")
        .maybeSingle();

      let themeId: string;
      if (existingTheme) {
        const { error: updateError } = await (supabase
          .from("user_themes") as any)
          .update({
            primary_color_id: colorId,
            secondary_color_id: colorId,
            accent_color_id: colorId,
          })
          .eq("id", existingTheme.id);
        if (updateError) throw updateError;
        themeId = existingTheme.id;
      } else {
        const defaultFontJson = serializeFontFamily(getDefaultFontFamily());
        const { data: newTheme, error: themeError } = await (supabase
          .from("user_themes") as any)
          .insert({
            user_id: userId,
            name: "Default Theme",
            primary_color_id: colorId,
            secondary_color_id: colorId,
            accent_color_id: colorId,
            font_family: defaultFontJson,
          })
          .select("id")
          .single();

        if (themeError) throw themeError;
        themeId = newTheme.id;
      }

      // Update user_settings
      const { error: settingsError } = await (supabase
        .from("user_settings") as any)
        .upsert(
          {
            user_id: userId,
            active_theme_id: themeId,
          },
          {
            onConflict: "user_id",
          }
        );

      if (settingsError) throw settingsError;

      // Update active theme ID state
      setActiveThemeId(themeId);

      // Reload themes list to ensure it's up to date
      const { data: updatedThemes } = await (supabase
        .from("user_themes") as any)
        .select("id, name, primary_color_id, secondary_color_id, accent_color_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (updatedThemes) {
        setUserThemes(updatedThemes);
      }
    } catch (error) {
      console.error("Error saving color preference:", error);
      // Don't show alert for automatic saves, just log the error
    }
  };

  const handleAddColor = () => {
    setEditingColor(null);
    setIsColorModalOpen(true);
  };

  const handleEditColor = (color: Color, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingColor(color);
    setIsColorModalOpen(true);
  };

  const handleDeleteColor = async (color: Color, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${color.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const supabase = createClient();
      
      // Check if color is being used in any theme
      const { data: themesUsingColor, error: themesError } = await (supabase
        .from("user_themes") as any)
        .select("id, name, primary_color_id, secondary_color_id, accent_color_id")
        .eq("user_id", userId)
        .or(`primary_color_id.eq.${color.id},secondary_color_id.eq.${color.id},accent_color_id.eq.${color.id}`);

      if (themesError) throw themesError;

      if (themesUsingColor && themesUsingColor.length > 0) {
        // Color is being used in themes, we need to update them first
        // Get the first available color to replace it with
        const replacementColor = userColors.find((c) => c.id !== color.id);
        
        if (!replacementColor) {
          toast({
            title: "Cannot delete color",
            description: "This color is being used in your theme and there are no other colors available. Please add another color first.",
            variant: "destructive",
          });
          return;
        }

        // Update all themes that use this color
        for (const theme of themesUsingColor) {
          const updateData: any = {};
          if (theme.primary_color_id === color.id) {
            updateData.primary_color_id = replacementColor.id;
          }
          if (theme.secondary_color_id === color.id) {
            updateData.secondary_color_id = replacementColor.id;
          }
          if (theme.accent_color_id === color.id) {
            updateData.accent_color_id = replacementColor.id;
          }

          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await (supabase
              .from("user_themes") as any)
              .update(updateData)
              .eq("id", theme.id);

            if (updateError) throw updateError;
          }
        }

        // If the deleted color was the selected one, switch to replacement
        if (selectedColor?.id === color.id) {
          await handleColorChange(replacementColor);
        }
      }

      // Now delete the color
      const { error } = await (supabase
        .from("user_colors") as any)
        .delete()
        .eq("id", color.id)
        .eq("user_id", userId);

      if (error) throw error;

      // Remove from local state
      setUserColors((prev) => prev.filter((c) => c.id !== color.id));
      
      // If deleted color was selected and we didn't already switch, select the first available
      if (selectedColor?.id === color.id && (!themesUsingColor || themesUsingColor.length === 0)) {
        const remainingColors = userColors.filter((c) => c.id !== color.id);
        if (remainingColors.length > 0) {
          await handleColorChange(remainingColors[0]);
        } else {
          setSelectedColor(null);
        }
      }

      toast({
        title: "Color deleted",
        description: `"${color.name}" has been successfully deleted.`,
      });
    } catch (error: any) {
      console.error("Failed to delete color:", error);
      toast({
        title: "Failed to delete color",
        description: error?.message || "An error occurred while deleting the color. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveColor = async (colorData: { hex: string; name: string }) => {
    if (!userId) return;

    try {
      const supabase = createClient();
      const hsl = hexToHsl(colorData.hex);

      if (editingColor) {
        // Update existing color
        const { error } = await (supabase
          .from("user_colors") as any)
          .update({
            name: colorData.name,
            hex: colorData.hex,
            hsl_h: hsl.h,
            hsl_s: hsl.s,
            hsl_l: hsl.l,
          })
          .eq("id", editingColor.id);

        if (error) throw error;

        // Refresh colors
        const { data: colors } = await (supabase
          .from("user_colors") as any)
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (colors) {
          const componentColors = colors.map(dbColorToComponent);
          setUserColors(componentColors);

          // Update selected color if it was the one being edited and save preference automatically
          if (selectedColor?.id === editingColor.id) {
            const updated = componentColors.find((c: Color) => c.id === editingColor.id);
            if (updated) {
              await handleColorChange(updated);
            }
          }
        }
      } else {
        // Create new color
        const { data: newColor, error } = await (supabase
          .from("user_colors") as any)
          .insert({
            user_id: userId,
            name: colorData.name,
            hex: colorData.hex,
            hsl_h: hsl.h,
            hsl_s: hsl.s,
            hsl_l: hsl.l,
          })
          .select()
          .single();

        if (error) throw error;

        const componentColor = dbColorToComponent(newColor);
        setUserColors((prev) => [componentColor, ...prev]);
        
        // Auto-select the new color and save preference automatically
        await handleColorChange(componentColor);
      }

      setIsColorModalOpen(false);
      setEditingColor(null);
    } catch (error) {
      console.error("Error saving color:", error);
      alert("Failed to save color. Please try again.");
    }
  };

  const handleGeneratePreset = async () => {
    if (!userId) return;

    setIsGeneratingPreset(true);
    try {
      // Call AI API to generate webapp preset
      const response = await fetch("/api/admin/ai/generate-webapp-preset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to generate preset" }));
        throw new Error(errorData.error || "Failed to generate preset");
      }

      const presetData = await response.json();

      console.log('[PRESET DEBUG] API Response:', {
        primary_color: presetData.primary_color,
        accent_color: presetData.accent_color,
        name: presetData.name
      });

      if (!presetData.primary_color || !presetData.accent_color) {
        throw new Error("Invalid preset data received");
      }

      // Verify colors are different
      if (presetData.primary_color === presetData.accent_color) {
        console.warn('[PRESET DEBUG] WARNING: Primary and accent colors are the same!');
      }

      const supabase = createClient();

      // Create primary color
      const primaryHsl = hexToHsl(presetData.primary_color);
      console.log('[PRESET DEBUG] Primary HSL:', primaryHsl);
      const { data: primaryColor, error: primaryError } = await (supabase
        .from("user_colors") as any)
        .insert({
          user_id: userId,
          name: `${presetData.name || "AI Generated"} - Primary`,
          hex: presetData.primary_color,
          hsl_h: primaryHsl.h,
          hsl_s: primaryHsl.s,
          hsl_l: primaryHsl.l,
        })
        .select()
        .single();

      if (primaryError) throw primaryError;
      console.log('[PRESET DEBUG] Primary color created:', {
        id: primaryColor.id,
        hex: primaryColor.hex,
        name: primaryColor.name
      });

      // Create accent color
      const accentHsl = hexToHsl(presetData.accent_color);
      console.log('[PRESET DEBUG] Accent HSL:', accentHsl);
      const { data: accentColor, error: accentError } = await (supabase
        .from("user_colors") as any)
        .insert({
          user_id: userId,
          name: `${presetData.name || "AI Generated"} - Accent`,
          hex: presetData.accent_color,
          hsl_h: accentHsl.h,
          hsl_s: accentHsl.s,
          hsl_l: accentHsl.l,
        })
        .select()
        .single();

      if (accentError) throw accentError;
      console.log('[PRESET DEBUG] Accent color created:', {
        id: accentColor.id,
        hex: accentColor.hex,
        name: accentColor.name
      });

      // Verify the colors are actually different
      if (primaryColor.id === accentColor.id || primaryColor.hex === accentColor.hex) {
        console.error('[PRESET DEBUG] ERROR: Primary and accent colors are the same!', {
          primaryId: primaryColor.id,
          accentId: accentColor.id,
          primaryHex: primaryColor.hex,
          accentHex: accentColor.hex
        });
        throw new Error("Primary and accent colors cannot be the same. Please try generating again.");
      }

      // Verify IDs are different
      if (primaryColor.id === accentColor.id) {
        console.error('[PRESET DEBUG] ERROR: Primary and accent color IDs are the same!');
        throw new Error("Color IDs are the same. This should not happen.");
      }

      // Convert to component colors
      const primaryComponent = dbColorToComponent(primaryColor);
      const accentComponent = dbColorToComponent(accentColor);

      // Update colors list
      setUserColors((prev) => [primaryComponent, accentComponent, ...prev]);

      // Create a new theme with both primary and accent colors
      const defaultFontJson = serializeFontFamily(getDefaultFontFamily());
      
      // Double-check we're using the correct IDs
      const primaryColorId = primaryColor.id;
      const accentColorId = accentColor.id;
      
      console.log('[PRESET DEBUG] Creating theme with:', {
        primary_color_id: primaryColorId,
        accent_color_id: accentColorId,
        primary_hex: primaryColor.hex,
        accent_hex: accentColor.hex,
        idsAreDifferent: primaryColorId !== accentColorId
      });
      
      if (primaryColorId === accentColorId) {
        console.error('[PRESET DEBUG] CRITICAL ERROR: Color IDs are the same before theme creation!');
        throw new Error("Cannot create theme: primary and accent color IDs are identical.");
      }
      
      const { data: newTheme, error: themeError } = await (supabase
        .from("user_themes") as any)
        .insert({
          user_id: userId,
          name: presetData.name || "AI Generated Preset",
          primary_color_id: primaryColorId,
          secondary_color_id: accentColorId, // Use accent as secondary for variety
          accent_color_id: accentColorId,
          font_family: defaultFontJson,
        })
        .select("id, primary_color_id, secondary_color_id, accent_color_id")
        .single();

      if (themeError) {
        console.error('[PRESET DEBUG] Theme creation error:', themeError);
        throw themeError;
      }
      
      console.log('[PRESET DEBUG] Theme created successfully:', {
        id: newTheme.id,
        primary_color_id: newTheme.primary_color_id,
        accent_color_id: newTheme.accent_color_id,
        secondary_color_id: newTheme.secondary_color_id
      });
      
      // Verify the saved theme has correct colors
      if (newTheme.primary_color_id === newTheme.accent_color_id) {
        console.error('[PRESET DEBUG] CRITICAL: Saved theme has same primary and accent color IDs!');
      }

      // Set this theme as active
      const { error: settingsError } = await (supabase
        .from("user_settings") as any)
        .upsert(
          {
            user_id: userId,
            active_theme_id: newTheme.id,
          },
          {
            onConflict: "user_id",
          }
        );

      if (settingsError) throw settingsError;

      // Update active theme ID state
      setActiveThemeId(newTheme.id);

      // Reload themes list
      const { data: updatedThemes } = await (supabase
        .from("user_themes") as any)
        .select("id, name, primary_color_id, secondary_color_id, accent_color_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (updatedThemes) {
        setUserThemes(updatedThemes);
      }

      // Apply primary color to CSS
      setSelectedColor(primaryComponent);
      applyColorToCSS(primaryComponent);

      toast({
        title: "Preset generated",
        description: `"${presetData.name || "AI Generated Preset"}" has been created with primary and accent colors.`,
      });
    } catch (error: any) {
      console.error("Error generating preset:", error);
      toast({
        title: "Failed to generate preset",
        description: error?.message || "An error occurred while generating the preset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreset(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const currentTheme = theme || "light";

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden shadow-lg border-0 rounded-3xl">

        <CardHeader className="relative">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          {/* Theme Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">Choose your interface theme</div>
            </div>
            <Select value={currentTheme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  {currentTheme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : currentTheme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Monitor className="h-4 w-4" />
                  )}
                  <SelectValue>
                    {currentTheme === "dark" ? "Dark" : currentTheme === "light" ? "Light" : "System"}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                    <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                    </div>
                  </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preset Section */}
          {userThemes.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="font-medium">Preset</div>
                <div className="text-sm text-muted-foreground">Switch between your saved presets</div>
              </div>
              <Select value={activeThemeId || ""} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select a preset">
                    {userThemes.find(t => t.id === activeThemeId)?.name || "Select a preset"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {userThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Brand Color Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div className="font-medium text-lg">Brand Color</div>
              </div>
              <div className="text-sm text-muted-foreground">Choose your vibe ✨</div>
            </div>

            {/* Current Color Display */}
            {selectedColor && (
              <div className="mb-6 p-5 rounded-xl border-2 border-border/50 bg-muted/10 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                  <div className="relative group/color flex-shrink-0">
                    <div
                      className="w-20 h-20 rounded-xl border-[3px] border-white/90 shadow-2xl transition-all duration-300 group-hover/color:scale-110 group-hover/color:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl blur-xl opacity-60 transition-opacity duration-300 group-hover/color:opacity-80"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    {/* Sparkle effect */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover/color:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-white rounded-full blur-sm animate-pulse" />
                      <div className="absolute inset-0.5 bg-primary rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 w-full min-w-0">
                    <div className="text-sm font-semibold mb-1.5 flex flex-wrap items-center gap-2">
                      Current Color
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {selectedColor.name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono font-medium break-all">
                      {selectedColor.hex}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={handleGeneratePreset}
                      disabled={isGeneratingPreset}
                      variant="default"
                      className={cn(
                        "relative overflow-hidden group/btn transition-all duration-300",
                        "w-full sm:w-auto"
                      )}
                    >
                      <FontAwesomeIcon 
                        icon={faWandMagicSparkles} 
                        className={cn(
                          "h-4 w-4 mr-2 relative z-10",
                          isGeneratingPreset && "animate-spin"
                        )} 
                      />
                      <span className="relative z-10">
                        {isGeneratingPreset ? "Generating..." : "Generate Preset"}
                      </span>
                    </Button>
                    <Button
                      onClick={handleAddColor}
                      variant="outline"
                      className={cn(
                        "relative overflow-hidden group/btn hover:border-primary/50 hover:bg-secondary hover:text-foreground transition-all duration-300",
                        "w-full sm:w-auto"
                      )}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                      <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2 relative z-10" />
                      <span className="relative z-10">Add Color</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Brand Colors Grid */}
            {userColors.length > 0 ? (
              <div className="mb-4">
                <div className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <span>Brand Colors</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {userColors.length}
                  </span>
          </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-3">
                {userColors.map((color) => {
                  const isActive = selectedColor?.id === color.id;
                  return (
                      <div key={color.id} className="relative group">
                    <button
                      onClick={() => handleColorChange(color)}
                      className={cn(
                            "relative w-full aspect-square rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl",
                            "border-2 border-white/50 shadow-md",
                            isActive &&
                              "ring-3 ring-primary ring-offset-1 ring-offset-background scale-105 shadow-xl"
                      )}
                          style={{
                            backgroundColor: color.hex,
                            boxShadow: isActive
                              ? `0 0 15px ${color.hex}40, 0 8px 20px rgba(0,0,0,0.15)`
                              : undefined,
                          }}
                          aria-label={`Select ${color.name || color.hex}`}
                        >
                          {/* Glow effect on hover */}
                      <div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-lg"
                        style={{ backgroundColor: color.hex }}
                      />

                          {/* Selected indicator */}
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="relative">
                                <div className="h-2.5 w-2.5 rounded-full bg-white shadow-md animate-pulse" />
                                <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-white/50 animate-ping" />
                              </div>
                            </div>
                          )}

                          {/* Sparkle decoration */}
                          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-2 h-2 bg-white/90 rounded-full blur-[1px]" />
                          </div>
                        </button>

                        {/* Edit and Delete buttons */}
                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                          <button
                            onClick={(e) => handleEditColor(color, e)}
                            className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md"
                            title="Edit color"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteColor(color, e)}
                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md"
                            title="Delete color"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Color name display */}
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium text-foreground truncate leading-tight">
                        {color.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate leading-tight">
                            {color.hex}
                          </div>
                        </div>
                      </div>
                  );
                })}
                </div>
                  </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20">
                <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium mb-1">No saved colors yet</p>
                <p className="text-xs">Click &quot;Add Color&quot; to create your first custom color!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Color Modal */}
      {userId && (
        <ColorModal
          isOpen={isColorModalOpen}
          onClose={() => {
            setIsColorModalOpen(false);
            setEditingColor(null);
          }}
          mode={editingColor ? "edit" : "create"}
          initialColor={editingColor ? { id: editingColor.id, hex: editingColor.hex, name: editingColor.name } : undefined}
          onSave={handleSaveColor}
          userId={userId}
          position={null}
        />
      )}
    </div>
  );
}
