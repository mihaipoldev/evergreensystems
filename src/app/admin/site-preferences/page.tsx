import { AdminPageTitle } from "@/components/admin/AdminPageTitle";

export const dynamic = 'force-dynamic';

export default function SitePreferencesPage() {
  return (
    <>
      <AdminPageTitle
        title="Site Preferences"
        description="Manage global site settings and preferences."
      />
      <p className="text-muted-foreground">
        Site preferences content will be added here.
      </p>
    </>
  );
}
