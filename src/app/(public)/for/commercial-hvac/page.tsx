import FunnelPage from "@/features/funnels/components/FunnelPage";
import { commercialHvacContent } from "@/features/funnels/content/commercial-hvac";

// No hero video yet — FunnelPage shows the placeholder until a media id is wired
// in (mirror the cleaning page's getMediaById fetch once the HVAC video exists).
export default function CommercialHvacPage() {
  return (
    <FunnelPage content={commercialHvacContent} heroVideo={null} pageSlug="for-commercial-hvac" />
  );
}
