import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BadgeCheck,
  Phone,
  Mail,
  FileText,
  Save,
  Loader2,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    registration: "",
    employee_type: "",
    phone: "",
    email: "",
    notes: "",
    active: true,
  });

  useEffect(() => {
    async function loadEmployee() {
      try {
        setLoadingPage(true);
        setError("");

        const { data, error: fetchError } = await supabase
          .from("employees")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        setForm({
          name: data?.name || "",
          registration: data?.registration || "",
          employee_type: data?.employee_type || "",
          phone: data?.phone || "",
          email: data?.email || "",
          notes: data?.notes || "",
          active: Boolean(data?.active),
        });
      } catch (err) {
        setError(err.message || "Erro ao carregar colaborador.");
      } finally {
        setLoadingPage(false);
      }
    }

    loadEmployee();
  }, [id]);

  const isValid = useMemo(() => {
    return form.name.trim() && form.registration.trim();
  }, [form]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function normalize(value) {
    const v = String(value || "").trim();
    return v || null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Nome é obrigatório.");
      setSuccess("");
      return;
    }

    if (!form.registration.trim()) {
      setError("Matrícula é obrigatória.");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        registration: form.registration.trim(),
        employee_type: normalize(form.employee_type),
        phone: normalize(form.phone),
        email: normalize(form.email),
        notes: normalize(form.notes),
        active: Boolean(form.active),
      };

      const { error: updateError } = await supabase
        .from("employees")
        .update(payload)
        .eq("id", id);

      if (updateError) throw updateError;

      setSuccess("Colaborador atualizado com sucesso.");
      navigate(`/colaboradores/${id}`);
    } catch (err) {
      setError(err.message || "Erro ao atualizar colaborador.");
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
            <h2 style={styles.loadingTitle}>Carregando colaborador</h2>
            <p style={styles.loadingText}>
              Preparando dados para edição do colaborador...
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.badge}>
            <Sparkles size={14} />
            Editar colaborador
          </div>

          <h1 style={styles.title}>Atualizar colaborador</h1>

          <p style={styles.subtitle}>
            Edite os dados do colaborador com uma experiência organizada,
            premium e consistente com o restante do sistema.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Nome</span>
              <strong style={styles.heroMetricValue}>
                {form.name.trim() || "Não definido"}
              </strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Matrícula</span>
              <strong style={styles.heroMetricValue}>
                {form.registration.trim() || "Não definida"}
              </strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status</span>
              <strong style={styles.heroMetricValue}>
                {form.active ? "Ativo" : "Inativo"}
              </strong>
            </div>
          </div>
        </div>

        <Link to={`/colaboradores/${id}`} style={styles.backButton}>
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </section>

      <div style={styles.contentGrid}>
        <section style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <User size={18} />
                </div>
                <div>
                  <h3 style={styles.sectionTitle}>Identificação</h3>
                  <p style={styles.sectionSubtitle}>
                    Atualize os dados principais do colaborador.
                  </p>
                </div>
              </div>

              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Nome</label>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Nome completo"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Matrícula</label>
                  <input
                    value={form.registration}
                    onChange={(e) => update("registration", e.target.value)}
                    placeholder="Ex: 12345"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <BadgeCheck size={18} />
                </div>
                <div>
                  <h3 style={styles.sectionTitle}>Perfil</h3>
                  <p style={styles.sectionSubtitle}>
                    Defina o tipo e o status atual do colaborador.
                  </p>
                </div>
              </div>

              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Tipo / Cargo</label>

                  <div style={styles.selectWrap}>
                    <select
                      value={form.employee_type}
                      onChange={(e) => update("employee_type", e.target.value)}
                      style={styles.select}
                    >
                      <option value="">Selecione</option>
                      <option value="tecnico">Técnico</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="gestor">Gestor</option>
                    </select>
                    <ChevronDown size={14} style={styles.selectIcon} />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Status</label>

                  <div style={styles.selectWrap}>
                    <select
                      value={form.active ? "active" : "inactive"}
                      onChange={(e) =>
                        update("active", e.target.value === "active")
                      }
                      style={styles.select}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                    <ChevronDown size={14} style={styles.selectIcon} />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <Phone size={18} />
                </div>
                <div>
                  <h3 style={styles.sectionTitle}>Contato</h3>
                  <p style={styles.sectionSubtitle}>
                    Atualize os canais de contato do colaborador.
                  </p>
                </div>
              </div>

              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Telefone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="(79) 99999-9999"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>E-mail</label>
                  <input
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="email@empresa.com"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={styles.sectionTitle}>Observações</h3>
                  <p style={styles.sectionSubtitle}>
                    Registre detalhes importantes sobre o colaborador.
                  </p>
                </div>
              </div>

              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Observações adicionais..."
                style={styles.textarea}
              />
            </div>

            <div style={styles.actions}>
              <Link to={`/colaboradores/${id}`} style={styles.cancel}>
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={!isValid || saving}
                style={{
                  ...styles.submit,
                  ...((!isValid || saving) ? styles.submitDisabled : {}),
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} style={styles.spinner} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <aside style={styles.sideColumn}>
          <section style={styles.sideCard}>
            <div style={styles.sideIconWrap}>
              <User size={20} />
            </div>

            <h3 style={styles.sideTitle}>Resumo da edição</h3>

            <div style={styles.summaryList}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Nome</span>
                <strong style={styles.summaryValue}>
                  {form.name.trim() || "Não definido"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Matrícula</span>
                <strong style={styles.summaryValue}>
                  {form.registration.trim() || "Não definida"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Tipo / Cargo</span>
                <strong style={styles.summaryValue}>
                  {form.employee_type.trim() || "Não definido"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Status</span>
                <strong style={styles.summaryValue}>
                  {form.active ? "Ativo" : "Inativo"}
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
                Revise nome e matrícula antes de salvar.
              </li>
              <li style={styles.tipItem}>
                Mantenha telefone e e-mail atualizados para facilitar contato.
              </li>
              <li style={styles.tipItem}>
                Marque como <strong>Inativo</strong> quando o colaborador não
                estiver mais em operação.
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
    gap: 22,
    paddingBottom: 8,
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    padding: 32,
    borderRadius: 28,
    background: "linear-gradient(135deg, #17233f 0%, #1a2646 45%, #0f172a 100%)",
    color: "#fff",
    boxShadow: "0 22px 55px rgba(15, 23, 42, 0.22)",
    flexWrap: "wrap",
  },

  heroLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 800,
  },

  badge: {
    fontSize: 12,
    opacity: 0.85,
    display: "inline-flex",
    gap: 6,
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    width: "fit-content",
  },

  title: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.04em",
  },

  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 1.7,
    margin: 0,
  },

  heroMetrics: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 18,
    marginTop: 8,
  },

  heroMetricItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  heroMetricLabel: {
    fontSize: 12,
    color: "rgba(148,163,184,0.95)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 700,
  },

  heroMetricValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: 800,
    maxWidth: 220,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  heroDivider: {
    width: 1,
    height: 34,
    background: "rgba(255,255,255,0.16)",
  },

  backButton: {
    color: "#fff",
    textDecoration: "none",
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    padding: "12px 18px",
    borderRadius: 16,
    background: "rgba(15, 23, 42, 0.38)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontWeight: 700,
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 0.7fr)",
    gap: 22,
    alignItems: "start",
  },

  card: {
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    borderRadius: 28,
    padding: 26,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    borderRadius: 22,
    padding: 20,
    background: "rgba(10, 16, 31, 0.52)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },

  sectionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
    flexShrink: 0,
  },

  sectionTitle: {
    fontWeight: 800,
    display: "flex",
    gap: 6,
    margin: 0,
    fontSize: "1.05rem",
    color: "#fff",
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    lineHeight: 1.6,
    fontSize: 14,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#e2e8f0",
  },

  input: {
    minHeight: 48,
    borderRadius: 14,
    border: "1px solid rgba(59,130,246,0.16)",
    padding: "0 14px",
    background: "#020617",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    minHeight: 120,
    borderRadius: 16,
    border: "1px solid rgba(59,130,246,0.16)",
    padding: 14,
    background: "#020617",
    color: "#fff",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    lineHeight: 1.6,
  },

  selectWrap: {
    position: "relative",
  },

  select: {
    width: "100%",
    minHeight: 48,
    borderRadius: 14,
    background: "#020617",
    color: "#fff",
    border: "1px solid rgba(59,130,246,0.16)",
    padding: "0 38px 0 14px",
    appearance: "none",
    outline: "none",
    boxSizing: "border-box",
  },

  selectIcon: {
    position: "absolute",
    right: 12,
    top: 16,
    pointerEvents: "none",
    color: "#94a3b8",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
    paddingTop: 6,
  },

  cancel: {
    padding: "12px 18px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  submit: {
    padding: "12px 18px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    border: "1px solid rgba(34,197,94,0.22)",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 16px 32px rgba(34,197,94,0.18)",
  },

  submitDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  sideCard: {
    borderRadius: 24,
    padding: 22,
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    color: "#fff",
  },

  sideCardSoft: {
    borderRadius: 24,
    padding: 22,
    background: "rgba(10,16,31,0.8)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
    color: "#fff",
  },

  sideIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
    marginBottom: 14,
  },

  sideTitle: {
    margin: "0 0 16px",
    fontSize: "1.08rem",
    fontWeight: 800,
    color: "#fff",
  },

  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingBottom: 14,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    wordBreak: "break-word",
  },

  sideCardHeader: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 16,
  },

  tipList: {
    margin: 0,
    paddingLeft: 18,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    color: "#cbd5e1",
    lineHeight: 1.6,
  },

  tipItem: {
    margin: 0,
  },

  error: {
    background: "rgba(239,68,68,0.12)",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(239,68,68,0.18)",
    color: "#fecaca",
    fontWeight: 600,
  },

  success: {
    background: "rgba(34,197,94,0.12)",
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(34,197,94,0.18)",
    color: "#bbf7d0",
    fontWeight: 600,
  },

  loadingCard: {
    minHeight: 220,
    borderRadius: 24,
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
  },

  loadingTitle: {
    margin: "0 0 4px",
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "#fff",
  },

  loadingText: {
    margin: 0,
    color: "#94a3b8",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },
};