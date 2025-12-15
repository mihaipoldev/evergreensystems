import { cn } from "@/lib/utils";

type PageSectionStatus = "published" | "draft" | "deactivated";

type PageSectionStatusBadgeProps = {
  status: PageSectionStatus;
  className?: string;
};

export function PageSectionStatusBadge({ status, className }: PageSectionStatusBadgeProps) {
  const statusConfig = {
    published: {
      label: "Published",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    },
    draft: {
      label: "Draft",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    },
    deactivated: {
      label: "Deactivated",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
