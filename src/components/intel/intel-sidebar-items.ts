import {
  faHome,
  faBook,
  faFolder,
  faFileText,
  faPlay,
  faFileAlt,
  faGear,
  faSitemap,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import type { SidebarItem } from "@/components/admin/layout/sidebar/types";

export const INTEL_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/intel/dashboard",
    icon: faHome,
    section: "overview",
  },
  {
    title: "Projects",
    href: "/intel/projects",
    icon: faFolder,
    section: "overview",
  },
  {
    title: "Knowledge Bases",
    href: "/intel/knowledge-bases",
    icon: faBook,
    section: "admin",
  },
  {
    title: "Documents",
    href: "/intel/documents",
    icon: faFileText,
    section: "overview",
  },
  {
    title: "Project Types",
    href: "/intel/project-types",
    icon: faTag,
    section: "admin",
  },
  {
    title: "Workflows",
    href: "/intel/workflows",
    icon: faSitemap,
    section: "admin",
  },
  {
    title: "Research Reports",
    href: "/intel/research-reports",
    icon: faFileAlt,
    section: "overview",
  },
  {
    title: "Settings",
    href: "/intel/settings",
    icon: faGear,
    section: "settings",
  },
];

