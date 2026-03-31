import { supabase } from "../../../lib/supabase";

export async function listEmployees(search = "") {
  let query = supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    query = query.or(
      `name.ilike.%${search}%,registration.ilike.%${search}%,employee_type.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Não foi possível carregar os funcionários.");
  }

  return data || [];
}

export async function getEmployeeById(id) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível carregar o funcionário.");
  }

  return data;
}

export async function createEmployee(payload) {
  const { data, error } = await supabase
    .from("employees")
    .insert([
      {
        name: payload.name,
        registration: payload.registration || null,
        employee_type: payload.employee_type,
        phone: payload.phone || null,
        email: payload.email || null,
        notes: payload.notes || null,
        active: payload.active,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível cadastrar o funcionário.");
  }

  return data;
}

export async function updateEmployee(id, payload) {
  const { data, error } = await supabase
    .from("employees")
    .update({
      name: payload.name,
      registration: payload.registration || null,
      employee_type: payload.employee_type,
      phone: payload.phone || null,
      email: payload.email || null,
      notes: payload.notes || null,
      active: payload.active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível atualizar o funcionário.");
  }

  return data;
}

export async function toggleEmployeeStatus(id, active) {
  const { data, error } = await supabase
    .from("employees")
    .update({ active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível alterar o status.");
  }

  return data;
}