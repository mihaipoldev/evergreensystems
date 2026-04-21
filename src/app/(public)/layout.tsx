import { PublicThemeProviderWrapper } from "@/providers/PublicThemeProviderWrapper";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicThemeProviderWrapper>
      {children}
      <a href="/trap" aria-hidden="true" tabIndex={-1}
         style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}>
        .
      </a>
    </PublicThemeProviderWrapper>
  );
}
