import { PublicTeamProvider } from "@/providers/PublicTeamProvider";
import { PublicThemeProvider } from "@/providers/PublicThemeProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicThemeProvider>
      <PublicTeamProvider>
        {children}
      </PublicTeamProvider>
    </PublicThemeProvider>
  );
}
