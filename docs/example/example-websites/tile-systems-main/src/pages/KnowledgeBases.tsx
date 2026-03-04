import { useState } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { KnowledgeBaseTile } from "@/components/tiles/KnowledgeBaseTile";
import { KnowledgeBaseForm } from "@/components/forms/KnowledgeBaseForm";

const knowledgeBases = [
  { id: "1", name: "Product Documentation", type: "docs" as const, documentCount: 45, chunkCount: 2340, lastUpdated: "2h ago" },
  { id: "2", name: "Customer Support Files", type: "files" as const, documentCount: 128, chunkCount: 8920, lastUpdated: "5h ago" },
  { id: "3", name: "Analytics Database", type: "database" as const, documentCount: 12, chunkCount: 1560, lastUpdated: "1d ago" },
  { id: "4", name: "Engineering Specs", type: "docs" as const, documentCount: 89, chunkCount: 4230, lastUpdated: "3h ago" },
  { id: "5", name: "Marketing Assets", type: "files" as const, documentCount: 234, chunkCount: 12340, lastUpdated: "6h ago" },
  { id: "6", name: "User Research DB", type: "database" as const, documentCount: 56, chunkCount: 3890, lastUpdated: "12h ago" },
  { id: "7", name: "API Reference", type: "docs" as const, documentCount: 167, chunkCount: 8450, lastUpdated: "1d ago" },
  { id: "8", name: "Legal Documents", type: "files" as const, documentCount: 43, chunkCount: 2100, lastUpdated: "2d ago" },
];

const filters = [
  { id: "all", label: "All", active: true },
  { id: "docs", label: "Documentation", active: false },
  { id: "files", label: "Files", active: false },
  { id: "database", label: "Database", active: false },
];

export default function KnowledgeBases() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState(filters);
  const [formOpen, setFormOpen] = useState(false);

  const handleFilterClick = (id: string) => {
    setActiveFilters(prev => 
      prev.map(f => ({ ...f, active: f.id === id }))
    );
  };

  const filteredKBs = knowledgeBases.filter(kb => {
    const activeFilter = activeFilters.find(f => f.active)?.id;
    const matchesFilter = activeFilter === "all" || kb.type === activeFilter;
    const matchesSearch = kb.name.toLowerCase().includes(searchValue.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Toolbar
        searchPlaceholder="Search knowledge bases..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={activeFilters}
        onFilterClick={handleFilterClick}
        onNewClick={() => setFormOpen(true)}
        newLabel="New KB"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <KnowledgeBaseForm open={formOpen} onOpenChange={setFormOpen} />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Bases</h1>
          <p className="text-muted-foreground">Manage your knowledge repositories</p>
        </div>

        <div className={viewMode === "grid" ? "tile-grid" : "tile-list"}>
          {filteredKBs.map((kb) => (
            <KnowledgeBaseTile
              key={kb.id}
              {...kb}
              variant={viewMode}
              onEdit={() => {}}
              onDuplicate={() => {}}
              onArchive={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>

        {filteredKBs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No knowledge bases found</p>
          </div>
        )}
      </div>
    </div>
  );
}
