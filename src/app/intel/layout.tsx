import { IntelLayout } from "@/components/intel/IntelLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IntelLayout>{children}</IntelLayout>;
}

