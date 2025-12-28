"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

// Admin team member type - full details for management
export type AdminTeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar_url?: string;
  bio?: string;
  visible_on_landing: boolean;
  display_color?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
};

interface AdminTeamContextType {
  teamMembers: AdminTeamMember[];
  loading: boolean;
  error: string | null;
  refreshTeamMembers: () => Promise<void>;
  addTeamMember: (member: Omit<AdminTeamMember, 'id' | 'created_at' | 'updated_at'>) => Promise<AdminTeamMember>;
  updateTeamMember: (id: string, member: Partial<AdminTeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  reorderTeamMembers: (updates: { id: string; position: number }[]) => Promise<void>;
}

const AdminTeamContext = createContext<AdminTeamContextType | undefined>(undefined);

export function AdminTeamProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    const fetchStartTime = getTimestamp();
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      // TODO: Uncomment when team_members table is created
      // const { data, error: fetchError } = await supabase
      //   .from('team_members')
      //   .select('*')
      //   .order('position', { ascending: true });
      
      // if (fetchError) throw fetchError;
      // setTeamMembers(data || []);
      
      // Temporary: Use empty array until table is created
      setTeamMembers([]);
      
      const fetchDuration = getDuration(fetchStartTime);
      debugClientTiming("AdminTeamProvider", "Fetch team members", fetchDuration, {
        memberCount: 0,
        source: 'temporary'
      });
    } catch (err) {
      const fetchDuration = getDuration(fetchStartTime);
      debugClientTiming("AdminTeamProvider", "Fetch team members (ERROR)", fetchDuration, {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const refreshTeamMembers = useCallback(async () => {
    await fetchTeamMembers();
  }, [fetchTeamMembers]);

  const addTeamMember = useCallback(async (member: Omit<AdminTeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<AdminTeamMember> => {
    try {
      setError(null);
      const supabase = createClient();
      
      // TODO: Uncomment when team_members table is created
      // const { data, error: insertError } = await supabase
      //   .from('team_members')
      //   .insert({
      //     ...member,
      //     created_at: new Date().toISOString(),
      //     updated_at: new Date().toISOString(),
      //   })
      //   .select()
      //   .single();
      
      // if (insertError) throw insertError;
      
      // await refreshTeamMembers();
      // return data;
      
      // Temporary implementation
      const newMember: AdminTeamMember = {
        ...member,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTeamMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add team member';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateTeamMember = useCallback(async (id: string, member: Partial<AdminTeamMember>) => {
    try {
      setError(null);
      const supabase = createClient();
      
      // TODO: Uncomment when team_members table is created
      // const { error: updateError } = await supabase
      //   .from('team_members')
      //   .update({
      //     ...member,
      //     updated_at: new Date().toISOString(),
      //   })
      //   .eq('id', id);
      
      // if (updateError) throw updateError;
      
      // await refreshTeamMembers();
      
      // Temporary implementation
      setTeamMembers(prev => 
        prev.map(m => m.id === id 
          ? { ...m, ...member, updated_at: new Date().toISOString() } 
          : m
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update team member';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const deleteTeamMember = useCallback(async (id: string) => {
    try {
      setError(null);
      const supabase = createClient();
      
      // TODO: Uncomment when team_members table is created
      // const { error: deleteError } = await supabase
      //   .from('team_members')
      //   .delete()
      //   .eq('id', id);
      
      // if (deleteError) throw deleteError;
      
      // await refreshTeamMembers();
      
      // Temporary implementation
      setTeamMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete team member';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const reorderTeamMembers = useCallback(async (updates: { id: string; position: number }[]) => {
    try {
      setError(null);
      const supabase = createClient();
      
      // TODO: Uncomment when team_members table is created
      // for (const update of updates) {
      //   const { error: updateError } = await supabase
      //     .from('team_members')
      //     .update({ position: update.position })
      //     .eq('id', update.id);
      //   
      //   if (updateError) throw updateError;
      // }
      
      // await refreshTeamMembers();
      
      // Temporary implementation
      setTeamMembers(prev => {
        const updated = [...prev];
        updates.forEach(({ id, position }) => {
          const index = updated.findIndex(m => m.id === id);
          if (index !== -1) {
            updated[index] = { ...updated[index], position };
          }
        });
        return updated.sort((a, b) => a.position - b.position);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder team members';
      setError(message);
      throw new Error(message);
    }
  }, []);

  return (
    <AdminTeamContext.Provider 
      value={{ 
        teamMembers, 
        loading, 
        error, 
        refreshTeamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        reorderTeamMembers
      }}
    >
      {children}
    </AdminTeamContext.Provider>
  );
}

export function useAdminTeam() {
  const context = useContext(AdminTeamContext);
  if (context === undefined) {
    throw new Error("useAdminTeam must be used within AdminTeamProvider");
  }
  return context;
}
