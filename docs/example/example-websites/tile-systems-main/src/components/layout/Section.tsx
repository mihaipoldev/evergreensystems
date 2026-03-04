import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface SectionProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, action, children, className = "" }: SectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {action.label}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
