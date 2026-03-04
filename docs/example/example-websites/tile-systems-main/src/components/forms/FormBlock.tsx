import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormBlockProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormBlock({ label, hint, required, children, className }: FormBlockProps) {
  return (
    <div className={cn("space-y-2 p-4 rounded-lg bg-secondary/30 border border-border/50", className)}>
      <div className="flex items-baseline gap-1">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {required && <span className="text-destructive text-xs">*</span>}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface FormSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function FormSection({ title, children, className, collapsible, defaultOpen = true }: FormSectionProps) {
  if (collapsible) {
    return (
      <details open={defaultOpen} className={cn("group", className)}>
        <summary className="cursor-pointer list-none flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 select-none">
          <span className="transition-transform group-open:rotate-90">▶</span>
          {title}
        </summary>
        <div className="space-y-3">{children}</div>
      </details>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
      )}
      {children}
    </div>
  );
}
