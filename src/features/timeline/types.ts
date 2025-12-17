export type Timeline = {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type SectionTimeline = {
  id: string;
  section_id: string;
  timeline_id: string;
  position: number;
  created_at: string;
};

export type TimelineWithSection = Timeline & {
  section_timeline: {
    id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};
