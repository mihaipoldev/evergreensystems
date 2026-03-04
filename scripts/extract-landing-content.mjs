/**
 * One-time script to extract all landing page content from the database.
 * Outputs JSON that will be used to create the TypeScript content file.
 *
 * Usage: node scripts/extract-landing-content.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.error("Extracting landing page content from database...\n");

  // 1. Get the home page via site_structure
  const { data: siteStructure, error: ssErr } = await supabase
    .from("site_structure")
    .select("production_page_id, development_page_id")
    .eq("slug", "home")
    .maybeSingle();

  if (ssErr) throw ssErr;
  if (!siteStructure) throw new Error("No site_structure entry for slug 'home'");

  const pageId = siteStructure.production_page_id;
  console.error(`Home page ID (production): ${pageId}`);

  // 2. Get the page record
  const { data: page, error: pageErr } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .single();

  if (pageErr) throw pageErr;
  console.error(`Page title: ${page.title}`);

  // 3. Get all page_sections (published only)
  const { data: pageSections, error: psErr } = await supabase
    .from("page_sections")
    .select("*, sections (*)")
    .eq("page_id", pageId)
    .eq("status", "published")
    .order("position", { ascending: true });

  if (psErr) throw psErr;

  const sections = pageSections
    .filter((ps) => ps.sections)
    .map((ps) => ({
      ...ps.sections,
      position: ps.position,
      page_section_id: ps.id,
    }));

  console.error(`Found ${sections.length} published sections\n`);

  const sectionIds = sections.map((s) => s.id);

  // 4. Fetch all related data in parallel
  const [
    mediaResult,
    ctaJunctionResult,
    featuresJunctionResult,
    faqJunctionResult,
    timelineResult,
    testimonialsJunctionResult,
    resultsResult,
    softwaresJunctionResult,
    socialsJunctionResult,
  ] = await Promise.all([
    // Media
    supabase
      .from("section_media")
      .select("*, media (*)")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    // CTA junction
    supabase
      .from("section_cta_buttons")
      .select("*")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("position", { ascending: true }),
    // Features junction
    supabase
      .from("section_features")
      .select("*")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("position", { ascending: true }),
    // FAQ junction
    supabase
      .from("section_faq_items")
      .select("*")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("position", { ascending: true }),
    // Timeline (with join — no RLS issue with service role)
    supabase
      .from("section_timeline")
      .select("*, timeline (*)")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("position", { ascending: true }),
    // Testimonials junction
    supabase
      .from("section_testimonials")
      .select("*")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("position", { ascending: true }),
    // Results (with join)
    supabase
      .from("section_results")
      .select("*, results (*)")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("position", { ascending: true }),
    // Softwares junction
    supabase
      .from("section_softwares")
      .select("*")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("order", { ascending: true }),
    // Socials junction
    supabase
      .from("section_socials")
      .select("*")
      .in("section_id", sectionIds)
      .eq("status", "published")
      .order("order", { ascending: true }),
  ]);

  // 5. Fetch base records for junction tables
  const ctaIds = (ctaJunctionResult.data || []).map((r) => r.cta_button_id).filter(Boolean);
  const featureIds = (featuresJunctionResult.data || []).map((r) => r.feature_id).filter(Boolean);
  const faqIds = (faqJunctionResult.data || []).map((r) => r.faq_item_id).filter(Boolean);
  const testimonialIds = (testimonialsJunctionResult.data || []).map((r) => r.testimonial_id).filter(Boolean);
  const softwareIds = (softwaresJunctionResult.data || []).map((r) => r.software_id).filter(Boolean);
  const platformIds = (socialsJunctionResult.data || []).map((r) => r.platform_id).filter(Boolean);

  const [ctaBase, featuresBase, faqBase, testimonialsBase, softwaresBase, socialsBase] =
    await Promise.all([
      ctaIds.length ? supabase.from("cta_buttons").select("*").in("id", ctaIds) : { data: [] },
      featureIds.length ? supabase.from("offer_features").select("*").in("id", featureIds) : { data: [] },
      faqIds.length ? supabase.from("faq_items").select("*").in("id", faqIds) : { data: [] },
      testimonialIds.length ? supabase.from("testimonials").select("*").in("id", testimonialIds) : { data: [] },
      softwareIds.length ? supabase.from("softwares").select("*").in("id", softwareIds) : { data: [] },
      platformIds.length ? supabase.from("social_platforms").select("*").in("id", platformIds) : { data: [] },
    ]);

  // 6. Build lookup maps
  const toMap = (arr, key = "id") => new Map((arr || []).map((r) => [r[key], r]));
  const ctaMap = toMap(ctaBase.data);
  const featuresMap = toMap(featuresBase.data);
  const faqMap = toMap(faqBase.data);
  const testimonialsMap = toMap(testimonialsBase.data);
  const softwaresMap = toMap(softwaresBase.data);
  const socialsMap = toMap(socialsBase.data);

  // 7. Group by section_id helpers
  function groupBy(junctionData, idField, baseMap) {
    const grouped = {};
    for (const item of junctionData || []) {
      const sectionId = item.section_id;
      const base = baseMap.get(item[idField]);
      if (!base) continue;
      if (!grouped[sectionId]) grouped[sectionId] = [];
      grouped[sectionId].push({
        ...base,
        _junction: { ...item },
      });
    }
    return grouped;
  }

  function groupByWithJoin(junctionData, joinField) {
    const grouped = {};
    for (const item of junctionData || []) {
      const sectionId = item.section_id;
      if (!item[joinField]) continue;
      if (!grouped[sectionId]) grouped[sectionId] = [];
      grouped[sectionId].push({
        ...item[joinField],
        _junction: { ...item, [joinField]: undefined },
      });
    }
    return grouped;
  }

  const mediaBySectionId = groupByWithJoin(mediaResult.data, "media");
  const ctaBySectionId = groupBy(ctaJunctionResult.data, "cta_button_id", ctaMap);
  const featuresBySectionId = groupBy(featuresJunctionResult.data, "feature_id", featuresMap);
  const faqBySectionId = groupBy(faqJunctionResult.data, "faq_item_id", faqMap);
  const timelineBySectionId = groupByWithJoin(timelineResult.data, "timeline");
  const testimonialsBySectionId = groupBy(testimonialsJunctionResult.data, "testimonial_id", testimonialsMap);
  const resultsBySectionId = groupByWithJoin(resultsResult.data, "results");
  const softwaresBySectionId = groupBy(softwaresJunctionResult.data, "software_id", softwaresMap);
  const socialsBySectionId = groupBy(socialsJunctionResult.data, "platform_id", socialsMap);

  // 8. Assemble final output
  const output = {
    _extractedAt: new Date().toISOString(),
    page,
    sections: sections.map((section) => ({
      ...section,
      media: mediaBySectionId[section.id] || [],
      ctaButtons: ctaBySectionId[section.id] || [],
      features: featuresBySectionId[section.id] || [],
      faqItems: faqBySectionId[section.id] || [],
      timelineItems: timelineBySectionId[section.id] || [],
      testimonials: testimonialsBySectionId[section.id] || [],
      results: resultsBySectionId[section.id] || [],
      softwares: softwaresBySectionId[section.id] || [],
      socialPlatforms: socialsBySectionId[section.id] || [],
    })),
  };

  // Print summary to stderr
  for (const s of output.sections) {
    const counts = [
      s.media.length && `${s.media.length} media`,
      s.ctaButtons.length && `${s.ctaButtons.length} CTAs`,
      s.features.length && `${s.features.length} features`,
      s.faqItems.length && `${s.faqItems.length} FAQs`,
      s.timelineItems.length && `${s.timelineItems.length} timeline`,
      s.testimonials.length && `${s.testimonials.length} testimonials`,
      s.results.length && `${s.results.length} results`,
      s.softwares.length && `${s.softwares.length} softwares`,
      s.socialPlatforms.length && `${s.socialPlatforms.length} socials`,
    ].filter(Boolean);
    console.error(`  [${s.position}] ${s.type}: "${s.title}" ${counts.length ? `(${counts.join(", ")})` : ""}`);
  }

  // Output JSON to stdout
  console.log(JSON.stringify(output, null, 2));
  console.error("\nDone! Pipe to a file: node scripts/extract-landing-content.mjs > scripts/landing-content.json");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
