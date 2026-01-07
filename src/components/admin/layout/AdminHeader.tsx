"use client";

import { useState } from "react";
import { SidebarTrigger } from "./sidebar/SidebarTrigger";
import { ThemeToggle } from "@/components/admin/styling/ThemeToggle";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { IntelPageTitle } from "@/components/intel/IntelPageTitle";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPlus, faBook, faFolder, faChartLine, faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { KnowledgeBaseModal } from "@/features/rag/knowledge-bases/components/KnowledgeBaseModal";
import { ProjectModal } from "@/features/rag/projects/components/ProjectModal";

export function AdminHeader() {
  const mountStartTime = useRef<number>(getTimestamp());
  const pathname = usePathname();
  const router = useRouter();
  const isIntelRoute = pathname?.startsWith("/intel") ?? false;
  const [isKnowledgeBaseModalOpen, setIsKnowledgeBaseModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  useEffect(() => {
    const mountDuration = getDuration(mountStartTime.current);
    debugClientTiming("AdminHeader", "Mount", mountDuration);
  }, []);

  // Refresh function for modals - will trigger a router refresh
  const handleRefresh = () => {
    router.refresh();
  };
  
  return (
    <header className={cn(
      "ml-0 md:ml-64 fixed top-0 left-0 right-0 z-50 flex h-[40px] md:h-[81px] items-center gap-2 bg-background",
      isIntelRoute ? "px-4 md:px-6 lg:px-8" : "px-4 md:px-10 lg:px-12 border-b border-border/50"
    )}>
      <div className="flex items-center gap-2 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {isIntelRoute ? <IntelPageTitle /> : <AdminBreadcrumb />}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isIntelRoute && (
            <ActionMenu
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-muted/50"
                >
                  <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-200 hover:bg-primary/90">
                    <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                  </div>
                </Button>
              }
              items={[
                {
                  label: "New Knowledge Base",
                  icon: <FontAwesomeIcon icon={faBook} className="h-4 w-4" />,
                  onClick: () => setIsKnowledgeBaseModalOpen(true),
                },
                {
                  label: "New Project",
                  icon: <FontAwesomeIcon icon={faFolder} className="h-4 w-4" />,
                  onClick: () => setIsProjectModalOpen(true),
                },
                { separator: true },
                {
                  label: "Generate Report",
                  icon: <FontAwesomeIcon icon={faChartLine} className="h-4 w-4" />,
                  onClick: () => {},
                },
              ]}
              align="end"
              width="w-56"
            />
          )}
          <ActionMenu
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-muted/50"
              >
                <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: isIntelRoute ? "Admin" : "Intelligence",
                icon: <FontAwesomeIcon icon={faArrowRightArrowLeft} className="h-4 w-4" />,
                href: isIntelRoute ? "/admin" : "/intel",
              },
            ]}
            align="end"
            width="w-48"
          />
        </div>
      </div>
      
      {/* Modals for Intel routes */}
      {isIntelRoute && (
        <>
          <KnowledgeBaseModal
            open={isKnowledgeBaseModalOpen}
            onOpenChange={setIsKnowledgeBaseModalOpen}
            onSuccess={handleRefresh}
          />
          <ProjectModal
            open={isProjectModalOpen}
            onOpenChange={setIsProjectModalOpen}
            onSuccess={handleRefresh}
          />
        </>
      )}
    </header>
  );
}

