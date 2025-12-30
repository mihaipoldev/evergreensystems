"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ItemBase = {
  id: string;
};

type CardListContainerProps<T extends ItemBase> = {
  items: T[];
  renderContent: (item: T) => ReactNode;
  renderActions?: (item: T) => ReactNode;
  className?: string;
};

function Card<T extends ItemBase>({ item, children, renderActions }: { item: T; children: ReactNode; renderActions?: (item: T) => ReactNode }) {
  return (
    <div className="relative flex items-stretch gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-md">
      <div className="flex-1 min-w-0">{children}</div>
      {renderActions ? (
        <div className="flex-shrink-0 self-stretch flex items-start">{renderActions(item)}</div>
      ) : null}
    </div>
  );
}

export function CardListContainer<T extends ItemBase>({
  items,
  renderContent,
  renderActions,
  className,
}: CardListContainerProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <Card key={item.id} item={item} renderActions={renderActions}>
          {renderContent(item)}
        </Card>
      ))}
    </div>
  );
}

