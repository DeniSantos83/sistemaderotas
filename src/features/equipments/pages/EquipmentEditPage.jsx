import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  ChevronDown,
  FileText,
  Hash,
  Loader2,
  MonitorSmartphone,
  PackageCheck,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function EquipmentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    tombamento: "",
    serial_number: "",
    brand: "",
    model: "",
    equipment_type: "",
    active: true,
    notes: "",
  });

  async function loadEquipment() {
    try {
      setLoadingPage(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("equipments")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      setForm({
        name: data?.name || "",
        tombamento: data?.tombamento || "",
        serial_number: data?.serial_number || "",
        brand: data?.brand || "",
        model: data?.model || "",
        equipment_type: data?.equipment_type || "",
        active: Boolean(data?.active),
        notes: data?.notes || "",
      });
    } catch (err) {
      setError(err.message || "Erro ao carregar equipamento.");
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    loadEquipment();
  }, [id]);

  const formIsValid = useMemo(() => {
    return Boolean(form.name.trim());
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
      return "Informe o nome do equipamento.";
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
        tombamento: normalizeOptional(form.tombamento),
        serial_number: normalizeOptional(form.serial_number),
        brand: normalizeOptional(form.brand),
        model: normalizeOptional(form.model),
        equipment_type: normalizeOptional(form.equipment_type),
        active: Boolean(form.active),
        notes: normalizeOptional(form.notes),
      };

      const { error: updateError } = await supabase
        .from("equipments")
        .update(payload)
        .eq("id", id);

      if (updateError) throw updateError;

      setSuccessMessage("Equipamento atualizado com sucesso.");
      navigate(`/equipamentos/${id}`);
    } catch (err) {
      setError(err.message || "Não foi possível atualizar o equipamento.");
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
            <h2 style={styles.loadingTitle}>Carregando equipamento</h2>
            <p style={styles.loadingText}>
              Preparando dados para edição do ativo...
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
            <span>Edição premium de ativo</span>
          </div>

          <h1 style={styles.heroTitle}>Editar equipamento</h1>

          <p style={styles.heroText}>
            Atualize as informações operacionais e técnicas do equipamento com
            um formulário moderno, limpo e consistente com o padrão SaaS do
            sistema.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status atual</span>
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
              <span style={styles.heroMetricLabel}>Tipo</span>
              <strong style={styles.heroMetricValue}>
                {form.equipment_type.trim() || "Não definido"}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to={`/equipamentos/${id}`} style={styles.backButton}>
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
              <h2 style={styles.cardTitle}>Editar equipamento</h2>
              <p style={styles.cardText}>
                Atualize os dados principais do ativo para manter o inventário
                organizado e padronizado.
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
                  <MonitorSmartphone size={18} />
                </div>
                <div>
                  <h3 style={styles.subTitle}>Identificação principal</h3>
                  <p style={styles.subText}>
                    Dados centrais para reconhecer o equipamento no sistema.
                  </p>
                </div>
              </div>

              <div style={styles.fieldsGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <PackageCheck size={16} />
                    <span>Nome do equipamento</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Ex.: Notebook Dell Latitude 5420"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Tag size={16} />
                    <span>Tipo de equipamento</span>
                  </label>
                  <input
                    type="text"
                    value={form.equipment_type}
                    onChange={(e) =>
                      updateField("equipment_type", e.target.value)
                    }
                    placeholder="Ex.: Notebook, Monitor, Impressora"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.sectionBlock}>
              <div style={styles.sectionBlockHeader}>
                <div style={styles.sectionIconWrap}>
                  <Settings2 size={18} />
                </div>
                <div>
                  <h3 style={styles.subTitle}>Identificação técnica</h3>
                  <p style={styles.subText}>
                    Informações patrimoniais e técnicas para controle completo.
                  </p>
                </div>
              </div>

              <div style={styles.fieldsGridTriple}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Hash size={16} />
                    <span>Tombamento</span>
                  </label>
                  <input
                    type="text"
                    value={form.tombamento}
                    onChange={(e) => updateField("tombamento", e.target.value)}
                    placeholder="Ex.: 123456"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Hash size={16} />
                    <span>Número de série</span>
                  </label>
                  <input
                    type="text"
                    value={form.serial_number}
                    onChange={(e) =>
                      updateField("serial_number", e.target.value)
                    }
                    placeholder="Ex.: SN-ABC-987654"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <ShieldCheck size={16} />
                    <span>Status</span>
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

              <div style={styles.fieldsGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Box size={16} />
                    <span>Marca</span>
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => updateField("brand", e.target.value)}
                    placeholder="Ex.: Dell"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    <Box size={16} />
                    <span>Modelo</span>
                  </label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => updateField("model", e.target.value)}
                    placeholder="Ex.: Latitude 5420"
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
                    Mantenha anotações úteis sobre o ativo, uso ou estado.
                  </p>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <FileText size={16} />
                  <span>Observações do equipamento</span>
                </label>
                <textarea
                  rows={6}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Ex.: Equipamento revisado, acompanha carregador e está alocado no setor administrativo."
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <Link to={`/equipamentos/${id}`} style={styles.cancelButton}>
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
                    <span>Salvar alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <aside style={styles.sideColumn}>
          <section style={styles.sideCard}>
            <div style={styles.sideIconWrap}>
              <MonitorSmartphone size={20} />
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
                <span style={styles.summaryLabel}>Tipo</span>
                <strong style={styles.summaryValue}>
                  {form.equipment_type.trim() || "Não definido"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Patrimônio</span>
                <strong style={styles.summaryValue}>
                  {form.tombamento.trim() || "Não informado"}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Marca / Modelo</span>
                <strong style={styles.summaryValue}>
                  {[form.brand.trim(), form.model.trim()].filter(Boolean).join(" / ") ||
                    "Não definido"}
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
                Revise nome, patrimônio e série antes de salvar.
              </li>
              <li style={styles.tipItem}>
                Mantenha marca e modelo preenchidos para facilitar buscas e relatórios.
              </li>
              <li style={styles.tipItem}>
                Marque como <strong>Inativo</strong> quando o ativo sair de uso.
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

  fieldsGridTriple: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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