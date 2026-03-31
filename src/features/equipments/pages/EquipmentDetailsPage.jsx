import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Hash,
  Loader2,
  MonitorSmartphone,
  PackageCheck,
  Pencil,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tag,
  XCircle,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function getStatusLabel(active) {
  return active ? "Ativo" : "Inativo";
}

function getStatusStyle(active) {
  if (active) {
    return { ...styles.badgeBase, ...styles.badgeSuccess };
  }

  return { ...styles.badgeBase, ...styles.badgeDanger };
}

function safeText(value, fallback = "-") {
  const text = String(value || "").trim();
  return text || fallback;
}

export default function EquipmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadEquipment(showRefreshState = false) {
    try {
      setError("");

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error: fetchError } = await supabase
        .from("equipments")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      setEquipment(data || null);
    } catch (err) {
      setError(err.message || "Erro ao carregar os detalhes do equipamento.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEquipment();
  }, [id]);

  async function handleToggleStatus() {
    if (!equipment) return;

    try {
      setStatusSaving(true);
      setError("");
      setSuccessMessage("");

      const nextStatus = !equipment.active;

      const { error: updateError } = await supabase
        .from("equipments")
        .update({ active: nextStatus })
        .eq("id", equipment.id);

      if (updateError) throw updateError;

      setEquipment((prev) =>
        prev
          ? {
              ...prev,
              active: nextStatus,
              updated_at: new Date().toISOString(),
            }
          : prev
      );

      setSuccessMessage(
        `Status atualizado para ${nextStatus ? "Ativo" : "Inativo"}.`
      );
    } catch (err) {
      setError(err.message || "Não foi possível atualizar o status.");
    } finally {
      setStatusSaving(false);
    }
  }

  const summary = useMemo(() => {
    if (!equipment) {
      return {
        name: "-",
        type: "-",
        tombamento: "-",
        serialNumber: "-",
        status: "-",
      };
    }

    return {
      name: safeText(equipment.name),
      type: safeText(equipment.equipment_type, "Não definido"),
      tombamento: safeText(equipment.tombamento, "Não informado"),
      serialNumber: safeText(equipment.serial_number, "Não informado"),
      status: getStatusLabel(Boolean(equipment.active)),
    };
  }, [equipment]);

  if (loading) {
    return (
      <div style={styles.page}>
        <section style={styles.loadingCard}>
          <Loader2 size={22} style={styles.spinner} />
          <div>
            <h2 style={styles.loadingTitle}>Carregando equipamento</h2>
            <p style={styles.loadingText}>
              Preparando os detalhes completos do ativo...
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div style={styles.page}>
        <section style={styles.mainCard}>
          <div style={styles.errorBox}>
            Equipamento não encontrado ou indisponível.
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate("/equipamentos")}
              style={styles.cancelButton}
            >
              Voltar
            </button>
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
            <span>Visualização premium do ativo</span>
          </div>

          <h1 style={styles.heroTitle}>{safeText(equipment.name)}</h1>

          <p style={styles.heroText}>
            Consulte os dados do equipamento, acompanhe seu status atual,
            visualize identificações patrimoniais e técnicas e gerencie o ativo
            em uma interface SaaS premium.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Tipo</span>
              <strong style={styles.heroMetricValue}>
                {safeText(equipment.equipment_type, "Não definido")}
              </strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Patrimônio</span>
              <strong style={styles.heroMetricValue}>
                {safeText(equipment.tombamento, "Não informado")}
              </strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status</span>
              <strong style={styles.heroMetricValue}>
                {getStatusLabel(Boolean(equipment.active))}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/equipamentos" style={styles.backButton}>
            <ArrowLeft size={17} />
            <span>Voltar</span>
          </Link>

          <Link
            to={`/equipamentos/${equipment.id}/editar`}
            style={styles.primaryButton}
          >
            <Pencil size={17} />
            <span>Editar equipamento</span>
          </Link>
        </div>
      </section>

      <div style={styles.contentGrid}>
        <section style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>Resumo operacional</p>
              <h2 style={styles.cardTitle}>Informações do equipamento</h2>
              <p style={styles.cardText}>
                Visualize os dados principais do ativo em um painel limpo,
                técnico e organizado.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadEquipment(true)}
              style={styles.ghostButton}
            >
              <RefreshCcw
                size={16}
                style={refreshing ? styles.spinner : undefined}
              />
              <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
            </button>
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}
          {successMessage ? (
            <div style={styles.successBox}>{successMessage}</div>
          ) : null}

          <div style={styles.infoGrid}>
            <article style={styles.infoCard}>
              <div style={styles.infoCardIcon}>
                <PackageCheck size={18} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Nome</span>
                <strong style={styles.infoValue}>
                  {safeText(equipment.name)}
                </strong>
                <span style={styles.infoSubtle}>Identificação principal</span>
              </div>
            </article>

            <article style={styles.infoCard}>
              <div style={styles.infoCardIcon}>
                <Tag size={18} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Tipo</span>
                <strong style={styles.infoValue}>
                  {safeText(equipment.equipment_type, "Não definido")}
                </strong>
                <span style={styles.infoSubtle}>Categoria do ativo</span>
              </div>
            </article>

            <article style={styles.infoCard}>
              <div style={styles.infoCardIcon}>
                <Hash size={18} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Tombamento</span>
                <strong style={styles.infoValue}>
                  {safeText(equipment.tombamento, "Não informado")}
                </strong>
                <span style={styles.infoSubtle}>Controle patrimonial</span>
              </div>
            </article>

            <article style={styles.infoCard}>
              <div style={styles.infoCardIcon}>
                <ShieldCheck size={18} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Status</span>
                <strong style={styles.infoValue}>
                  <span style={getStatusStyle(Boolean(equipment.active))}>
                    {getStatusLabel(Boolean(equipment.active))}
                  </span>
                </strong>
                <span style={styles.infoSubtle}>Situação atual do ativo</span>
              </div>
            </article>
          </div>
        </section>

        <aside style={styles.sideColumn}>
          <section style={styles.sideCard}>
            <div style={styles.sideIconWrap}>
              <Eye size={20} />
            </div>
            <h3 style={styles.sideTitle}>Resumo executivo</h3>

            <div style={styles.summaryList}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Nome</span>
                <strong style={styles.summaryValue}>{summary.name}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Tipo</span>
                <strong style={styles.summaryValue}>{summary.type}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Patrimônio</span>
                <strong style={styles.summaryValue}>{summary.tombamento}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Série</span>
                <strong style={styles.summaryValue}>
                  {summary.serialNumber}
                </strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Status</span>
                <strong style={styles.summaryValue}>{summary.status}</strong>
              </div>
            </div>
          </section>

          <section style={styles.sideCardSoft}>
            <div style={styles.sideCardHeader}>
              <ClipboardList size={18} />
              <span>Ações rápidas</span>
            </div>

            <div style={styles.sideActions}>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusSaving}
                style={{
                  ...styles.sideActionButton,
                  ...(statusSaving ? styles.sideActionButtonDisabled : {}),
                }}
              >
                {statusSaving ? (
                  <Loader2 size={16} style={styles.spinner} />
                ) : equipment.active ? (
                  <XCircle size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>
                  {equipment.active ? "Marcar como inativo" : "Marcar como ativo"}
                </span>
              </button>

              <Link
                to={`/equipamentos/${equipment.id}/editar`}
                style={styles.sideActionButtonGhost}
              >
                <Pencil size={16} />
                <span>Editar este equipamento</span>
              </Link>
            </div>
          </section>
        </aside>
      </div>

      <section style={styles.mainCard}>
        <div style={styles.cardHeader}>
          <div>
            <p style={styles.sectionKicker}>Detalhamento técnico</p>
            <h2 style={styles.cardTitle}>Dados completos do ativo</h2>
            <p style={styles.cardText}>
              Visualize informações técnicas, auditoria e observações do
              equipamento.
            </p>
          </div>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailBlock}>
            <div style={styles.detailHeader}>
              <MonitorSmartphone size={16} />
              <span>Identificação principal</span>
            </div>

            <div style={styles.detailList}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Nome</span>
                <strong style={styles.detailValue}>
                  {safeText(equipment.name)}
                </strong>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Tipo</span>
                <strong style={styles.detailValue}>
                  {safeText(equipment.equipment_type, "Não definido")}
                </strong>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status</span>
                <strong style={styles.detailValue}>
                  {getStatusLabel(Boolean(equipment.active))}
                </strong>
              </div>
            </div>
          </div>

          <div style={styles.detailBlock}>
            <div style={styles.detailHeader}>
              <Settings2 size={16} />
              <span>Identificação técnica</span>
            </div>

            <div style={styles.detailList}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Tombamento</span>
                <strong style={styles.detailValue}>
                  {safeText(equipment.tombamento, "Não informado")}
                </strong>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Número de série</span>
                <strong style={styles.detailValue}>
                  {safeText(equipment.serial_number, "Não informado")}
                </strong>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Marca</span>
                <strong style={styles.detailValue}>
                  {safeText(equipment.brand, "Não definida")}
                </strong>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Modelo</span>
                <strong style={styles.detailValue}>
                  {safeText(equipment.model, "Não definido")}
                </strong>
              </div>
            </div>
          </div>

          <div style={styles.detailBlock}>
            <div style={styles.detailHeader}>
              <Box size={16} />
              <span>Metadados</span>
            </div>

            <div style={styles.detailList}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>ID</span>
                <strong style={styles.detailValue}>{safeText(equipment.id)}</strong>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Criado em</span>
                <strong style={styles.detailValue}>
                  {formatDateTime(equipment.created_at)}
                </strong>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Atualizado em</span>
                <strong style={styles.detailValue}>
                  {formatDateTime(equipment.updated_at)}
                </strong>
              </div>
            </div>
          </div>

          <div style={styles.detailBlock}>
            <div style={styles.detailHeader}>
              <FileText size={16} />
              <span>Observações</span>
            </div>

            <p style={styles.notesText}>
              {safeText(
                equipment.notes,
                "Nenhuma observação cadastrada para este equipamento."
              )}
            </p>
          </div>
        </div>
      </section>
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

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    border: "1px solid rgba(34,197,94,0.22)",
    fontWeight: 800,
    boxShadow: "0 16px 32px rgba(34,197,94,0.18)",
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

  cardHeader: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
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

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  infoCard: {
    display: "flex",
    gap: "14px",
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(10,16,31,0.52)",
    border: "1px solid rgba(255,255,255,0.06)",
    minHeight: "116px",
  },

  infoCardIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "15px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
    flexShrink: 0,
  },

  infoContent: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
  },

  infoLabel: {
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  infoValue: {
    fontSize: "1rem",
    fontWeight: 800,
    color: "#ffffff",
    wordBreak: "break-word",
  },

  infoSubtle: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    lineHeight: 1.5,
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

  sideCardHeader: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "16px",
  },

  sideActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  sideActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "44px",
    padding: "0 14px",
    borderRadius: "14px",
    border: "1px solid rgba(34,197,94,0.22)",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },

  sideActionButtonGhost: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "44px",
    padding: "0 14px",
    borderRadius: "14px",
    textDecoration: "none",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontWeight: 700,
  },

  sideActionButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  detailBlock: {
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(10,16,31,0.52)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  detailHeader: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 800,
    color: "#ffffff",
  },

  detailList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  detailLabel: {
    fontSize: "0.76rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  detailValue: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#ffffff",
    wordBreak: "break-word",
  },

  notesText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  badgeBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "0.76rem",
    fontWeight: 800,
    border: "1px solid transparent",
    whiteSpace: "nowrap",
  },

  badgeSuccess: {
    background: "rgba(34,197,94,0.12)",
    color: "#4ade80",
    borderColor: "rgba(34,197,94,0.18)",
  },

  badgeDanger: {
    background: "rgba(239,68,68,0.12)",
    color: "#f87171",
    borderColor: "rgba(239,68,68,0.18)",
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

  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "42px",
    padding: "0 14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  cancelButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "42px",
    padding: "0 16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },
};