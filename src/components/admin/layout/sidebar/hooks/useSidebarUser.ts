"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";
import type { SidebarUser } from "../types";

export function useSidebarUser() {
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const userFetchStartTime = getTimestamp();
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const userFetchDuration = getDuration(userFetchStartTime);
      debugClientTiming("AdminSidebar", "User data fetch", userFetchDuration, {
        hasUser: !!authUser
      });
      setUser({
        email: authUser?.email || null,
        name: authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || null,
      });
      setLoading(false);
    };

    getUser();
  }, []);

  return { user, loading };
}

