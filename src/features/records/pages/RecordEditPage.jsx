import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  Package,
  Save,
  ShieldCheck,
  User,
  Wrench,
  Sparkles,
  FileEdit,
  CheckCircle2,
  AlertTriangle,
  Route as RouteIcon,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import {
  fetchRecordById,
  updateRecord,
  confirmMaintenance,
  removeMaintenanceConfirmation,
} from "../services/recordsService";
import {
  RECORD_STATUS_OPTIONS,
  RECORD_TYPE_OPTIONS,
} from "../Utils/recordOptions";

const INITIAL_FORM = {
  app_number: "",
  route_id: "",
  record_type: "",
  status: "",
  occurred_at: "",

  call_number: "",
  grp_number: "",
  qr_code_read: "",

  location_id: "",
  location_manual: "",

  sector_id: "",
  sector_manual: "",

  equipment_id: "",
  equipment_manual: "",
  tombamento_manual: "",

  route_responsible_id: "",
  route_responsible_manual_name: "",
  route_responsible_manual_registration: "",

  receiver_employee_id: "",
  receiver_manual_name: "",
  receiver_manual_registration: "",

  sender_employee_id: "",
  sender_manual_name: "",
  sender_manual_registration: "",

  delivery_signature_path: "",
  reception_signature_path: "",
  maintenance_signature_path: "",

  maintenance_confirmation: false,
  maintenance_confirmed_by: "",
  maintenance_confirmed_at: "",

  observations: "",
  cancellation_reason: "",

  delivery_signature_mime_type: "",
  reception_signature_mime_type: "",
  maintenance_signature_mime_type: "",
};

function SectionCard({ title, icon: Icon, description, children }) {
  return (
    <section style={styles.sectionCard}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionIcon}>
          <Icon size={18} />
        </div>
        <div>
          <h3 style={styles.sectionTitle}>{title}</h3>
          {description ? (
            <p style={styles.sectionDescription}>{description}</p>
          ) : null}
        </div>
      </div>
      <div style={styles.sectionContent}>{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldHeader}>
        <label style={styles.label}>{label}</label>
        {hint ? <span style={styles.hint}>{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function toDateTimeLocal(value) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function mapRecordToForm(record) {
  return {
    app_number: record.app_number || "",
    route_id: record.route_id || "",
    record_type: record.record_type || "",
    status: record.status || "",
    occurred_at: toDateTimeLocal(record.occurred_at),

    call_number: record.call_number || "",
    grp_number: record.grp_number || "",
    qr_code_read: record.qr_code_read || "",

    location_id: record.location_id || "",
    location_manual: record.location_manual || "",

    sector_id: record.sector_id || "",
    sector_manual: record.sector_manual || "",

    equipment_id: record.equipment_id || "",
    equipment_manual: record.equipment_manual || "",
    tombamento_manual: record.tombamento_manual || "",

    route_responsible_id: record.route_responsible_id || "",
    route_responsible_manual_name: record.route_responsible_manual_name || "",
    route_responsible_manual_registration:
      record.route_responsible_manual_registration || "",

    receiver_employee_id: record.receiver_employee_id || "",
    receiver_manual_name: record.receiver_manual_name || "",
    receiver_manual_registration: record.receiver_manual_registration || "",

    sender_employee_id: record.sender_employee_id || "",
    sender_manual_name: record.sender_manual_name || "",
    sender_manual_registration: record.sender_manual_registration || "",

    delivery_signature_path: record.delivery_signature_path || "",
    reception_signature_path: record.reception_signature_path || "",
    maintenance_signature_path: record.maintenance_signature_path || "",

    maintenance_confirmation: record.maintenance_confirmation === true,
    maintenance_confirmed_by: record.maintenance_confirmed_by || "",
    maintenance_confirmed_at: toDateTimeLocal(record.maintenance_confirmed_at),

    observations: record.observations || "",
    cancellation_reason: record.cancellation_reason || "",

    delivery_signature_mime_type: record.delivery_signature_mime_type || "",
    reception_signature_mime_type: record.reception_signature_mime_type || "",
    maintenance_signature_mime_type:
      record.maintenance_signature_mime_type || "",
  };
}

export default function RecordEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [originalRecord, setOriginalRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceBusy, setMaintenanceBusy] = useState(false);

  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isCancelled = form.status === "cancelled";
  const isCompletedLike = ["completed", "received", "delivered"].includes(
    form.status
  );

  const readOnlyMode = isCancelled;
  const restrictedMode = isCompletedLike;

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateTextField(e) {
    const { name, value, type, checked } = e.target;
    updateField(name, type === "checkbox" ? checked : value);
  }

  async function loadOptions() {
    setLoadingOptions(true);

    try {
      const [
        routesRes,
        locationsRes,
        sectorsRes,
        equipmentsRes,
        employeesRes,
      ] = await Promise.all([
        supabase.from("routes").select("id, name").order("name"),
        supabase.from("locations").select("id, name").order("name"),
        supabase.from("sectors").select("id, name").order("name"),
        supabase
          .from("equipments")
          .select("id, name, default_tombamento")
          .order("name"),
        supabase
          .from("employees")
          .select("id, name, registration")
          .order("name"),
      ]);

      const errors = [
        routesRes.error,
        locationsRes.error,
        sectorsRes.error,
        equipmentsRes.error,
        employeesRes.error,
      ].filter(Boolean);

      if (errors.length > 0) throw errors[0];

      setRoutes(routesRes.data ?? []);
      setLocations(locationsRes.data ?? []);
      setSectors(sectorsRes.data ?? []);
      setEquipments(equipmentsRes.data ?? []);
      setEmployees(employeesRes.data ?? []);
    } catch (err) {
      setErrorMessage(
        err.message || "Não foi possível carregar os dados auxiliares."
      );
    } finally {
      setLoadingOptions(false);
    }
  }

  async function loadRecord() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchRecordById(id);
      setOriginalRecord(data);
      setForm(mapRecordToForm(data));
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível carregar o registro.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOptions();
    loadRecord();
  }, [id]);

  const selectedEquipment = useMemo(
    () => equipments.find((item) => item.id === form.equipment_id),
    [equipments, form.equipment_id]
  );

  useEffect(() => {
    if (
      selectedEquipment?.default_tombamento &&
      !form.tombamento_manual &&
      !originalRecord?.tombamento_manual
    ) {
      setForm((prev) => ({
        ...prev,
        tombamento_manual: selectedEquipment.default_tombamento || "",
      }));
    }
  }, [selectedEquipment, form.tombamento_manual, originalRecord]);

  const summary = useMemo(() => {
    const route = routes.find((item) => item.id === form.route_id);

    return {
      routeName: route?.name || "Sem rota vinculada",
      statusLabel:
        RECORD_STATUS_OPTIONS.find((item) => item.value === form.status)?.label ||
        form.status ||
        "Sem status",
      typeLabel:
        RECORD_TYPE_OPTIONS.find((item) => item.value === form.record_type)?.label ||
        form.record_type ||
        "Sem tipo",
    };
  }, [routes, form.route_id, form.status, form.record_type]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (!form.record_type) throw new Error("Selecione o tipo do registro.");
      if (!form.status) throw new Error("Selecione o status do registro.");
      if (form.status === "cancelled" && !form.cancellation_reason.trim()) {
        throw new Error("Informe o motivo do cancelamento.");
      }

      await updateRecord(id, form);
      setSuccessMessage("Registro atualizado com sucesso.");
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível atualizar o registro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmMaintenance() {
    setMaintenanceBusy(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await confirmMaintenance(id);
      await loadRecord();
      setSuccessMessage("Manutenção confirmada com sucesso.");
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível confirmar a manutenção.");
    } finally {
      setMaintenanceBusy(false);
    }
  }

  async function handleRemoveMaintenanceConfirmation() {
    setMaintenanceBusy(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await removeMaintenanceConfirmation(id);
      await loadRecord();
      setSuccessMessage("Confirmação de manutenção removida com sucesso.");
    } catch (err) {
      setErrorMessage(
        err.message || "Não foi possível remover a confirmação."
      );
    } finally {
      setMaintenanceBusy(false);
    }
  }

  if (loading || loadingOptions) {
    return (
      <div style={styles.loadingCard}>
        <p style={styles.loadingTitle}>Carregando registro...</p>
        <p style={styles.loadingText}>
          Aguarde enquanto buscamos os dados para edição.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <FileEdit size={15} />
            <span>Edição operacional</span>
          </div>

          <h1 style={styles.heroTitle}>Editar registro</h1>

          <p style={styles.heroText}>
            Atualize dados do registro, confirme manutenção e ajuste informações
            operacionais mantendo o mesmo padrão premium do sistema.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Tipo</span>
              <strong style={styles.heroMetricValue}>{summary.typeLabel}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status</span>
              <strong style={styles.heroMetricValue}>{summary.statusLabel}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Rota</span>
              <strong style={styles.heroMetricValue}>{summary.routeName}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to={`/registros/${id}`} style={styles.ghostButton}>
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </Link>

          <button
            type="submit"
            form="record-edit-form"
            disabled={saving || readOnlyMode}
            style={styles.primaryButton}
          >
            <Save size={18} />
            <span>{saving ? "Salvando..." : "Salvar alterações"}</span>
          </button>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Tipo atual</p>
              <h3 style={styles.statValue}>{summary.typeLabel}</h3>
            </div>
            <div style={styles.statIcon}>
              <ClipboardList size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Natureza operacional registrada</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Status</p>
              <h3 style={styles.statValue}>{summary.statusLabel}</h3>
            </div>
            <div style={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Situação atual do fluxo</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Manutenção</p>
              <h3 style={styles.statValue}>
                {form.maintenance_confirmation ? "Confirmada" : "Pendente"}
              </h3>
            </div>
            <div style={styles.statIcon}>
              <Wrench size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Controle técnico do registro</p>
        </article>
      </section>

      {readOnlyMode ? (
        <div style={styles.warningBox}>
          <AlertTriangle size={18} />
          <span>Este registro está cancelado. A edição está bloqueada.</span>
        </div>
      ) : restrictedMode ? (
        <div style={styles.infoBox}>
          <Sparkles size={18} />
          <span>
            Este registro já está concluído. Edite apenas quando realmente necessário.
          </span>
        </div>
      ) : null}

      {successMessage ? <div style={styles.successBox}>{successMessage}</div> : null}
      {errorMessage ? <div style={styles.errorBox}>{errorMessage}</div> : null}

      <form id="record-edit-form" onSubmit={handleSubmit} style={styles.form}>
        <SectionCard
          title="Identificação"
          icon={ClipboardList}
          description="Dados principais do registro operacional."
        >
          <div style={styles.grid3}>
            <Field label="APP">
              <input
                name="app_number"
                value={form.app_number}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Número APP"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Chamado">
              <input
                name="call_number"
                value={form.call_number}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Número do chamado"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="GRP">
              <input
                name="grp_number"
                value={form.grp_number}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Número GRP"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Data/Hora da ocorrência">
              <input
                type="datetime-local"
                name="occurred_at"
                value={form.occurred_at}
                onChange={updateTextField}
                style={styles.input}
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Tipo do registro">
              <select
                name="record_type"
                value={form.record_type}
                onChange={updateTextField}
                style={styles.input}
                required
                disabled={readOnlyMode || restrictedMode}
              >
                <option value="">Selecione</option>
                {RECORD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status">
              <select
                name="status"
                value={form.status}
                onChange={updateTextField}
                style={styles.input}
                required
                disabled={readOnlyMode}
              >
                <option value="">Selecione</option>
                {RECORD_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Rota"
          icon={MapPin}
          description="Vincule o registro a uma rota e ao responsável, quando necessário."
        >
          <div style={styles.grid3}>
            <Field label="Rota">
              <select
                name="route_id"
                value={form.route_id}
                onChange={updateTextField}
                style={styles.input}
                disabled={readOnlyMode || restrictedMode}
              >
                <option value="">Sem rota</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Responsável da rota">
              <select
                name="route_responsible_id"
                value={form.route_responsible_id}
                onChange={updateTextField}
                style={styles.input}
                disabled={readOnlyMode || restrictedMode}
              >
                <option value="">Selecionar funcionário</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                    {employee.registration ? ` • ${employee.registration}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="QR Code lido">
              <input
                name="qr_code_read"
                value={form.qr_code_read}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Conteúdo do QR Code"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Nome manual do responsável">
              <input
                name="route_responsible_manual_name"
                value={form.route_responsible_manual_name}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Preencha se não houver funcionário cadastrado"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>

            <Field label="Matrícula manual do responsável">
              <input
                name="route_responsible_manual_registration"
                value={form.route_responsible_manual_registration}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Matrícula manual"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Local / Setor / Equipamento"
          icon={Package}
          description="Dados do patrimônio e do ponto operacional relacionado."
        >
          <div style={styles.grid3}>
            <Field label="Local">
              <select
                name="location_id"
                value={form.location_id}
                onChange={updateTextField}
                style={styles.input}
                disabled={readOnlyMode || restrictedMode}
              >
                <option value="">Selecionar local</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Setor">
              <select
                name="sector_id"
                value={form.sector_id}
                onChange={updateTextField}
                style={styles.input}
                disabled={readOnlyMode || restrictedMode}
              >
                <option value="">Selecionar setor</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Equipamento">
              <select
                name="equipment_id"
                value={form.equipment_id}
                onChange={updateTextField}
                style={styles.input}
                disabled={readOnlyMode || restrictedMode}
              >
                <option value="">Selecionar equipamento</option>
                {equipments.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name}
                    {equipment.default_tombamento
                      ? ` • ${equipment.default_tombamento}`
                      : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Local manual">
              <input
                name="location_manual"
                value={form.location_manual}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Preencha se o local não estiver cadastrado"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>

            <Field label="Setor manual">
              <input
                name="sector_manual"
                value={form.sector_manual}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Preencha se o setor não estiver cadastrado"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>

            <Field label="Equipamento manual">
              <input
                name="equipment_manual"
                value={form.equipment_manual}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Preencha se o equipamento não estiver cadastrado"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>

            <Field label="Tombamento manual">
              <input
                name="tombamento_manual"
                value={form.tombamento_manual}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Tombamento"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Envolvidos"
          icon={User}
          description="Remetente, recebedor e identificações manuais quando necessário."
        >
          <div style={styles.grid3}>
            <Field label="Remetente">
              <select
                name="sender_employee_id"
                value={form.sender_employee_id}
                onChange={updateTextField}
                style={styles.input}
                disabled={readOnlyMode || restrictedMode}
              >
                <option value="">Selecionar funcionário</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                    {employee.registration ? ` • ${employee.registration}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Recebedor">
              <select
                name="receiver_employee_id"
                value={form.receiver_employee_id}
                onChange={updateTextField}
                style={styles.input}
                disabled={readOnlyMode || restrictedMode}
              >
                <option value="">Selecionar funcionário</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                    {employee.registration ? ` • ${employee.registration}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nome manual do remetente">
              <input
                name="sender_manual_name"
                value={form.sender_manual_name}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Nome manual do remetente"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>

            <Field label="Matrícula manual do remetente">
              <input
                name="sender_manual_registration"
                value={form.sender_manual_registration}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Matrícula manual"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>

            <Field label="Nome manual do recebedor">
              <input
                name="receiver_manual_name"
                value={form.receiver_manual_name}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Nome manual do recebedor"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>

            <Field label="Matrícula manual do recebedor">
              <input
                name="receiver_manual_registration"
                value={form.receiver_manual_registration}
                onChange={updateTextField}
                style={styles.input}
                placeholder="Matrícula manual"
                disabled={readOnlyMode || restrictedMode}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Assinaturas e manutenção"
          icon={Wrench}
          description="Campos de apoio para confirmação, evidência e manutenção."
        >
          <div style={styles.grid3}>
            <Field label="Caminho da assinatura de entrega">
              <input
                name="delivery_signature_path"
                value={form.delivery_signature_path}
                onChange={updateTextField}
                style={styles.input}
                placeholder="storage/path/assinatura-entrega"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Mime type da assinatura de entrega">
              <input
                name="delivery_signature_mime_type"
                value={form.delivery_signature_mime_type}
                onChange={updateTextField}
                style={styles.input}
                placeholder="image/png"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Caminho da assinatura de recepção">
              <input
                name="reception_signature_path"
                value={form.reception_signature_path}
                onChange={updateTextField}
                style={styles.input}
                placeholder="storage/path/assinatura-recepcao"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Mime type da assinatura de recepção">
              <input
                name="reception_signature_mime_type"
                value={form.reception_signature_mime_type}
                onChange={updateTextField}
                style={styles.input}
                placeholder="image/png"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Caminho da assinatura de manutenção">
              <input
                name="maintenance_signature_path"
                value={form.maintenance_signature_path}
                onChange={updateTextField}
                style={styles.input}
                placeholder="storage/path/assinatura-manutencao"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Mime type da assinatura de manutenção">
              <input
                name="maintenance_signature_mime_type"
                value={form.maintenance_signature_mime_type}
                onChange={updateTextField}
                style={styles.input}
                placeholder="image/png"
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Manutenção confirmada">
              <div style={styles.maintenanceActions}>
                {form.maintenance_confirmation ? (
                  <>
                    <span style={styles.maintenanceConfirmedBadge}>
                      Confirmada
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveMaintenanceConfirmation}
                      disabled={maintenanceBusy || readOnlyMode}
                      style={styles.maintenanceSecondaryButton}
                    >
                      {maintenanceBusy ? "Processando..." : "Remover confirmação"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmMaintenance}
                    disabled={maintenanceBusy || readOnlyMode}
                    style={styles.maintenancePrimaryButton}
                  >
                    {maintenanceBusy ? "Processando..." : "Confirmar manutenção"}
                  </button>
                )}
              </div>
            </Field>

            <Field label="Confirmado em">
              <input
                type="datetime-local"
                name="maintenance_confirmed_at"
                value={form.maintenance_confirmed_at}
                onChange={updateTextField}
                style={styles.input}
                disabled
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Observações e controle"
          icon={ShieldCheck}
          description="Informações complementares e motivo de cancelamento quando aplicável."
        >
          <div style={styles.grid2}>
            <Field label="Observações">
              <textarea
                name="observations"
                value={form.observations}
                onChange={updateTextField}
                style={styles.textarea}
                placeholder="Detalhes operacionais, contexto, observações gerais..."
                disabled={readOnlyMode}
              />
            </Field>

            <Field label="Motivo de cancelamento">
              <textarea
                name="cancellation_reason"
                value={form.cancellation_reason}
                onChange={updateTextField}
                style={styles.textarea}
                placeholder="Preencha apenas quando houver cancelamento"
                disabled={readOnlyMode}
              />
            </Field>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    paddingBottom: "8px",
    color: "#fff",
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "26px",
    padding: "32px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    background:
      "linear-gradient(135deg, #17233f 0%, #1a2646 45%, #0f172a 100%)",
    boxShadow: "0 22px 55px rgba(15, 23, 42, 0.22)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "28px",
    color: "#ffffff",
  },

  heroGlowA: {
    position: "absolute",
    top: "-80px",
    right: "-40px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.08)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },

  heroGlowB: {
    position: "absolute",
    bottom: "-90px",
    left: "-30px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
    filter: "blur(32px)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "820px",
  },

  heroBadge: {
    width: "fit-content",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e2e8f0",
    fontSize: "0.82rem",
    fontWeight: "700",
    letterSpacing: "0.02em",
  },

  heroTitle: {
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.03em",
    fontSize: "52px",
    lineHeight: 1.05,
  },

  heroText: {
    margin: 0,
    maxWidth: "720px",
    color: "rgba(226,232,240,0.82)",
    lineHeight: 1.7,
    fontSize: "1rem",
  },

  heroMetrics: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "18px",
    marginTop: "12px",
  },

  heroMetricItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  heroMetricLabel: {
    fontSize: "0.76rem",
    color: "rgba(148,163,184,0.95)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 700,
  },

  heroMetricValue: {
    fontSize: "1rem",
    color: "#ffffff",
    fontWeight: 800,
  },

  heroDivider: {
    width: "1px",
    height: "34px",
    background: "rgba(255,255,255,0.16)",
  },

  heroActions: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "flex-start",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    border: "1px solid rgba(34,197,94,0.22)",
    fontWeight: 800,
    boxShadow: "0 16px 32px rgba(34,197,94,0.18)",
    cursor: "pointer",
  },

  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 700,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },

  statCard: {
    borderRadius: "24px",
    padding: "18px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
    color: "#ffffff",
  },

  statCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
    flexShrink: 0,
  },

  statTitle: {
    margin: "0 0 6px",
    fontSize: "0.82rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },

  statValue: {
    margin: 0,
    fontSize: "1.3rem",
    color: "#ffffff",
    letterSpacing: "-0.03em",
  },

  statDetail: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.92rem",
  },

  successBox: {
    borderRadius: "16px",
    padding: "14px 16px",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.22)",
    color: "#bbf7d0",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  errorBox: {
    borderRadius: "16px",
    padding: "14px 16px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.22)",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  warningBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "16px",
    padding: "14px 16px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.22)",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  infoBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "16px",
    padding: "14px 16px",
    background: "rgba(59, 130, 246, 0.12)",
    border: "1px solid rgba(59, 130, 246, 0.22)",
    color: "#bfdbfe",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  loadingCard: {
    width: "100%",
    padding: "28px",
    borderRadius: "24px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.94), rgba(2,6,23,0.92))",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
  },

  loadingTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "22px",
    fontWeight: 800,
  },

  loadingText: {
    margin: "10px 0 0 0",
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  sectionCard: {
    borderRadius: "26px",
    padding: "24px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.94), rgba(2,6,23,0.92))",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "20px",
  },

  sectionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#22c55e",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  },

  sectionDescription: {
    margin: "6px 0 0 0",
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  sectionContent: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(148, 163, 184, 0.08)",
  },

  fieldHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  label: {
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 700,
  },

  hint: {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.4,
  },

  input: {
    width: "100%",
    height: "48px",
    padding: "0 14px",
    borderRadius: "14px",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    background: "rgba(15, 23, 42, 0.94)",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    background: "rgba(15, 23, 42, 0.94)",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  maintenanceActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  maintenanceConfirmedBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#bbf7d0",
    fontSize: "12px",
    fontWeight: 700,
  },

  maintenancePrimaryButton: {
    height: "42px",
    border: "none",
    borderRadius: "12px",
    padding: "0 14px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 45%, #3b82f6 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  maintenanceSecondaryButton: {
    height: "42px",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: "12px",
    padding: "0 14px",
    background: "rgba(15, 23, 42, 0.94)",
    color: "#e2e8f0",
    fontWeight: 700,
    cursor: "pointer",
  },
};