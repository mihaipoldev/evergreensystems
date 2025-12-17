import { PublicTeamProvider } from "@/providers/PublicTeamProvider";
import { PublicThemeProviderWrapper } from "@/providers/PublicThemeProviderWrapper";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicThemeProviderWrapper>
      <PublicTeamProvider>
        {children}
      </PublicTeamProvider>
    </PublicThemeProviderWrapper>
  );
}
