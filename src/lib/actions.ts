import { supabase } from './supabaseClient';

export async function addProject(title: string, description: string) {
  const { data, error } = await supabase
    .from('Project')
    .insert([{ title, description }]);
  if (error) throw error;
  return data;
}

export async function getProjects() {
  const { data, error } = await supabase
    .from('Project')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('Project')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('Project')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function updateProject(id: string, title: string, description: string) {
  const { error } = await supabase
    .from('Project')
    .update({ title, description })
    .eq('id', id);
  if (error) throw error;
}
