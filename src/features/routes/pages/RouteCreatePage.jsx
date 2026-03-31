import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MapPinned,
  Route,
  Save,
  ShieldCheck,
  Truck,
  UserRound,
  UserSquare2,
  FileText,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const STATUS_OPTIONS = [
  { value: "planejada", label: "Planejada" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "finalizada", label: "Finalizada" },
  { value: "cancelada", label: "Cancelada" },
];

export default function RouteCreatePage() {
  const navigate = useNavigate();

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    route_date: "",
    departure_location_id: "",
    status: "planejada",
    notes: "",
    responsible_mode: "employee",
    route_responsible_id: "",
    route_responsible_manual_name: "",
    route_responsible_manual_registration: "",
  });

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoadingPage(true);
        setError("");

        const [employeesResult, locationsResult] = await Promise.all([
          supabase
            .from("employees")
            .select("id, name, registration, active")
            .eq("active", true)
            .order("name", { ascending: true }),
          supabase
            .from("locations")
            .select("id, name, active")
            .eq("active", true)
            .order("name", { ascending: true }),
        ]);

        if (employeesResult.error) throw employeesResult.error;
        if (locationsResult.error) throw locationsResult.error;

        setEmployees(employeesResult.data || []);
        setLocations(locationsResult.data || []);
      } catch (err) {
        setError(err.message || "Erro ao carregar os dados da rota.");
      } finally {
        setLoadingPage(false);
      }
    }

    loadPageData();
  }, []);

  const selectedEmployee = useMemo(() => {
    return employees.find((item) => item.id === form.route_responsible_id) || null;
  }, [employees, form.route_responsible_id]);

  const formIsValid = useMemo(() => {
    const hasDate = Boolean(form.route_date);
    const hasDeparture = Boolean(form.departure_location_id);
    const hasResponsible =
      form.responsible_mode === "employee"
        ? Boolean(form.route_responsible_id)
        : Boolean(form.route_responsible_manual_name.trim());

    return hasDate && hasDeparture && hasResponsible;
  }, [form]);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleResponsibleModeChange(mode) {
    setForm((prev) => ({
      ...prev,
      responsible_mode: mode,
      route_responsible_id: mode === "employee" ? prev.route_responsible_id : "",
      route_responsible_manual_name:
        mode === "manual" ? prev.route_responsible_manual_name : "",
      route_responsible_manual_registration:
        mode === "manual" ? prev.route_responsible_manual_registration : "",
    }));
  }

  function validateForm() {
    if (!form.route_date) {
      return "Selecione a data da rota.";
    }

    if (!form.departure_location_id) {
      return "Selecione o local de saída.";
    }

    if (form.responsible_mode === "employee" && !form.route_responsible_id) {
      return "Selecione um responsável.";
    }

    if (
      form.responsible_mode === "manual" &&
      !form.route_responsible_manual_name.trim()
    ) {
      return "Informe o nome do responsável manual.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccessMessage("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const payload = {
        route_date: form.route_date,
        departure_location_id: form.departure_location_id,
        status: form.status,
        notes: form.notes.trim() || null,
        route_responsible_id:
          form.responsible_mode === "employee"
            ? form.route_responsible_id
            : null,
        route_responsible_manual_name:
          form.responsible_mode === "manual"
            ? form.route_responsible_manual_name.trim()
            : null,
        route_responsible_manual_registration:
          form.responsible_mode === "manual"
            ? form.route_responsible_manual_registration.trim() || null
            : null,
        created_by: user?.id || null,
      };

      const { data, error: insertError } = await supabase
        .from("routes")
        .insert(payload)
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSuccessMessage("Rota criada com sucesso.");
      navigate(`/rotas/${data.id}`);
    } catch (err) {
      setError(err.message || "Não foi possível criar a rota.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingPage) {
    return (
      <div style={styles.page}>
        <section style={styles.loadingCard}>
          <Loader2 size={22} style={styles.spinner} />
          <div>
            <h2 style={styles.loadingTitle}>Preparando formulário</h2>
            <p style={styles.loadingText}>
              Carregando responsáveis e locais para criação da rota...
            </p>
          </div>
        </section>
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
            <Sparkles size={15} />
            <span>Cadastro premium de itinerário</span>
          </div>

          <h1 style={styles.heroTitle}>Nova rota</h1>

          <p style={styles.heroText}>
            Configure a operação com data, responsável, local de saída e status
            inicial em uma experiência mais organizada e alinhada ao padrão SaaS
            do painel.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Responsáveis ativos</span>
              <strong style={styles.heroMetricValue}>{employees.length}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Locais disponíveis</span>
              <strong style={styles.heroMetricValue}>{locations.length}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status inicial</span>
              <strong style={styles.heroMetricValue}>
                {STATUS_OPTIONS.find((item) => item.value === form.status)?.label}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/rotas" style={styles.backButton}>
            <ArrowLeft size={17} />
            <span>Voltar</span>
          </Link>
        </div>
      </section>

      <div style={styles.contentGrid}>
        <section style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>Formulário operacional</p>
              <h2 style={styles.cardTitle}>Criar rota</h2>
              <p style={styles.cardText}>
                Preencha os dados principais para cadastrar uma nova rota no
                sistema.
              </p>
            </div>
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {successMessage ? (
            <div style={styles.successBox}>{successMessage}</div>
          ) : null}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldsGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <CalendarDays size={16} />
                  <span>Data da rota</span>
                </label>
                <input
                  type="date"
                  value={form.route_date}
                  onChange={(e) => updateField("route_date", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <MapPinned size={16} />
                  <span>Local de saída</span>
                </label>
                <div style={styles.selectWrap}>
                  <select
                    value={form.departure_location_id}
                    onChange={(e) =>
                      updateField("departure_location_id", e.target.value)
                    }
                    style={styles.select}
                  >
                    <option value="">Selecione um local</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={styles.selectIcon} />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <ShieldCheck size={16} />
                  <span>Status inicial</span>
                </label>
                <div style={styles.selectWrap}>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    style={styles.select}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={styles.selectIcon} />
                </div>
              </div>
            </div>

            <div style={styles.responsibleCard}>
              <div style={styles.responsibleHeader}>
                <div>
                  <p style={styles.sectionKicker}>Responsável pela rota</p>
                  <h3 style={styles.subTitle}>Definição do responsável</h3>
                  <p style={styles.subText}>
                    Você pode escolher um colaborador já cadastrado ou informar
                    um responsável manualmente.
                  </p>
                </div>
              </div>

              <div style={styles.modeTabs}>
                <button
                  type="button"
                  onClick={() => handleResponsibleModeChange("employee")}
                  style={{
                    ...styles.modeButton,
                    ...(form.responsible_mode === "employee"
                      ? styles.modeButtonActive
                      : {}),
                  }}
                >
                  <UserRound size={16} />
                  <span>Colaborador cadastrado</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleResponsibleModeChange("manual")}
                  style={{
                    ...styles.modeButton,
                    ...(form.responsible_mode === "manual"
                      ? styles.modeButtonActive
                      : {}),
                  }}
                >
                  <UserSquare2 size={16} />
                  <span>Responsável manual</span>
                </button>
              </div>

              {form.responsible_mode === "employee" ? (
                <div style={styles.fieldsGrid}>
                  <div style={styles.fieldGroupWide}>
                    <label style={styles.label}>
                      <Truck size={16} />
                      <span>Responsável</span>
                    </label>
                    <div style={styles.selectWrap}>
                      <select
                        value={form.route_responsible_id}
                        onChange={(e) =>
                          updateField("route_responsible_id", e.target.value)
                        }
                        style={styles.select}
                      >
                        <option value="">Selecione um responsável</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                            {employee.registration
                              ? ` - ${employee.registration}`
                              : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} style={styles.selectIcon} />
                    </div>

                    {selectedEmployee ? (
                      <div style={styles.helperCard}>
                        <span style={styles.helperTitle}>Selecionado:</span>
                        <span style={styles.helperText}>
                          {selectedEmployee.name}
                          {selectedEmployee.registration
                            ? ` • Matrícula ${selectedEmployee.registration}`
                            : ""}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div style={styles.fieldsGrid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      <UserRound size={16} />
                      <span>Nome do responsável</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: João da Silva"
                      value={form.route_responsible_manual_name}
                      onChange={(e) =>
                        updateField(
                          "route_responsible_manual_name",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      <ShieldCheck size={16} />
                      <span>Matrícula / identificação</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex.: 12345"
                      value={form.route_responsible_manual_registration}
                      onChange={(e) =>
                        updateField(
                          "route_responsible_manual_registration",
                          e.target.value
                        )
                      }
                      style={styles.input}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <FileText size={16} />
                <span>Observações</span>
              </label>
              <textarea
                rows={6}
                placeholder="Informe detalhes importantes sobre a rota, pontos de atenção ou observações operacionais..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.formActions}>
              <Link to="/rotas" style={styles.cancelButton}>
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={saving || !formIsValid}
                style={{
                  ...styles.submitButton,
                  ...(saving || !formIsValid ? styles.submitButtonDisabled : {}),
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={17} style={styles.spinner} />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    <span>Criar rota</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <aside style={styles.sideColumn}>
          <section style={styles.sideCard}>
            <div style={styles.sideIconWrap}>
              <Route size={20} />
            </div>
            <h3 style={styles.sideTitle}>Resumo do cadastro</h3>

            <div style={styles.summaryList}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Data</span>
                <strong style={styles.summaryValue}>
                  {form.route_date
                    ? new Date(`${form.route_date}T00:00:00`).toLocaleDateString(
                        "pt-BR",
                        { timeZone: "UTC" }
                      )
                    : "Não definida"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Saída</span>
                <strong style={styles.summaryValue}>
                  {locations.find((item) => item.id === form.departure_location_id)
                    ?.name || "Não definida"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Responsável</span>
                <strong style={styles.summaryValue}>
                  {form.responsible_mode === "employee"
                    ? selectedEmployee?.name || "Não definido"
                    : form.route_responsible_manual_name || "Não definido"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Status</span>
                <strong style={styles.summaryValue}>
                  {STATUS_OPTIONS.find((item) => item.value === form.status)?.label}
                </strong>
              </div>
            </div>
          </section>

          <section style={styles.sideCardSoft}>
            <div style={styles.sideCardHeader}>
              <CheckCircle2 size={18} />
              <span>Dicas rápidas</span>
            </div>

            <ul style={styles.tipList}>
              <li style={styles.tipItem}>
                Prefira selecionar um colaborador já cadastrado para manter os
                vínculos organizados.
              </li>
              <li style={styles.tipItem}>
                Use observações para registrar particularidades da operação.
              </li>
              <li style={styles.tipItem}>
                Deixe o status como <strong>Planejada</strong> ao criar, quando
                a rota ainda não começou.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    paddingBottom: "8px",
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "28px",
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
    flexWrap: "wrap",
  },

  heroGlowA: {
    position: "absolute",
    top: "-80px",
    right: "-30px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.09)",
    filter: "blur(34px)",
    pointerEvents: "none",
  },

  heroGlowB: {
    position: "absolute",
    bottom: "-100px",
    left: "-40px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
    filter: "blur(36px)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "790px",
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
    fontWeight: 700,
    letterSpacing: "0.02em",
  },

  heroTitle: {
    margin: 0,
    fontSize: "clamp(2rem, 4vw, 3.35rem)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "#ffffff",
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
    marginTop: "8px",
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
    gap: "12px",
    alignItems: "flex-start",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "16px",
    background: "rgba(15, 23, 42, 0.38)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontWeight: 700,
    boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 0.7fr)",
    gap: "22px",
    alignItems: "start",
  },

  mainCard: {
    borderRadius: "28px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    padding: "26px",
    color: "#ffffff",
  },

  cardHeader: {
    marginBottom: "20px",
  },

  sectionKicker: {
    margin: "0 0 8px",
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#22c55e",
  },

  cardTitle: {
    margin: "0 0 8px",
    fontSize: "1.5rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#ffffff",
  },

  cardText: {
    margin: 0,
    color: "rgba(148,163,184,0.92)",
    lineHeight: 1.6,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  fieldGroupWide: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    gridColumn: "1 / -1",
  },

  label: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#e2e8f0",
  },

  input: {
    minHeight: "48px",
    borderRadius: "14px",
    padding: "0 14px",
    background: "#0b1326",
    border: "1px solid rgba(59,130,246,0.16)",
    color: "#ffffff",
    outline: "none",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  },

  textarea: {
    minHeight: "140px",
    borderRadius: "16px",
    padding: "14px 16px",
    background: "#0b1326",
    border: "1px solid rgba(59,130,246,0.16)",
    color: "#ffffff",
    outline: "none",
    resize: "vertical",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },

  selectWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  select: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    width: "100%",
    minHeight: "48px",
    borderRadius: "14px",
    padding: "0 42px 0 14px",
    background: "#0b1326",
    border: "1px solid rgba(59,130,246,0.16)",
    color: "#ffffff",
    outline: "none",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  },

  selectIcon: {
    position: "absolute",
    right: "14px",
    pointerEvents: "none",
    color: "#94a3b8",
  },

  responsibleCard: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(10, 16, 31, 0.52)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  responsibleHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },

  subTitle: {
    margin: "0 0 6px",
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "#ffffff",
  },

  subText: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.6,
  },

  modeTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },

  modeButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "44px",
    padding: "0 14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontWeight: 700,
  },

  modeButtonActive: {
    background: "rgba(34,197,94,0.12)",
    color: "#4ade80",
    border: "1px solid rgba(34,197,94,0.22)",
    boxShadow: "0 10px 24px rgba(34,197,94,0.10)",
  },

  helperCard: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  helperTitle: {
    fontSize: "0.82rem",
    fontWeight: 800,
    color: "#22c55e",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  helperText: {
    fontSize: "0.92rem",
    color: "#e2e8f0",
    fontWeight: 600,
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    paddingTop: "6px",
  },

  cancelButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "48px",
    padding: "0 18px",
    borderRadius: "14px",
    textDecoration: "none",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontWeight: 700,
  },

  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "48px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "1px solid rgba(34,197,94,0.22)",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 16px 32px rgba(34,197,94,0.18)",
  },

  submitButtonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  sideCard: {
    borderRadius: "24px",
    padding: "22px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    color: "#ffffff",
  },

  sideCardSoft: {
    borderRadius: "24px",
    padding: "22px",
    background: "rgba(10,16,31,0.8)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
    color: "#ffffff",
  },

  sideIconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
    marginBottom: "14px",
  },

  sideTitle: {
    margin: "0 0 16px",
    fontSize: "1.08rem",
    fontWeight: 800,
    color: "#ffffff",
  },

  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  summaryLabel: {
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  summaryValue: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#ffffff",
  },

  sideCardHeader: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "16px",
  },

  tipList: {
    margin: 0,
    paddingLeft: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    color: "#cbd5e1",
    lineHeight: 1.6,
  },

  tipItem: {
    margin: 0,
  },

  errorBox: {
    marginBottom: "16px",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.18)",
    color: "#fecaca",
    fontWeight: 600,
  },

  successBox: {
    marginBottom: "16px",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.18)",
    color: "#bbf7d0",
    fontWeight: 600,
  },

  loadingCard: {
    minHeight: "220px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "24px",
  },

  loadingTitle: {
    margin: "0 0 4px",
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "#ffffff",
  },

  loadingText: {
    margin: 0,
    color: "#94a3b8",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },
};