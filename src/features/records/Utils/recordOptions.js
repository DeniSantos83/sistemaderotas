export const RECORD_TYPE_OPTIONS = [
  { value: "delivery", label: "Entrega" },
  { value: "receipt", label: "Recebimento" },
  { value: "transfer", label: "Transferência" },
  { value: "maintenance_out", label: "Saída para manutenção" },
  { value: "maintenance_return", label: "Retorno de manutenção" },
  { value: "occurrence", label: "Ocorrência" },
];

export const RECORD_STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "in_transit", label: "Em trânsito" },
  { value: "delivered", label: "Entregue" },
  { value: "received", label: "Recebido" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

export function getRecordTypeOption(value) {
  return RECORD_TYPE_OPTIONS.find((item) => item.value === value) || null;
}

export function getRecordStatusOption(value) {
  return RECORD_STATUS_OPTIONS.find((item) => item.value === value) || null;
}