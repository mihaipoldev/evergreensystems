import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { OfferFeature } from "./types";
import { unstable_cache } from "next/cache";
import { shouldIncludeItemByStatus } from "@/lib/supabase/queries";

/**
 * Get all features, ordered by position
 * Uses service role client to bypass RLS for admin operations
 * Cached for 5 minutes to improve performance
 */
export async function getAllOfferFeatures(): Promise<OfferFeature[]> {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase
        .from("offer_features")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
    ['all-offer-features'],
    {
      revalidate: 60, // 1 minute
      tags: ['offer-features'],
    }
  )();
}

/**
 * Get a single feature by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getOfferFeatureById(id: string): Promise<OfferFeature | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("offer_features")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get all features (public-facing)
 * Status is now managed at the junction table level, so we return all features
 * Cached for 5 minutes to improve performance
 */
export async function getActiveOfferFeatures() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from("offer_features")
        .select("id, title, subtitle, description, icon, position, created_at, updated_at")
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
    ['active-offer-features'],
    {
      revalidate: 60, // 1 minute
      tags: ['offer-features'],
    }
  )();
}

/**
 * Get all features for a specific section via section_features junction table
 */
export async function getFeaturesBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const { data, error } = await supabase
    .from("section_features")
    .select(`
      *,
      offer_features (*)
    `)
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.offer_features) return false;
      
      // Filter based on status from junction table
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.offer_features,
      section_feature: {
        id: item.id,
        position: item.position,
        status: item.status || "published",
        created_at: item.created_at,
      },
    }));
}
