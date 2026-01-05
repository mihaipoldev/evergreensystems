import { AppLayout } from "@/components/layout/AppLayout";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Settings as SettingsIcon, Key, Users, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const settingsSections = [
  {
    title: "API Keys",
    description: "Manage API keys for integrations and external access",
    icon: Key,
    items: [
      { label: "Production Key", value: "sk-prod-****-****-****-a3f2", status: "Active" },
      { label: "Development Key", value: "sk-dev-****-****-****-b1c4", status: "Active" },
    ]
  },
  {
    title: "Team Members",
    description: "Manage team access and permissions",
    icon: Users,
    items: [
      { label: "Admins", value: "3 members", status: "" },
      { label: "Editors", value: "8 members", status: "" },
      { label: "Viewers", value: "24 members", status: "" },
    ]
  },
  {
    title: "Notifications",
    description: "Configure alerts and notification preferences",
    icon: Bell,
    items: [
      { label: "Email Notifications", value: "Enabled", status: "Active" },
      { label: "Slack Integration", value: "#ai-platform-alerts", status: "Active" },
      { label: "Webhook Alerts", value: "Disabled", status: "" },
    ]
  },
  {
    title: "Security",
    description: "Security settings and audit logs",
    icon: Shield,
    items: [
      { label: "Two-Factor Auth", value: "Enforced for all users", status: "Active" },
      { label: "SSO", value: "SAML configured", status: "Active" },
      { label: "Audit Logs", value: "90 day retention", status: "" },
    ]
  },
];

export default function Settings() {
  return (
    <AppLayout 
      title="Settings" 
      subtitle="Configure your platform settings"
    >
      <div className="max-w-4xl space-y-8">
        {settingsSections.map((section) => (
          <section key={section.title}>
            <SectionHeader 
              title={section.title}
              description={section.description}
              icon={section.icon}
              action={
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              }
            />
            <div className="enterprise-card divide-y divide-border">
              {section.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                    {item.status && (
                      <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
