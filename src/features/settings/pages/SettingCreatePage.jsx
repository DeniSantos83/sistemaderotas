import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Save,
  Settings2,
  Sparkles,
  Type,
} from "lucide-react";
import { createSetting } from "../services/settingsService";

const initialForm = {
  setting_key: "",
  setting_value_text: "",
  setting_value_json: "",
  value_mode: "text",
  category: "general",
  description: "",
  active: true,
};

const CATEGORY_OPTIONS = [
  { value: "general", label: "Geral" },
  { value: "branding", label: "Branding" },
  { value: "notifications", label: "Notificações" },
  { value: "reports", label: "Relatórios" },
  { value: "integrations", label: "Integrações" },
  { value: "security", label: "Segurança" },
  { value: "mobile", label: "Mobile" },
];

function Field({ label, hint, children, full = false }) {
  return (
    <div
      style={{
        ...styles.field,
        gridColumn: full ? "1 / -1" : "auto",
      }}
    >
      <div style={styles.fieldHeader}>
        <label style={styles.label}>{label}</label>
        {hint ? <span style={styles.hint}>{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function InfoChip({ icon: Icon, children }) {
  return (
    <span style={styles.infoChip}>
      <Icon size={14} />
      <span>{children}</span>
    </span>
  );
}

export default function SettingCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const jsonPreviewStatus = useMemo(() => {
    if (form.value_mode !== "json") return null;
    if (!form.setting_value_json.trim()) return "empty";

    try {
      JSON.parse(form.setting_value_json);
      return "valid";
    } catch {
      return "invalid";
    }
  }, [form.value_mode, form.setting_value_json]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.setting_key.trim()) {
      setError("Informe a chave da configuração.");
      return;
    }

    if (form.value_mode === "text" && !form.setting_value_text.trim()) {
      setError("Informe o valor em texto.");
      return;
    }

    if (form.value_mode === "json" && !form.setting_value_json.trim()) {
      setError("Informe o valor JSON.");
      return;
    }

    try {
      if (form.value_mode === "json") {
        JSON.parse(form.setting_value_json);
      }

      setSubmitting(true);
      await createSetting(form);
      navigate("/configuracoes");
    } catch (err) {
      setError(err.message || "Não foi possível salvar a configuração.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroContent}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.kicker}>Novo parâmetro</p>
            <h1 style={styles.title}>Cadastrar configuração</h1>
            <p style={styles.subtitle}>
              Crie uma configuração premium para controlar branding, integração,
              comportamento operacional ou regras internas do sistema.
            </p>

            <div style={styles.heroChips}>
              <InfoChip icon={Settings2}>CRUD SaaS</InfoChip>
              <InfoChip icon={Sparkles}>Visual premium</InfoChip>
              <InfoChip icon={Save}>Persistência centralizada</InfoChip>
            </div>
          </div>

          <Link to="/configuracoes" style={styles.backButton}>
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIconWrap}>
            <Settings2 size={18} />
          </div>
          <div>
            <h2 style={styles.sectionTitle}>Dados da configuração</h2>
            <p style={styles.sectionDescription}>
              Preencha a chave, categoria, tipo de valor e status da configuração.
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          <Field
            label="Chave"
            hint="Nome técnico único da configuração"
          >
            <input
              name="setting_key"
              value={form.setting_key}
              onChange={handleChange}
              placeholder="Ex.: system_name"
              style={styles.input}
              required
            />
          </Field>

          <Field
            label="Categoria"
            hint="Agrupamento funcional"
          >
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={styles.input}
            >
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Modo do valor"
            hint="Texto simples ou JSON estruturado"
          >
            <select
              name="value_mode"
              value={form.value_mode}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="text">Texto</option>
              <option value="json">JSON</option>
            </select>
          </Field>

          <Field
            label="Status"
            hint="Define se a configuração está ativa"
          >
            <select
              name="active"
              value={String(form.active)}
              onChange={(e) =>
                setForm((old) => ({
                  ...old,
                  active: e.target.value === "true",
                }))
              }
              style={styles.input}
            >
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>
          </Field>

          {form.value_mode === "text" ? (
            <Field
              label="Valor em texto"
              hint="Valor simples da configuração"
              full
            >
              <div style={styles.valueModeHeader}>
                <div style={styles.valueModeBadge}>
                  <Type size={14} />
                  <span>Modo texto</span>
                </div>
              </div>

              <input
                name="setting_value_text"
                value={form.setting_value_text}
                onChange={handleChange}
                placeholder="Ex.: Sistema de Rotas"
                style={styles.input}
              />
            </Field>
          ) : (
            <Field
              label="Valor JSON"
              hint="Cole um JSON válido para armazenamento estruturado"
              full
            >
              <div style={styles.valueModeHeader}>
                <div style={styles.valueModeBadge}>
                  <Code2 size={14} />
                  <span>Modo JSON</span>
                </div>

                {jsonPreviewStatus === "valid" ? (
                  <div style={styles.statusValid}>
                    <CheckCircle2 size={14} />
                    <span>JSON válido</span>
                  </div>
                ) : jsonPreviewStatus === "invalid" ? (
                  <div style={styles.statusInvalid}>
                    <AlertCircle size={14} />
                    <span>JSON inválido</span>
                  </div>
                ) : null}
              </div>

              <textarea
                name="setting_value_json"
                value={form.setting_value_json}
                onChange={handleChange}
                placeholder='Ex.: {"primaryColor":"#0f172a"}'
                rows={9}
                style={styles.textarea}
              />
            </Field>
          )}

          <Field
            label="Descrição"
            hint="Explique para que serve esse parâmetro"
            full
          >
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descreva a finalidade da configuração..."
              rows={5}
              style={styles.textarea}
            />
          </Field>
        </div>

        {error ? (
          <div style={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        <div style={styles.actionBar}>
          <Link to="/configuracoes" style={styles.secondaryButton}>
            Cancelar
          </Link>

          <button type="submit" style={styles.primaryButton} disabled={submitting}>
            <Save size={16} />
            <span>{submitting ? "Salvando..." : "Salvar configuração"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    color: "#f8fafc",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    padding: "28px",
    background:
      "radial-gradient(circle at top left, rgba(34,197,94,0.16), transparent 30%), radial-gradient(circle at top right, rgba(59,130,246,0.14), transparent 28%), linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.96))",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },

  heroGlowOne: {
    position: "absolute",
    top: "-90px",
    right: "-70px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.18)",
    filter: "blur(40px)",
    pointerEvents: "none",
  },

  heroGlowTwo: {
    position: "absolute",
    bottom: "-80px",
    left: "-60px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.16)",
    filter: "blur(40px)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },

  kicker: {
    margin: 0,
    color: "#86efac",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },

  title: {
    margin: "10px 0 12px",
    fontSize: "34px",
    lineHeight: 1.06,
    letterSpacing: "-0.04em",
    fontWeight: 900,
    color: "#f8fafc",
  },

  subtitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: 1.75,
  },

  heroChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },

  infoChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "36px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: 700,
  },

  backButton: {
    height: "46px",
    padding: "0 16px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    color: "#f8fafc",
    textDecoration: "none",
    fontWeight: 700,
  },

  formCard: {
    borderRadius: "28px",
    padding: "24px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(2,6,23,0.92))",
    border: "1px solid rgba(148, 163, 184, 0.10)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  sectionIconWrap: {
    width: "42px",
    height: "42px",
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
    fontSize: "22px",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.03)",
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
    fontWeight: 800,
  },

  hint: {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  input: {
    width: "100%",
    height: "50px",
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
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    background: "rgba(15, 23, 42, 0.94)",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.6,
    fontFamily: "inherit",
  },

  valueModeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  valueModeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "32px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(59,130,246,0.20)",
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  statusValid: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "32px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "#bbf7d0",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  statusInvalid: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "32px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.20)",
    color: "#fecaca",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(239, 68, 68, 0.10)",
    border: "1px solid rgba(239, 68, 68, 0.22)",
    color: "#fecaca",
    fontSize: "14px",
  },

  actionBar: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },

  secondaryButton: {
    height: "48px",
    padding: "0 16px",
    borderRadius: "14px",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    fontWeight: 700,
  },

  primaryButton: {
    height: "48px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 46%, #3b82f6 100%)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 18px 45px rgba(34, 197, 94, 0.22)",
  },
};