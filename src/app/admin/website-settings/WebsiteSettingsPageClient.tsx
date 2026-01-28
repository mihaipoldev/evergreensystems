"use client";

import { useState, useEffect } from "react";
import { PresetManager } from "@/components/admin/settings/PresetManager";
import { WebsiteSettings } from "@/components/admin/settings/WebsiteSettings";
import { RouteSelector } from "@/components/admin/settings/RouteSelector";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { hexToHsl } from "@/lib/color-utils";
import { serializeFontFamily, getDefaultFontFamily } from "@/lib/font-utils";
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

type Preset = {
  id: string;
  name: string;
  primary_color_hex: string | null;
  secondary_color_hex: string | null;
  theme: string | null;
  favorite?: boolean;
};

export function WebsiteSettingsPageClient() {
  const { toast } = useToast();
  const [activeEnvironment, setActiveEnvironment] = useState<'production' | 'development'>('development');
  
  // Initialize activeRoute from localStorage, default to '/'
  const [activeRoute, setActiveRoute] = useState<'/' | '/outbound-system'>(() => {
    if (typeof window !== 'undefined') {
      const savedRoute = localStorage.getItem('website-settings-active-route');
      if (savedRoute === '/' || savedRoute === '/outbound-system') {
        return savedRoute;
      }
    }
    return '/';
  });
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPreset, setIsGeneratingPreset] = useState(false);
  const [showProductionConfirm, setShowProductionConfirm] = useState(false);
  const [pendingPresetId, setPendingPresetId] = useState<string | null>(null);
  const [renameTrigger, setRenameTrigger] = useState<string | null>(null);
  const [presetNameUpdateTrigger, setPresetNameUpdateTrigger] = useState<{ presetId: string; newName: string } | null>(null);

  // Load presets and active preset for environment
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Load all presets
        const { data: presetsData, error: presetsError } = await (supabase
          .from("website_settings_presets") as any)
          .select("id, name, primary_color_hex, secondary_color_hex, theme, favorite, created_at")
          .order("name", { ascending: true });

        if (presetsError) {
          console.error("Error loading presets:", presetsError);
        } else if (presetsData) {
          // Sort client-side as well to ensure proper alphabetical order
          const sortedPresets = [...presetsData].sort((a, b) => 
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          );
          setPresets(sortedPresets);
        }

        // Load active preset for current environment and route
        const { data: settings } = await (supabase
          .from("website_settings") as any)
          .select("preset_id")
          .eq("environment", activeEnvironment)
          .eq("route", activeRoute)
          .maybeSingle();

        if (settings?.preset_id) {
          setActivePresetId(settings.preset_id);
          setSelectedPresetId(settings.preset_id);
        } else {
          setActivePresetId(null);
          setSelectedPresetId(null);
        }
      } catch (error) {
        console.error("Error loading website settings data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeEnvironment, activeRoute]);

  // Set up Supabase real-time subscription for presets
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('website_settings_presets_changes_client', {
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
          console.log('Preset change detected (client):', payload);
          
          // Use payload data directly if available, otherwise reload
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedPreset = payload.new as { id: string; name: string; primary_color_hex: string | null; secondary_color_hex: string | null; theme: string | null; favorite?: boolean };
            setPresets(prevPresets => {
              const updated = prevPresets.map(preset => 
                preset.id === updatedPreset.id 
                  ? { ...preset, name: updatedPreset.name, favorite: updatedPreset.favorite ?? preset.favorite }
                  : preset
              );
              // Sort by name (favorites will be sorted by PresetManager component)
              return updated.sort((a, b) => 
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
              );
            });
            console.log('Preset updated from subscription (client):', updatedPreset);
          } else {
            // For INSERT or DELETE, reload all presets
            try {
              const { data: presetsData, error } = await (supabase
                .from("website_settings_presets") as any)
                .select("id, name, primary_color_hex, secondary_color_hex, theme, favorite, created_at")
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
                console.log('Presets updated (client):', sortedPresets);
              }
            } catch (error) {
              console.error("Error reloading presets:", error);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status (client):', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to preset changes (client)');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error - check Supabase real-time settings');
        } else if (status === 'TIMED_OUT') {
          console.error('Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('Subscription closed');
        }
      });

    return () => {
      console.log('Cleaning up subscription (client)');
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEnvironmentChange = (env: 'production' | 'development') => {
    setActiveEnvironment(env);
    // Reset selection - will be updated by useEffect
    setSelectedPresetId(null);
  };

  const handleRouteChange = (route: '/' | '/outbound-system') => {
    setActiveRoute(route);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('website-settings-active-route', route);
    }
    // Reset selection - will be updated by useEffect
    setSelectedPresetId(null);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
  };

  const applyPresetToEnvironment = async (presetId: string, environment: 'production' | 'development', route: '/' | '/outbound-system') => {
    try {
      setIsApplying(true);
      const supabase = createClient();

      // Use upsert to handle both insert and update cases, avoiding 409 conflicts
      // For composite unique constraints, we need to check first and then update or insert
      const { data: existing } = await (supabase
        .from("website_settings") as any)
        .select("id")
        .eq("environment", environment)
        .eq("route", route)
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
            environment: environment,
            route: route,
            preset_id: presetId,
          });
        
        if (error) {
          // If insert fails with 409, try update in case record was created between check and insert
          if (error.code === '23505') {
            const { data: retryExisting } = await (supabase
              .from("website_settings") as any)
              .select("id")
              .eq("environment", environment)
              .eq("route", route)
              .maybeSingle();
            
            if (retryExisting) {
              const { error: updateError } = await (supabase
                .from("website_settings") as any)
                .update({ preset_id: presetId })
                .eq("id", retryExisting.id);
              
              if (updateError) throw updateError;
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      setActivePresetId(presetId);
      if (environment === activeEnvironment && route === activeRoute) {
        setSelectedPresetId(presetId);
      }
      
      toast({
        title: "Preset applied",
        description: `The preset has been applied to ${environment} environment for ${route === '/' ? 'Landing Page' : 'Outbound Systems'}.`,
      });
    } catch (error) {
      console.error("Error applying preset:", error);
      toast({
        title: "Failed to apply preset",
        description: "An error occurred while applying the preset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyPreset = async () => {
    if (!selectedPresetId) return;

    // If preset is already active, deactivate it
    if (selectedPresetId === activePresetId) {
      await deactivatePresetFromEnvironment(activeEnvironment, activeRoute);
      return;
    }

    // Show confirmation for production
    if (activeEnvironment === 'production') {
      setPendingPresetId(selectedPresetId);
      setShowProductionConfirm(true);
      return;
    }

    // Apply directly for development
    await applyPresetToEnvironment(selectedPresetId, activeEnvironment, activeRoute);
  };

  const deactivatePresetFromEnvironment = async (environment: 'production' | 'development', route: '/' | '/outbound-system') => {
    try {
      setIsApplying(true);
      const supabase = createClient();

      // Delete the website_settings entry for this environment and route
      const { error } = await (supabase
        .from("website_settings") as any)
        .delete()
        .eq("environment", environment)
        .eq("route", route);

      if (error) throw error;

      setActivePresetId(null);
      if (environment === activeEnvironment && route === activeRoute) {
        // Select the first preset if available
        if (presets.length > 0) {
          setSelectedPresetId(presets[0].id);
        } else {
          setSelectedPresetId(null);
        }
      }
      
      toast({
        title: "Preset deactivated",
        description: `The preset has been deactivated from ${environment} environment for ${route === '/' ? 'Landing Page' : 'Outbound Systems'}.`,
      });
    } catch (error) {
      console.error("Error deactivating preset:", error);
      toast({
        title: "Failed to deactivate preset",
        description: "An error occurred while deactivating the preset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleConfirmProductionApply = async () => {
    if (!pendingPresetId) return;
    setShowProductionConfirm(false);
    await applyPresetToEnvironment(pendingPresetId, 'production', activeRoute);
    setPendingPresetId(null);
  };

  const handleCreateNew = () => {
    // Set to 'new' to trigger new preset creation in WebsiteSettings
    setSelectedPresetId('new');
  };

  const handleRenamePreset = (presetId: string) => {
    // Select the preset first
    setSelectedPresetId(presetId);
    // Trigger rename dialog after preset is selected
    setTimeout(() => {
      setRenameTrigger(presetId);
      // Clear trigger after a moment so it can be triggered again
      setTimeout(() => setRenameTrigger(null), 100);
    }, 100);
  };

  const handleDuplicatePreset = async (presetId: string) => {
    try {
      const supabase = createClient();
      
      // Get current preset data
      const { data: currentPreset } = await (supabase
        .from("website_settings_presets") as any)
        .select("theme, primary_color_hex, primary_color_h, primary_color_s, primary_color_l, secondary_color_hex, secondary_color_h, secondary_color_s, secondary_color_l, font_family, styling_options, name")
        .eq("id", presetId)
        .single();

      if (!currentPreset) {
        toast({
          title: "Preset not found",
          description: "The preset could not be found.",
          variant: "destructive",
        });
        return;
      }

      // Find all presets with the same base name
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
      
      // Prepare styling_options - default to dots_enabled: false if not present
      const stylingOptions = currentPreset.styling_options 
        ? (typeof currentPreset.styling_options === 'string' 
            ? JSON.parse(currentPreset.styling_options) 
            : currentPreset.styling_options)
        : { dots_enabled: false, wave_gradient_enabled: false, noise_texture_enabled: false };

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
          styling_options: stylingOptions,
        })
        .select("id, name, primary_color_hex, secondary_color_hex, theme, favorite, created_at")
        .single();

      if (createError) throw createError;

      // Reload presets
      const { data: presetsData } = await (supabase
        .from("website_settings_presets") as any)
        .select("id, name, primary_color_hex, secondary_color_hex, theme, favorite, created_at")
        .order("name", { ascending: true });

      if (presetsData) {
        const sortedPresets = [...presetsData].sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setPresets(sortedPresets);
      }

      // Select the new duplicate
      setSelectedPresetId(newPreset.id);

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

  const handleGeneratePreset = async () => {
    try {
      setIsGeneratingPreset(true);
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Call AI API to generate complete preset
      const response = await fetch("/api/admin/ai/generate-preset", {
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

      // Convert hex colors to HSL
      const primaryHsl = hexToHsl(presetData.primary_color);
      const secondaryHsl = hexToHsl(presetData.secondary_color);

      // Prepare font family JSON
      const fontConfig = {
        admin: getDefaultFontFamily().admin,
        landing: {
          heading: presetData.heading_font,
          body: presetData.body_font,
        },
      };
      const fontJson = serializeFontFamily(fontConfig);

      // Prepare styling_options JSON
      const stylingOptions = {
        dots_enabled: presetData.dots_enabled,
        wave_gradient_enabled: presetData.wave_gradient_enabled,
        noise_texture_enabled: presetData.noise_texture_enabled,
      };

      // Create new preset
      const { data: newPreset, error: createError } = await (supabase
        .from("website_settings_presets") as any)
        .insert({
          name: presetData.name,
          theme: presetData.theme,
          primary_color_hex: presetData.primary_color,
          primary_color_h: primaryHsl.h,
          primary_color_s: primaryHsl.s,
          primary_color_l: primaryHsl.l,
          secondary_color_hex: presetData.secondary_color,
          secondary_color_h: secondaryHsl.h,
          secondary_color_s: secondaryHsl.s,
          secondary_color_l: secondaryHsl.l,
          font_family: fontJson,
          styling_options: stylingOptions,
        })
        .select("id, name, primary_color_hex, secondary_color_hex, theme, favorite, created_at")
        .single();

      if (createError) throw createError;

      // Reload presets
      const { data: presetsData } = await (supabase
        .from("website_settings_presets") as any)
        .select("id, name, primary_color_hex, secondary_color_hex, theme, favorite, created_at")
        .order("name", { ascending: true });

      if (presetsData) {
        const sortedPresets = [...presetsData].sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setPresets(sortedPresets);
      }

      // Select the new preset
      setSelectedPresetId(newPreset.id);

      toast({
        title: "Preset generated",
        description: `"${presetData.name}" has been created with AI-generated settings.`,
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

  const handleGenerateName = async (presetId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Get full preset data including font_family
      const { data: preset, error: presetError } = await (supabase
        .from("website_settings_presets") as any)
        .select("primary_color_hex, secondary_color_hex, theme, font_family")
        .eq("id", presetId)
        .single();

      if (presetError || !preset) {
        toast({
          title: "Preset not found",
          description: "The preset could not be found.",
          variant: "destructive",
        });
        return;
      }

      // Parse font_family to get body font
      let bodyFont = "gotham"; // default
      if (preset.font_family) {
        try {
          const fontConfig = typeof preset.font_family === 'string' 
            ? JSON.parse(preset.font_family) 
            : preset.font_family;
          bodyFont = fontConfig?.landing?.body || fontConfig?.admin?.body || "gotham";
        } catch (e) {
          console.warn("Error parsing font_family:", e);
        }
      }

      // Call AI API to generate preset name
      const response = await fetch("/api/admin/ai/generate-preset-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          primary_color: preset.primary_color_hex || "#cccccc",
          secondary_color: preset.secondary_color_hex || null,
          body_font: bodyFont,
          theme: preset.theme || "dark",
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
        .eq("id", presetId);

      if (updateError) throw updateError;

      // Update presets state immediately for instant UI update
      setPresets(prevPresets => {
        const updated = prevPresets.map(preset => 
          preset.id === presetId 
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

      // Trigger update in WebsiteSettings component
      setPresetNameUpdateTrigger({ presetId, newName: generatedName.trim() });
      // Clear trigger after a moment so it can be triggered again
      setTimeout(() => setPresetNameUpdateTrigger(null), 100);

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

  const handleToggleFavorite = async (presetId: string, isFavorite: boolean) => {
    try {
      const supabase = createClient();

      const { error } = await (supabase
        .from("website_settings_presets") as any)
        .update({ favorite: isFavorite })
        .eq("id", presetId);

      if (error) throw error;

      // Update local state immediately
      setPresets(prevPresets => 
        prevPresets.map(preset => 
          preset.id === presetId 
            ? { ...preset, favorite: isFavorite }
            : preset
        )
      );

      const preset = presets.find(p => p.id === presetId);
      toast({
        title: isFavorite ? "Added to favorites" : "Removed from favorites",
        description: `Preset "${preset?.name || 'Unknown'}" has been ${isFavorite ? 'added to' : 'removed from'} favorites.`,
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

  const handleDeletePreset = async (presetId: string) => {
    try {
      const supabase = createClient();
      
      // Check if preset is being used by any environment and route
      const { data: settingsUsingPreset } = await (supabase
        .from("website_settings") as any)
        .select("environment, route")
        .eq("preset_id", presetId);

      // Allow deletion in development even if active, but block in production
      if (settingsUsingPreset && settingsUsingPreset.length > 0) {
        const isUsedInProduction = settingsUsingPreset.some((s: any) => s.environment === 'production');
        
        // Only block deletion if used in production (always allow in development)
        if (isUsedInProduction && activeEnvironment !== 'development') {
          const environments = settingsUsingPreset.map((s: any) => s.environment).join(", ");
          toast({
            title: "Cannot delete preset",
            description: `This preset is currently being used by ${environments} environment(s). Please select a different preset first.`,
            variant: "destructive",
          });
          return;
        }

        // If in development and preset is active for current route, remove it from website_settings first
        if (activeEnvironment === 'development') {
          await (supabase
            .from("website_settings") as any)
            .delete()
            .eq("preset_id", presetId)
            .eq("environment", 'development')
            .eq("route", activeRoute);
        }
      }

      // Delete the preset
      const { error } = await (supabase
        .from("website_settings_presets") as any)
        .delete()
        .eq("id", presetId);

      if (error) throw error;

      // Reload presets
      const { data: presetsData } = await (supabase
        .from("website_settings_presets") as any)
        .select("id, name, primary_color_hex, secondary_color_hex, theme, favorite, created_at")
        .order("name", { ascending: true });

      if (presetsData) {
        const sortedPresets = [...presetsData].sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setPresets(sortedPresets);

        // Select the first preset in the list if available
        if (sortedPresets.length > 0) {
          setSelectedPresetId(sortedPresets[0].id);
        } else {
          setSelectedPresetId(null);
        }
      } else {
        setSelectedPresetId(null);
      }

      // Update active preset if it was deleted
      if (activePresetId === presetId) {
        setActivePresetId(null);
      }

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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="flex gap-4">
          <div className="w-80 h-96 bg-muted animate-pulse rounded-lg" />
          <div className="flex-1 h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col -mx-4 md:-mx-10 lg:-mx-12 -mt-6 md:-mt-8 -mb-4 md:-mb-8 h-[calc(100vh-64px)] md:h-[calc(100vh-76px)] overflow-hidden">
      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar - Preset Manager */}
        <div className="flex flex-col w-80 border-r border-border bg-muted/20 shrink-0 h-full overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <PresetManager
            presets={presets}
            selectedPresetId={selectedPresetId}
            activePresetId={activePresetId}
            onPresetSelect={handlePresetSelect}
            onApplyPreset={handleApplyPreset}
            onCreateNew={handleCreateNew}
            isApplying={isApplying}
            onRenamePreset={handleRenamePreset}
            onDuplicatePreset={handleDuplicatePreset}
            onDeletePreset={handleDeletePreset}
            onGenerateName={handleGenerateName}
            onGeneratePreset={handleGeneratePreset}
            isGeneratingPreset={isGeneratingPreset}
            onActivatePreset={async (presetId: string) => {
              // Show confirmation for production
              if (activeEnvironment === 'production') {
                setPendingPresetId(presetId);
                setShowProductionConfirm(true);
                return;
              }

              // Apply directly for development
              await applyPresetToEnvironment(presetId, activeEnvironment, activeRoute);
            }}
            onToggleFavorite={handleToggleFavorite}
            />
          </div>
          {/* Route Selector and Environment Toggle */}
          <div className="p-3 border-t border-border shrink-0 space-y-2">
            <RouteSelector
              activeRoute={activeRoute}
              onRouteChange={handleRouteChange}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEnvironmentChange('development')}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeEnvironment === 'development'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Development
              </button>
              <button
                onClick={() => handleEnvironmentChange('production')}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeEnvironment === 'production'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Production
              </button>
            </div>
          </div>
        </div>

        {/* Right Content - Settings Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <WebsiteSettings
              environment={activeEnvironment}
              route={activeRoute}
              selectedPresetId={selectedPresetId}
              renameTrigger={renameTrigger}
              presetNameUpdateTrigger={presetNameUpdateTrigger}
              isApplying={isApplying}
              activePresetId={activePresetId}
              onApplyRequest={(presetId: string) => {
                // If preset is already active, deactivate it
                if (presetId === activePresetId) {
                  // Show confirmation for production deactivation
                  if (activeEnvironment === 'production') {
                    // For production, we'll handle deactivation differently - maybe show a confirmation
                    // For now, just deactivate it
                    deactivatePresetFromEnvironment(activeEnvironment, activeRoute);
                  } else {
                    deactivatePresetFromEnvironment(activeEnvironment, activeRoute);
                  }
                  return;
                }

                // Show confirmation for production
                if (activeEnvironment === 'production') {
                  setPendingPresetId(presetId);
                  setShowProductionConfirm(true);
                  return;
                }

                // Apply directly for development
                applyPresetToEnvironment(presetId, activeEnvironment, activeRoute);
              }}
              onPresetNameUpdated={(presetId: string, newName: string) => {
                // Update presets state immediately when name is updated from WebsiteSettings
                setPresets(prevPresets => {
                  const updated = prevPresets.map(preset => 
                    preset.id === presetId 
                      ? { ...preset, name: newName }
                      : preset
                  );
                  // Sort by name
                  return updated.sort((a, b) => 
                    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
                  );
                });
              }}
              onPresetApplied={async () => {
                // Reload presets and active preset after preset is created/applied
                const supabase = createClient();
                
                // Reload presets list
                const { data: presetsData } = await (supabase
                  .from("website_settings_presets") as any)
                  .select("id, name, primary_color_hex, secondary_color_hex, theme, favorite, created_at")
                  .order("name", { ascending: true });

                if (presetsData) {
                  const sortedPresets = [...presetsData].sort((a, b) => 
                    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
                  );
                  setPresets(sortedPresets);
                }

                // Reload active preset
                const { data: settings } = await (supabase
                  .from("website_settings") as any)
                  .select("preset_id")
                  .eq("environment", activeEnvironment)
                  .eq("route", activeRoute)
                  .maybeSingle();

                if (settings?.preset_id) {
                  setActivePresetId(settings.preset_id);
                  setSelectedPresetId(settings.preset_id);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Production Confirmation Dialog */}
      <AlertDialog open={showProductionConfirm} onOpenChange={setShowProductionConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Preset to Production?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to apply this preset to the production environment? 
              This will update the live website settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowProductionConfirm(false);
              setPendingPresetId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmProductionApply}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Apply to Production
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
