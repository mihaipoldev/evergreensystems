"use client";

import { PropsWithChildren, ReactNode, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

type SortableItemBase = {
  id: string;
  position?: number;
};

type SortableCardListProps<T extends SortableItemBase> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderContent: (item: T) => ReactNode;
  renderActions?: (item: T) => ReactNode;
  className?: string;
};

type SortableCardProps<T extends SortableItemBase> = PropsWithChildren<{
  item: T;
  renderActions?: (item: T) => ReactNode;
}>;

function SortableCard<T extends SortableItemBase>({ item, children, renderActions }: SortableCardProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "transform 0s" : transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-stretch gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all",
        isDragging ? "ring-2 ring-primary/40 shadow-lg bg-card/80" : "hover:shadow-md"
      )}
    >
      <button
        type="button"
        className="self-center my-auto h-10 w-10 flex-shrink-0 rounded-lg text-muted-foreground flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors touch-none"
        style={{ touchAction: "none" }}
        {...attributes}
        {...listeners}
      >
        <FontAwesomeIcon icon={faGripVertical} className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
      {renderActions ? (
        <div className="flex-shrink-0 self-stretch flex items-start">{renderActions(item)}</div>
      ) : null}
    </div>
  );
}

export function SortableCardList<T extends SortableItemBase>({
  items,
  onReorder,
  renderContent,
  renderActions,
  className,
}: SortableCardListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeItem = useMemo(() => items.find((item) => item.id === activeId) || null, [activeId, items]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Prevent body scroll during drag on mobile
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // Restore body scroll
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    setActiveId(null);
    
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const newOrder = arrayMove(items, oldIndex, newIndex);
    onReorder(
      newOrder.map((item, index) => ({
        ...item,
        position: index,
      }))
    );
  };

  // Render static list during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((item) => (
          <div
            key={item.id}
            className="relative flex items-stretch gap-4 rounded-xl border border-border/60 bg-card p-4"
          >
            <div className="self-center my-auto h-10 w-10 flex-shrink-0 rounded-lg text-muted-foreground flex items-center justify-center">
              <FontAwesomeIcon icon={faGripVertical} className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">{renderContent(item)}</div>
            {renderActions ? (
              <div className="flex-shrink-0 self-stretch flex items-start">{renderActions(item)}</div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        setActiveId(null);
      }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-3", className)}>
          {items.map((item) => (
            <SortableCard key={item.id} item={item} renderActions={renderActions}>
              {renderContent(item)}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div className="pointer-events-none">
            <div className="relative flex items-stretch gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-xl ring-2 ring-primary/40">
              <div className="self-center my-auto h-10 w-10 flex-shrink-0 rounded-lg text-muted-foreground flex items-center justify-center">
                <FontAwesomeIcon icon={faGripVertical} className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">{renderContent(activeItem)}</div>
              {renderActions ? (
                <div className="flex-shrink-0 self-stretch flex items-start">{renderActions(activeItem)}</div>
              ) : null}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
