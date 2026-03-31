import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CircleAlert,
  Filter,
  Info,
  Search,
  ShieldAlert,
  Trash2,
  Sparkles,
  RefreshCcw,
  MailOpen,
  Mail,
} from "lucide-react";
import {
  fetchNotifications,
  getNotificationTypeLabel,
  markNotificationAsRead,
  markNotificationAsUnread,
  archiveNotification,
} from "../services/notificationsService";

function getTypeIcon(type) {
  switch (type) {
    case "success":
      return <CheckCheck size={18} />;
    case "warning":
      return <CircleAlert size={18} />;
    case "error":
      return <ShieldAlert size={18} />;
    default:
      return <Info size={18} />;
  }
}

function getTypeStyles(type) {
  switch (type) {
    case "success":
      return {
        color: "#86efac",
        background: "rgba(34, 197, 94, 0.12)",
        border: "1px solid rgba(34, 197, 94, 0.22)",
      };
    case "warning":
      return {
        color: "#fde68a",
        background: "rgba(245, 158, 11, 0.12)",
        border: "1px solid rgba(245, 158, 11, 0.22)",
      };
    case "error":
      return {
        color: "#fca5a5",
        background: "rgba(239, 68, 68, 0.12)",
        border: "1px solid rgba(239, 68, 68, 0.22)",
      };
    default:
      return {
        color: "#93c5fd",
        background: "rgba(59, 130, 246, 0.12)",
        border: "1px solid rgba(59, 130, 246, 0.22)",
      };
  }
}

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadNotifications(showRefreshing = false) {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const data = await fetchNotifications();
      setNotifications(data || []);
    } catch (err) {
      setErrorMessage(
        err.message || "Não foi possível carregar as notificações."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkRead(id) {
    setBusyId(id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );

      setSuccessMessage("Notificação marcada como lida.");
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível marcar como lida.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkUnread(id) {
    setBusyId(id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await markNotificationAsUnread(id);

      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: false } : item))
      );

      setSuccessMessage("Notificação marcada como não lida.");
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível marcar como não lida.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(id) {
    setBusyId(id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await archiveNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage("Notificação arquivada com sucesso.");
    } catch (err) {
      setErrorMessage(
        err.message || "Não foi possível arquivar a notificação."
      );
    } finally {
      setBusyId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.message?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || item.notification_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "read" && item.read) ||
        (statusFilter === "unread" && !item.read);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [notifications, search, typeFilter, statusFilter]);

  const summary = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((item) => !item.read).length;
    const read = notifications.filter((item) => item.read).length;
    const warnings = notifications.filter(
      (item) => item.notification_type === "warning"
    ).length;
    const errors = notifications.filter(
      (item) => item.notification_type === "error"
    ).length;

    return { total, unread, read, warnings, errors };
  }, [notifications]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (typeFilter !== "all") count += 1;
    if (statusFilter !== "all") count += 1;
    return count;
  }, [search, typeFilter, statusFilter]);

  return (
    <div style={styles.page}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Sparkles size={15} />
            <span>Monitoramento e alertas</span>
          </div>

          <h1 style={styles.heroTitle}>Central de notificações</h1>

          <p style={styles.heroText}>
            Acompanhe eventos do sistema, alertas operacionais e avisos
            administrativos em um painel alinhado ao padrão SaaS premium das
            demais páginas do sistema.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Total no painel</span>
              <strong style={styles.heroMetricValue}>
                {summary.total} notificação(ões)
              </strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Não lidas</span>
              <strong style={styles.heroMetricValue}>{summary.unread}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Alertas críticos</span>
              <strong style={styles.heroMetricValue}>
                {summary.warnings + summary.errors}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <button
            type="button"
            onClick={() => loadNotifications(true)}
            style={styles.primaryButton}
          >
            <RefreshCcw
              size={16}
              style={refreshing ? styles.spinner : undefined}
            />
            <span>{refreshing ? "Atualizando..." : "Atualizar painel"}</span>
          </button>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Total</p>
              <h3 style={styles.statValue}>{summary.total}</h3>
            </div>
            <div style={styles.statIcon}>
              <Bell size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Notificações disponíveis no sistema</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Não lidas</p>
              <h3 style={styles.statValue}>{summary.unread}</h3>
            </div>
            <div style={styles.statIcon}>
              <Mail size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Pendentes de atenção do usuário</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Lidas</p>
              <h3 style={styles.statValue}>{summary.read}</h3>
            </div>
            <div style={styles.statIcon}>
              <MailOpen size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Já visualizadas no painel</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Avisos e erros</p>
              <h3 style={styles.statValue}>
                {summary.warnings + summary.errors}
              </h3>
            </div>
            <div style={styles.statIcon}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Itens que exigem maior atenção</p>
        </article>
      </section>

      <section style={styles.panelCard}>
        <div style={styles.panelHeader}>
          <div>
            <p style={styles.sectionKicker}>Painel operacional</p>
            <h3 style={styles.panelTitle}>Lista de notificações</h3>
            <p style={styles.panelText}>
              Filtre por tipo, status e conteúdo para localizar rapidamente os
              eventos importantes do sistema.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={() => loadNotifications(true)}
              style={styles.ghostButton}
            >
              <RefreshCcw
                size={16}
                style={refreshing ? styles.spinner : undefined}
              />
              <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
            </button>

            <button type="button" onClick={clearFilters} style={styles.ghostButton}>
              Limpar filtros
            </button>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por título ou mensagem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            style={styles.field}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            <option value="info">Informação</option>
            <option value="success">Sucesso</option>
            <option value="warning">Aviso</option>
            <option value="error">Erro</option>
          </select>

          <select
            style={styles.field}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="unread">Não lidas</option>
            <option value="read">Lidas</option>
          </select>
        </div>

        <div style={styles.filtersSummary}>
          <div style={styles.filtersGroup}>
            <span style={styles.infoChip}>
              <Bell size={14} />
              <span>{filteredNotifications.length} resultado(s)</span>
            </span>

            <span style={styles.subtleChip}>
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filtro(s) ativo(s)`
                : "Sem filtros aplicados"}
            </span>
          </div>
        </div>

        {successMessage ? <div style={styles.successBox}>{successMessage}</div> : null}
        {errorMessage ? <div style={styles.errorBox}>{errorMessage}</div> : null}

        {loading ? (
          <div style={styles.emptyPanel}>Carregando notificações...</div>
        ) : filteredNotifications.length === 0 ? (
          <div style={styles.emptyPanel}>Nenhuma notificação encontrada.</div>
        ) : (
          <div style={styles.listWrap}>
            {filteredNotifications.map((item) => {
              const typeStyles = getTypeStyles(item.notification_type);

              return (
                <article
                  key={item.id}
                  style={{
                    ...styles.notificationCard,
                    ...(item.read ? styles.notificationCardRead : {}),
                  }}
                >
                  <div style={styles.notificationTop}>
                    <div style={styles.notificationMain}>
                      <div style={{ ...styles.typeBadge, ...typeStyles }}>
                        {getTypeIcon(item.notification_type)}
                        <span>
                          {getNotificationTypeLabel(item.notification_type)}
                        </span>
                      </div>

                      <div style={styles.notificationHeadText}>
                        <h3 style={styles.notificationTitle}>{item.title}</h3>
                        <p style={styles.notificationMessage}>{item.message}</p>
                      </div>
                    </div>

                    <div style={styles.metaWrap}>
                      <span
                        style={{
                          ...styles.readBadge,
                          ...(item.read ? styles.readBadgeRead : styles.readBadgeUnread),
                        }}
                      >
                        {item.read ? "Lida" : "Não lida"}
                      </span>
                    </div>
                  </div>

                  <div style={styles.notificationFooter}>
                    <div style={styles.footerInfo}>
                      <span>Criada em {formatDateTime(item.created_at)}</span>
                      {item.related_record_id ? (
                        <span>Registro relacionado: {item.related_record_id}</span>
                      ) : null}
                    </div>

                    <div style={styles.actions}>
                      {item.read ? (
                        <button
                          type="button"
                          style={styles.secondaryButton}
                          disabled={busyId === item.id}
                          onClick={() => handleMarkUnread(item.id)}
                        >
                          Marcar como não lida
                        </button>
                      ) : (
                        <button
                          type="button"
                          style={styles.primarySolidButton}
                          disabled={busyId === item.id}
                          onClick={() => handleMarkRead(item.id)}
                        >
                          Marcar como lida
                        </button>
                      )}

                      <button
                        type="button"
                        style={styles.dangerButton}
                        disabled={busyId === item.id}
                        onClick={() => handleArchive(item.id)}
                      >
                        <Trash2 size={16} />
                        <span>Arquivar</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
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
    color: "#ffffff",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 18px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    border: "1px solid rgba(34,197,94,0.22)",
    fontWeight: 800,
    color: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(34,197,94,0.18)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },

  statCard: {
    borderRadius: "24px",
    padding: "22px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
    color: "#ffffff",
    minHeight: "148px",
  },

  statCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
  },

  statTitle: {
    margin: "0 0 6px",
    color: "#94a3b8",
    fontSize: "0.86rem",
    fontWeight: 700,
  },

  statValue: {
    margin: 0,
    color: "#ffffff",
    fontSize: "1.9rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },

  statDetail: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "0.92rem",
    lineHeight: 1.5,
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

  panelCard: {
    borderRadius: "26px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    padding: "26px",
    color: "#ffffff",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "22px",
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

  panelTitle: {
    margin: "0 0 6px",
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },

  panelText: {
    margin: 0,
    color: "rgba(148,163,184,0.92)",
    lineHeight: 1.55,
  },

  headerActions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  toolbar: {
    marginTop: "10px",
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(15,23,42,0.38)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: "280px",
    padding: "13px 16px",
    borderRadius: "14px",
    background: "#0b1326",
    border: "1px solid rgba(59,130,246,0.18)",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "0.95rem",
    background: "transparent",
    color: "#e2e8f0",
  },

  field: {
    minHeight: "46px",
    borderRadius: "12px",
    padding: "0 14px",
    background: "#0b1326",
    border: "1px solid rgba(59,130,246,0.18)",
    color: "#ffffff",
    outline: "none",
  },

  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "46px",
    padding: "0 14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  filtersSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    margin: "18px 0 10px",
  },

  filtersGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  infoChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontSize: "0.82rem",
    fontWeight: 700,
  },

  subtleChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#94a3b8",
    fontSize: "0.82rem",
    fontWeight: 600,
  },

  successBox: {
    marginBottom: "16px",
    borderRadius: "16px",
    padding: "14px 16px",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.22)",
    color: "#bbf7d0",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  errorBox: {
    marginBottom: "16px",
    borderRadius: "16px",
    padding: "14px 16px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.22)",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  listWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "18px",
  },

  notificationCard: {
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(34, 197, 94, 0.16)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  notificationCardRead: {
    opacity: 0.82,
    borderColor: "rgba(148, 163, 184, 0.08)",
  },

  notificationTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  notificationMain: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    minWidth: 0,
    flex: 1,
  },

  typeBadge: {
    minWidth: "fit-content",
    padding: "10px 12px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 700,
    flexShrink: 0,
  },

  notificationHeadText: {
    minWidth: 0,
  },

  notificationTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: 800,
    lineHeight: 1.3,
  },

  notificationMessage: {
    margin: "8px 0 0 0",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  metaWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "flex-end",
  },

  readBadge: {
    padding: "8px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },

  readBadgeRead: {
    color: "#cbd5e1",
    background: "rgba(148, 163, 184, 0.12)",
  },

  readBadgeUnread: {
    color: "#86efac",
    background: "rgba(34, 197, 94, 0.14)",
  },

  notificationFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  footerInfo: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  primarySolidButton: {
    height: "40px",
    padding: "0 14px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 45%, #3b82f6 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    height: "40px",
    padding: "0 14px",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: "12px",
    background: "rgba(15, 23, 42, 0.94)",
    color: "#e2e8f0",
    fontWeight: 700,
    cursor: "pointer",
  },

  dangerButton: {
    height: "40px",
    padding: "0 14px",
    border: "1px solid rgba(239, 68, 68, 0.18)",
    borderRadius: "12px",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#fecaca",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },

  emptyPanel: {
    minHeight: "220px",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    fontWeight: 600,
    borderRadius: "18px",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },
};