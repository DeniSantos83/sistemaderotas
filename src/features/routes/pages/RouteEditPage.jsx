import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Plus,
  Route,
  Save,
  Trash2,
  User2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import {
  getRouteById,
  listRouteStops,
  updateRoute,
} from "../services/routesService";
import { listEmployees } from "../../employees/services/employeesService";
import { listLocations } from "../../locations/services/locationsService";

const initialForm = {
  route_date: "",
  route_responsible_id: "",
  route_responsible_manual_name: "",
  route_responsible_manual_registration: "",
  departure_location_id: "",
  status: "planejada",
  notes: "",
  stops: [{ location_id: "", notes: "" }],
};

const statusOptions = [
  { value: "planejada", label: "Planejada" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "finalizada", label: "Finalizada" },
  { value: "cancelada", label: "Cancelada" },
];

export default function RouteEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setError("");

        const [routeData, stopsData, employeesData, locationsData] =
          await Promise.all([
            getRouteById(id),
            listRouteStops(id),
            listEmployees(),
            listLocations(),
          ]);

        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setLocations(Array.isArray(locationsData) ? locationsData : []);

        setForm({
          route_date: routeData?.route_date || "",
          route_responsible_id: routeData?.route_responsible_id || "",
          route_responsible_manual_name:
            routeData?.route_responsible_manual_name || "",
          route_responsible_manual_registration:
            routeData?.route_responsible_manual_registration || "",
          departure_location_id: routeData?.departure_location_id || "",
          status: routeData?.status || "planejada",
          notes: routeData?.notes || "",
          stops:
            Array.isArray(stopsData) && stopsData.length > 0
              ? stopsData.map((item) => ({
                  location_id: item?.location_id || "",
                  notes: item?.notes || "",
                }))
              : [{ location_id: "", notes: "" }],
        });
      } catch (err) {
        setError(err.message || "Não foi possível carregar a rota.");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [id]);

  const selectedResponsible = useMemo(() => {
    return employees.find((item) => item.id === form.route_responsible_id);
  }, [employees, form.route_responsible_id]);

  const selectedDepartureLocation = useMemo(() => {
    return locations.find((item) => item.id === form.departure_location_id);
  }, [locations, form.departure_location_id]);

  const filledStopsCount = useMemo(() => {
    return form.stops.filter((item) => item.location_id).length;
  }, [form.stops]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  }

  function handleStopChange(index, field, value) {
    setForm((old) => {
      const nextStops = [...old.stops];
      nextStops[index] = {
        ...nextStops[index],
        [field]: value,
      };

      return {
        ...old,
        stops: nextStops,
      };
    });
  }

  function handleAddStop() {
    setForm((old) => ({
      ...old,
      stops: [...old.stops, { location_id: "", notes: "" }],
    }));
  }

  function handleRemoveStop(index) {
    setForm((old) => ({
      ...old,
      stops:
        old.stops.length === 1
          ? [{ location_id: "", notes: "" }]
          : old.stops.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      await updateRoute(id, form);
      navigate("/rotas");
    } catch (err) {
      setError(err.message || "Não foi possível salvar as alterações.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingGlowA} />
        <div style={styles.loadingGlowB} />
        <div style={styles.loadingCard}>
          <div style={styles.loadingIconWrap}>
            <Route size={22} />
          </div>
          <div>
            <h2 style={styles.loadingTitle}>Carregando rota</h2>
            <p style={styles.loadingText}>
              Buscando dados da rota, paradas e informações auxiliares...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroTop}>
          <div style={styles.heroContent}>
            <span style={styles.heroBadge}>Edição operacional</span>
            <h1 style={styles.heroTitle}>Editar rota</h1>
            <p style={styles.heroSubtitle}>
              Atualize a programação, responsável, local de saída e a sequência
              de paradas com uma experiência mais profissional e organizada.
            </p>
          </div>

          <div style={styles.heroActions}>
            <Link to="/rotas" style={styles.ghostButton}>
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </Link>

            <button
              type="submit"
              form="route-edit-form"
              style={submitting ? styles.primaryButtonDisabled : styles.primaryButton}
              disabled={submitting}
            >
              <Save size={16} />
              <span>{submitting ? "Salvando..." : "Salvar alterações"}</span>
            </button>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIconGreen}>
              <CalendarDays size={18} />
            </div>
            <div>
              <p style={styles.statLabel}>Data da rota</p>
              <strong style={styles.statValue}>
                {form.route_date || "Não definida"}
              </strong>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconBlue}>
              <User2 size={18} />
            </div>
            <div>
              <p style={styles.statLabel}>Responsável</p>
              <strong style={styles.statValue}>
                {selectedResponsible?.name ||
                  form.route_responsible_manual_name ||
                  "Não informado"}
              </strong>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconPurple}>
              <MapPin size={18} />
            </div>
            <div>
              <p style={styles.statLabel}>Local de saída</p>
              <strong style={styles.statValue}>
                {selectedDepartureLocation?.name || "Não definido"}
              </strong>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconAmber}>
              <ClipboardList size={18} />
            </div>
            <div>
              <p style={styles.statLabel}>Paradas preenchidas</p>
              <strong style={styles.statValue}>
                {filledStopsCount} de {form.stops.length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <form id="route-edit-form" onSubmit={handleSubmit} style={styles.formShell}>
        <div style={styles.layoutGrid}>
          <section style={styles.leftColumn}>
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <p style={styles.sectionKicker}>Dados principais</p>
                  <h2 style={styles.sectionTitle}>Informações da rota</h2>
                  <p style={styles.sectionText}>
                    Defina data, status, responsável e local de saída da rota.
                  </p>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data da rota</label>
                  <div style={styles.inputWrap}>
                    <CalendarDays size={16} style={styles.inputIcon} />
                    <input
                      style={styles.input}
                      type="date"
                      name="route_date"
                      value={form.route_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.select}
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {statusOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Responsável da rota</label>
                  <select
                    style={styles.select}
                    name="route_responsible_id"
                    value={form.route_responsible_id}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    {employees.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Local de saída</label>
                  <select
                    style={styles.select}
                    name="departure_location_id"
                    value={form.departure_location_id}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    {locations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Responsável manual</label>
                  <input
                    style={styles.inputPlain}
                    name="route_responsible_manual_name"
                    value={form.route_responsible_manual_name}
                    onChange={handleChange}
                    placeholder="Preencha se não houver colaborador vinculado"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Matrícula manual</label>
                  <input
                    style={styles.inputPlain}
                    name="route_responsible_manual_registration"
                    value={form.route_responsible_manual_registration}
                    onChange={handleChange}
                    placeholder="Ex.: 123456"
                  />
                </div>

                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                  <label style={styles.label}>Observações</label>
                  <textarea
                    style={styles.textarea}
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Adicione instruções, observações logísticas ou detalhes importantes para esta rota."
                  />
                </div>
              </div>
            </div>

            <div style={styles.sectionCard}>
              <div style={styles.sectionHeaderRow}>
                <div>
                  <p style={styles.sectionKicker}>Fluxo da rota</p>
                  <h2 style={styles.sectionTitle}>Paradas planejadas</h2>
                  <p style={styles.sectionText}>
                    Organize os locais da rota e registre observações em cada parada.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={handleAddStop}
                >
                  <Plus size={16} />
                  <span>Adicionar parada</span>
                </button>
              </div>

              <div style={styles.stopsList}>
                {form.stops.map((stop, index) => (
                  <div key={index} style={styles.stopCard}>
                    <div style={styles.stopHeader}>
                      <div style={styles.stopTitleWrap}>
                        <div style={styles.stopIndex}>{index + 1}</div>
                        <div>
                          <h3 style={styles.stopTitle}>Parada {index + 1}</h3>
                          <p style={styles.stopSubtitle}>
                            Configure o local e a observação desta etapa.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        style={styles.deleteButton}
                        onClick={() => handleRemoveStop(index)}
                        title="Remover parada"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Local</label>
                        <select
                          style={styles.select}
                          value={stop.location_id}
                          onChange={(e) =>
                            handleStopChange(index, "location_id", e.target.value)
                          }
                        >
                          <option value="">Selecione</option>
                          {locations.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Observações da parada</label>
                        <input
                          style={styles.inputPlain}
                          value={stop.notes}
                          onChange={(e) =>
                            handleStopChange(index, "notes", e.target.value)
                          }
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside style={styles.rightColumn}>
            <div style={styles.sideCard}>
              <p style={styles.sectionKicker}>Resumo operacional</p>
              <h3 style={styles.sideTitle}>Validação rápida</h3>

              <div style={styles.summaryList}>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Status atual</span>
                  <span style={styles.summaryValue}>{form.status}</span>
                </div>

                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Total de paradas</span>
                  <span style={styles.summaryValue}>{form.stops.length}</span>
                </div>

                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Paradas preenchidas</span>
                  <span style={styles.summaryValue}>{filledStopsCount}</span>
                </div>

                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Saída definida</span>
                  <span style={styles.summaryValue}>
                    {form.departure_location_id ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.sideCard}>
              <p style={styles.sectionKicker}>Boas práticas</p>
              <h3 style={styles.sideTitle}>Recomendações</h3>

              <ul style={styles.tipList}>
                <li style={styles.tipItem}>Confirme a data antes de salvar.</li>
                <li style={styles.tipItem}>
                  Prefira um responsável vinculado ao sistema.
                </li>
                <li style={styles.tipItem}>
                  Revise a ordem das paradas para evitar retrabalho.
                </li>
                <li style={styles.tipItem}>
                  Use observações para instruções operacionais.
                </li>
              </ul>
            </div>

            {error ? (
              <div style={styles.errorCard}>
                <div style={styles.errorIconWrap}>
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 style={styles.errorTitle}>Não foi possível salvar</h4>
                  <p style={styles.errorText}>{error}</p>
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <div style={styles.bottomActions}>
          <Link to="/rotas" style={styles.cancelButton}>
            Cancelar
          </Link>

          <button
            type="submit"
            style={submitting ? styles.primaryButtonDisabled : styles.primaryButton}
            disabled={submitting}
          >
            <Save size={16} />
            <span>{submitting ? "Salvando..." : "Salvar alterações"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    padding: "28px",
    background:
      "linear-gradient(135deg, #172554 0%, #0f172a 52%, #111827 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 60px rgba(15,23,42,0.24)",
  },

  heroGlowA: {
    position: "absolute",
    top: "-80px",
    right: "-40px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.20)",
    filter: "blur(50px)",
    pointerEvents: "none",
  },

  heroGlowB: {
    position: "absolute",
    bottom: "-70px",
    left: "-40px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.14)",
    filter: "blur(50px)",
    pointerEvents: "none",
  },

  heroTop: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },

  heroContent: {
    maxWidth: "760px",
  },

  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    height: "30px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.16)",
    border: "1px solid rgba(147,197,253,0.24)",
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "12px",
  },

  heroTitle: {
    margin: "0 0 10px",
    fontSize: "2rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#ffffff",
  },

  heroSubtitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.98rem",
    lineHeight: 1.7,
    maxWidth: "760px",
  },

  heroActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  statsGrid: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  },

  statIconGreen: {
    ...iconBase("#22c55e", "rgba(34,197,94,0.14)"),
  },

  statIconBlue: {
    ...iconBase("#3b82f6", "rgba(59,130,246,0.14)"),
  },

  statIconPurple: {
    ...iconBase("#8b5cf6", "rgba(139,92,246,0.14)"),
  },

  statIconAmber: {
    ...iconBase("#f59e0b", "rgba(245,158,11,0.14)"),
  },

  statLabel: {
    margin: "0 0 4px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
  },

  statValue: {
    fontSize: "0.98rem",
    color: "#ffffff",
  },

  formShell: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.65fr) minmax(300px, 0.75fr)",
    gap: "20px",
    alignItems: "start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "sticky",
    top: "110px",
  },

  sectionCard: {
    borderRadius: "28px",
    padding: "24px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
  },

  sectionHeader: {
    marginBottom: "18px",
  },

  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  sectionKicker: {
    margin: "0 0 8px",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#16a34a",
  },

  sectionTitle: {
    margin: "0 0 6px",
    fontSize: "1.45rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#0f172a",
  },

  sectionText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "0.96rem",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  fullWidth: {
    gridColumn: "1 / -1",
  },

  label: {
    fontSize: "0.92rem",
    fontWeight: 700,
    color: "#0f172a",
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "52px",
    padding: "0 14px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
  },

  inputIcon: {
    color: "#64748b",
    flexShrink: 0,
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "0.95rem",
    color: "#0f172a",
  },

  inputPlain: {
    height: "52px",
    borderRadius: "16px",
    border: "1px solid #dbe4f0",
    background: "#ffffff",
    padding: "0 14px",
    outline: "none",
    fontSize: "0.95rem",
    color: "#0f172a",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
  },

  select: {
    height: "52px",
    borderRadius: "16px",
    border: "1px solid #dbe4f0",
    background: "#ffffff",
    padding: "0 14px",
    outline: "none",
    fontSize: "0.95rem",
    color: "#0f172a",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
  },

  textarea: {
    minHeight: "128px",
    borderRadius: "18px",
    border: "1px solid #dbe4f0",
    background: "#ffffff",
    padding: "14px",
    outline: "none",
    resize: "vertical",
    fontSize: "0.95rem",
    color: "#0f172a",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
  },

  secondaryButton: {
    height: "46px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 16px",
    borderRadius: "14px",
    border: "1px solid #dbe4f0",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "0.92rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
  },

  stopsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  stopCard: {
    borderRadius: "24px",
    padding: "18px",
    background:
      "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(241,245,249,0.95) 100%)",
    border: "1px solid #e2e8f0",
  },

  stopHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },

  stopTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  stopIndex: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 800,
    boxShadow: "0 10px 20px rgba(37,99,235,0.22)",
    flexShrink: 0,
  },

  stopTitle: {
    margin: "0 0 4px",
    fontSize: "1rem",
    fontWeight: 800,
    color: "#0f172a",
  },

  stopSubtitle: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#64748b",
  },

  deleteButton: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#dc2626",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  sideCard: {
    borderRadius: "24px",
    padding: "22px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
  },

  sideTitle: {
    margin: "0 0 16px",
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#0f172a",
  },

  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #eef2f7",
  },

  summaryLabel: {
    color: "#64748b",
    fontSize: "0.92rem",
  },

  summaryValue: {
    color: "#0f172a",
    fontWeight: 800,
    fontSize: "0.92rem",
    textTransform: "capitalize",
  },

  tipList: {
    margin: 0,
    paddingLeft: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    color: "#475569",
  },

  tipItem: {
    lineHeight: 1.6,
    fontSize: "0.93rem",
  },

  errorCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "18px",
    borderRadius: "22px",
    background: "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)",
    border: "1px solid #fecdd3",
    color: "#9f1239",
  },

  errorIconWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "rgba(225,29,72,0.10)",
    flexShrink: 0,
  },

  errorTitle: {
    margin: "0 0 4px",
    fontSize: "0.96rem",
    fontWeight: 800,
  },

  errorText: {
    margin: 0,
    lineHeight: 1.6,
    fontSize: "0.92rem",
  },

  bottomActions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  ghostButton: {
    height: "48px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 18px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
    backdropFilter: "blur(6px)",
  },

  cancelButton: {
    height: "48px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 18px",
    borderRadius: "16px",
    border: "1px solid #dbe4f0",
    background: "#ffffff",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
  },

  primaryButton: {
    height: "48px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "0 18px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 16px 30px rgba(37,99,235,0.25)",
  },

  primaryButtonDisabled: {
    height: "48px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "0 18px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "not-allowed",
    opacity: 0.85,
  },

  loadingPage: {
    minHeight: "60vh",
    position: "relative",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    padding: "24px",
  },

  loadingGlowA: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.12)",
    filter: "blur(46px)",
  },

  loadingGlowB: {
    position: "absolute",
    bottom: "-90px",
    left: "-60px",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(34,197,94,0.10)",
    filter: "blur(50px)",
  },

  loadingCard: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "560px",
    padding: "28px",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border: "1px solid rgba(226,232,240,0.95)",
    boxShadow: "0 20px 45px rgba(15,23,42,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  loadingIconWrap: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "rgba(37,99,235,0.10)",
    color: "#2563eb",
    border: "1px solid rgba(37,99,235,0.16)",
    flexShrink: 0,
  },

  loadingTitle: {
    margin: "0 0 6px",
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#0f172a",
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
  },
};

function iconBase(color, background) {
  return {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    color,
    background,
    border: "1px solid rgba(255,255,255,0.06)",
    flexShrink: 0,
  };
}