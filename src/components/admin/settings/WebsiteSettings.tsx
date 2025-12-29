"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Monitor, Palette, Type, Globe, Copy, MoreHorizontal, Save, Pencil, Trash2, CheckCircle, Sparkles } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { hexToHsl, hslToCssString } from "@/lib/color-utils";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import type { FontConfig } from "@/types/fonts";
import { fontOptions, getFontVariable } from "@/lib/fonts";
import { parseFontFamily, serializeFontFamily, generateLandingFontCSS, getDefaultFontFamily } from "@/lib/font-utils";
import { useToast } from "@/hooks/use-toast";

// Simplified Color type - colors are now part of preset, not separate entities
type Color = {
  hex: string;
  h: number;
  s: number;
  l: number;
};

interface WebsiteSettingsProps {
  environment?: 'production' | 'development';
  selectedPresetId?: string | 'new' | null;
  onPresetApplied?: () => void;
  renameTrigger?: string | null; // When this changes to a preset ID, trigger rename
  onApplyRequest?: (presetId: string, showConfirm: (presetId: string) => void) => void; // Callback for apply action
  onPresetNameUpdated?: (presetId: string, newName: string) => void; // Callback when preset name is updated
  presetNameUpdateTrigger?: { presetId: string; newName: string } | null; // When this changes, update the preset name in WebsiteSettings
  isApplying?: boolean; // Whether a preset is currently being applied
  activePresetId?: string | null; // The currently active preset ID for this environment (from parent)
}

export function WebsiteSettings({ environment = 'production', selectedPresetId: externalSelectedPresetId, onPresetApplied, renameTrigger, onApplyRequest, onPresetNameUpdated, presetNameUpdateTrigger, isApplying = false, activePresetId: externalActivePresetId }: WebsiteSettingsProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState<Color | null>(null);
  const [activeColorType, setActiveColorType] = useState<'primary' | 'secondary'>('primary');
  const [websiteTheme, setWebsiteTheme] = useState<string>("dark");
  const [fontConfig, setFontConfig] = useState<FontConfig>({
    admin: { heading: "geist-sans", body: "geist-sans" },
    landing: { heading: "gotham", body: "gotham" },
  });
  const [presets, setPresets] = useState<Array<{ id: string; name: string; favorite?: boolean }>>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | 'new' | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renamePresetName, setRenamePresetName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const [activePresetIdForEnvironment, setActivePresetIdForEnvironment] = useState<string | null>(null);
  const [dotsEnabled, setDotsEnabled] = useState<boolean>(true);
  const [waveGradientEnabled, setWaveGradientEnabled] = useState<boolean>(false);
  const [noiseTextureEnabled, setNoiseTextureEnabled] = useState<boolean>(false);
  const [isGeneratingName, setIsGeneratingName] = useState<boolean>(false);
  const [isGeneratingNameInDialog, setIsGeneratingNameInDialog] = useState<boolean>(false);
  const [currentPresetFavorite, setCurrentPresetFavorite] = useState<boolean>(false);


  // Apply fonts to CSS variables for landing page
  const applyFontsToCSS = (fonts: FontConfig) => {
    if (typeof document === "undefined" || !document.head) return;
    const css = generateLandingFontCSS(fonts);
    
    if (!css) return;
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      try {
        // Remove existing font style tags safely
        const existingStyles = [
          document.getElementById("landing-font-family-inline"),
          document.getElementById("landing-font-family-script"),
          document.getElementById("landing-font-family-session"),
          document.getElementById("landing-font-family-inline-server"),
          document.getElementById("landing-font-family-client"),
        ].filter(Boolean) as HTMLElement[];
        
        existingStyles.forEach((style) => {
          try {
            if (style && style.parentNode && document.head.contains(style)) {
              style.remove();
            }
          } catch (e) {
            // Ignore errors if node is already removed
          }
        });
        
        // Apply fonts via CSS - the generateLandingFontCSS already scopes to .preset-landing-page
        // Do NOT set root-level CSS variables as that would affect admin panel
        if (fonts.landing && document.head) {
          // Check if style already exists to avoid duplicates
          const existingStyle = document.getElementById("landing-font-family-client");
          if (existingStyle) {
            existingStyle.textContent = css;
          } else {
            // Inject style tag with scoped CSS
            const style = document.createElement("style");
            style.id = "landing-font-family-client";
            style.textContent = css;
            if (document.head) {
              document.head.appendChild(style);
            }
          }
          
          // Save to sessionStorage and cookie
          try {
            const fontJson = serializeFontFamily(fonts);
            sessionStorage.setItem("website-font-family-json", fontJson);
            
            // Save to cookie
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);
            document.cookie = `website-font-family-json=${encodeURIComponent(fontJson)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
          } catch (e) {
            // Storage not available
          }
        }
      } catch (e) {
        // Ignore DOM manipulation errors
        console.warn("Failed to apply font styles:", e);
      }
    });
  };

  // Apply primary color to CSS variable for landing page
  const applyPrimaryColorToCSS = (color: Color | null) => {
    if (!color || typeof document === "undefined" || !document.head) return;
    const cssValue = hslToCssString(color.h, color.s, color.l);
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      try {
        // Remove existing injected style tags that might have !important
        const existingStyles = [
          document.getElementById("website-primary-color-inline"),
          document.getElementById("website-primary-color-script"),
          document.getElementById("website-primary-color-session"),
          document.getElementById("website-primary-color-client"),
          document.getElementById("website-primary-color-inline-server"),
        ].filter(Boolean) as HTMLElement[];
        
        existingStyles.forEach((style) => {
          try {
            if (style && style.parentNode && document.head.contains(style)) {
              style.remove();
            }
          } catch (e) {
            // Ignore errors if node is already removed
          }
        });
        
        // Apply brand color variables ONLY to landing page preset - NOT to :root
        // This prevents affecting the admin panel
        if (document.head) {
          // Check if style already exists to avoid duplicates
          const existingStyle = document.getElementById("website-primary-color-client");
          if (existingStyle) {
            existingStyle.textContent = `.preset-landing-page,.preset-landing-page *,.preset-landing-page.dark,.preset-landing-page.dark *{--brand-h:${color.h}!important;--brand-s:${color.s}!important;--brand-l:${color.l}!important;--primary:${cssValue}!important;}`;
          } else {
            const style = document.createElement("style");
            style.id = "website-primary-color-client";
            style.textContent = `.preset-landing-page,.preset-landing-page *,.preset-landing-page.dark,.preset-landing-page.dark *{--brand-h:${color.h}!important;--brand-s:${color.s}!important;--brand-l:${color.l}!important;--primary:${cssValue}!important;}`;
            document.head.appendChild(style);
          }
          
          // Save to sessionStorage for instant access
          try {
            sessionStorage.setItem("website-primary-color-hsl", cssValue);
          } catch (e) {
            // sessionStorage not available
          }
          
          // Save to cookie for instant access on next page load (server-side)
          try {
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);
            document.cookie = `website-primary-color-hsl=${encodeURIComponent(cssValue)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            document.cookie = `website-brand-color-h=${encodeURIComponent(color.h.toString())}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            document.cookie = `website-brand-color-s=${encodeURIComponent(color.s.toString())}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            document.cookie = `website-brand-color-l=${encodeURIComponent(color.l.toString())}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
          } catch (e) {
            // Cookie setting failed
          }
        }
      } catch (e) {
        // Ignore DOM manipulation errors
        console.warn("Failed to apply primary color styles:", e);
      }
    });
  };

  // Apply secondary color to CSS variable for landing page
  const applySecondaryColorToCSS = (color: Color | null) => {
    if (!color || typeof document === "undefined" || !document.head) return;
    const cssValue = hslToCssString(color.h, color.s, color.l);
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      try {
        // Remove existing injected style tags that might have !important
        const existingStyles = [
          document.getElementById("website-secondary-color-inline"),
          document.getElementById("website-secondary-color-script"),
          document.getElementById("website-secondary-color-session"),
          document.getElementById("website-secondary-color-client"),
          document.getElementById("website-secondary-color-inline-server"),
        ].filter(Boolean) as HTMLElement[];
        
        existingStyles.forEach((style) => {
          try {
            if (style && style.parentNode && document.head.contains(style)) {
              style.remove();
            }
          } catch (e) {
            // Ignore errors if node is already removed
          }
        });
        
        // Apply secondary color variable ONLY to landing page preset - NOT to :root
        // This prevents affecting the admin panel
        if (document.head) {
          // Check if style already exists to avoid duplicates
          const existingStyle = document.getElementById("website-secondary-color-client");
          if (existingStyle) {
            existingStyle.textContent = `.preset-landing-page,.preset-landing-page *,.preset-landing-page.dark,.preset-landing-page.dark *{--secondary:${cssValue}!important;}`;
          } else {
            const style = document.createElement("style");
            style.id = "website-secondary-color-client";
            style.textContent = `.preset-landing-page,.preset-landing-page *,.preset-landing-page.dark,.preset-landing-page.dark *{--secondary:${cssValue}!important;}`;
            document.head.appendChild(style);
          }
          
          // Save to sessionStorage for instant access
          try {
            sessionStorage.setItem("website-secondary-color-hsl", cssValue);
          } catch (e) {
            // sessionStorage not available
          }
          
          // Save to cookie for instant access on next page load (server-side)
          try {
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);
            document.cookie = `website-secondary-color-hsl=${encodeURIComponent(cssValue)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
          } catch (e) {
            // Cookie setting failed
          }
        }
      } catch (e) {
        // Ignore DOM manipulation errors
        console.warn("Failed to apply secondary color styles:", e);
      }
    });
  };

  // Load colors and settings from database
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

        setLoading(true);

        // Load all presets, sorted by name
        const { data: presetsData } = await (supabase
          .from("website_settings_presets") as any)
          .select("id, name")
          .order("name", { ascending: true });

        if (presetsData) {
          // Sort client-side as well to ensure proper alphabetical order
          const sortedPresets = [...presetsData].sort((a, b) => 
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          );
          setPresets(sortedPresets);
        }

        // If externalSelectedPresetId is provided, use it; otherwise load from environment
        let presetIdToLoad: string | 'new' | null = null;
        
        if (externalSelectedPresetId !== undefined) {
          // Use external preset ID (from Preset Manager)
          presetIdToLoad = externalSelectedPresetId;
          setSelectedPresetId(externalSelectedPresetId);
        } else {
          // Load website settings for selected environment (to get active preset)
          const { data: settings } = await (supabase
            .from("website_settings") as any)
            .select("preset_id")
            .eq("environment", environment)
            .maybeSingle();

          if (settings?.preset_id) {
            presetIdToLoad = settings.preset_id;
            setSelectedPresetId(settings.preset_id);
            setActivePresetIdForEnvironment(settings.preset_id);
          } else {
            // No active preset, start with "new"
            presetIdToLoad = 'new';
            setSelectedPresetId('new');
            setActivePresetIdForEnvironment(null);
          }
        }

        // Load preset data if exists
        if (presetIdToLoad && presetIdToLoad !== 'new') {
          const { data: preset } = await (supabase
            .from("website_settings_presets") as any)
            .select("theme, primary_color_hex, primary_color_h, primary_color_s, primary_color_l, secondary_color_hex, secondary_color_h, secondary_color_s, secondary_color_l, font_family, styling_options, favorite")
            .eq("id", presetIdToLoad)
            .single();

          if (preset) {
            // Set theme
            setWebsiteTheme(preset.theme || "dark");

            // Load primary color directly from preset
            if (preset.primary_color_hex && preset.primary_color_h !== null && preset.primary_color_s !== null && preset.primary_color_l !== null) {
              const primaryColor: Color = {
                hex: preset.primary_color_hex,
                h: preset.primary_color_h,
                s: preset.primary_color_s,
                l: preset.primary_color_l,
              };
              setSelectedColor(primaryColor);
              applyPrimaryColorToCSS(primaryColor);
            }

            // Load secondary color directly from preset
            if (preset.secondary_color_hex && preset.secondary_color_h !== null && preset.secondary_color_s !== null && preset.secondary_color_l !== null) {
              const secondaryColor: Color = {
                hex: preset.secondary_color_hex,
                h: preset.secondary_color_h,
                s: preset.secondary_color_s,
                l: preset.secondary_color_l,
              };
              setSelectedSecondaryColor(secondaryColor);
              applySecondaryColorToCSS(secondaryColor);
            }

            // Load fonts
            if (preset.font_family) {
              const fonts = parseFontFamily(preset.font_family);
              if (fonts.landing) {
                setFontConfig({
                  admin: getDefaultFontFamily().admin,
                  landing: fonts.landing,
                });
                applyFontsToCSS({
                  admin: getDefaultFontFamily().admin,
                  landing: fonts.landing,
                });
              }
            }

            // Load styling_options
            if (preset.styling_options) {
              try {
                const stylingOptions = typeof preset.styling_options === 'string' 
                  ? JSON.parse(preset.styling_options) 
                  : preset.styling_options;
                setDotsEnabled(stylingOptions?.dots_enabled !== false); // Default to true if not present
                setWaveGradientEnabled(stylingOptions?.wave_gradient_enabled === true); // Default to false if not present
                setNoiseTextureEnabled(stylingOptions?.noise_texture_enabled === true); // Default to false if not present
              } catch (e) {
                // If parsing fails, default to true for dots, false for others
                setDotsEnabled(true);
                setWaveGradientEnabled(false);
                setNoiseTextureEnabled(false);
              }
            } else {
              setDotsEnabled(true); // Default to true if not present
              setWaveGradientEnabled(false); // Default to false if not present
              setNoiseTextureEnabled(false); // Default to false if not present
            }

            // Load favorite status
            setCurrentPresetFavorite(preset.favorite === true);
          }
        } else {
          setCurrentPresetFavorite(false);
        }

        setIsDirty(false);
      } catch (error) {
        console.error("Error loading website data:", error);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    loadData();
  }, [environment, externalSelectedPresetId]);

  // Set up Supabase real-time subscription for presets
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('website_settings_presets_changes', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'website_settings_presets',
        },
        async (payload) => {
          console.log('Preset change detected:', payload);
          
          // Use payload data directly if available, otherwise reload
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedPreset = payload.new as { id: string; name: string; favorite?: boolean };
            setPresets(prevPresets => {
              const updated = prevPresets.map(preset => 
                preset.id === updatedPreset.id 
                  ? { ...preset, name: updatedPreset.name, favorite: updatedPreset.favorite ?? preset.favorite }
                  : preset
              );
              // Sort by name
              return updated.sort((a, b) => 
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
              );
            });
            
            // Update current preset favorite status if it's the selected preset
            if (selectedPresetId === updatedPreset.id) {
              setCurrentPresetFavorite(updatedPreset.favorite === true);
            }
            
            console.log('Preset updated from subscription:', updatedPreset);
          } else {
            // For INSERT or DELETE, reload all presets
            try {
              const { data: presetsData, error } = await (supabase
                .from("website_settings_presets") as any)
                .select("id, name, favorite")
                .order("name", { ascending: true });

              if (error) {
                console.error("Error reloading presets:", error);
                return;
              }

              if (presetsData) {
                const sortedPresets = [...presetsData].sort((a, b) => 
                  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
                );
                setPresets(sortedPresets);
                console.log('Presets updated:', sortedPresets);
              }
            } catch (error) {
              console.error("Error reloading presets:", error);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to preset changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error - check Supabase real-time settings');
        } else if (status === 'TIMED_OUT') {
          console.error('Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('Subscription closed');
        }
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  // Cleanup effect: Remove style tags when component unmounts or environment changes
  useEffect(() => {
    return () => {
      if (typeof document === "undefined" || !document.head) return;
      
      // Use requestAnimationFrame to ensure cleanup happens at the right time
      requestAnimationFrame(() => {
        // Clean up font style tags
        const fontStyleIds = [
          "landing-font-family-inline",
          "landing-font-family-script",
          "landing-font-family-session",
          "landing-font-family-inline-server",
          "landing-font-family-client",
        ];
        
        fontStyleIds.forEach((id) => {
          try {
            const style = document.getElementById(id);
            if (style && style.parentNode && document.head.contains(style)) {
              style.remove();
            }
          } catch (e) {
            // Ignore errors
          }
        });
        
        // Clean up color style tags
        const colorStyleIds = [
          "website-primary-color-inline",
          "website-primary-color-script",
          "website-primary-color-session",
          "website-primary-color-client",
          "website-primary-color-inline-server",
          "website-secondary-color-inline",
          "website-secondary-color-script",
          "website-secondary-color-session",
          "website-secondary-color-client",
          "website-secondary-color-inline-server",
        ];
        
        colorStyleIds.forEach((id) => {
          try {
            const style = document.getElementById(id);
            if (style && style.parentNode && document.head.contains(style)) {
              style.remove();
            }
          } catch (e) {
            // Ignore errors
          }
        });
      });
    };
  }, [environment]);

  const handleThemeChange = (newTheme: string) => {
    setWebsiteTheme(newTheme);
    setIsDirty(true);
  };

  const handleColorChange = (hex: string, type?: 'primary' | 'secondary') => {
    const colorType = type || activeColorType;
    const hsl = hexToHsl(hex);
    const color: Color = {
      hex,
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
    };
    
    if (colorType === 'primary') {
      setSelectedColor(color);
      applyPrimaryColorToCSS(color);
    } else {
      setSelectedSecondaryColor(color);
      applySecondaryColorToCSS(color);
    }
    setIsDirty(true);
  };

  const handleFontChange = (type: "heading" | "body", fontId: string) => {
    const newFontConfig: FontConfig = {
      ...fontConfig,
      landing: {
        ...(fontConfig.landing || { heading: "gotham", body: "gotham" }),
        [type]: fontId as any,
      },
    };
    
    setFontConfig(newFontConfig);
    applyFontsToCSS(newFontConfig);
    setIsDirty(true);
  };

  const handleDotsEnabledChange = (enabled: boolean) => {
    setDotsEnabled(enabled);
    setIsDirty(true);
  };

  const handleWaveGradientEnabledChange = (enabled: boolean) => {
    setWaveGradientEnabled(enabled);
    setIsDirty(true);
  };

  const handleNoiseTextureEnabledChange = (enabled: boolean) => {
    setNoiseTextureEnabled(enabled);
    setIsDirty(true);
  };


  // Effect to load preset when externalSelectedPresetId changes
  useEffect(() => {
    if (externalSelectedPresetId !== undefined && externalSelectedPresetId !== selectedPresetId && externalSelectedPresetId !== null) {
      handlePresetChange(externalSelectedPresetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSelectedPresetId]);

  // Sync activePresetIdForEnvironment with external activePresetId prop
  useEffect(() => {
    if (externalActivePresetId !== undefined) {
      setActivePresetIdForEnvironment(externalActivePresetId);
    }
  }, [externalActivePresetId]);

  // Trigger rename when renameTrigger changes
  useEffect(() => {
    if (renameTrigger && renameTrigger === selectedPresetId && selectedPresetId !== 'new') {
      handleRenamePreset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renameTrigger]);

  // Update preset name when presetNameUpdateTrigger changes (from parent/card)
  useEffect(() => {
    if (presetNameUpdateTrigger) {
      setPresets(prevPresets => {
        const updated = prevPresets.map(preset => 
          preset.id === presetNameUpdateTrigger.presetId 
            ? { ...preset, name: presetNameUpdateTrigger.newName }
            : preset
        );
        // Sort by name
        return updated.sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
      });
    }
  }, [presetNameUpdateTrigger]);

  const handlePresetChange = async (presetId: string | 'new') => {
    if (presetId === 'new') {
      // Clear form for new preset
      setSelectedPresetId('new');
      setWebsiteTheme('dark');
      setSelectedColor(null);
      setSelectedSecondaryColor(null);
      setFontConfig({
        admin: getDefaultFontFamily().admin,
        landing: getDefaultFontFamily().landing,
      });
      setDotsEnabled(true);
      setWaveGradientEnabled(false);
      setNoiseTextureEnabled(false);
      setIsDirty(false);
      return;
    }

    // Load preset data
    try {
      const supabase = createClient();
      const { data: preset } = await (supabase
        .from("website_settings_presets") as any)
        .select("theme, primary_color_hex, primary_color_h, primary_color_s, primary_color_l, secondary_color_hex, secondary_color_h, secondary_color_s, secondary_color_l, font_family, styling_options")
        .eq("id", presetId)
        .single();

      if (preset) {
        setSelectedPresetId(presetId);
        setWebsiteTheme(preset.theme || "dark");

        // Load primary color directly from preset
        if (preset.primary_color_hex && preset.primary_color_h !== null && preset.primary_color_s !== null && preset.primary_color_l !== null) {
          const primaryColor: Color = {
            hex: preset.primary_color_hex,
            h: preset.primary_color_h,
            s: preset.primary_color_s,
            l: preset.primary_color_l,
          };
          setSelectedColor(primaryColor);
          applyPrimaryColorToCSS(primaryColor);
        } else {
          setSelectedColor(null);
        }

        // Load secondary color directly from preset
        if (preset.secondary_color_hex && preset.secondary_color_h !== null && preset.secondary_color_s !== null && preset.secondary_color_l !== null) {
          const secondaryColor: Color = {
            hex: preset.secondary_color_hex,
            h: preset.secondary_color_h,
            s: preset.secondary_color_s,
            l: preset.secondary_color_l,
          };
          setSelectedSecondaryColor(secondaryColor);
          applySecondaryColorToCSS(secondaryColor);
        } else {
          setSelectedSecondaryColor(null);
        }

        // Load fonts
        if (preset.font_family) {
          const fonts = parseFontFamily(preset.font_family);
          if (fonts.landing) {
            setFontConfig({
              admin: getDefaultFontFamily().admin,
              landing: fonts.landing,
            });
            applyFontsToCSS({
              admin: getDefaultFontFamily().admin,
              landing: fonts.landing,
            });
          }
        }

        // Load styling_options
        if (preset.styling_options) {
          try {
            const stylingOptions = typeof preset.styling_options === 'string' 
              ? JSON.parse(preset.styling_options) 
              : preset.styling_options;
            setDotsEnabled(stylingOptions?.dots_enabled !== false); // Default to true if not present
            setWaveGradientEnabled(stylingOptions?.wave_gradient_enabled === true); // Default to false if not present
            setNoiseTextureEnabled(stylingOptions?.noise_texture_enabled === true); // Default to false if not present
          } catch (e) {
            // If parsing fails, default to true for dots, false for others
            setDotsEnabled(true);
            setWaveGradientEnabled(false);
            setNoiseTextureEnabled(false);
          }
        } else {
          setDotsEnabled(true); // Default to true if not present
          setWaveGradientEnabled(false); // Default to false if not present
          setNoiseTextureEnabled(false); // Default to false if not present
        }

        // Set isDirty to true if switching to a different preset than the active one
        // This allows the user to save the preset change to the environment
        if (presetId !== activePresetIdForEnvironment) {
          setIsDirty(true);
        } else {
          setIsDirty(false);
        }
      }
    } catch (error) {
      console.error("Error loading preset:", error);
      toast({
        title: "Failed to load preset",
        description: "An error occurred while loading the preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (selectedPresetId === 'new') {
      // Generate preset name using AI
      setIsGeneratingName(true);
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        // Get body font from fontConfig
        const bodyFont = fontConfig.landing?.body || "gotham";

        // Call AI API to generate preset name
        const response = await fetch("/api/admin/ai/generate-preset-name", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            primary_color: selectedColor?.hex || "#cccccc",
            secondary_color: selectedSecondaryColor?.hex || null,
            body_font: bodyFont,
            theme: websiteTheme,
          }),
        });

        if (!response.ok) {
          // If AI generation fails, fall back to dialog (don't throw error)
          setIsSaveDialogOpen(true);
          return;
        }

        const data = await response.json();
        const generatedName = data.name;

        if (!generatedName || !generatedName.trim()) {
          // If generated name is empty, fall back to dialog
          setIsSaveDialogOpen(true);
          return;
        }

        // Use generated name to create preset directly
        await createPresetWithName(generatedName.trim());
      } catch (error) {
        console.error("Error generating preset name:", error);
        // Fallback to showing dialog
        setIsSaveDialogOpen(true);
      } finally {
        setIsGeneratingName(false);
      }
      return;
    }

    // Update existing preset
    if (selectedPresetId && selectedPresetId !== 'new' && typeof selectedPresetId === 'string') {
      await savePreset(selectedPresetId);
    }
  };

  const savePreset = async (presetId: string) => {
    try {
      const supabase = createClient();
      
      const fontConfigForWebsite: FontConfig = {
        admin: getDefaultFontFamily().admin,
        landing: fontConfig.landing || getDefaultFontFamily().landing,
      };
      const fontJson = serializeFontFamily(fontConfigForWebsite);

      // Prepare styling_options JSON
      const stylingOptions = {
        dots_enabled: dotsEnabled,
        wave_gradient_enabled: waveGradientEnabled,
        noise_texture_enabled: noiseTextureEnabled,
      };

      // Update preset
      const { error: updateError } = await (supabase
        .from("website_settings_presets") as any)
        .update({
          theme: websiteTheme,
          primary_color_hex: selectedColor?.hex || null,
          primary_color_h: selectedColor?.h || null,
          primary_color_s: selectedColor?.s || null,
          primary_color_l: selectedColor?.l || null,
          secondary_color_hex: selectedSecondaryColor?.hex || null,
          secondary_color_h: selectedSecondaryColor?.h || null,
          secondary_color_s: selectedSecondaryColor?.s || null,
          secondary_color_l: selectedSecondaryColor?.l || null,
          font_family: fontJson,
          styling_options: stylingOptions,
        })
        .eq("id", presetId);

      if (updateError) throw updateError;

      // Update or create website_settings for environment
      const { data: existing } = await (supabase
        .from("website_settings") as any)
        .select("id")
        .eq("environment", environment)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase
          .from("website_settings") as any)
          .update({ preset_id: presetId })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from("website_settings") as any)
          .insert({
            environment,
            preset_id: presetId,
          });
        
        if (error) throw error;
      }

      setIsDirty(false);
      setActivePresetIdForEnvironment(presetId);
      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving preset:", error);
      toast({
        title: "Failed to save changes",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateName = async () => {
    if (!selectedPresetId || selectedPresetId === 'new') return;

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Get body font from fontConfig
      const bodyFont = fontConfig.landing?.body || "gotham";

      // Call AI API to generate preset name
      const response = await fetch("/api/admin/ai/generate-preset-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          primary_color: selectedColor?.hex || "#cccccc",
          secondary_color: selectedSecondaryColor?.hex || null,
          body_font: bodyFont,
          theme: websiteTheme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate preset name");
      }

      const data = await response.json();
      const generatedName = data.name;

      if (!generatedName || !generatedName.trim()) {
        throw new Error("Generated name is empty");
      }

      // Update preset name
      const { error: updateError } = await (supabase
        .from("website_settings_presets") as any)
        .update({ name: generatedName.trim() })
        .eq("id", selectedPresetId);

      if (updateError) throw updateError;

      // Update presets state immediately for instant UI update
      setPresets(prevPresets => {
        const updated = prevPresets.map(preset => 
          preset.id === selectedPresetId 
            ? { ...preset, name: generatedName.trim() }
            : preset
        );
        // Sort by name
        return updated.sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
      });

      toast({
        title: "Name generated",
        description: `Preset name updated to "${generatedName.trim()}".`,
      });

      // Notify parent component to update its state
      if (onPresetNameUpdated) {
        onPresetNameUpdated(selectedPresetId, generatedName.trim());
      }

      // Presets will also be updated via Supabase subscription as backup
    } catch (error) {
      console.error("Error generating preset name:", error);
      toast({
        title: "Failed to generate name",
        description: error instanceof Error ? error.message : "An error occurred while generating the preset name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRenamePreset = async () => {
    if (!selectedPresetId || selectedPresetId === 'new') return;
    
    const currentPreset = presets.find(p => p.id === selectedPresetId);
    if (!currentPreset) return;

    setRenamePresetName(currentPreset.name);
    setIsRenameDialogOpen(true);
  };

  const handleSaveRename = async () => {
    if (!selectedPresetId || selectedPresetId === 'new' || !renamePresetName.trim()) {
      return;
    }

    try {
      const supabase = createClient();
      
      const { error } = await (supabase
        .from("website_settings_presets") as any)
        .update({ name: renamePresetName.trim() })
        .eq("id", selectedPresetId);

      if (error) throw error;

      // Update presets state immediately for instant UI update
      setPresets(prevPresets => {
        const updated = prevPresets.map(preset => 
          preset.id === selectedPresetId 
            ? { ...preset, name: renamePresetName.trim() }
            : preset
        );
        // Sort by name
        return updated.sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
      });

      setIsRenameDialogOpen(false);
      setRenamePresetName("");

      // Notify parent component to update its state
      if (onPresetNameUpdated) {
        onPresetNameUpdated(selectedPresetId, renamePresetName.trim());
      }

      // Presets will also be updated via Supabase subscription as backup

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

  const handleDuplicatePreset = async () => {
    if (!selectedPresetId || selectedPresetId === 'new') return;

    try {
      const supabase = createClient();
      
      // Get current preset data
      const { data: currentPreset } = await (supabase
        .from("website_settings_presets") as any)
        .select("theme, primary_color_hex, primary_color_h, primary_color_s, primary_color_l, secondary_color_hex, secondary_color_h, secondary_color_s, secondary_color_l, font_family, styling_options")
        .eq("id", selectedPresetId)
        .single();

      if (!currentPreset) {
        toast({
          title: "Preset not found",
          description: "The preset could not be found.",
          variant: "destructive",
        });
        return;
      }

      // Find all presets with the same base name (name, name 2, name 3, etc.)
      const baseName = currentPreset.name;
      const { data: allPresets } = await (supabase
        .from("website_settings_presets") as any)
        .select("name")
        .order("name", { ascending: true });

      // Find the highest number suffix
      let maxNumber = 1;
      const namePattern = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: (\\d+))?$`);
      
      if (allPresets) {
        allPresets.forEach((preset: { name: string }) => {
          const match = preset.name.match(namePattern);
          if (match) {
            const num = match[1] ? parseInt(match[1], 10) : 1;
            if (num >= maxNumber) {
              maxNumber = num + 1;
            }
          }
        });
      }

      // Create duplicate with numbered suffix
      const duplicateName = maxNumber === 1 ? `${baseName} 2` : `${baseName} ${maxNumber}`;
      
      const { data: newPreset, error: createError } = await (supabase
        .from("website_settings_presets") as any)
        .insert({
          name: duplicateName,
          theme: currentPreset.theme,
          primary_color_hex: currentPreset.primary_color_hex,
          primary_color_h: currentPreset.primary_color_h,
          primary_color_s: currentPreset.primary_color_s,
          primary_color_l: currentPreset.primary_color_l,
          secondary_color_hex: currentPreset.secondary_color_hex,
          secondary_color_h: currentPreset.secondary_color_h,
          secondary_color_s: currentPreset.secondary_color_s,
          secondary_color_l: currentPreset.secondary_color_l,
          font_family: currentPreset.font_family,
          styling_options: currentPreset.styling_options || { dots_enabled: true, wave_gradient_enabled: false, noise_texture_enabled: false },
        })
        .select()
        .single();

      if (createError) throw createError;

      // Reload presets, sorted by name
      const { data: presetsData } = await (supabase
        .from("website_settings_presets") as any)
        .select("id, name")
        .order("name", { ascending: true });

      if (presetsData) {
        // Sort client-side as well to ensure proper alphabetical order
        const sortedPresets = [...presetsData].sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setPresets(sortedPresets);
      }

      // Switch to the new duplicate
      setSelectedPresetId(newPreset.id);
      setIsDirty(false);

      toast({
        title: "Preset duplicated",
        description: `"${duplicateName}" has been created.`,
      });
    } catch (error) {
      console.error("Error duplicating preset:", error);
      toast({
        title: "Failed to duplicate preset",
        description: "An error occurred while duplicating the preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePreset = async () => {
    if (!presetToDelete) return;

    try {
      const supabase = createClient();
      
      // Check if preset is being used by any environment
      const { data: settingsUsingPreset } = await (supabase
        .from("website_settings") as any)
        .select("environment")
        .eq("preset_id", presetToDelete);

      // Allow deletion in development even if active, but block in production
      if (settingsUsingPreset && settingsUsingPreset.length > 0) {
        const isUsedInProduction = settingsUsingPreset.some((s: any) => s.environment === 'production');
        
        // Only block deletion if used in production (always allow in development)
        if (isUsedInProduction && environment !== 'development') {
          const environments = settingsUsingPreset.map((s: any) => s.environment).join(", ");
          toast({
            title: "Cannot delete preset",
            description: `This preset is currently being used by ${environments} environment(s). Please select a different preset first.`,
            variant: "destructive",
          });
          setIsDeleteDialogOpen(false);
          setPresetToDelete(null);
          return;
        }

        // If in development and preset is active, remove it from website_settings first
        if (environment === 'development') {
          await (supabase
            .from("website_settings") as any)
            .delete()
            .eq("preset_id", presetToDelete)
            .eq("environment", 'development');
        }
      }

      // Delete the preset
      const { error } = await (supabase
        .from("website_settings_presets") as any)
        .delete()
        .eq("id", presetToDelete);

      if (error) throw error;

      // Reload presets, sorted by name
      const { data: presetsData } = await (supabase
        .from("website_settings_presets") as any)
        .select("id, name")
        .order("name", { ascending: true });

      if (presetsData) {
        // Sort client-side as well to ensure proper alphabetical order
        const sortedPresets = [...presetsData].sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setPresets(sortedPresets);

        // If the deleted preset was selected, switch to the first preset in the list
        if (selectedPresetId === presetToDelete) {
          if (sortedPresets.length > 0) {
            setSelectedPresetId(sortedPresets[0].id);
            // Load the first preset
            handlePresetChange(sortedPresets[0].id);
          } else {
            setSelectedPresetId('new');
          }
          setIsDirty(false);
        }
      } else {
        // No presets left, switch to "new"
        if (selectedPresetId === presetToDelete) {
          setSelectedPresetId('new');
          setIsDirty(false);
        }
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

  const createPresetWithName = async (presetName: string) => {
    if (!presetName.trim()) {
      toast({
        title: "Preset name required",
        description: "Please enter a name for the preset.",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = createClient();
      
      const fontConfigForWebsite: FontConfig = {
        admin: getDefaultFontFamily().admin,
        landing: fontConfig.landing || getDefaultFontFamily().landing,
      };
      const fontJson = serializeFontFamily(fontConfigForWebsite);

      // Prepare styling_options JSON
      const stylingOptions = {
        dots_enabled: dotsEnabled,
        wave_gradient_enabled: waveGradientEnabled,
        noise_texture_enabled: noiseTextureEnabled,
      };

      // Create new preset
      const { data: newPreset, error: createError } = await (supabase
        .from("website_settings_presets") as any)
        .insert({
          name: presetName.trim(),
          theme: websiteTheme,
          primary_color_hex: selectedColor?.hex || null,
          primary_color_h: selectedColor?.h || null,
          primary_color_s: selectedColor?.s || null,
          primary_color_l: selectedColor?.l || null,
          secondary_color_hex: selectedSecondaryColor?.hex || null,
          secondary_color_h: selectedSecondaryColor?.h || null,
          secondary_color_s: selectedSecondaryColor?.s || null,
          secondary_color_l: selectedSecondaryColor?.l || null,
          font_family: fontJson,
          styling_options: stylingOptions,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update or create website_settings for environment
      const { data: existing } = await (supabase
        .from("website_settings") as any)
        .select("id")
        .eq("environment", environment)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase
          .from("website_settings") as any)
          .update({ preset_id: newPreset.id })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from("website_settings") as any)
          .insert({
            environment,
            preset_id: newPreset.id,
          });
        
        if (error) throw error;
      }

      // Reload presets and update selected, sorted by name
      const { data: presetsData } = await (supabase
        .from("website_settings_presets") as any)
        .select("id, name")
        .order("name", { ascending: true });

      if (presetsData) {
        // Sort client-side as well to ensure proper alphabetical order
        const sortedPresets = [...presetsData].sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setPresets(sortedPresets);
      }

      setSelectedPresetId(newPreset.id);
      setActivePresetIdForEnvironment(newPreset.id);
      setIsDirty(false);
      setIsSaveDialogOpen(false);
      setNewPresetName("");
      
      if (onPresetApplied) {
        onPresetApplied();
      }

      toast({
        title: "Preset created",
        description: `"${presetName.trim()}" has been created and applied.`,
      });
    } catch (error) {
      console.error("Error creating preset:", error);
      toast({
        title: "Failed to create preset",
        description: "An error occurred while creating the preset. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to allow caller to handle fallback
    }
  };

  const handleGenerateNameForDialog = async () => {
    setIsGeneratingNameInDialog(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Get body font from fontConfig
      const bodyFont = fontConfig.landing?.body || "gotham";

      // Call AI API to generate preset name
      const response = await fetch("/api/admin/ai/generate-preset-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          primary_color: selectedColor?.hex || "#cccccc",
          secondary_color: selectedSecondaryColor?.hex || null,
          body_font: bodyFont,
          theme: websiteTheme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate preset name");
      }

      const data = await response.json();
      const generatedName = data.name;

      if (!generatedName || !generatedName.trim()) {
        throw new Error("Generated name is empty");
      }

      // Set the generated name in the input field
      setNewPresetName(generatedName.trim());
      
      toast({
        title: "Name generated",
        description: `Generated name: "${generatedName.trim()}"`,
      });
    } catch (error) {
      console.error("Error generating preset name:", error);
      toast({
        title: "Failed to generate name",
        description: error instanceof Error ? error.message : "An error occurred while generating the preset name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNameInDialog(false);
    }
  };

  const handleCreateNewPreset = async () => {
    await createPresetWithName(newPresetName);
  };

  const handleToggleFavorite = async () => {
    if (!selectedPresetId || selectedPresetId === 'new') return;

    try {
      const supabase = createClient();
      const newFavoriteStatus = !currentPresetFavorite;

      const { error } = await (supabase
        .from("website_settings_presets") as any)
        .update({ favorite: newFavoriteStatus })
        .eq("id", selectedPresetId);

      if (error) throw error;

      // Update local state immediately
      setCurrentPresetFavorite(newFavoriteStatus);
      
      // Update presets list
      setPresets(prevPresets => 
        prevPresets.map(preset => 
          preset.id === selectedPresetId 
            ? { ...preset, favorite: newFavoriteStatus }
            : preset
        )
      );

      toast({
        title: newFavoriteStatus ? "Added to favorites" : "Removed from favorites",
        description: `Preset "${currentPresetName}" has been ${newFavoriteStatus ? 'added to' : 'removed from'} favorites.`,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Failed to update favorite",
        description: "An error occurred while updating the favorite status. Please try again.",
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

  // Get preset name for title
  const currentPresetName = selectedPresetId === 'new' 
    ? 'New Preset' 
    : selectedPresetId 
      ? presets.find(p => p.id === selectedPresetId)?.name || 'Preset'
      : 'Preset';

  return (
    <div className="space-y-6">
      {/* Title with Preset Name */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          <span className="flex items-center gap-2">
            {currentPresetName}
            {selectedPresetId && selectedPresetId !== 'new' && (
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  "transition-colors shrink-0",
                  currentPresetFavorite
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground hover:text-primary"
                )}
                title={currentPresetFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <FontAwesomeIcon
                  icon={currentPresetFavorite ? faStarSolid : faStarRegular}
                  className="h-5 w-5"
                />
              </button>
            )}
          </span>
        </h2>
        {selectedPresetId && selectedPresetId !== 'new' && (
          <div className="flex items-center gap-2">
            {environment && (
              <Button
                onClick={() => {
                  if (onApplyRequest && selectedPresetId) {
                    onApplyRequest(selectedPresetId, (presetId: string) => {
                      // This will be handled by the parent
                    });
                  }
                }}
                disabled={isApplying}
                variant={selectedPresetId === activePresetIdForEnvironment ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "h-8 w-8",
                  selectedPresetId === activePresetIdForEnvironment && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                title={
                  isApplying 
                    ? "Applying..." 
                    : selectedPresetId === activePresetIdForEnvironment 
                      ? "Active preset - Click to deactivate" 
                      : "Click to activate preset"
                }
              >
                {isApplying ? (
                  <CheckCircle className="h-5 w-5 animate-pulse" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {isApplying 
                    ? "Applying..." 
                    : selectedPresetId === activePresetIdForEnvironment 
                      ? "Active preset - Click to deactivate" 
                      : "Click to activate preset"}
                </span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {selectedPresetId && selectedPresetId !== 'new' && (
                  <>
                    {environment && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onApplyRequest && selectedPresetId) {
                              onApplyRequest(selectedPresetId, (presetId: string) => {
                                // This will be handled by the parent
                              });
                            }
                          }}
                          className="cursor-pointer"
                          disabled={isApplying}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {selectedPresetId === activePresetIdForEnvironment ? "Deactivate" : "Apply"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={handleGenerateName}
                      className="cursor-pointer"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRenamePreset}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDuplicatePreset}
                      className="cursor-pointer"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setPresetToDelete(selectedPresetId);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content without Card */}
      <div className="space-y-6 relative">
          {/* Preset Selector - Only show if not using external preset selection */}
          {externalSelectedPresetId === undefined && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="font-medium">Preset</div>
                <div className="text-sm text-muted-foreground">Select or create a preset</div>
              </div>
              <Select
                value={selectedPresetId || undefined}
                onValueChange={handlePresetChange}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <span className="text-primary">New preset</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Theme Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">Choose your website theme</div>
            </div>
            <Select value={websiteTheme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  {websiteTheme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : websiteTheme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Monitor className="h-4 w-4" />
                  )}
                  <SelectValue>
                    {websiteTheme === "dark" ? "Dark" : websiteTheme === "light" ? "Light" : "System"}
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

          {/* Brand Color Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div className="font-medium text-lg">Brand Color</div>
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
                      style={{ backgroundColor: selectedColor?.hex || '#cccccc' }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl blur-xl opacity-60 transition-opacity duration-300 group-hover/color:opacity-80"
                      style={{ backgroundColor: selectedColor?.hex || '#cccccc' }}
                    />
                    {/* Sparkle effect */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover/color:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-white rounded-full blur-sm animate-pulse" />
                      <div className="absolute inset-0.5 bg-primary rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-1">
                      Primary Color
                    </div>
                    {selectedColor && (
                      <div className="text-xs text-muted-foreground font-mono font-medium truncate">
                        {selectedColor.hex}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary Color Card */}
              <div
                onClick={() => setActiveColorType('secondary')}
                className={cn(
                  "p-5 rounded-xl border-2 bg-muted/10 relative overflow-hidden group transition-all duration-300 cursor-pointer",
                  activeColorType === 'secondary'
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <div className="relative flex items-center gap-4">
                  <div className="relative group/color flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-xl border-[3px] border-white/90 shadow-2xl transition-all duration-300 group-hover/color:scale-110 group-hover/color:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                      style={{ backgroundColor: selectedSecondaryColor?.hex || '#cccccc' }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl blur-xl opacity-60 transition-opacity duration-300 group-hover/color:opacity-80"
                      style={{ backgroundColor: selectedSecondaryColor?.hex || '#cccccc' }}
                    />
                    {/* Sparkle effect */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover/color:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-white rounded-full blur-sm animate-pulse" />
                      <div className="absolute inset-0.5 bg-primary rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-1">
                      Secondary Color
                    </div>
                    {selectedSecondaryColor && (
                      <div className="text-xs text-muted-foreground font-mono font-medium truncate">
                        {selectedSecondaryColor.hex}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inline Color Picker */}
            {(activeColorType === 'primary' || activeColorType === 'secondary') && (
              <div className="mb-6 p-5 rounded-xl border-2 border-border/50 bg-muted/10">
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2">
                    Pick {activeColorType === 'primary' ? 'Primary' : 'Secondary'} Color
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">
                    Use the color picker below to select your {activeColorType} color
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <HexColorPicker
                      color={activeColorType === 'primary' ? (selectedColor?.hex || '#3382c7') : (selectedSecondaryColor?.hex || '#3382c7')}
                      onChange={(hex) => handleColorChange(hex, activeColorType)}
                      style={{ width: '100%', height: '200px' }}
                    />
                  </div>
                  <div className="sm:w-48 space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Hex Value</Label>
                      <Input
                        type="text"
                        value={activeColorType === 'primary' ? (selectedColor?.hex || '') : (selectedSecondaryColor?.hex || '')}
                        onChange={(e) => {
                          const hex = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(hex) || hex === '') {
                            if (hex.length === 7) {
                              handleColorChange(hex, activeColorType);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const hex = e.target.value;
                          if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
                            handleColorChange(hex, activeColorType);
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
                            ? (selectedColor?.hex || '#cccccc') 
                            : (selectedSecondaryColor?.hex || '#cccccc')
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-xs font-medium">
                          {activeColorType === 'primary' ? 'Primary' : 'Secondary'} Color
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {activeColorType === 'primary' 
                            ? (selectedColor?.hex || 'Not set') 
                            : (selectedSecondaryColor?.hex || 'Not set')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Landing Page Fonts Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                <div className="font-medium text-lg">Landing Page Fonts</div>
              </div>
              <div className="text-sm text-muted-foreground">Customize typography</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="landing-heading" className="text-sm font-medium">
                  Heading Font
                </Label>
                <Select
                  value={fontConfig.landing?.heading || "gotham"}
                  onValueChange={(value) => handleFontChange("heading", value)}
                >
                  <SelectTrigger id="landing-heading" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <span
                          style={{
                            fontFamily: `var(${getFontVariable(font.id)}), system-ui, sans-serif`,
                          }}
                        >
                          {font.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landing-body" className="text-sm font-medium">
                  Body Font
                </Label>
                <Select
                  value={fontConfig.landing?.body || "gotham"}
                  onValueChange={(value) => handleFontChange("body", value)}
                >
                  <SelectTrigger id="landing-body" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.id} value={font.id}>
                        <span
                          style={{
                            fontFamily: `var(${getFontVariable(font.id)}), system-ui, sans-serif`,
                          }}
                        >
                          {font.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dots Decoration Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-medium">Dots Decoration</div>
              <div className="text-sm text-muted-foreground">Show dots pattern on landing page</div>
            </div>
            <Switch
              checked={dotsEnabled}
              onCheckedChange={handleDotsEnabledChange}
            />
          </div>

          {/* Wave Gradient Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-medium">Wave Gradient</div>
              <div className="text-sm text-muted-foreground">Flowing wave-like gradient effects</div>
            </div>
            <Switch
              checked={waveGradientEnabled}
              onCheckedChange={handleWaveGradientEnabledChange}
            />
          </div>

          {/* Noise Texture Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-medium">Noise Texture</div>
              <div className="text-sm text-muted-foreground">Subtle grain texture overlay</div>
            </div>
            <Switch
              checked={noiseTextureEnabled}
              onCheckedChange={handleNoiseTextureEnabledChange}
            />
          </div>
      </div>

      {/* Save Changes Button - Outside Card */}
      {isDirty && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveChanges} 
            disabled={isGeneratingName}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isGeneratingName 
              ? (selectedPresetId === 'new' ? "Generating name..." : "Saving...")
              : "Save changes"
            }
          </Button>
        </div>
      )}

      {/* Save Dialog for New Preset */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Preset</DialogTitle>
            <DialogDescription>
              Enter a name for your new preset. This will save your current theme, color, and font settings.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Preset name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateNewPreset();
                  }
                }}
                autoFocus
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateNameForDialog}
                disabled={isGeneratingNameInDialog}
                className="shrink-0"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingNameInDialog ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a name manually or click "Generate with AI" to create a name based on your preset's colors, font, and theme.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewPreset} disabled={!newPresetName.trim()}>
              Create Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Input
              placeholder="Preset name"
              value={renamePresetName}
              onChange={(e) => setRenamePresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveRename();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRename}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the preset.
              {presetToDelete && presets.find(p => p.id === presetToDelete) && (
                <> The preset "{presets.find(p => p.id === presetToDelete)?.name}" will be deleted.</>
              )}
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
              onClick={handleDeletePreset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Color Modal */}
    </div>
  );
}
