import {
  faChartLine,
  faImages,
  faGear,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import type { SidebarItem } from "./types";

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: faChartLine,
    section: "overview",
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: faImages,
    section: "overview",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: faGear,
    section: "settings",
  },
  {
    title: "Website Settings",
    href: "/admin/website-settings",
    icon: faGlobe,
    section: "settings",
  },
];

