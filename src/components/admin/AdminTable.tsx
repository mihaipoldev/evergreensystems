import { ReactNode } from "react";
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
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl text-card-foreground bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
      )}
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
