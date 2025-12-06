"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AdminTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/admin/AdminTable";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";
import { cn } from "@/lib/utils";
import type { Testimonial } from "../types";

type TestimonialsListProps = {
  initialTestimonials: Testimonial[];
};

export function TestimonialsList({ initialTestimonials }: TestimonialsListProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [searchQuery, setSearchQuery] = useState("");
  const [clickedRowId, setClickedRowId] = useState<string | null>(null);
  const router = useRouter();
  const { startNavigation } = useNavigationLoading();

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete testimonial");
      }

      toast.success("Testimonial deleted successfully");
      setTestimonials(testimonials.filter((t) => t.id !== id));
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast.error(error.message || "Failed to delete testimonial");
      throw error;
    }
  };

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const query = searchQuery.toLowerCase();
    return (
      testimonial.author_name.toLowerCase().includes(query) ||
      testimonial.quote.toLowerCase().includes(query) ||
      testimonial.company_name?.toLowerCase().includes(query) ||
      testimonial.author_role?.toLowerCase().includes(query)
    );
  });

  const handleRowClick = (testimonialId: string, e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't navigate if clicking on action menu or its children
    const target = e.target as HTMLElement;
    if (target.closest('[data-action-menu]')) {
      return;
    }
    setClickedRowId(testimonialId);
    const path = `/admin/testimonials/${testimonialId}/edit`;
    startNavigation(path);
    router.push(path);
  };

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8 relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground leading-none">Testimonials</h1>
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
              ({filteredTestimonials.length} {filteredTestimonials.length === 1 ? "testimonial" : "testimonials"})
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Manage customer testimonials and reviews.
          </p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search testimonials..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New Testimonial"
          >
            <Link href="/admin/testimonials/new">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        <AdminTable>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b">
              <TableHead className="pl-4 w-20 font-bold">Icon</TableHead>
              <TableHead className="font-bold">Author</TableHead>
              <TableHead className="text-right pr-4 w-24 font-bold" style={{ textAlign: "right" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  {searchQuery
                    ? "No testimonials found matching your search"
                    : "No testimonials found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((testimonial) => (
                <Fragment key={testimonial.id}>
                  {/* Mobile Layout */}
                  <TableRow
                    key={`${testimonial.id}-mobile`}
                    className={cn(
                      "md:hidden group cursor-pointer hover:bg-muted/50 border-b border-border/50 transition-all duration-150",
                      clickedRowId === testimonial.id && "bg-primary/5"
                    )}
                    onClick={(e) => handleRowClick(testimonial.id, e)}
                  >
                    <TableCell className="px-3 md:pl-4 md:pr-4 py-4" colSpan={3}>
                      <div className={cn(
                        "flex items-start gap-3 md:gap-4 transition-transform duration-150",
                        clickedRowId === testimonial.id && "scale-[0.99]"
                      )}>
                        <div className={cn(
                          "h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 transition-all duration-150",
                          clickedRowId === testimonial.id ? "bg-primary/10 ring ring-primary/20" : "bg-muted"
                        )}>
                          {testimonial.avatar_url ? (
                            <img
                              src={testimonial.avatar_url}
                              alt={testimonial.author_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className={cn(
                              "text-xs font-semibold transition-colors duration-150",
                              clickedRowId === testimonial.id ? "text-primary/70" : "text-muted-foreground"
                            )}>
                              {testimonial.author_name
                                .split(/\s+/)
                                .map((w) => w[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base mb-1.5 break-words">
                            {testimonial.author_name}
                          </div>
                          {(testimonial.author_role || testimonial.company_name) && (
                            <div className="text-sm text-muted-foreground mb-1">
                              {testimonial.author_role && testimonial.company_name
                                ? `${testimonial.author_role} at ${testimonial.company_name}`
                                : testimonial.author_role || testimonial.company_name}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {testimonial.quote}
                          </div>
                        </div>
                        <div 
                          className="flex-shrink-0 ml-2" 
                          data-action-menu
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionMenu
                            itemId={testimonial.id}
                            editHref={`/admin/testimonials/${testimonial.id}/edit`}
                            onDelete={handleDelete}
                            deleteLabel={`testimonial from "${testimonial.author_name}"`}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Desktop Layout */}
                  <TableRow
                    key={`${testimonial.id}-desktop`}
                    className={cn(
                      "table-row-responsive group cursor-pointer hover:bg-muted/50 transition-all duration-150",
                      clickedRowId === testimonial.id && "bg-primary/5"
                    )}
                    onClick={(e) => handleRowClick(testimonial.id, e)}
                  >
                    <TableCell className="pl-4 w-20">
                      <div className={cn(
                        "h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md transition-all duration-150",
                        clickedRowId === testimonial.id ? "bg-primary/10 ring ring-primary/20 scale-[0.99]" : "bg-muted"
                      )}>
                        {testimonial.avatar_url ? (
                          <img
                            src={testimonial.avatar_url}
                            alt={testimonial.author_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className={cn(
                            "text-xs font-semibold transition-colors duration-150",
                            clickedRowId === testimonial.id ? "text-primary/70" : "text-muted-foreground"
                          )}>
                            {testimonial.author_name
                              .split(/\s+/)
                              .map((w) => w[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      <span className="truncate block" title={testimonial.author_name}>
                        {testimonial.author_name}
                      </span>
                    </TableCell>
                    <TableCell 
                      className="text-right pr-4 w-24" 
                      data-action-menu 
                      style={{ textAlign: "right" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex ml-auto">
                        <ActionMenu
                          itemId={testimonial.id}
                          editHref={`/admin/testimonials/${testimonial.id}/edit`}
                          onDelete={handleDelete}
                          deleteLabel={`testimonial from "${testimonial.author_name}"`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))
            )}
          </TableBody>
        </AdminTable>
      </div>
    </div>
  );
}
