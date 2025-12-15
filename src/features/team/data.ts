import { createClient } from '@/lib/supabase/client';
import { TeamMember, TeamMemberFormData } from './types';

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();
  
  // TODO: Uncomment when team_members table is created
  // const { data, error } = await supabase
  //   .from('team_members')
  //   .select('*')
  //   .order('position', { ascending: true });
  
  // if (error) {
  //   console.error('Error fetching team members:', error);
  //   throw error;
  // }
  
  // return data || [];
  
  // Temporary: return empty array
  return [];
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const supabase = createClient();
  
  // TODO: Uncomment when team_members table is created
  // const { data, error } = await supabase
  //   .from('team_members')
  //   .select('*')
  //   .eq('id', id)
  //   .single();
  
  // if (error) {
  //   console.error('Error fetching team member:', error);
  //   return null;
  // }
  
  // return data;
  
  // Temporary: return null
  return null;
}

export async function createTeamMember(member: TeamMemberFormData): Promise<TeamMember> {
  const supabase = createClient();
  
  // TODO: Uncomment when team_members table is created
  // const { data, error } = await supabase
  //   .from('team_members')
  //   .insert(member)
  //   .select()
  //   .single();
  
  // if (error) {
  //   console.error('Error creating team member:', error);
  //   throw error;
  // }
  
  // return data;
  
  // Temporary: return mock data
  throw new Error('Team members table not yet created');
}

export async function updateTeamMember(id: string, member: Partial<TeamMemberFormData>): Promise<void> {
  const supabase = createClient();
  
  // TODO: Uncomment when team_members table is created
  // const { error } = await supabase
  //   .from('team_members')
  //   .update(member)
  //   .eq('id', id);
  
  // if (error) {
  //   console.error('Error updating team member:', error);
  //   throw error;
  // }
  
  // Temporary: do nothing
  throw new Error('Team members table not yet created');
}

export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = createClient();
  
  // TODO: Uncomment when team_members table is created
  // const { error } = await supabase
  //   .from('team_members')
  //   .delete()
  //   .eq('id', id);
  
  // if (error) {
  //   console.error('Error deleting team member:', error);
  //   throw error;
  // }
  
  // Temporary: do nothing
  throw new Error('Team members table not yet created');
}


