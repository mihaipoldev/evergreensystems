import { useState } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { ProjectTile } from "@/components/tiles/ProjectTile";
import { ProjectForm } from "@/components/forms/ProjectForm";
const projects = [
  { id: "1", name: "Q1 Product Launch", status: "active" as const, knowledgeBase: "Product Docs", documentCount: 23, lastUpdated: "1h ago" },
  { id: "2", name: "Customer Insights Analysis", status: "pending" as const, knowledgeBase: "Support Files", documentCount: 67, lastUpdated: "3h ago" },
  { id: "3", name: "Legacy System Migration", status: "archived" as const, documentCount: 145, lastUpdated: "2d ago" },
  { id: "4", name: "Brand Guidelines Update", status: "active" as const, knowledgeBase: "Marketing Assets", documentCount: 34, lastUpdated: "4h ago" },
  { id: "5", name: "API v3 Documentation", status: "active" as const, knowledgeBase: "API Reference", documentCount: 89, lastUpdated: "6h ago" },
  { id: "6", name: "User Research Q4", status: "pending" as const, knowledgeBase: "User Research DB", documentCount: 56, lastUpdated: "1d ago" },
  { id: "7", name: "Compliance Review", status: "pending" as const, knowledgeBase: "Legal Documents", documentCount: 28, lastUpdated: "2d ago" },
  { id: "8", name: "Feature Spec: Search", status: "active" as const, knowledgeBase: "Engineering Specs", documentCount: 12, lastUpdated: "5h ago" },
];

const filters = [
  { id: "all", label: "All", active: true },
  { id: "active", label: "Active", active: false },
  { id: "pending", label: "Pending", active: false },
  { id: "archived", label: "Archived", active: false },
];

export default function Projects() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState(filters);
  const [formOpen, setFormOpen] = useState(false);

  const handleFilterClick = (id: string) => {
    setActiveFilters(prev => 
      prev.map(f => ({ ...f, active: f.id === id }))
    );
  };

  const filteredProjects = projects.filter(project => {
    const activeFilter = activeFilters.find(f => f.active)?.id;
    const matchesFilter = activeFilter === "all" || project.status === activeFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchValue.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Toolbar
        searchPlaceholder="Search projects..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={activeFilters}
        onFilterClick={handleFilterClick}
        onNewClick={() => setFormOpen(true)}
        newLabel="New Project"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ProjectForm open={formOpen} onOpenChange={setFormOpen} />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Organize your work into focused projects</p>
        </div>

        <div className={viewMode === "grid" ? "tile-grid" : "tile-list"}>
          {filteredProjects.map((project) => (
            <ProjectTile
              key={project.id}
              {...project}
              variant={viewMode}
              onEdit={() => {}}
              onDuplicate={() => {}}
              onArchive={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
