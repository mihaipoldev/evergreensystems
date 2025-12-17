import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";

type AdminPageTitleProps = {
  title: string | ReactNode;
  entityName?: string;
  description?: string | ReactNode;
  entityType?: "album" | "event" | "update";
  rightSideContent?: ReactNode;
  icon?: IconDefinition | ReactNode;
};

const getEntityTypeBadge = (type?: "album" | "event" | "update") => {
  if (!type) return null;

  const badgeConfig = {
    album: { label: "Album", className: "text-blue-500 border-blue-500 bg-blue-500/10" },
    event: { label: "Event", className: "text-orange-500 border-orange-500 bg-orange-500/10" },
    update: { label: "Update", className: "text-emerald-500 border-emerald-500 bg-emerald-500/10" },
  };

  const config = badgeConfig[type];
  return (
    <Badge variant="outline" className={cn("ml-3 text-xs font-semibold", config.className)}>
      {config.label}
    </Badge>
  );
};

export function AdminPageTitle({
  title,
  entityName,
  description,
  entityType,
  rightSideContent,
  icon,
}: AdminPageTitleProps) {
  if (entityName) {
    return (
      <div>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-4xl font-bold text-foreground">
            {entityName} <span className="text-muted-foreground text-base font-normal">EDIT</span>
          </h1>
          {rightSideContent && <div className="flex items-center">{rightSideContent}</div>}
        </div>
        {description && <p className="text-muted-foreground mt-2 text-base">{description}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-primary">
              {typeof icon === "object" && "iconName" in (icon as any) ? (
                <FontAwesomeIcon icon={icon as IconDefinition} className="h-8 w-8" />
              ) : (
                <>{icon}</>
              )}
            </div>
          )}
          <div className="flex items-baseline">
            <h1 className="text-4xl font-bold text-foreground">{title}</h1>
            {getEntityTypeBadge(entityType)}
          </div>
        </div>
        {rightSideContent && <div className="flex items-center">{rightSideContent}</div>}
      </div>
      {description && <p className="text-muted-foreground mt-2 text-base">{description}</p>}
    </div>
  );
}
