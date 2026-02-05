"use client";

import {
  SectionWrapper,
  BlockHeader,
  NumberedCard,
  ContentCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWater,
  faCheckCircle,
  faChartPie,
  faStar,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

type EnrichmentField = {
  field?: string;
  sources?: string[];
  must_verify?: boolean;
  verification_method?: string | null;
  usage?: string;
  acceptable_proxy?: string;
  impact?: string;
};

type EnrichmentRequirements = {
  description?: string;
  enrichment_waterfall?: string[];
  required_before_outreach?: EnrichmentField[];
  required_for_segmentation?: EnrichmentField[];
  nice_to_have_for_personalization?: EnrichmentField[];
};

interface EnrichmentRequirementsSectionProps {
  enrichmentRequirements: EnrichmentRequirements;
  sectionNumber?: string;
}

export const EnrichmentRequirementsSection = ({
  enrichmentRequirements,
  sectionNumber = "11",
}: EnrichmentRequirementsSectionProps) => {
  const waterfall = enrichmentRequirements?.enrichment_waterfall ?? [];
  const beforeOutreach = enrichmentRequirements?.required_before_outreach ?? [];
  const forSegmentation = enrichmentRequirements?.required_for_segmentation ?? [];
  const niceToHave = enrichmentRequirements?.nice_to_have_for_personalization ?? [];

  return (
    <SectionWrapper
      id="enrichment-requirements"
      number={sectionNumber}
      title="Enrichment Requirements"
      subtitle={enrichmentRequirements?.description ?? "Data fields required before outreach and for segmentation"}
    >
      {waterfall.length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Enrichment Waterfall"
            icon={<FontAwesomeIcon icon={faWater} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-3">
            {waterfall.map((step, i) => (
              <NumberedCard key={i} number={i + 1} layout="inline">
                <p className="text-sm font-body text-foreground">{step}</p>
              </NumberedCard>
            ))}
          </div>
        </div>
      )}

      {beforeOutreach.length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Required Before Outreach"
            icon={<FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600" />}
          />
          <div className="space-y-4">
            {beforeOutreach.map((f, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border report-shadow p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-display font-semibold text-foreground">
                    {f.field}
                  </h4>
                  {f.must_verify && (
                    <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-body">
                      Must verify
                    </span>
                  )}
                </div>
                {f.sources && f.sources.length > 0 && (
                  <p className="text-sm text-muted-foreground font-body mb-2">
                    Sources: {f.sources.join(", ")}
                  </p>
                )}
                {f.verification_method && (
                  <p className="text-sm font-body text-foreground">
                    Verification: {f.verification_method}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {forSegmentation.length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Required for Segmentation"
            icon={<FontAwesomeIcon icon={faChartPie} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-4">
            {forSegmentation.map((f, i) => (
              <ContentCard key={i} title={f.field ?? `Field ${i + 1}`}>
                <div className="space-y-2">
                  {f.usage && (
                    <p className="text-sm font-body text-foreground">
                      <span className="font-medium text-muted-foreground">Usage:</span> {f.usage}
                    </p>
                  )}
                  {f.sources && f.sources.length > 0 && (
                    <p className="text-sm text-muted-foreground font-body">
                      Sources: {f.sources.join(", ")}
                    </p>
                  )}
                  {f.acceptable_proxy && (
                    <p className="text-sm text-muted-foreground font-body italic">
                      Proxy: {f.acceptable_proxy}
                    </p>
                  )}
                </div>
              </ContentCard>
            ))}
          </div>
        </div>
      )}

      {niceToHave.length > 0 && (
        <div>
          <BlockHeader
            variant="title"
            title="Nice to Have for Personalization"
            icon={<FontAwesomeIcon icon={faStar} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-4">
            {niceToHave.map((f, i) => (
              <div
                key={i}
                className="bg-muted/30 rounded-xl border border-border p-6"
              >
                <h4 className="font-display font-semibold text-foreground mb-2">
                  {f.field}
                </h4>
                {f.usage && (
                  <p className="text-sm font-body text-foreground mb-2">{f.usage}</p>
                )}
                {f.impact && (
                  <p className="text-xs text-muted-foreground font-body">
                    Impact: {f.impact}
                  </p>
                )}
                {f.sources && f.sources.length > 0 && (
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    Sources: {f.sources.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};
