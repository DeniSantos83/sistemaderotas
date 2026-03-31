import { supabase } from "../../../lib/supabase";

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: "info", label: "Informação" },
  { value: "success", label: "Sucesso" },
  { value: "warning", label: "Aviso" },
  { value: "error", label: "Erro" },
];

export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user?.id ?? null;
}

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchNotificationById(id) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getNotificationById(id) {
  return fetchNotificationById(id);
}

export async function createNotification(form) {
  const userId = await getCurrentUserId();

  const payload = {
    user_id: userId,
    title: form.title?.trim() || "",
    message: form.message?.trim() || "",
    notification_type: form.notification_type || "info",
    read: form.read ?? false,
    related_record_id: form.related_record_id || null,
  };

  const { data, error } = await supabase
    .from("notifications")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateNotification(id, form) {
  const payload = {
    title: form.title?.trim() || "",
    message: form.message?.trim() || "",
    notification_type: form.notification_type || "info",
    read: form.read ?? false,
    related_record_id: form.related_record_id || null,
  };

  const { data, error } = await supabase
    .from("notifications")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(id) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function markNotificationAsUnread(id) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: false })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function archiveNotification(id) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export function getNotificationTypeLabel(value) {
  return (
    NOTIFICATION_TYPE_OPTIONS.find((item) => item.value === value)?.label ||
    value
  );
}