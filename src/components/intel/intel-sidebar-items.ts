import {
  faHome,
  faBook,
  faFolder,
  faFileText,
  faPlay,
  faFileAlt,
  faGear,
  faRightLeft,
  faSearch,
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
    title: "Knowledge Bases",
    href: "/intel/knowledge-bases",
    icon: faBook,
    section: "overview",
  },
  {
    title: "Projects",
    href: "/intel/projects",
    icon: faFolder,
    section: "overview",
  },
  {
    title: "Documents",
    href: "/intel/documents",
    icon: faFileText,
    section: "overview",
  },
  {
    title: "Research",
    href: "/intel/research",
    icon: faSearch,
    section: "overview",
  },
  {
    title: "Subject Types",
    href: "/intel/subject-types",
    icon: faTag,
    section: "overview",
  },
  {
    title: "Workflows",
    href: "/intel/workflows",
    icon: faSitemap,
    section: "overview",
  },
  {
    title: "Runs",
    href: "/intel/runs",
    icon: faPlay,
    section: "overview",
  },
  {
    title: "Reports",
    href: "/intel/reports",
    icon: faFileAlt,
    section: "overview",
  },
  {
    title: "Admin",
    href: "/admin",
    icon: faRightLeft,
    section: "settings",
  },
  {
    title: "Settings",
    href: "/intel/settings",
    icon: faGear,
    section: "settings",
  },
];

