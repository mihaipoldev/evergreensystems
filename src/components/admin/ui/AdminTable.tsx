"use client";

import { ReactNode, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminTableProps = {
  children: ReactNode;
  className?: string;
};

export function AdminTable({ children, className }: AdminTableProps) {
  const { resolvedTheme } = useTheme();

  const tableShadow = useMemo(() => {
    if (resolvedTheme !== "dark") return undefined;
    return "0 12px 32px -18px hsl(var(--primary) / 0.35)";
  }, [resolvedTheme]);

  const tableShadowHover = useMemo(() => {
    if (resolvedTheme !== "dark") return undefined;
    return "0 16px 40px -18px hsl(var(--primary) / 0.45)";
  }, [resolvedTheme]);

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl text-card-foreground bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
      )}
      style={{
        boxShadow: tableShadow,
      }}
      onMouseEnter={(e) => {
        if (tableShadowHover) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = tableShadowHover;
        }
      }}
      onMouseLeave={(e) => {
        if (tableShadow) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = tableShadow;
        } else {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        }
      }}
    >
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        style={{
          backgroundColor: "hsl(var(--table-background))",
        }}
      >
        {children}
      </table>
    </div>
  );
}

export { TableHeader, TableBody, TableRow, TableHead, TableCell };
