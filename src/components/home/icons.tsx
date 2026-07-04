// Icon resolver for the homepage. Lucide icons for the generic set; an inline
// SVG for the LinkedIn brand mark (matches the prototype's path exactly).
import {
  ShieldCheck,
  Server,
  UserRound,
  Zap,
  Clock,
  ArrowRight,
  Mail,
  Calendar,
  Check,
  CheckCircle2,
  CalendarCheck,
  Search,
  Newspaper,
  Calculator,
  BarChart3,
  GraduationCap,
  MessageSquare,
  NotebookPen,
  User,
  BookOpen,
  X,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/features/home/types";

const LUCIDE: Record<Exclude<IconName, "linkedin">, React.ComponentType<LucideProps>> = {
  "shield-check": ShieldCheck,
  server: Server,
  "user-round": UserRound,
  zap: Zap,
  clock: Clock,
  "arrow-right": ArrowRight,
  mail: Mail,
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  check: Check,
  "check-circle-2": CheckCircle2,
  search: Search,
  newspaper: Newspaper,
  calculator: Calculator,
  "bar-chart": BarChart3,
  "graduation-cap": GraduationCap,
  "message-square": MessageSquare,
  "notebook-pen": NotebookPen,
  user: User,
  "book-open": BookOpen,
  x: X,
};

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.22 8.02h4.56V24H.22V8.02zM8.34 8.02h4.37v2.18h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V24h-4.56v-7.08c0-1.69-.03-3.86-2.35-3.86-2.35 0-2.71 1.84-2.71 3.74V24H8.34V8.02z" />
    </svg>
  );
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  if (name === "linkedin") return <LinkedInIcon className={className} />;
  const Cmp = LUCIDE[name];
  return <Cmp className={className} />;
}
