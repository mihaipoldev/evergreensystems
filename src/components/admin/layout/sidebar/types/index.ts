import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type SidebarSection = 'overview' | 'settings';

export type SidebarItem = {
  title: string;
  href: string;
  icon: IconDefinition;
  section: SidebarSection;
};

export type SidebarUser = {
  email: string | null;
  name: string | null;
};

