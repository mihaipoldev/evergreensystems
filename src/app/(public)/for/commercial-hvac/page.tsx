import FunnelPage from "@/features/funnels/components/FunnelPage";
import { commercialHvacContent } from "@/features/funnels/content/commercial-hvac";

// No hero video yet — FunnelPage shows the placeholder until one is wired in: add it to
// src/features/media/videos.ts and name its id here, as the cleaning page does.
export default function CommercialHvacPage() {
  return (
    <FunnelPage content={commercialHvacContent} heroVideo={null} pageSlug="for-commercial-hvac" />
  );
}
