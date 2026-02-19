"use client";

import {
  SectionWrapper,
  BlockHeader,
  NumberedCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWater,
  faCheckCircle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

type EnrichmentField = {
  field?: string;
  sources?: string[];
  must_verify?: boolean;
  verification_method?: string | null;
  usage?: string;
};

type EnrichmentRequirements = {
  description?: string;
  enrichment_waterfall?: string[];
  required?: EnrichmentField[];
  optional?: EnrichmentField[];
};

interface EnrichmentRequirementsSectionProps {
  enrichmentRequirements: EnrichmentRequirements;
  sectionNumber?: string;
}

export const EnrichmentRequirementsSection = ({
  enrichmentRequirements,
  sectionNumber = "03",
}: EnrichmentRequirementsSectionProps) => {
  const waterfall = enrichmentRequirements?.enrichment_waterfall ?? [];
  const required = enrichmentRequirements?.required ?? [];
  const optional = enrichmentRequirements?.optional ?? [];

  return (
    <SectionWrapper
      id="enrichment-requirements"
      number={sectionNumber}
      title="Enrichment Requirements"
      subtitle={enrichmentRequirements?.description || undefined}
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

      {required.length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Required Fields"
            icon={<FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600" />}
          />
          <div className="space-y-4">
            {required.map((f, i) => (
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
                {f.verification_method && f.verification_method !== "N/A" && (
                  <p className="text-sm font-body text-foreground">
                    Verification: {f.verification_method}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {optional.length > 0 && (
        <div>
          <BlockHeader
            variant="title"
            title="Optional Fields"
            icon={<FontAwesomeIcon icon={faStar} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-4">
            {optional.map((f, i) => (
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
