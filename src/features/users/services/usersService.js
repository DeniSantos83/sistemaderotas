import { supabase } from "../../../lib/supabase";

const PROFILE_FIELDS = `
  id,
  full_name,
  email,
  role,
  active,
  created_at,
  updated_at,
  registration,
  avatar_url,
  must_change_password
`;

function normalizeError(error, fallbackMessage) {
  if (!error) return new Error(fallbackMessage);
  return new Error(error.message || fallbackMessage);
}

export async function getUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .order("created_at", { ascending: false });

  if (error) {
    throw normalizeError(error, "Não foi possível carregar os usuários.");
  }

  return data || [];
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw normalizeError(error, "Não foi possível carregar o usuário.");
  }

  if (!data) {
    throw new Error("Usuário não encontrado.");
  }

  return data;
}

export async function updateUser(id, payload) {
  const updatePayload = {
    full_name: payload.full_name ?? null,
    email: payload.email ?? null,
    registration: payload.registration ?? null,
    role: payload.role ?? null,
    active: payload.active ?? true,
    must_change_password: payload.must_change_password ?? false,
    avatar_url: payload.avatar_url ?? null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    throw normalizeError(error, "Não foi possível atualizar o usuário.");
  }

  return true;
}

export async function toggleUserActive(id, active) {
  const { error } = await supabase
    .from("profiles")
    .update({ active })
    .eq("id", id);

  if (error) {
    throw normalizeError(error, "Não foi possível alterar o status do usuário.");
  }

  return true;
}

/**
 * Opcional: útil se você quiser criar o profile manualmente
 * depois que o usuário já existir no Auth.
 */
export async function createUserProfile(payload) {
  const insertPayload = {
    id: payload.id,
    full_name: payload.full_name ?? null,
    email: payload.email ?? null,
    registration: payload.registration ?? null,
    role: payload.role ?? "tecnico",
    active: payload.active ?? true,
    avatar_url: payload.avatar_url ?? null,
    must_change_password: payload.must_change_password ?? true,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(insertPayload)
    .select(PROFILE_FIELDS)
    .maybeSingle();

  if (error) {
    throw normalizeError(error, "Não foi possível criar o perfil do usuário.");
  }

  return data;
}