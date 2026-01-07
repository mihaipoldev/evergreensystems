import {
  faChartLine,
  faSitemap,
  faImages,
  faShareAlt,
  faLaptopCode,
  faMousePointer,
  faQuestionCircle,
  faStar,
  faTrophy,
  faQuoteLeft,
  faClock,
  faGear,
  faGlobe,
  faRightLeft,
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
    title: "Site Structure",
    href: "/admin/site-structure",
    icon: faSitemap,
    section: "pageBuilder",
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: faImages,
    section: "database",
  },
  {
    title: "Social Platforms",
    href: "/admin/social-platforms",
    icon: faShareAlt,
    section: "database",
  },
  {
    title: "Softwares",
    href: "/admin/softwares",
    icon: faLaptopCode,
    section: "database",
  },
  {
    title: "CTAs",
    href: "/admin/cta",
    icon: faMousePointer,
    section: "database",
  },
  {
    title: "FAQ",
    href: "/admin/faq",
    icon: faQuestionCircle,
    section: "database",
  },
  {
    title: "Features",
    href: "/admin/features",
    icon: faStar,
    section: "database",
  },
  {
    title: "Results",
    href: "/admin/results",
    icon: faTrophy,
    section: "database",
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: faQuoteLeft,
    section: "database",
  },
  {
    title: "Timeline",
    href: "/admin/timeline",
    icon: faClock,
    section: "database",
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

