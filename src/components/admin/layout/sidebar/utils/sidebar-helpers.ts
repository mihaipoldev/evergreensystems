import type { SidebarUser } from "../types";

/**
 * Get user initials from name or email
 */
export function getUserInitials(user: SidebarUser | null): string {
  if (!user?.name && !user?.email) return "U";
  const name = user.name || user.email || "";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0]?.toUpperCase() || "U";
}

