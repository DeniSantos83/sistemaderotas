import {
  getRecordStatusOption,
  getRecordTypeOption,
} from "../Utils/recordOptions";

export function formatRecordDateTime(value) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function getRecordTypeLabel(record) {
  const value =
    typeof record === "string" ? record : record?.record_type;

  return getRecordTypeOption(value)?.label || value || "-";
}

export function getRecordStatusLabel(record) {
  const value =
    typeof record === "string" ? record : record?.status;

  return getRecordStatusOption(value)?.label || value || "-";
}

export function getRecordEquipmentLabel(record) {
  if (!record) return "-";

  const equipmentName =
    record.equipment?.name ||
    record.equipment_manual ||
    "-";

  const tombamento =
    record.equipment?.tombamento ||
    record.tombamento_manual ||
    "";

  if (equipmentName !== "-" && tombamento) {
    return `${equipmentName} • ${tombamento}`;
  }

  return equipmentName;
}

export function getRecordLocationLabel(record) {
  if (!record) return "-";

  const location =
    record.location?.name ||
    record.location_manual ||
    "-";

  const sector =
    record.sector?.name ||
    record.sector_manual ||
    "";

  if (location !== "-" && sector) {
    return `${location} / ${sector}`;
  }

  return location;
}

export function getRecordResponsibleLabel(record) {
  if (!record) return "-";

  const routeResponsible =
    record.route_responsible?.name ||
    record.route_responsible_manual_name;

  const sender =
    record.sender_employee?.name ||
    record.sender_manual_name;

  const receiver =
    record.receiver_employee?.name ||
    record.receiver_manual_name;

  if (routeResponsible) return routeResponsible;
  if (sender && receiver) return `${sender} → ${receiver}`;
  if (sender) return sender;
  if (receiver) return receiver;

  return "-";
}