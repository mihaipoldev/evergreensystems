import { 
  Database, 
  Folder, 
  FileText, 
  Zap, 
  Plus, 
  Upload, 
  Link, 
  TrendingUp,
  Layers
} from "lucide-react";
import { Section } from "@/components/layout/Section";
import { StatTile } from "@/components/tiles/StatTile";
import { QuickActionTile } from "@/components/tiles/QuickActionTile";
import { KnowledgeBaseTile } from "@/components/tiles/KnowledgeBaseTile";
import { ProjectTile } from "@/components/tiles/ProjectTile";

const stats = [
  { label: "Knowledge Bases", value: 12, icon: Database, trend: { value: 8, positive: true } },
  { label: "Active Projects", value: 24, icon: Folder, trend: { value: 12, positive: true } },
  { label: "Documents", value: "1.2k", icon: FileText, trend: { value: 5, positive: true } },
  { label: "Total Chunks", value: "48.3k", icon: Layers, trend: { value: 15, positive: true } },
];

const quickActions = [
  { label: "New Knowledge Base", description: "Create a new KB", icon: Plus },
  { label: "Upload Documents", description: "Add files to KB", icon: Upload },
  { label: "Connect Source", description: "Link external data", icon: Link },
  { label: "Run Pipeline", description: "Process documents", icon: Zap },
];

const recentKnowledgeBases = [
  { id: "1", name: "Product Documentation", type: "docs" as const, documentCount: 45, chunkCount: 2340, lastUpdated: "2h ago" },
  { id: "2", name: "Customer Support Files", type: "files" as const, documentCount: 128, chunkCount: 8920, lastUpdated: "5h ago" },
  { id: "3", name: "Analytics Database", type: "database" as const, documentCount: 12, chunkCount: 1560, lastUpdated: "1d ago" },
];

const recentProjects = [
  { id: "1", name: "Q1 Product Launch", status: "active" as const, knowledgeBase: "Product Docs", documentCount: 23, lastUpdated: "1h ago" },
  { id: "2", name: "Customer Insights", status: "pending" as const, knowledgeBase: "Support Files", documentCount: 67, lastUpdated: "3h ago" },
  { id: "3", name: "Legacy Migration", status: "archived" as const, documentCount: 145, lastUpdated: "2d ago" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your intelligence system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatTile key={stat.label} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <Section title="Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <QuickActionTile key={action.label} {...action} />
            ))}
          </div>
        </Section>

        {/* Recent Knowledge Bases */}
        <Section 
          title="Recent Knowledge Bases" 
          action={{ label: "View all", onClick: () => {} }}
        >
          <div className="tile-grid">
            {recentKnowledgeBases.map((kb) => (
              <KnowledgeBaseTile
                key={kb.id}
                {...kb}
                variant="grid"
                onEdit={() => {}}
                onDuplicate={() => {}}
                onArchive={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </Section>

        {/* Recent Projects */}
        <Section 
          title="Recent Projects" 
          action={{ label: "View all", onClick: () => {} }}
        >
          <div className="tile-grid">
            {recentProjects.map((project) => (
              <ProjectTile
                key={project.id}
                {...project}
                variant="grid"
                onEdit={() => {}}
                onDuplicate={() => {}}
                onArchive={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
