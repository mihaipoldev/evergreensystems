import { PublicThemeProviderWrapper } from "@/providers/PublicThemeProviderWrapper";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicThemeProviderWrapper>
      {children}
    </PublicThemeProviderWrapper>
  );
}
