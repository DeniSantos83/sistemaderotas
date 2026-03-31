import { supabase } from "../../../lib/supabase";

function cleanText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function cleanUuid(value) {
  if (!value) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function cleanBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function cleanDate(value) {
  if (!value) return new Date().toISOString();
  return value;
}

export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user?.id ?? null;
}

export function mapRecordFormToPayload(form, userId, mode = "create") {
  const payload = {
    app_number: cleanText(form.app_number),
    route_id: cleanUuid(form.route_id),
    record_type: cleanText(form.record_type),
    status: cleanText(form.status),
    occurred_at: cleanDate(form.occurred_at),

    call_number: cleanText(form.call_number),
    grp_number: cleanText(form.grp_number),
    qr_code_read: cleanText(form.qr_code_read),

    location_id: cleanUuid(form.location_id),
    location_manual: cleanText(form.location_manual),

    sector_id: cleanUuid(form.sector_id),
    sector_manual: cleanText(form.sector_manual),

    equipment_id: cleanUuid(form.equipment_id),
    equipment_manual: cleanText(form.equipment_manual),
    tombamento_manual: cleanText(form.tombamento_manual),

    route_responsible_id: cleanUuid(form.route_responsible_id),
    route_responsible_manual_name: cleanText(
      form.route_responsible_manual_name
    ),
    route_responsible_manual_registration: cleanText(
      form.route_responsible_manual_registration
    ),

    receiver_employee_id: cleanUuid(form.receiver_employee_id),
    receiver_manual_name: cleanText(form.receiver_manual_name),
    receiver_manual_registration: cleanText(
      form.receiver_manual_registration
    ),

    sender_employee_id: cleanUuid(form.sender_employee_id),
    sender_manual_name: cleanText(form.sender_manual_name),
    sender_manual_registration: cleanText(form.sender_manual_registration),

    delivery_signature_path: cleanText(form.delivery_signature_path),
    reception_signature_path: cleanText(form.reception_signature_path),
    maintenance_signature_path: cleanText(form.maintenance_signature_path),

    maintenance_confirmation: cleanBoolean(
      form.maintenance_confirmation,
      false
    ),
    maintenance_confirmed_by: cleanUuid(form.maintenance_confirmed_by),
    maintenance_confirmed_at: form.maintenance_confirmed_at || null,

    observations: cleanText(form.observations),
    cancellation_reason: cleanText(form.cancellation_reason),

    delivery_signature_mime_type: cleanText(form.delivery_signature_mime_type),
    reception_signature_mime_type: cleanText(
      form.reception_signature_mime_type
    ),
    maintenance_signature_mime_type: cleanText(
      form.maintenance_signature_mime_type
    ),

    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  if (mode === "create") {
    payload.created_by = userId;
    payload.created_at = new Date().toISOString();
  }

  return payload;
}

export async function fetchRecords() {
  const { data, error } = await supabase
    .from("records")
    .select(`
      *,
      route:route_id ( id, route_date, status ),
      location:location_id ( id, name ),
      sector:sector_id ( id, name ),
      equipment:equipment_id ( id, name, default_tombamento ),
      route_responsible:route_responsible_id ( id, name, registration ),
      receiver_employee:receiver_employee_id ( id, name, registration ),
      sender_employee:sender_employee_id ( id, name, registration )
    `)
    .order("occurred_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchRecordById(id) {
  const { data, error } = await supabase
    .from("records")
    .select(`
      *,
      route:route_id ( id, route_date, status ),
      location:location_id ( id, name ),
      sector:sector_id ( id, name ),
      equipment:equipment_id ( id, name, default_tombamento ),
      route_responsible:route_responsible_id ( id, name, registration ),
      receiver_employee:receiver_employee_id ( id, name, registration ),
      sender_employee:sender_employee_id ( id, name, registration ),
      created_by_user:created_by ( id ),
      updated_by_user:updated_by ( id ),
      maintenance_confirmed_by_user:maintenance_confirmed_by ( id )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getRecordById(id) {
  return fetchRecordById(id);
}

export async function createRecord(form) {
  const userId = await getCurrentUserId();
  const payload = mapRecordFormToPayload(form, userId, "create");

  const { data, error } = await supabase
    .from("records")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateRecord(id, form) {
  const userId = await getCurrentUserId();
  const payload = mapRecordFormToPayload(form, userId, "update");

  const { data, error } = await supabase
    .from("records")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function cancelRecord(id, reason = "") {
  const userId = await getCurrentUserId();

  const payload = {
    status: "cancelled",
    cancellation_reason: cleanText(reason),
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("records")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function confirmMaintenance(id) {
  const userId = await getCurrentUserId();

  const payload = {
    maintenance_confirmation: true,
    maintenance_confirmed_by: userId,
    maintenance_confirmed_at: new Date().toISOString(),
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("records")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function removeMaintenanceConfirmation(id) {
  const userId = await getCurrentUserId();

  const payload = {
    maintenance_confirmation: false,
    maintenance_confirmed_by: null,
    maintenance_confirmed_at: null,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("records")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}