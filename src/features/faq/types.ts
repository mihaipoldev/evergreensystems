export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type SectionFAQItem = {
  id: string;
  section_id: string;
  faq_item_id: string;
  position: number;
  created_at: string;
};

export type FAQItemWithSection = FAQItem & {
  section_faq_item: {
    id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};
