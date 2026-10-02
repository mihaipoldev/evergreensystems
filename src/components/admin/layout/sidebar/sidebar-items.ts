import {
  faChartLine,
  faGear,
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
    title: "Settings",
    href: "/admin/settings",
    icon: faGear,
    section: "settings",
  },
];

