import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  IdCard,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function EmployeeCreatePage() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    registration: "",
    employee_type: "",
    phone: "",
    email: "",
    notes: "",
    active: true,
  });

  const formIsValid = useMemo(() => {
    return Boolean(form.name.trim()) && Boolean(form.registration.trim());
  }, [form]);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function normalizeOptional(value) {
    const trimmed = String(value || "").trim();
    return trimmed ? trimmed : null;
  }

  function validateForm() {
    if (!form.name.trim()) {
      return "Informe o nome do colaborador.";
    }

    if (!form.registration.trim()) {
      return "Informe a matrícula do colaborador.";
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

      const payload = {
        name: form.name.trim(),
        registration: form.registration.trim(),
        employee_type: normalizeOptional(form.employee_type),
        phone: normalizeOptional(form.phone),
        email: normalizeOptional(form.email),
        notes: normalizeOptional(form.notes),
        active: Boolean(form.active),
      };

      const { data, error: insertError } = await supabase
        .from("employees")
        .insert(payload)
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSuccessMessage("Colaborador criado com sucesso.");
      navigate(`/colaboradores/${data.id}`);
    } catch (err) {
      setError(err.message || "Não foi possível criar o colaborador.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Sparkles size={15} />
            <span>Cadastro premium de colaborador</span>
          </div>

          <h1 style={styles.heroTitle}>Novo colaborador</h1>

          <p style={styles.heroText}>
            Cadastre um novo colaborador com identificação, perfil, contatos e
            observações em uma experiência SaaS premium consistente com o
            restante do sistema.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status inicial</span>
              <strong style={styles.heroMetricValue}>
                {form.active ? "Ativo" : "Inativo"}
              </strong>
            </div>

            <div style={styles.heroDivider} />

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
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/colaboradores" style={styles.backButton}>
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
              <h2 style={styles.cardTitle}>Cadastrar colaborador</h2>
              <p style={styles.cardText}>
                Preencha os dados principais para adicionar um novo colaborador
                à base operacional do sistema.
              </p>
            </div>
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {successMessage ? (
            <div style={styles.successBox}>{successMessage}</div>
          ) : null}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.sectionBlock}>
              <div style={styles.sectionBlockHeader}>
                <div style={styles.sectionIconWrap}>
                  <User size={18} />
                </div>
                <div>
                  <h3 style={styles.subTitle}>Identificação principal</h3>
                  <p style={styles.subText}>
                    Dados centrais para reconhecer o colaborador no sistema.
                  </p>
                </div>
              </div>

              <div style={styles.fieldsGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <User size={16} />
                    <span>Nome</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Nome completo"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <IdCard size={16} />
                    <span>Matrícula</span>
                  </label>
                  <input
                    value={form.registration}
                    onChange={(e) => updateField("registration", e.target.value)}
                    placeholder="Ex.: 12345"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.sectionBlock}>
              <div style={styles.sectionBlockHeader}>
                <div style={styles.sectionIconWrap}>
                  <BadgeCheck size={18} />
                </div>
                <div>
                  <h3 style={styles.subTitle}>Perfil e status</h3>
                  <p style={styles.subText}>
                    Defina o tipo do colaborador e sua situação inicial.
                  </p>
                </div>
              </div>

              <div style={styles.fieldsGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <BadgeCheck size={16} />
                    <span>Tipo / Cargo</span>
                  </label>

                  <div style={styles.selectWrap}>
                    <select
                      value={form.employee_type}
                      onChange={(e) =>
                        updateField("employee_type", e.target.value)
                      }
                      style={styles.select}
                    >
                      <option value="">Selecione</option>
                      <option value="tecnico">Técnico</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="gestor">Gestor</option>
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
                      value={form.active ? "active" : "inactive"}
                      onChange={(e) =>
                        updateField("active", e.target.value === "active")
                      }
                      style={styles.select}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                    <ChevronDown size={16} style={styles.selectIcon} />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.sectionBlock}>
              <div style={styles.sectionBlockHeader}>
                <div style={styles.sectionIconWrap}>
                  <Phone size={18} />
                </div>
                <div>
                  <h3 style={styles.subTitle}>Contato</h3>
                  <p style={styles.subText}>
                    Informe os principais canais de contato do colaborador.
                  </p>
                </div>
              </div>

              <div style={styles.fieldsGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Phone size={16} />
                    <span>Telefone</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(79) 99999-9999"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Mail size={16} />
                    <span>E-mail</span>
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="email@empresa.com"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.sectionBlock}>
              <div style={styles.sectionBlockHeader}>
                <div style={styles.sectionIconWrap}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={styles.subTitle}>Observações</h3>
                  <p style={styles.subText}>
                    Registre informações adicionais relevantes sobre o
                    colaborador.
                  </p>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <FileText size={16} />
                  <span>Observações</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Observações adicionais..."
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <Link to="/colaboradores" style={styles.cancelButton}>
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={!formIsValid || saving}
                style={{
                  ...styles.submitButton,
                  ...((!formIsValid || saving)
                    ? styles.submitButtonDisabled
                    : {}),
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} style={styles.spinner} />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Criar colaborador</span>
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

            <h3 style={styles.sideTitle}>Resumo do cadastro</h3>

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
                Preencha nome e matrícula para garantir identificação correta.
              </li>
              <li style={styles.tipItem}>
                Mantenha telefone e e-mail atualizados para facilitar contato.
              </li>
              <li style={styles.tipItem}>
                Use <strong>Ativo</strong> para colaboradores disponíveis na
                operação.
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
    fontSize: "clamp(2rem, 4vw, 3.15rem)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
    color: "#ffffff",
    wordBreak: "break-word",
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
    maxWidth: "220px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
    flexWrap: "wrap",
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

  sectionBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(10, 16, 31, 0.52)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  sectionBlockHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  sectionIconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
    flexShrink: 0,
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

  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
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
    minHeight: "120px",
    borderRadius: "16px",
    border: "1px solid rgba(59,130,246,0.16)",
    padding: "14px 16px",
    background: "#020617",
    color: "#fff",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    lineHeight: 1.6,
  },

  selectWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  select: {
    width: "100%",
    minHeight: "48px",
    borderRadius: "14px",
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
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: "#94a3b8",
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
    wordBreak: "break-word",
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

  spinner: {
    animation: "spin 1s linear infinite",
  },
};