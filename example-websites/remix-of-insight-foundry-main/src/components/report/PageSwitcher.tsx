import { useLocation, useNavigate } from "react-router-dom";
import { FileText, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const pages = [
  {
    path: "/",
    label: "Intelligence Report",
    icon: FileText,
    description: "Full niche analysis",
  },
  {
    path: "/evaluation",
    label: "Evaluation Report",
    icon: ClipboardCheck,
    description: "Quick assessment",
  },
];

export const PageSwitcher = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <h2 className="text-xs uppercase tracking-widest text-sidebar-foreground/60 mb-4 font-body">
        Reports
      </h2>
      <div className="space-y-2">
        {pages.map((page) => {
          const Icon = page.icon;
          const isActive = location.pathname === page.path;

          return (
            <button
              key={page.path}
              onClick={() => navigate(page.path)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group flex items-start gap-3",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 mt-0.5",
                  isActive ? "text-sidebar-primary-foreground" : "text-sidebar-primary"
                )}
              />
              <div>
                <span className="text-sm font-body font-medium block leading-tight">
                  {page.label}
                </span>
                <span
                  className={cn(
                    "text-xs font-body",
                    isActive ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/50"
                  )}
                >
                  {page.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 w-full h-px bg-sidebar-border" />
    </div>
  );
};
