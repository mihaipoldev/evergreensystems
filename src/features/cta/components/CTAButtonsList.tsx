"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdminTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/admin/AdminTable";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMousePointer, faLink } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";
import { cn } from "@/lib/utils";
import type { CTAButton } from "../types";

type CTAButtonsListProps = {
  initialCTAButtons: CTAButton[];
};

export function CTAButtonsList({ initialCTAButtons }: CTAButtonsListProps) {
  const [ctaButtons, setCTAButtons] = useState<CTAButton[]>(initialCTAButtons);
  const [searchQuery, setSearchQuery] = useState("");
  const [clickedRowId, setClickedRowId] = useState<string | null>(null);
  const router = useRouter();
  const { startNavigation } = useNavigationLoading();

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/cta-buttons/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete CTA button");
      }

      toast.success("CTA button deleted successfully");
      setCTAButtons(ctaButtons.filter((btn) => btn.id !== id));
    } catch (error: any) {
      console.error("Error deleting CTA button:", error);
      toast.error(error.message || "Failed to delete CTA button");
      throw error;
    }
  };

  const filteredCTAButtons = ctaButtons.filter((button) => {
    const query = searchQuery.toLowerCase();
    return (
      button.label.toLowerCase().includes(query) ||
      button.url.toLowerCase().includes(query) ||
      button.style?.toLowerCase().includes(query) ||
      button.icon?.toLowerCase().includes(query)
    );
  });

  const handleRowClick = (buttonId: string, e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't navigate if clicking on action menu or its children
    const target = e.target as HTMLElement;
    if (target.closest('[data-action-menu]')) {
      return;
    }
    setClickedRowId(buttonId);
    const path = `/admin/cta/${buttonId}/edit`;
    startNavigation(path);
    router.push(path);
  };

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground leading-none">CTA Buttons</h1>
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
              ({filteredCTAButtons.length} {filteredCTAButtons.length === 1 ? "button" : "buttons"})
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Manage call-to-action buttons.
          </p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search CTA buttons..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New CTA Button"
          >
            <Link href="/admin/cta/new">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        <AdminTable>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b">
              <TableHead className="pl-4 w-20 font-bold">Icon</TableHead>
              <TableHead className="font-bold">Label</TableHead>
              <TableHead className="font-bold">URL</TableHead>
              <TableHead className="font-bold w-28">Status</TableHead>
              <TableHead className="text-right pr-4 w-24 font-bold" style={{ textAlign: "right" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCTAButtons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {searchQuery
                    ? "No CTA buttons found matching your search"
                    : "No CTA buttons found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCTAButtons.map((button) => (
                <Fragment key={button.id}>
                  {/* Mobile Layout */}
                  <TableRow
                    key={`${button.id}-mobile`}
                    className={cn(
                      "md:hidden group cursor-pointer hover:bg-muted/50 border-b border-border/50 transition-all duration-150",
                      clickedRowId === button.id && "bg-primary/5"
                    )}
                    onClick={(e) => handleRowClick(button.id, e)}
                  >
                    <TableCell className="px-3 md:pl-4 md:pr-4 py-4" colSpan={4}>
                      <div className={cn(
                        "flex items-start gap-3 md:gap-4 transition-transform duration-150",
                        clickedRowId === button.id && "scale-[0.99]"
                      )}>
                        <div className={cn(
                          "h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 transition-all duration-150",
                          clickedRowId === button.id ? "bg-primary/10 ring ring-primary/20" : "bg-muted"
                        )}>
                          <FontAwesomeIcon
                            icon={button.icon ? (button.icon as any) : faMousePointer}
                            className={cn(
                              "h-5 w-5 transition-colors duration-150",
                              clickedRowId === button.id ? "text-primary/70" : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base mb-1.5 break-words">
                            {button.label}
                          </div>
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                            <span className="truncate">{button.url}</span>
                          </div>
                          {button.style && (
                            <div className="text-xs text-muted-foreground mb-1">
                              Style: {button.style}
                            </div>
                          )}
                          <div className="mt-2">
                            <Badge
                              variant={button.status === "active" ? "default" : "outline"}
                              className="text-xs font-semibold"
                            >
                              {button.status === "active" ? "Active" : "Deactivated"}
                            </Badge>
                          </div>
                        </div>
                        <div 
                          className="flex-shrink-0 ml-2" 
                          data-action-menu
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionMenu
                            itemId={button.id}
                            editHref={`/admin/cta/${button.id}/edit`}
                            onDelete={handleDelete}
                            deleteLabel={`CTA button "${button.label}"`}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Desktop Layout */}
                  <TableRow
                    key={`${button.id}-desktop`}
                    className={cn(
                      "table-row-responsive group cursor-pointer hover:bg-muted/50 transition-all duration-150",
                      clickedRowId === button.id && "bg-primary/5"
                    )}
                    onClick={(e) => handleRowClick(button.id, e)}
                  >
                    <TableCell className="pl-4 w-20">
                      <div className={cn(
                        "h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md transition-all duration-150",
                        clickedRowId === button.id ? "bg-primary/10 ring ring-primary/20 scale-[0.99]" : "bg-muted"
                      )}>
                        <FontAwesomeIcon
                          icon={button.icon ? (button.icon as any) : faMousePointer}
                          className={cn(
                            "h-5 w-5 transition-colors duration-150",
                            clickedRowId === button.id ? "text-primary/70" : "text-muted-foreground"
                          )}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      <span className="truncate block" title={button.label}>
                        {button.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                        <span className="truncate max-w-[200px]" title={button.url}>
                          {button.url}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-28">
                      <Badge
                        variant={button.status === "active" ? "default" : "outline"}
                        className="text-xs font-semibold"
                      >
                        {button.status === "active" ? "Active" : "Deactivated"}
                      </Badge>
                    </TableCell>
                    <TableCell 
                      className="text-right pr-4 w-24" 
                      data-action-menu 
                      style={{ textAlign: "right" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex ml-auto">
                        <ActionMenu
                          itemId={button.id}
                          editHref={`/admin/cta/${button.id}/edit`}
                          onDelete={handleDelete}
                          deleteLabel={`CTA button "${button.label}"`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))
            )}
          </TableBody>
        </AdminTable>
      </div>
    </div>
  );
}
