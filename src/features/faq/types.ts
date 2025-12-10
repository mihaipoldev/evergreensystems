export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  position: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};
