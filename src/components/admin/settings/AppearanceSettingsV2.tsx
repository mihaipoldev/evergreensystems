"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSun, faMoon, faDisplay } from "@fortawesome/free-solid-svg-icons";
import { Moon, Sun, Monitor, Palette, Edit2, Trash2, Save, Sparkles } from "lucide-react";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { createClient } from "@/lib/supabase/client";
import { hexToHsl, hslToCssString } from "@/lib/color-utils";
import { HexColorPicker } from "react-colorful";
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
};

type UserTheme = {
  id: string;
  name: string;
  primary_color_id: string;
  secondary_color_id: string;
  accent_color_id: string;
  primary_color?: DatabaseColor;
  secondary_color?: DatabaseColor;
  accent_color?: DatabaseColor;
};

export function AppearanceSettingsV2() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userThemes, setUserThemes] = useState<UserTheme[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  
  // Color picker state
  const [primaryColor, setPrimaryColor] = useState<Color | null>(null);
  const [accentColor, setAccentColor] = useState<Color | null>(null);
  const [activeColorType, setActiveColorType] = useState<'primary' | 'accent'>('primary');
  
  // Dialog state
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const [isEditingPreset, setIsEditingPreset] = useState(false);
  const [isGeneratingPreset, setIsGeneratingPreset] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renamePresetName, setRenamePresetName] = useState("");
  const [presetToRename, setPresetToRename] = useState<string | null>(null);

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
    };
  };

  // Apply primary color to CSS
  const applyPrimaryColorToCSS = (color: Color | null) => {
    if (!color || typeof document === "undefined") return;
    const cssValue = hslToCssString(color.hsl.h, color.hsl.s, color.hsl.l);
    
    const applyStyle = () => {
      try {
        const styleText = `html.preset-admin,html.preset-admin.dark,html.preset-admin *,html.preset-admin.dark *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${color.hsl.h}!important;--brand-s:${color.hsl.s}!important;--brand-l:${color.hsl.l}!important;--primary:${cssValue}!important;}`;
        
        const oldStyle = document.getElementById("primary-color-client");
        if (oldStyle) {
          try {
            if (oldStyle.parentNode) {
              oldStyle.remove();
            }
          } catch (e) {
            // Ignore removal errors
          }
        }
        
        const style = document.createElement("style");
        style.id = "primary-color-client";
        style.textContent = styleText;
        
        if (document.head) {
          document.head.appendChild(style);
          
          const sessionStyle = document.getElementById("primary-color-session");
          if (sessionStyle) {
            try {
              sessionStyle.textContent = styleText;
            } catch (e) {
              // Ignore update errors
            }
          }
        }
      } catch (error) {
        console.error("Error applying primary color to CSS:", error);
      }
    };
    
    applyStyle();
    setTimeout(applyStyle, 0);
    
    try {
      sessionStorage.setItem("primary-color-hsl", cssValue);
    } catch (e) {
      // sessionStorage not available
    }
    
    try {
      // CRITICAL: Delete old cookies with all possible attribute combinations
      const cookieNames = ['primary-color-hsl', 'brand-color-h', 'brand-color-s', 'brand-color-l'];
      const deletionStrategies = [
        '',
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
      
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      // Don't URL-encode - HSL values are safe for cookies
      document.cookie = `primary-color-hsl=${cssValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = `brand-color-h=${color.hsl.h}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = `brand-color-s=${color.hsl.s}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = `brand-color-l=${color.hsl.l}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } catch (e) {
      // Cookie setting failed
    }
  };

  // Secondary color is not applied dynamically - it comes from CSS defaults in globals.css
  // The applySecondaryColorToCSS function has been removed

  // Apply accent color to CSS
  const applyAccentColorToCSS = (color: Color | null) => {
    if (!color || typeof document === "undefined") return;
    const cssValue = hslToCssString(color.hsl.h, color.hsl.s, color.hsl.l);
    
    const applyStyle = () => {
      try {
        const styleText = `html.preset-admin,html.preset-admin.dark,html.preset-admin *,html.preset-admin.dark *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--accent-h:${color.hsl.h}!important;--accent-s:${color.hsl.s}!important;--accent-l:${color.hsl.l}!important;--accent:${cssValue}!important;}`;
        
        const oldStyle = document.getElementById("accent-color-client");
        if (oldStyle) {
          try {
            if (oldStyle.parentNode) {
              oldStyle.remove();
            }
          } catch (e) {
            // Ignore removal errors
          }
        }
        
        const style = document.createElement("style");
        style.id = "accent-color-client";
        style.textContent = styleText;
        
        if (document.head) {
          document.head.appendChild(style);
          
          // Also update accent-color-session if it exists (for InstantColorApply)
          const sessionStyle = document.getElementById("accent-color-session");
          if (sessionStyle) {
            try {
              sessionStyle.textContent = styleText;
            } catch (e) {
              // Ignore update errors
            }
          }
        }
      } catch (error) {
        console.error("Error applying accent color to CSS:", error);
      }
    };
    
    // Apply immediately
    applyStyle();
    
    // Also apply after a short delay to ensure it overrides any server styles that load late
    setTimeout(applyStyle, 0);
    
    // Save to sessionStorage for InstantColorApply fallback
    try {
      sessionStorage.setItem("accent-color-hsl", cssValue);
    } catch (e) {
      // sessionStorage not available
    }
    
    // Save to cookie for instant access on next page load (server-side)
    // CRITICAL: First delete old cookie, then set new one WITHOUT encoding
    try {
      // Delete old accent cookie with all possible attributes
      const deletionStrategies = [
        '',
        '; path=/',
        '; path=/; domain=localhost',
        '; path=/; domain=' + window.location.hostname,
        '; path=/; SameSite=Lax',
        '; path=/; SameSite=None; Secure',
      ];
      
      deletionStrategies.forEach(attrs => {
        document.cookie = `accent-color-hsl=; expires=Thu, 01 Jan 1970 00:00:00 GMT${attrs}`;
        document.cookie = `accent-color-h=; expires=Thu, 01 Jan 1970 00:00:00 GMT${attrs}`;
        document.cookie = `accent-color-s=; expires=Thu, 01 Jan 1970 00:00:00 GMT${attrs}`;
        document.cookie = `accent-color-l=; expires=Thu, 01 Jan 1970 00:00:00 GMT${attrs}`;
      });
      
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      // Don't URL-encode HSL values
      document.cookie = `accent-color-hsl=${cssValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      // Also save accent color variables to cookies (numbers don't need encoding)
      document.cookie = `accent-color-h=${color.hsl.h}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = `accent-color-s=${color.hsl.s}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = `accent-color-l=${color.hsl.l}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } catch (e) {
      // Cookie setting failed
    }
  };

  // Helper function to reload themes with colors
  const reloadThemes = async () => {
    if (!userId) return;
    
    const supabase = createClient();
    const { data: themes, error: themesError } = await (supabase
      .from("user_themes") as any)
      .select("id, name, primary_color_id, secondary_color_id, accent_color_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (themesError) {
      console.error("Error loading themes:", themesError);
      return;
    }

    if (themes) {
      // Load colors for each theme
      const themesWithColors = await Promise.all(
        themes.map(async (theme: UserTheme) => {
          const [primaryColor, secondaryColor, accentColor] = await Promise.all([
            theme.primary_color_id
              ? (supabase
                  .from("user_colors") as any)
                  .select("*")
                  .eq("id", theme.primary_color_id)
                  .single()
                  .then(({ data }: { data: any }) => data)
              : null,
            theme.secondary_color_id
              ? (supabase
                  .from("user_colors") as any)
                  .select("*")
                  .eq("id", theme.secondary_color_id)
                  .single()
                  .then(({ data }: { data: any }) => data)
              : null,
            theme.accent_color_id
              ? (supabase
                  .from("user_colors") as any)
                  .select("*")
                  .eq("id", theme.accent_color_id)
                  .single()
                  .then(({ data }: { data: any }) => data)
              : null,
          ]);

          return {
            ...theme,
            primary_color: primaryColor || undefined,
            secondary_color: secondaryColor || undefined,
            accent_color: accentColor || undefined,
          };
        })
      );

      setUserThemes(themesWithColors);
    }
  };

  // Load themes and colors
  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          setMounted(true);
          return;
        }

        setUserId(user.id);

        // Load all user themes
        const { data: themes, error: themesError } = await (supabase
          .from("user_themes") as any)
          .select("id, name, primary_color_id, secondary_color_id, accent_color_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (themesError) {
          console.error("Error loading themes:", themesError);
        } else if (themes) {
          // Load colors for each theme
          const themesWithColors = await Promise.all(
            themes.map(async (theme: UserTheme) => {
              const [primaryColor, secondaryColor, accentColor] = await Promise.all([
                theme.primary_color_id
                  ? (supabase
                      .from("user_colors") as any)
                      .select("*")
                      .eq("id", theme.primary_color_id)
                      .single()
                      .then(({ data }: { data: any }) => data)
                  : null,
                theme.secondary_color_id
                  ? (supabase
                      .from("user_colors") as any)
                      .select("*")
                      .eq("id", theme.secondary_color_id)
                      .single()
                      .then(({ data }: { data: any }) => data)
                  : null,
                theme.accent_color_id
                  ? (supabase
                      .from("user_colors") as any)
                      .select("*")
                      .eq("id", theme.accent_color_id)
                      .single()
                      .then(({ data }: { data: any }) => data)
                  : null,
              ]);

              return {
                ...theme,
                primary_color: primaryColor || undefined,
                secondary_color: secondaryColor || undefined,
                accent_color: accentColor || undefined,
              };
            })
          );

          setUserThemes(themesWithColors);
        }

        // Load active theme from user_settings
        const { data: settings } = await (supabase
          .from("user_settings") as any)
          .select("active_theme_id")
          .eq("user_id", user.id)
          .single();

        if (settings?.active_theme_id && themes) {
          const activeTheme = themes.find((t: UserTheme) => t.id === settings.active_theme_id);
          if (activeTheme) {
            // Load colors for active theme
            const [primaryColor, secondaryColor, accentColor] = await Promise.all([
              activeTheme.primary_color_id
                ? (supabase
                    .from("user_colors") as any)
                    .select("*")
                    .eq("id", activeTheme.primary_color_id)
                    .single()
                    .then(({ data }: { data: any }) => data)
                : null,
              activeTheme.secondary_color_id
                ? (supabase
                    .from("user_colors") as any)
                    .select("*")
                    .eq("id", activeTheme.secondary_color_id)
                    .single()
                    .then(({ data }: { data: any }) => data)
                : null,
              activeTheme.accent_color_id
                ? (supabase
                    .from("user_colors") as any)
                    .select("*")
                    .eq("id", activeTheme.accent_color_id)
                    .single()
                    .then(({ data }: { data: any }) => data)
                : null,
            ]);

            setSelectedPresetId(activeTheme.id);
            if (primaryColor) {
              const primary = dbColorToComponent(primaryColor);
              setPrimaryColor(primary);
              applyPrimaryColorToCSS(primary);
            }
            // Secondary color removed from UI - not loading it anymore
            if (accentColor) {
              const accent = dbColorToComponent(accentColor);
              setAccentColor(accent);
              applyAccentColorToCSS(accent);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    loadData();
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleColorChange = (hex: string, type?: 'primary' | 'accent') => {
    const colorType = type || activeColorType;
    const hsl = hexToHsl(hex);
    const color: Color = {
      id: '', // Temporary, will be set when saved
      name: '',
      hex,
      hsl: {
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
      },
    };
    
    if (colorType === 'primary') {
      setPrimaryColor(color);
      applyPrimaryColorToCSS(color);
    } else if (colorType === 'accent') {
      setAccentColor(color);
      applyAccentColorToCSS(color);
    }
  };

  const handlePresetClick = async (theme: UserTheme) => {
    if (!userId) return;
    
    setSelectedPresetId(theme.id);
    setIsEditingPreset(true);
    
    if (theme.primary_color) {
      const primary = dbColorToComponent(theme.primary_color);
      setPrimaryColor(primary);
      applyPrimaryColorToCSS(primary);
    }
    // Secondary color removed from UI - not loading it anymore
    if (theme.accent_color) {
      const accent = dbColorToComponent(theme.accent_color);
      setAccentColor(accent);
      applyAccentColorToCSS(accent);
    }

    // Update user_settings to set this as active theme
    try {
      const supabase = createClient();
      await (supabase
        .from("user_settings") as any)
        .upsert(
          {
            user_id: userId,
            active_theme_id: theme.id,
          },
          {
            onConflict: "user_id",
          }
        );
    } catch (error) {
      console.error("Error updating active theme:", error);
    }
  };

  const handleCreateNewPreset = () => {
    setSelectedPresetId(null);
    setIsEditingPreset(false);
    setNewPresetName("");
    setIsSaveDialogOpen(true);
  };

  const handleGeneratePreset = async () => {
    if (!userId) return;

    try {
      setIsGeneratingPreset(true);
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Call AI API to generate webapp preset (primary + accent)
      const response = await fetch("/api/admin/ai/generate-webapp-preset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate preset");
      }

      const presetData = await response.json();

      if (!presetData.primary_color || !presetData.accent_color) {
        throw new Error("Invalid preset data received");
      }

      // Verify colors are different
      if (presetData.primary_color === presetData.accent_color) {
        throw new Error("Primary and accent colors cannot be the same. Please try generating again.");
      }

      // Convert hex colors to HSL
      const primaryHsl = hexToHsl(presetData.primary_color);
      const accentHsl = hexToHsl(presetData.accent_color);

      // Create primary color in database
      const { data: newPrimaryColor, error: primaryError } = await (supabase
        .from("user_colors") as any)
        .insert({
          user_id: userId,
          name: `${presetData.name || "AI Generated"} - Primary`,
          hex: presetData.primary_color,
          hsl_h: primaryHsl.h,
          hsl_s: primaryHsl.s,
          hsl_l: primaryHsl.l,
        })
        .select("id")
        .single();

      if (primaryError) throw primaryError;

      // Create accent color in database
      const { data: newAccentColor, error: accentError } = await (supabase
        .from("user_colors") as any)
        .insert({
          user_id: userId,
          name: `${presetData.name || "AI Generated"} - Accent`,
          hex: presetData.accent_color,
          hsl_h: accentHsl.h,
          hsl_s: accentHsl.s,
          hsl_l: accentHsl.l,
        })
        .select("id")
        .single();

      if (accentError) throw accentError;

      // Verify IDs are different
      if (newPrimaryColor.id === newAccentColor.id) {
        throw new Error("Color IDs are the same. This should not happen.");
      }

      // Create gray secondary color (neutral gray for webapps)
      const grayHex = "#9ca3af"; // Neutral gray (similar to gray-400 in Tailwind)
      const grayHsl = hexToHsl(grayHex);
      const { data: newSecondaryColor, error: secondaryError } = await (supabase
        .from("user_colors") as any)
        .insert({
          user_id: userId,
          name: `${presetData.name || "AI Generated"} - Secondary`,
          hex: grayHex,
          hsl_h: grayHsl.h,
          hsl_s: grayHsl.s,
          hsl_l: grayHsl.l,
        })
        .select("id")
        .single();

      if (secondaryError) throw secondaryError;

      // Create theme with primary, gray secondary, and accent colors
      const defaultFontJson = serializeFontFamily(getDefaultFontFamily());
      const { data: newTheme, error: themeError } = await (supabase
        .from("user_themes") as any)
        .insert({
          user_id: userId,
          name: presetData.name || "AI Generated Preset",
          primary_color_id: newPrimaryColor.id,
          secondary_color_id: newSecondaryColor.id, // Gray secondary
          accent_color_id: newAccentColor.id,
          font_family: defaultFontJson,
        })
        .select("id, name, primary_color_id, secondary_color_id, accent_color_id")
        .single();

      if (themeError) throw themeError;

      // Verify the saved theme has correct colors
      if (newTheme.primary_color_id === newTheme.accent_color_id) {
        console.error('[PRESET DEBUG] CRITICAL: Saved theme has same primary and accent color IDs!');
      }

      // Update user_settings to set this as active theme
      await (supabase
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

      // Reload themes with colors
      await reloadThemes();

      // Set colors in picker
      const primaryColorComponent: Color = {
        id: newPrimaryColor.id,
        name: `${presetData.name || "AI Generated"} - Primary`,
        hex: presetData.primary_color,
        hsl: {
          h: primaryHsl.h,
          s: primaryHsl.s,
          l: primaryHsl.l,
        },
      };

      const accentColorComponent: Color = {
        id: newAccentColor.id,
        name: `${presetData.name || "AI Generated"} - Accent`,
        hex: presetData.accent_color,
        hsl: {
          h: accentHsl.h,
          s: accentHsl.s,
          l: accentHsl.l,
        },
      };

      setPrimaryColor(primaryColorComponent);
      setAccentColor(accentColorComponent);
      // Secondary color removed from UI - not setting it in state anymore
      applyPrimaryColorToCSS(primaryColorComponent);

      setSelectedPresetId(newTheme.id);
      setIsEditingPreset(true);

      toast({
        title: "Preset generated",
        description: `"${presetData.name || "AI Generated Preset"}" has been created with primary and accent colors optimized for webapps.`,
      });
    } catch (error) {
      console.error("Error generating preset:", error);
      toast({
        title: "Failed to generate preset",
        description: error instanceof Error ? error.message : "An error occurred while generating the preset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreset(false);
    }
  };

  const handleSavePreset = async () => {
    if (!userId || !primaryColor || !accentColor) {
      toast({
        title: "Missing colors",
        description: "Please select primary and accent colors before saving.",
        variant: "destructive",
      });
      return;
    }

    if (isEditingPreset && selectedPresetId) {
      // Update existing preset
      await updatePreset(selectedPresetId);
    } else {
      // Create new preset
      if (!newPresetName.trim()) {
        toast({
          title: "Preset name required",
          description: "Please enter a name for your preset.",
          variant: "destructive",
        });
        return;
      }
      await createPreset(newPresetName.trim());
    }
  };

  const createPreset = async (presetName: string) => {
    if (!userId || !primaryColor || !accentColor) return;

    try {
      const supabase = createClient();

      // Find or create primary color
      let primaryColorId: string;
      const { data: existingPrimary } = await (supabase
        .from("user_colors") as any)
        .select("id")
        .eq("user_id", userId)
        .eq("hex", primaryColor.hex)
        .maybeSingle();

      if (existingPrimary) {
        primaryColorId = existingPrimary.id;
      } else {
        const { data: newPrimary, error: primaryError } = await (supabase
          .from("user_colors") as any)
          .insert({
            user_id: userId,
            name: `Primary ${presetName}`,
            hex: primaryColor.hex,
            hsl_h: primaryColor.hsl.h,
            hsl_s: primaryColor.hsl.s,
            hsl_l: primaryColor.hsl.l,
          })
          .select("id")
          .single();

        if (primaryError) throw primaryError;
        primaryColorId = newPrimary.id;
      }

      // Create default gray secondary color for backward compatibility
      const grayHex = "#9ca3af"; // Neutral gray (similar to gray-400 in Tailwind)
      const grayHsl = hexToHsl(grayHex);
      const { data: newSecondary, error: secondaryError } = await (supabase
        .from("user_colors") as any)
        .insert({
          user_id: userId,
          name: `Secondary ${presetName}`,
          hex: grayHex,
          hsl_h: grayHsl.h,
          hsl_s: grayHsl.s,
          hsl_l: grayHsl.l,
        })
        .select("id")
        .single();

      if (secondaryError) throw secondaryError;
      const secondaryColorId = newSecondary.id;

      // Find or create accent color
      let accentColorId: string;
      const { data: existingAccent } = await (supabase
        .from("user_colors") as any)
        .select("id")
        .eq("user_id", userId)
        .eq("hex", accentColor.hex)
        .maybeSingle();

      if (existingAccent) {
        accentColorId = existingAccent.id;
      } else {
        const { data: newAccent, error: accentError } = await (supabase
          .from("user_colors") as any)
          .insert({
            user_id: userId,
            name: `Accent ${presetName}`,
            hex: accentColor.hex,
            hsl_h: accentColor.hsl.h,
            hsl_s: accentColor.hsl.s,
            hsl_l: accentColor.hsl.l,
          })
          .select("id")
          .single();

        if (accentError) throw accentError;
        accentColorId = newAccent.id;
      }

      // Create theme
      const defaultFontJson = serializeFontFamily(getDefaultFontFamily());
      const { data: newTheme, error: themeError } = await (supabase
        .from("user_themes") as any)
        .insert({
          user_id: userId,
          name: presetName,
          primary_color_id: primaryColorId,
          secondary_color_id: secondaryColorId,
          accent_color_id: accentColorId,
          font_family: defaultFontJson,
        })
        .select("id, name, primary_color_id, secondary_color_id, accent_color_id")
        .single();

      if (themeError) throw themeError;

      // Update user_settings to set this as active theme
      await (supabase
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

      // Reload themes with colors
      await reloadThemes();

      setSelectedPresetId(newTheme.id);
      setIsEditingPreset(true);
      setIsSaveDialogOpen(false);
      setNewPresetName("");

      toast({
        title: "Preset created",
        description: `"${presetName}" has been created and activated successfully.`,
      });
    } catch (error) {
      console.error("Error creating preset:", error);
      toast({
        title: "Failed to create preset",
        description: "An error occurred while creating the preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updatePreset = async (presetId: string) => {
    if (!userId || !primaryColor || !accentColor) return;

    try {
      const supabase = createClient();

      // Find or create primary color
      let primaryColorId: string;
      const { data: existingPrimary } = await (supabase
        .from("user_colors") as any)
        .select("id")
        .eq("user_id", userId)
        .eq("hex", primaryColor.hex)
        .maybeSingle();

      if (existingPrimary) {
        primaryColorId = existingPrimary.id;
      } else {
        const { data: newPrimary, error: primaryError } = await (supabase
          .from("user_colors") as any)
          .insert({
            user_id: userId,
            name: `Primary`,
            hex: primaryColor.hex,
            hsl_h: primaryColor.hsl.h,
            hsl_s: primaryColor.hsl.s,
            hsl_l: primaryColor.hsl.l,
          })
          .select("id")
          .single();

        if (primaryError) throw primaryError;
        primaryColorId = newPrimary.id;
      }

      // Create default gray secondary color for backward compatibility
      const grayHex = "#9ca3af"; // Neutral gray (similar to gray-400 in Tailwind)
      const grayHsl = hexToHsl(grayHex);
      const { data: newSecondary, error: secondaryError } = await (supabase
        .from("user_colors") as any)
        .insert({
          user_id: userId,
          name: `Secondary`,
          hex: grayHex,
          hsl_h: grayHsl.h,
          hsl_s: grayHsl.s,
          hsl_l: grayHsl.l,
        })
        .select("id")
        .single();

      if (secondaryError) throw secondaryError;
      const secondaryColorId = newSecondary.id;

      // Find or create accent color
      let accentColorId: string;
      const { data: existingAccent } = await (supabase
        .from("user_colors") as any)
        .select("id")
        .eq("user_id", userId)
        .eq("hex", accentColor.hex)
        .maybeSingle();

      if (existingAccent) {
        accentColorId = existingAccent.id;
      } else {
        const { data: newAccent, error: accentError } = await (supabase
          .from("user_colors") as any)
          .insert({
            user_id: userId,
            name: `Accent`,
            hex: accentColor.hex,
            hsl_h: accentColor.hsl.h,
            hsl_s: accentColor.hsl.s,
            hsl_l: accentColor.hsl.l,
          })
          .select("id")
          .single();

        if (accentError) throw accentError;
        accentColorId = newAccent.id;
      }

      // Update theme
      const { error: updateError } = await (supabase
        .from("user_themes") as any)
        .update({
          primary_color_id: primaryColorId,
          secondary_color_id: secondaryColorId,
          accent_color_id: accentColorId,
        })
        .eq("id", presetId);

      if (updateError) throw updateError;

      // Reload themes with colors
      await reloadThemes();

      toast({
        title: "Preset updated",
        description: "The preset has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating preset:", error);
      toast({
        title: "Failed to update preset",
        description: "An error occurred while updating the preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPresetToDelete(presetId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePreset = async () => {
    if (!presetToDelete || !userId) return;

    try {
      const supabase = createClient();
      
      const { error } = await (supabase
        .from("user_themes") as any)
        .delete()
        .eq("id", presetToDelete)
        .eq("user_id", userId);

      if (error) throw error;

      // Reload themes with colors
      await reloadThemes();

      if (selectedPresetId === presetToDelete) {
        setSelectedPresetId(null);
        setIsEditingPreset(false);
      }

      setIsDeleteDialogOpen(false);
      setPresetToDelete(null);

      toast({
        title: "Preset deleted",
        description: "The preset has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting preset:", error);
      toast({
        title: "Failed to delete preset",
        description: "An error occurred while deleting the preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRenamePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = userThemes.find((t) => t.id === presetId);
    if (preset) {
      setPresetToRename(presetId);
      setRenamePresetName(preset.name);
      setIsRenameDialogOpen(true);
    }
  };

  const handleSaveRename = async () => {
    if (!presetToRename || !userId || !renamePresetName.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid preset name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = createClient();
      
      const { error } = await (supabase
        .from("user_themes") as any)
        .update({ name: renamePresetName.trim() })
        .eq("id", presetToRename)
        .eq("user_id", userId);

      if (error) throw error;

      // Reload themes with colors
      await reloadThemes();

      // Update local state
      setUserThemes((prev) =>
        prev.map((preset) =>
          preset.id === presetToRename
            ? { ...preset, name: renamePresetName.trim() }
            : preset
        )
      );

      setIsRenameDialogOpen(false);
      setRenamePresetName("");
      setPresetToRename(null);

      toast({
        title: "Preset renamed",
        description: "The preset has been renamed successfully.",
      });
    } catch (error) {
      console.error("Error renaming preset:", error);
      toast({
        title: "Failed to rename preset",
        description: "An error occurred while renaming the preset. Please try again.",
        variant: "destructive",
      });
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
        <CardContent className="space-y-6 relative pt-6">

          {/* Brand Color Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div className="font-medium text-lg">Theme Settings</div>
              </div>
              <div className="text-sm text-muted-foreground">Choose your vibe ✨</div>
            </div>

            {/* Current Colors Display */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Color Card */}
              <div
                onClick={() => setActiveColorType('primary')}
                className={cn(
                  "p-5 rounded-xl border-2 bg-muted/10 relative overflow-hidden group transition-all duration-300 cursor-pointer",
                  activeColorType === 'primary'
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <div className="relative flex items-center gap-4">
                  <div className="relative group/color flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-xl border-[3px] border-white/90 shadow-2xl transition-all duration-300 group-hover/color:scale-110 group-hover/color:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                      style={{ backgroundColor: primaryColor?.hex || '#cccccc' }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl blur-xl opacity-60 transition-opacity duration-300 group-hover/color:opacity-80"
                      style={{ backgroundColor: primaryColor?.hex || '#cccccc' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-1">
                      Primary Color
                    </div>
                    {primaryColor && (
                      <div className="text-xs text-muted-foreground font-mono font-medium truncate">
                        {primaryColor.hex}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accent Color Card */}
              <div
                onClick={() => setActiveColorType('accent')}
                className={cn(
                  "p-5 rounded-xl border-2 bg-muted/10 relative overflow-hidden group transition-all duration-300 cursor-pointer",
                  activeColorType === 'accent'
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <div className="relative flex items-center gap-4">
                  <div className="relative group/color flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-xl border-[3px] border-white/90 shadow-2xl transition-all duration-300 group-hover/color:scale-110 group-hover/color:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                      style={{ backgroundColor: accentColor?.hex || '#cccccc' }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl blur-xl opacity-60 transition-opacity duration-300 group-hover/color:opacity-80"
                      style={{ backgroundColor: accentColor?.hex || '#cccccc' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-1">
                      Accent Color
                    </div>
                    {accentColor && (
                      <div className="text-xs text-muted-foreground font-mono font-medium truncate">
                        {accentColor.hex}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inline Color Picker */}
            {(activeColorType === 'primary' || activeColorType === 'accent') && (
              <div className="mb-6 p-5 rounded-xl border-2 border-border/50 bg-muted/10">
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2">
                    Pick {activeColorType === 'primary' ? 'Primary' : 'Accent'} Color
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">
                    Use the color picker below to select your {activeColorType} color
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <HexColorPicker
                      color={activeColorType === 'primary' ? (primaryColor?.hex || '#3382c7') : (accentColor?.hex || '#3382c7')}
                      onChange={(hex) => handleColorChange(hex, activeColorType)}
                      style={{ width: '100%', height: '200px' }}
                    />
                  </div>
                  <div className="sm:w-48 space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Hex Value</Label>
                      <Input
                        type="text"
                        value={activeColorType === 'primary' ? (primaryColor?.hex || '') : (accentColor?.hex || '')}
                        onChange={(e) => {
                          const hex = e.target.value;
                          // Allow typing intermediate values - validate format
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(hex) || hex === '') {
                            // Get current color to preserve id and other properties
                            const currentColor = activeColorType === 'primary' ? primaryColor : accentColor;
                            
                            // Create a temporary color object with the new hex
                            // Only calculate HSL if we have a complete hex (7 chars)
                            let hsl = currentColor?.hsl || { h: 0, s: 0, l: 0 };
                            if (hex.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
                              hsl = hexToHsl(hex);
                            }
                            
                            const color: Color = {
                              id: currentColor?.id || '',
                              name: currentColor?.name || '',
                              hex: hex || '#000000',
                              hsl: hsl,
                            };
                            
                            // Update state immediately so input reflects typing
                            if (activeColorType === 'primary') {
                              setPrimaryColor(color);
                            } else if (activeColorType === 'accent') {
                              setAccentColor(color);
                            }
                            
                            // Only apply to CSS when hex is complete and valid
                            if (hex.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
                              handleColorChange(hex, activeColorType);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const hex = e.target.value;
                          // Validate and apply on blur if valid
                          if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
                            handleColorChange(hex, activeColorType);
                          } else {
                            // Reset to current color if invalid
                            const currentHex = activeColorType === 'primary' ? (primaryColor?.hex || '#3382c7') : (accentColor?.hex || '#3382c7');
                            if (activeColorType === 'primary' && primaryColor) {
                              setPrimaryColor(primaryColor);
                            } else if (activeColorType === 'accent' && accentColor) {
                              setAccentColor(accentColor);
                            }
                          }
                        }}
                        placeholder="#3382c7"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-white shadow-lg"
                        style={{ 
                          backgroundColor: activeColorType === 'primary' 
                            ? (primaryColor?.hex || '#cccccc') 
                            : (accentColor?.hex || '#cccccc')
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-xs font-medium">
                          {activeColorType === 'primary' ? 'Primary' : 'Accent'} Color
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {activeColorType === 'primary' 
                            ? (primaryColor?.hex || 'Not set') 
                            : (accentColor?.hex || 'Not set')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  if (isEditingPreset && selectedPresetId) {
                    handleSavePreset();
                  } else {
                    setIsSaveDialogOpen(true);
                  }
                }}
                disabled={!primaryColor || !accentColor}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isEditingPreset && selectedPresetId ? "Update Preset" : "Save Preset"}
              </Button>
            </div>
          </div>

          {/* Presets List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">Presets</div>
              <div className="flex gap-2">
                <Button
                  onClick={handleGeneratePreset}
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-secondary hover:text-foreground"
                  disabled={isGeneratingPreset}
                >
                  <Sparkles className={cn("h-4 w-4", isGeneratingPreset && "animate-spin")} />
                </Button>
                <Button
                  onClick={handleCreateNewPreset}
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-secondary hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {userThemes.length > 0 ? (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-3">
                {userThemes.map((theme) => {
                  const isSelected = selectedPresetId === theme.id;
                  const primaryHex = theme.primary_color?.hex || '#cccccc';
                  const accentHex = theme.accent_color?.hex || '#cccccc';
                  
                  return (
                    <div key={theme.id} className="relative group">
                      <button
                        onClick={() => handlePresetClick(theme)}
                        className={cn(
                          "relative w-full aspect-square rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl",
                          "border-2 border-white/50 shadow-md",
                          isSelected &&
                            "ring-3 ring-primary ring-offset-1 ring-offset-background scale-105 shadow-xl"
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${primaryHex} 0%, ${primaryHex} 25%, ${accentHex} 75%, ${accentHex} 100%)`,
                          boxShadow: isSelected
                            ? `0 0 15px ${primaryHex}40, 0 8px 20px rgba(0,0,0,0.15)`
                            : undefined,
                        }}
                        aria-label={`Select ${theme.name}`}
                      >
                        {/* Glow effect on hover */}
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-lg"
                          style={{ background: `linear-gradient(135deg, ${primaryHex} 0%, ${primaryHex} 25%, ${accentHex} 75%, ${accentHex} 100%)` }}
                        />

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                              <div className="h-2.5 w-2.5 rounded-full bg-white shadow-md animate-pulse" />
                              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-white/50 animate-ping" />
                            </div>
                          </div>
                        )}
                      </button>

                      {/* Edit and Delete buttons */}
                      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                        <button
                          onClick={(e) => handleRenamePreset(theme.id, e)}
                          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md"
                          title="Rename preset"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePreset(theme.id, e)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md"
                          title="Delete preset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Preset name display */}
                      <div className="mt-2 text-center">
                        <div className="text-xs font-medium text-foreground truncate leading-tight">
                          {theme.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20">
                <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium mb-1">No presets yet</p>
                <p className="text-xs">Click &quot;Create New Preset&quot; to create your first preset!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
            <DialogDescription>
              Enter a name for your preset. This will save your current primary and secondary colors.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="e.g., Ocean Blue, Sunset Orange..."
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newPresetName.trim()) {
                  handleSavePreset();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePreset}
              disabled={!newPresetName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this preset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setPresetToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePreset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Preset</DialogTitle>
            <DialogDescription>
              Enter a new name for this preset.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-preset-name">Preset Name</Label>
            <Input
              id="rename-preset-name"
              value={renamePresetName}
              onChange={(e) => setRenamePresetName(e.target.value)}
              placeholder="e.g., Ocean Blue, Sunset Orange..."
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && renamePresetName.trim()) {
                  handleSaveRename();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsRenameDialogOpen(false);
              setRenamePresetName("");
              setPresetToRename(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRename}
              disabled={!renamePresetName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

