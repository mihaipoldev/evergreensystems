import FunnelPage from "@/features/funnels/components/FunnelPage";
import { recruitingAgenciesContent } from "@/features/funnels/content/recruiting-agencies";

export default function RecruitingAgenciesPage() {
  return <FunnelPage content={recruitingAgenciesContent} heroVideo={null} pageSlug="for-recruiting-agencies" />;
}
