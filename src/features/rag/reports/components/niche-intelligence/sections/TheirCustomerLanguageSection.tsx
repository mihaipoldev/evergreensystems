"use client";

import { SectionWrapper, TagCloud, ContentCard } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faExclamationCircle,
  faCheckCircle,
  faAward,
} from "@fortawesome/free-solid-svg-icons";

interface TheirCustomerLanguage {
  industry_jargon?: string[];
  pain_language?: string[];
  benefit_language?: string[];
  proof_language?: string[];
}

interface TheirCustomerLanguageSectionProps {
  data: TheirCustomerLanguage;
  sectionNumber?: string;
}

const BulletList = ({ items, bulletClassName = "bg-muted-foreground" }: { items: string[]; bulletClassName?: string }) => (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li
        key={index}
        className="flex items-start gap-2 text-sm font-body text-foreground"
      >
        <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${bulletClassName}`} />
        {item}
      </li>
    ))}
  </ul>
);

export const TheirCustomerLanguageSection = ({
  data,
  sectionNumber = "15",
}: TheirCustomerLanguageSectionProps) => {
  return (
    <SectionWrapper
      id="their-customer-language"
      number={sectionNumber}
      title="Their Customer Language"
      subtitle="Industry vocabulary, pain language, and proof elements for copywriting"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.industry_jargon && data.industry_jargon.length > 0 && (
          <ContentCard
            variant="default"
            title="Industry Jargon"
            titleVariant="title"
            icon={<FontAwesomeIcon icon={faBook} className="w-5 h-5 text-accent" />}
            subtitle="Key terms and acronyms used in this industry"
          >
            <TagCloud tags={data.industry_jargon} variant="outline" />
          </ContentCard>
        )}

        {data.pain_language && data.pain_language.length > 0 && (
          <ContentCard
            variant="warning"
            title="Pain Language"
            titleVariant="title"
            icon={<FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            subtitle="How they describe their challenges and frustrations"
          >
            <BulletList items={data.pain_language} bulletClassName="bg-amber-500 dark:bg-amber-400" />
          </ContentCard>
        )}

        {data.benefit_language && data.benefit_language.length > 0 && (
          <ContentCard
            variant="success"
            title="Benefit Language"
            titleVariant="title"
            icon={<FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600 dark:text-green-400" />}
            subtitle="Outcomes and improvements they seek"
          >
            <BulletList items={data.benefit_language} bulletClassName="bg-green-500 dark:bg-green-400" />
          </ContentCard>
        )}

        {data.proof_language && data.proof_language.length > 0 && (
          <ContentCard
            variant="accent"
            title="Proof Language"
            titleVariant="title"
            icon={<FontAwesomeIcon icon={faAward} className="w-5 h-5 text-accent" />}
            subtitle="Credibility markers and trust signals"
          >
            <BulletList items={data.proof_language} bulletClassName="bg-accent" />
          </ContentCard>
        )}
      </div>
    </SectionWrapper>
  );
};
