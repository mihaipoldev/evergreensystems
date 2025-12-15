export type Result = {
  id: string;
  content: Record<string, any>; // JSONB content
  position: number;
  created_at: string;
  updated_at: string;
};

export type SectionResult = {
  id: string;
  section_id: string;
  result_id: string;
  position: number;
  created_at: string;
};

export type ResultWithSection = Result & {
  section_result: {
    id: string;
    position: number;
    created_at: string;
  };
};
