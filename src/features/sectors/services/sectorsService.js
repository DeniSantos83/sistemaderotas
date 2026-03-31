import { supabase } from "../../../lib/supabase";

export async function listSectors(search = "") {
  let query = supabase
    .from("sectors")
    .select(`
      *,
      location:locations (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error("Erro ao carregar setores");

  return data || [];
}

export async function getSectorById(id) {
  const { data, error } = await supabase
    .from("sectors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("Erro ao carregar setor");

  return data;
}

export async function createSector(payload) {
  const { data, error } = await supabase
    .from("sectors")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error("Erro ao criar setor");

  return data;
}

export async function updateSector(id, payload) {
  const { data, error } = await supabase
    .from("sectors")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Erro ao atualizar setor");

  return data;
}

export async function toggleSectorStatus(id, active) {
  const { error } = await supabase
    .from("sectors")
    .update({ active })
    .eq("id", id);

  if (error) throw new Error("Erro ao alterar status");
}