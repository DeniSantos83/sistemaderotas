import { supabase } from "../../../lib/supabase";

export async function listLocations(search = "") {
  let query = supabase
    .from("locations")
    .select("*")
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    query = query.or(
      `name.ilike.%${search}%,code.ilike.%${search}%,address.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Não foi possível carregar os locais.");
  }

  return data || [];
}

export async function getLocationById(id) {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível carregar o local.");
  }

  return data;
}

export async function createLocation(payload) {
  const { data, error } = await supabase
    .from("locations")
    .insert([
      {
        name: payload.name,
        code: payload.code || null,
        address: payload.address || null,
        notes: payload.notes || null,
        active: payload.active,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível cadastrar o local.");
  }

  return data;
}

export async function updateLocation(id, payload) {
  const { data, error } = await supabase
    .from("locations")
    .update({
      name: payload.name,
      code: payload.code || null,
      address: payload.address || null,
      notes: payload.notes || null,
      active: payload.active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível atualizar o local.");
  }

  return data;
}

export async function toggleLocationStatus(id, active) {
  const { data, error } = await supabase
    .from("locations")
    .update({ active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível alterar o status do local.");
  }

  return data;
}