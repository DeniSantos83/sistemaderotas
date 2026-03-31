import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Pencil,
  Save,
  Settings2,
  Type,
} from "lucide-react";
import { getSettingById, updateSetting } from "../services/settingsService";

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

export default function SettingEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadSetting() {
      try {
        setLoading(true);
        setError("");

        const data = await getSettingById(id);

        setForm({
          setting_key: data.setting_key || "",
          setting_value_text: data.setting_value_text || "",
          setting_value_json: data.setting_value_json
            ? JSON.stringify(data.setting_value_json, null, 2)
            : "",
          value_mode: data.setting_value_json ? "json" : "text",
          category: data.category || "general",
          description: data.description || "",
          active: !!data.active,
        });
      } catch (err) {
        setError(err.message || "Não foi possível carregar a configuração.");
      } finally {
        setLoading(false);
      }
    }

    loadSetting();
  }, [id]);

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
      await updateSetting(id, form);
      navigate("/configuracoes");
    } catch (err) {
      setError(err.message || "Não foi possível salvar as alterações.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingCard}>
          <p style={styles.loadingKicker}>Configuração</p>
          <h2 style={styles.loadingTitle}>Carregando edição premium...</h2>
          <p style={styles.loadingText}>
            Aguarde enquanto buscamos os dados da configuração.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroContent}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.kicker}>Edição de parâmetro</p>
            <h1 style={styles.title}>Editar configuração</h1>
            <p style={styles.subtitle}>
              Atualize a chave, categoria, valor e status da configuração com
              experiência premium e validação elegante.
            </p>

            <div style={styles.idPill}>
              <Pencil size={14} />
              <span>ID: {id}</span>
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
            <h2 style={styles.sectionTitle}>Atualizar configuração</h2>
            <p style={styles.sectionDescription}>
              Revise cuidadosamente os dados abaixo antes de salvar as alterações.
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          <Field label="Chave" hint="Nome técnico da configuração">
            <input
              name="setting_key"
              value={form.setting_key}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </Field>

          <Field label="Categoria" hint="Agrupamento funcional">
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

          <Field label="Modo do valor" hint="Texto simples ou JSON">
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

          <Field label="Status" hint="Define se a configuração está ativa">
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
            <Field label="Valor em texto" hint="Conteúdo textual da configuração" full>
              <div style={styles.modeMeta}>
                <span style={styles.modeBadge}>
                  <Type size={14} />
                  <span>Modo texto</span>
                </span>
              </div>

              <input
                name="setting_value_text"
                value={form.setting_value_text}
                onChange={handleChange}
                style={styles.input}
              />
            </Field>
          ) : (
            <Field label="Valor JSON" hint="Edite um JSON válido" full>
              <div style={styles.modeMeta}>
                <span style={styles.modeBadge}>
                  <Code2 size={14} />
                  <span>Modo JSON</span>
                </span>

                {jsonPreviewStatus === "valid" ? (
                  <span style={styles.validBadge}>
                    <CheckCircle2 size={14} />
                    <span>JSON válido</span>
                  </span>
                ) : jsonPreviewStatus === "invalid" ? (
                  <span style={styles.invalidBadge}>
                    <AlertCircle size={14} />
                    <span>JSON inválido</span>
                  </span>
                ) : null}
              </div>

              <textarea
                name="setting_value_json"
                value={form.setting_value_json}
                onChange={handleChange}
                rows={10}
                style={styles.textarea}
              />
            </Field>
          )}

          <Field label="Descrição" hint="Contexto e finalidade da configuração" full>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
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
            <span>{submitting ? "Salvando..." : "Salvar alterações"}</span>
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

  loadingWrap: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "540px",
    padding: "30px",
    borderRadius: "28px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.94))",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
  },

  loadingKicker: {
    margin: 0,
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },

  loadingTitle: {
    margin: "10px 0 8px",
    fontSize: "30px",
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },

  loadingText: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.7,
    fontSize: "15px",
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

  idPill: {
    marginTop: "18px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    color: "#e2e8f0",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
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
    background: "rgba(59, 130, 246, 0.12)",
    color: "#60a5fa",
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

  modeMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  modeBadge: {
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

  validBadge: {
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

  invalidBadge: {
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