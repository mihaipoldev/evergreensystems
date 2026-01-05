import { Database, FolderKanban, FileText, Activity, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/shared/StatCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { KnowledgeBaseCard } from "@/components/shared/KnowledgeBaseCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { title: "Knowledge Bases", value: 12, change: "+2 this week", changeType: "positive" as const, icon: Database },
  { title: "Active Projects", value: 8, change: "3 in progress", changeType: "neutral" as const, icon: FolderKanban },
  { title: "Documents", value: 2847, change: "+156 this month", changeType: "positive" as const, icon: FileText },
  { title: "API Calls (24h)", value: "14.2K", change: "-5% vs yesterday", changeType: "negative" as const, icon: Activity },
];

const recentKBs = [
  {
    name: "Product Documentation",
    type: "Vector" as const,
    description: "Technical documentation, API references, and user guides for the main product suite.",
    documentCount: 342,
    size: "1.2 GB",
    updatedAt: "2 hours ago"
  },
  {
    name: "Customer Support",
    type: "Hybrid" as const,
    description: "Support tickets, FAQs, and resolution procedures for customer service teams.",
    documentCount: 1205,
    size: "890 MB",
    updatedAt: "5 hours ago"
  },
  {
    name: "Legal Compliance",
    type: "Graph" as const,
    description: "Regulatory documents, compliance checklists, and legal precedents.",
    documentCount: 89,
    size: "450 MB",
    updatedAt: "1 day ago"
  },
];

const recentActivity = [
  { action: "Knowledge base updated", target: "Product Documentation", time: "2 hours ago" },
  { action: "Project created", target: "Q4 Analysis Pipeline", time: "4 hours ago" },
  { action: "Documents indexed", target: "156 files processed", time: "6 hours ago" },
  { action: "API key generated", target: "Production environment", time: "1 day ago" },
  { action: "User invited", target: "sarah@company.com", time: "2 days ago" },
];

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard" subtitle="Overview of your AI intelligence platform">
      <div className="space-y-8">
        {/* Stats Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/* Recent Knowledge Bases */}
        <section>
          <SectionHeader 
            title="Recent Knowledge Bases" 
            icon={Database}
            action={
              <Link to="/knowledge-bases">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentKBs.map((kb) => (
              <KnowledgeBaseCard
                key={kb.name}
                {...kb}
                onView={() => {}}
                onMenuClick={() => {}}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <SectionHeader 
            title="Recent Activity" 
            icon={Activity}
            action={
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
          <div className="enterprise-card divide-y divide-border">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">{activity.action}</span>
                  <span className="text-sm text-muted-foreground">—</span>
                  <span className="text-sm font-medium text-foreground">{activity.target}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
