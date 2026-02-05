"use client";

import { ReactNode } from "react";

export interface PageTitleProps {
  icon?: ReactNode;
  title: ReactNode;
  titleActions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}

export function PageTitle({
  icon,
  title,
  titleActions,
  meta,
  className = "",
}: PageTitleProps) {
  return (
    <div className={`${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2 min-w-0 min-h-[40px]">
            <h1 className="text-lg md:text-3xl font-bold text-foreground flex items-center gap-2 leading-tight truncate">
              {icon && <span className="shrink-0">{icon}</span>}
              <span className="truncate">{title}</span>
            </h1>
            {titleActions}
          </div>
        </div>
      </div>

      {meta && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground min-w-0 mt-1">
          {meta}
        </div>
      )}
    </div>
  );
}
