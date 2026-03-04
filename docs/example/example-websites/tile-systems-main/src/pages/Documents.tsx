import { useState } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { DocumentTile } from "@/components/tiles/DocumentTile";
import { DocumentForm } from "@/components/forms/DocumentForm";
const documents = [
  { id: "1", name: "Getting Started Guide.md", source: "github", status: "processed" as const, chunkCount: 24, knowledgeBase: "Product Docs", lastUpdated: "1h ago" },
  { id: "2", name: "API Authentication.md", source: "notion", status: "processed" as const, chunkCount: 18, knowledgeBase: "API Reference", lastUpdated: "2h ago" },
  { id: "3", name: "Customer Feedback Q4.pdf", source: "upload", status: "processing" as const, chunkCount: 0, project: "Customer Insights", lastUpdated: "3h ago" },
  { id: "4", name: "Brand Guidelines v2.pdf", source: "drive", status: "processed" as const, chunkCount: 156, knowledgeBase: "Marketing Assets", lastUpdated: "4h ago" },
  { id: "5", name: "Engineering Handbook.docx", source: "upload", status: "processed" as const, chunkCount: 89, knowledgeBase: "Engineering Specs", lastUpdated: "6h ago" },
  { id: "6", name: "User Interview Notes.md", source: "notion", status: "failed" as const, chunkCount: 0, project: "User Research Q4", lastUpdated: "8h ago" },
  { id: "7", name: "Security Policy.pdf", source: "upload", status: "processed" as const, chunkCount: 34, knowledgeBase: "Legal Documents", lastUpdated: "1d ago" },
  { id: "8", name: "Release Notes v3.2.md", source: "github", status: "processed" as const, chunkCount: 12, knowledgeBase: "Product Docs", lastUpdated: "1d ago" },
  { id: "9", name: "Competitor Analysis.xlsx", source: "drive", status: "processed" as const, chunkCount: 67, project: "Q1 Product Launch", lastUpdated: "2d ago" },
  { id: "10", name: "Training Materials.pptx", source: "upload", status: "processing" as const, chunkCount: 0, knowledgeBase: "Customer Support", lastUpdated: "2d ago" },
];

const filters = [
  { id: "all", label: "All", active: true },
  { id: "processed", label: "Processed", active: false },
  { id: "processing", label: "Processing", active: false },
  { id: "failed", label: "Failed", active: false },
];

export default function Documents() {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState(filters);
  const [formOpen, setFormOpen] = useState(false);

  const handleFilterClick = (id: string) => {
    setActiveFilters(prev => 
      prev.map(f => ({ ...f, active: f.id === id }))
    );
  };

  const filteredDocs = documents.filter(doc => {
    const activeFilter = activeFilters.find(f => f.active)?.id;
    const matchesFilter = activeFilter === "all" || doc.status === activeFilter;
    const matchesSearch = doc.name.toLowerCase().includes(searchValue.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Toolbar
        searchPlaceholder="Search documents..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={activeFilters}
        onFilterClick={handleFilterClick}
        onNewClick={() => setFormOpen(true)}
        newLabel="Upload"
        showViewToggle={false}
      />

      <DocumentForm open={formOpen} onOpenChange={setFormOpen} />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">All ingested documents across your system</p>
        </div>

        <div className="tile-list">
          {filteredDocs.map((doc) => (
            <DocumentTile
              key={doc.id}
              {...doc}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
