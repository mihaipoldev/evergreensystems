import { createServiceRoleClient } from "@/lib/supabase/server";
import type { OfferFeature } from "./types";
import type { Database } from "@/lib/supabase/types";
import { unstable_cache } from "next/cache";

type Section = Database["public"]["Tables"]["sections"]["Row"];

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
 * Get all sections for dropdown selection
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllSections(): Promise<Section[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}
