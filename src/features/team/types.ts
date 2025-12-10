export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar_url?: string;
  bio?: string;
  visible_on_landing: boolean;
  display_color?: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TeamMemberFormData = Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>;

