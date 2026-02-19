"use client";

import { useState, useEffect, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import {
  getStoredCollapsibleState,
  setStoredCollapsibleState,
  getReportGroupId,
} from "@/lib/collapsible-persistence";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface ReportCollapsibleCardProps {
  id: string;
  title: string | ReactNode;
  children: ReactNode;
  reportId: string;
  defaultOpen?: boolean;
  triggerClassName?: string;
  icon?: ReactNode;
}

export function ReportCollapsibleCard({
  id,
  title,
  children,
  reportId,
  defaultOpen = false,
  triggerClassName = "",
  icon,
}: ReportCollapsibleCardProps) {
  const groupId = getReportGroupId(reportId, id);
  const [open, setOpen] = useState(() => getStoredCollapsibleState(groupId, defaultOpen));

  useEffect(() => {
    setStoredCollapsibleState(groupId, open);
  }, [groupId, open]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            className={`w-full flex items-center justify-between p-4 md:p-6 transition-colors text-left hover:bg-muted/20 rounded-t-lg ${triggerClassName}`}
            aria-expanded={open}
          >
            <div className="flex items-center gap-3">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              {typeof title === "string" ? (
                <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
              ) : (
                title
              )}
            </div>
            <FontAwesomeIcon
              icon={open ? faChevronUp : faChevronDown}
              className="w-4 h-4 text-muted-foreground flex-shrink-0"
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 border-t border-border">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
