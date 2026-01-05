import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toolbar } from "@/components/shared/Toolbar";
import { DocumentRow } from "@/components/shared/DocumentRow";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { AddDocumentDialog } from "@/components/forms/AddDocumentDialog";

const documents = [
  {
    name: "API Reference v3.2.pdf",
    type: "PDF",
    size: "4.2 MB",
    status: "Indexed" as const,
    knowledgeBase: "Product Docs",
    uploadedAt: "Jan 3, 2025"
  },
  {
    name: "Q4 Support Analysis.docx",
    type: "Word",
    size: "1.8 MB",
    status: "Processing" as const,
    knowledgeBase: "Customer Support",
    uploadedAt: "Jan 3, 2025"
  },
  {
    name: "Compliance Checklist 2024.xlsx",
    type: "Excel",
    size: "890 KB",
    status: "Indexed" as const,
    knowledgeBase: "Legal Compliance",
    uploadedAt: "Jan 2, 2025"
  },
  {
    name: "Employee Handbook v12.pdf",
    type: "PDF",
    size: "2.3 MB",
    status: "Indexed" as const,
    knowledgeBase: "HR Policies",
    uploadedAt: "Jan 2, 2025"
  },
  {
    name: "Sales Playbook Q1.pptx",
    type: "PowerPoint",
    size: "15.4 MB",
    status: "Pending" as const,
    knowledgeBase: "Sales Enablement",
    uploadedAt: "Jan 1, 2025"
  },
  {
    name: "Architecture Decision Log.md",
    type: "Markdown",
    size: "156 KB",
    status: "Indexed" as const,
    knowledgeBase: "Engineering Wiki",
    uploadedAt: "Dec 30, 2024"
  },
  {
    name: "Brand Guidelines 2025.pdf",
    type: "PDF",
    size: "28.7 MB",
    status: "Failed" as const,
    knowledgeBase: "Marketing Content",
    uploadedAt: "Dec 29, 2024"
  },
  {
    name: "Budget Forecast Q1.xlsx",
    type: "Excel",
    size: "1.2 MB",
    status: "Indexed" as const,
    knowledgeBase: "Financial Reports",
    uploadedAt: "Dec 28, 2024"
  },
  {
    name: "Incident Response Runbook.pdf",
    type: "PDF",
    size: "3.4 MB",
    status: "Indexed" as const,
    knowledgeBase: "Engineering Wiki",
    uploadedAt: "Dec 27, 2024"
  },
  {
    name: "Competitive Analysis Q4.docx",
    type: "Word",
    size: "2.1 MB",
    status: "Indexed" as const,
    knowledgeBase: "Sales Enablement",
    uploadedAt: "Dec 26, 2024"
  },
];

export default function Documents() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <>
      <AppLayout 
        title="Documents" 
        subtitle="View and manage all indexed documents"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        }
      >
        <div>
          <Toolbar 
            searchPlaceholder="Search documents..."
            filters={["All", "Indexed", "Processing", "Pending", "Failed"]}
            primaryAction={{ label: "Upload", onClick: () => setIsAddDialogOpen(true) }}
          />
          
          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="flex-1 min-w-0">Name</div>
            <div className="w-20 shrink-0">Size</div>
            <div className="w-24 shrink-0">Status</div>
            <div className="w-32 shrink-0">Knowledge Base</div>
            <div className="w-28 shrink-0">Uploaded</div>
            <div className="w-24 shrink-0">Actions</div>
          </div>

          {/* Document Rows */}
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.name}
                {...doc}
                onView={() => {}}
                onMenuClick={() => {}}
              />
            ))}
          </div>
        </div>
      </AppLayout>

      <AddDocumentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </>
  );
}
