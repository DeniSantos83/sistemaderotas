import { supabase } from "../../../lib/supabase";

export async function listEquipments(search = "") {
  let query = supabase
    .from("equipments")
    .select("*")
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    query = query.or(
      `name.ilike.%${search}%,category.ilike.%${search}%,model.ilike.%${search}%,default_tombamento.ilike.%${search}%,serial_number.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Não foi possível carregar os equipamentos.");
  }

  return data || [];
}

export async function getEquipmentById(id) {
  const { data, error } = await supabase
    .from("equipments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível carregar o equipamento.");
  }

  return data;
}

export async function createEquipment(payload) {
  const { data, error } = await supabase
    .from("equipments")
    .insert([
      {
        name: payload.name,
        category: payload.category || null,
        model: payload.model || null,
        serial_number: payload.serial_number || null,
        default_tombamento: payload.default_tombamento || null,
        default_qr_code: payload.default_qr_code || null,
        notes: payload.notes || null,
        active: payload.active,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível cadastrar o equipamento.");
  }

  return data;
}

export async function updateEquipment(id, payload) {
  const { data, error } = await supabase
    .from("equipments")
    .update({
      name: payload.name,
      category: payload.category || null,
      model: payload.model || null,
      serial_number: payload.serial_number || null,
      default_tombamento: payload.default_tombamento || null,
      default_qr_code: payload.default_qr_code || null,
      notes: payload.notes || null,
      active: payload.active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível atualizar o equipamento.");
  }

  return data;
}

export async function toggleEquipmentStatus(id, active) {
  const { data, error } = await supabase
    .from("equipments")
    .update({ active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível alterar o status.");
  }

  return data;
}