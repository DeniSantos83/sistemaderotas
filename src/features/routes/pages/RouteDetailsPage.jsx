import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Flag,
  Loader2,
  MapPinned,
  Pencil,
  RefreshCcw,
  Route,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { updateRouteStatus } from "../services/routesService";

function formatDate(value) {
  if (!value) return "-";

  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("pt-BR");
}

function statusLabel(status) {
  const map = {
    planejada: "Planejada",
    em_andamento: "Em andamento",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  };

  return map[status] || status || "-";
}

function getStatusStyle(status) {
  switch (status) {
    case "finalizada":
      return { ...styles.badgeBase, ...styles.badgeSuccess };
    case "cancelada":
      return { ...styles.badgeBase, ...styles.badgeDanger };
    case "em_andamento":
      return { ...styles.badgeBase, ...styles.badgeInfo };
    case "planejada":
    default:
      return { ...styles.badgeBase, ...styles.badgeWarning };
  }
}

function getResponsibleName(route) {
  return (
    route?.route_responsible?.name ||
    route?.route_responsible_manual_name ||
    "-"
  );
}

function getResponsibleRegistration(route) {
  return (
    route?.route_responsible?.registration ||
    route?.route_responsible_manual_registration ||
    "-"
  );
}

function getResponsibleType(route) {
  return route?.route_responsible?.employee_type || "Responsável da operação";
}

function getDepartureLocation(route) {
  return route?.departure_location?.name || "-";
}

export default function RouteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadRoute() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const { data, error: fetchError } = await supabase
        .from("routes")
        .select(`
          id,
          route_date,
          status,
          notes,
          created_at,
          updated_at,
          created_by,
          route_responsible_id,
          route_responsible_manual_name,
          route_responsible_manual_registration,
          departure_location_id,
          departure_location:locations (
            id,
            name
          ),
          route_responsible:employees (
            id,
            name,
            registration,
            employee_type
          )
        `)
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      setRouteData(data || null);
    } catch (err) {
      setError(err.message || "Erro ao carregar os detalhes da rota.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoute();
  }, [id]);

  async function handleQuickStatus(nextStatus) {
    try {
      setStatusLoading(nextStatus);
      setError("");
      setSuccessMessage("");

      await updateRouteStatus(id, nextStatus);
      await loadRoute();

      setSuccessMessage(`Status atualizado para ${statusLabel(nextStatus)}.`);
    } catch (err) {
      setError(err.message || "Não foi possível atualizar o status.");
    } finally {
      setStatusLoading("");
    }
  }

  const summary = useMemo(() => {
    if (!routeData) {
      return {
        status: "-",
        date: "-",
        responsible: "-",
        departure: "-",
      };
    }

    return {
      status: statusLabel(routeData.status),
      date: formatDate(routeData.route_date),
      responsible: getResponsibleName(routeData),
      departure: getDepartureLocation(routeData),
    };
  }, [routeData]);

  const statusActions = useMemo(() => {
    if (!routeData) return [];

    return [
      {
        value: "planejada",
        label: "Voltar para planejada",
        icon: RotateCcw,
        visible: routeData.status !== "planejada",
      },
      {
        value: "em_andamento",
        label: "Marcar em andamento",
        icon: Truck,
        visible: routeData.status !== "em_andamento",
      },
      {
        value: "finalizada",
        label: "Marcar finalizada",
        icon: Flag,
        visible: routeData.status !== "finalizada",
      },
      {
        value: "cancelada",
        label: "Cancelar rota",
        icon: XCircle,
        visible: routeData.status !== "cancelada",
      },
    ].filter((item) => item.visible);
  }, [routeData]);

  if (loading) {
    return (
      <div style={styles.page}>
        <section style={styles.loadingCard}>
          <Loader2 size={22} style={styles.spinner} />
          <div>
            <h2 style={styles.loadingTitle}>Carregando rota</h2>
            <p style={styles.loadingText}>
              Preparando os detalhes operacionais do itinerário...
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (error && !routeData) {
    return (
      <div style={styles.page}>
        <section style={styles.mainCard}>
          <div style={styles.errorBox}>{error}</div>

          <div style={styles.formActions}>
            <button type="button" onClick={loadRoute} style={styles.ghostButton}>
              <RefreshCcw size={16} />
              <span>Tentar novamente</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/rotas")}
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
            <span>Visualização premium da operação</span>
          </div>

          <h1 style={styles.heroTitle}>Detalhes da rota</h1>

          <p style={styles.heroText}>
            Acompanhe a configuração da operação, valide o responsável, confira
            o ponto de saída e altere rapidamente o status conforme a execução
            da rota.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Data da rota</span>
              <strong style={styles.heroMetricValue}>{summary.date}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status atual</span>
              <strong style={styles.heroMetricValue}>{summary.status}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Saída</span>
              <strong style={styles.heroMetricValue}>{summary.departure}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/rotas" style={styles.backButton}>
            <ArrowLeft size={17} />
            <span>Voltar</span>
          </Link>

          <Link to={`/rotas/${id}/editar`} style={styles.primaryButton}>
            <Pencil size={17} />
            <span>Editar rota</span>
          </Link>
        </div>
      </section>

      <div style={styles.contentGrid}>
        <section style={styles.mainColumn}>
          <section style={styles.mainCard}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionKicker}>Resumo operacional</p>
                <h2 style={styles.cardTitle}>Informações principais</h2>
                <p style={styles.cardText}>
                  Visualize os dados centrais desta rota em um painel limpo e
                  organizado.
                </p>
              </div>

              <button type="button" onClick={loadRoute} style={styles.ghostButton}>
                <RefreshCcw size={16} />
                <span>Atualizar</span>
              </button>
            </div>

            {error ? <div style={styles.errorBox}>{error}</div> : null}
            {successMessage ? (
              <div style={styles.successBox}>{successMessage}</div>
            ) : null}

            <div style={styles.infoGrid}>
              <article style={styles.infoCard}>
                <div style={styles.infoCardIcon}>
                  <CalendarDays size={18} />
                </div>
                <div style={styles.infoContent}>
                  <span style={styles.infoLabel}>Data da rota</span>
                  <strong style={styles.infoValue}>
                    {formatDate(routeData?.route_date)}
                  </strong>
                  <span style={styles.infoSubtle}>Operação programada</span>
                </div>
              </article>

              <article style={styles.infoCard}>
                <div style={styles.infoCardIcon}>
                  <MapPinned size={18} />
                </div>
                <div style={styles.infoContent}>
                  <span style={styles.infoLabel}>Local de saída</span>
                  <strong style={styles.infoValue}>
                    {getDepartureLocation(routeData)}
                  </strong>
                  <span style={styles.infoSubtle}>Ponto inicial da rota</span>
                </div>
              </article>

              <article style={styles.infoCard}>
                <div style={styles.infoCardIcon}>
                  <UserRound size={18} />
                </div>
                <div style={styles.infoContent}>
                  <span style={styles.infoLabel}>Responsável</span>
                  <strong style={styles.infoValue}>
                    {getResponsibleName(routeData)}
                  </strong>
                  <span style={styles.infoSubtle}>
                    {getResponsibleRegistration(routeData) !== "-"
                      ? `Identificação ${getResponsibleRegistration(routeData)}`
                      : "Sem matrícula informada"}
                  </span>
                </div>
              </article>

              <article style={styles.infoCard}>
                <div style={styles.infoCardIcon}>
                  <ShieldCheck size={18} />
                </div>
                <div style={styles.infoContent}>
                  <span style={styles.infoLabel}>Status</span>
                  <strong style={styles.infoValue}>
                    <span style={getStatusStyle(routeData?.status)}>
                      {statusLabel(routeData?.status)}
                    </span>
                  </strong>
                  <span style={styles.infoSubtle}>Situação atual da operação</span>
                </div>
              </article>
            </div>
          </section>

          <section style={styles.mainCard}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionKicker}>Detalhamento</p>
                <h2 style={styles.cardTitle}>Dados da rota</h2>
                <p style={styles.cardText}>
                  Informações complementares para conferência e auditoria.
                </p>
              </div>
            </div>

            <div style={styles.detailsGrid}>
              <div style={styles.detailBlock}>
                <span style={styles.detailLabel}>Identificador</span>
                <strong style={styles.detailValue}>{routeData?.id || "-"}</strong>
              </div>

              <div style={styles.detailBlock}>
                <span style={styles.detailLabel}>Tipo de responsável</span>
                <strong style={styles.detailValue}>
                  {routeData?.route_responsible
                    ? getResponsibleType(routeData)
                    : "Responsável manual"}
                </strong>
              </div>

              <div style={styles.detailBlock}>
                <span style={styles.detailLabel}>Criado em</span>
                <strong style={styles.detailValue}>
                  {formatDateTime(routeData?.created_at)}
                </strong>
              </div>

              <div style={styles.detailBlock}>
                <span style={styles.detailLabel}>Última atualização</span>
                <strong style={styles.detailValue}>
                  {formatDateTime(routeData?.updated_at)}
                </strong>
              </div>
            </div>

            <div style={styles.notesCard}>
              <div style={styles.notesHeader}>
                <FileText size={18} />
                <span>Observações</span>
              </div>

              <p style={styles.notesText}>
                {routeData?.notes?.trim()
                  ? routeData.notes
                  : "Nenhuma observação foi cadastrada para esta rota."}
              </p>
            </div>
          </section>

          <section style={styles.mainCard}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionKicker}>Ações rápidas</p>
                <h2 style={styles.cardTitle}>Atualização de status</h2>
                <p style={styles.cardText}>
                  Altere rapidamente a situação da rota conforme a execução da
                  operação.
                </p>
              </div>
            </div>

            <div style={styles.quickActionsGrid}>
              {statusActions.length === 0 ? (
                <div style={styles.emptyInlineBox}>
                  Nenhuma ação de status disponível no momento.
                </div>
              ) : (
                statusActions.map((action) => {
                  const Icon = action.icon;
                  const loadingThisAction = statusLoading === action.value;

                  return (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => handleQuickStatus(action.value)}
                      disabled={Boolean(statusLoading)}
                      style={{
                        ...styles.quickActionButton,
                        ...(loadingThisAction ? styles.quickActionButtonLoading : {}),
                      }}
                    >
                      {loadingThisAction ? (
                        <Loader2 size={17} style={styles.spinner} />
                      ) : (
                        <Icon size={17} />
                      )}
                      <span>{action.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </section>

        <aside style={styles.sideColumn}>
          <section style={styles.sideCard}>
            <div style={styles.sideIconWrap}>
              <Route size={20} />
            </div>

            <h3 style={styles.sideTitle}>Resumo executivo</h3>

            <div style={styles.summaryList}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Data</span>
                <strong style={styles.summaryValue}>{summary.date}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Status</span>
                <strong style={styles.summaryValue}>{summary.status}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Responsável</span>
                <strong style={styles.summaryValue}>{summary.responsible}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Saída</span>
                <strong style={styles.summaryValue}>{summary.departure}</strong>
              </div>
            </div>
          </section>

          <section style={styles.sideCardSoft}>
            <div style={styles.sideCardHeader}>
              <ClipboardList size={18} />
              <span>Checklist visual</span>
            </div>

            <ul style={styles.tipList}>
              <li style={styles.tipItem}>
                Confira se o responsável exibido corresponde ao planejado.
              </li>
              <li style={styles.tipItem}>
                Valide o ponto de saída antes de iniciar a operação.
              </li>
              <li style={styles.tipItem}>
                Atualize o status da rota conforme o andamento real da execução.
              </li>
            </ul>
          </section>

          <section style={styles.sideCardSoft}>
            <div style={styles.sideCardHeader}>
              <CheckCircle2 size={18} />
              <span>Atalhos</span>
            </div>

            <div style={styles.sideActions}>
              <Link to={`/rotas/${id}/editar`} style={styles.sideActionButton}>
                <Pencil size={16} />
                <span>Editar esta rota</span>
              </Link>

              <Link to="/rotas" style={styles.sideActionButtonGhost}>
                <ArrowLeft size={16} />
                <span>Voltar para lista</span>
              </Link>
            </div>
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

  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
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
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
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

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  detailBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px 18px",
    borderRadius: "18px",
    background: "rgba(10,16,31,0.44)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  detailLabel: {
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  detailValue: {
    fontSize: "0.96rem",
    fontWeight: 700,
    color: "#ffffff",
    wordBreak: "break-word",
  },

  notesCard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(10,16,31,0.52)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  notesHeader: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 800,
    color: "#ffffff",
  },

  notesText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  quickActionsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },

  quickActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "46px",
    padding: "0 16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  quickActionButtonLoading: {
    opacity: 0.75,
    cursor: "wait",
  },

  emptyInlineBox: {
    width: "100%",
    padding: "18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#94a3b8",
    fontWeight: 600,
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

  badgeInfo: {
    background: "rgba(59,130,246,0.12)",
    color: "#60a5fa",
    borderColor: "rgba(59,130,246,0.18)",
  },

  badgeWarning: {
    background: "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    borderColor: "rgba(245,158,11,0.18)",
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
    textDecoration: "none",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    border: "1px solid rgba(34,197,94,0.22)",
    color: "#ffffff",
    fontWeight: 800,
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