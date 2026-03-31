import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Route,
  CalendarDays,
  Truck,
  Flag,
  Eye,
  RotateCcw,
  XCircle,
  RefreshCcw,
  MapPinned,
  ClipboardList,
} from "lucide-react";
import { listRoutes, updateRouteStatus } from "../services/routesService";

function formatDate(value) {
  if (!value) return "-";

  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
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
    ""
  );
}

function getDepartureLocation(route) {
  return route?.departure_location?.name || "-";
}

export default function RoutesListPage() {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [routeDate, setRouteDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  async function loadRoutes() {
    try {
      setLoading(true);
      setError("");

      const data = await listRoutes({
        search,
        status,
        route_date: routeDate,
      });

      setRoutes(data || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar rotas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRoutes();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, status, routeDate]);

  const stats = useMemo(() => {
    const total = routes.length;
    const planejadas = routes.filter(
      (item) => item.status === "planejada"
    ).length;
    const andamento = routes.filter(
      (item) => item.status === "em_andamento"
    ).length;
    const finalizadas = routes.filter(
      (item) => item.status === "finalizada"
    ).length;
    const canceladas = routes.filter(
      (item) => item.status === "cancelada"
    ).length;

    return { total, planejadas, andamento, finalizadas, canceladas };
  }, [routes]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (status) count += 1;
    if (routeDate) count += 1;
    return count;
  }, [search, status, routeDate]);

  async function handleQuickStatus(route, nextStatus) {
    try {
      await updateRouteStatus(route.id, nextStatus);
      await loadRoutes();
    } catch (err) {
      alert(err.message || "Não foi possível atualizar o status.");
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setRouteDate("");
  }

  return (
    <div className="employees-page" style={styles.page}>
      <section className="hero-card" style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Route size={15} />
            <span>Planejamento logístico</span>
          </div>

          <h1 className="hero-title" style={styles.heroTitle}>
            Gestão de rotas
          </h1>

          <p className="hero-text" style={styles.heroText}>
            Centralize o controle dos itinerários, acompanhe o status das
            operações do dia e mantenha responsáveis e pontos de saída
            organizados em um painel visualmente alinhado ao restante do
            sistema.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Hoje no painel</span>
              <strong style={styles.heroMetricValue}>{stats.total} rotas</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Ativas</span>
              <strong style={styles.heroMetricValue}>{stats.andamento}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Concluídas</span>
              <strong style={styles.heroMetricValue}>{stats.finalizadas}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/rotas/novo" style={styles.primaryButton}>
            <Plus size={18} />
            <span>Nova rota</span>
          </Link>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <article className="stat-card" style={styles.statCard}>
          <div className="stat-card-top" style={styles.statCardTop}>
            <div>
              <p className="stat-title">Total</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
            <div className="stat-icon" style={styles.statIcon}>
              <ClipboardList size={20} />
            </div>
          </div>
          <p className="stat-detail">Rotas localizadas</p>
        </article>

        <article className="stat-card" style={styles.statCard}>
          <div className="stat-card-top">
            <div>
              <p className="stat-title">Planejadas</p>
              <h3 className="stat-value">{stats.planejadas}</h3>
            </div>
            <div className="stat-icon" style={styles.statIcon}>
              <CalendarDays size={20} />
            </div>
          </div>
          <p className="stat-detail">Aguardando início</p>
        </article>

        <article className="stat-card" style={styles.statCard}>
          <div className="stat-card-top">
            <div>
              <p className="stat-title">Em andamento</p>
              <h3 className="stat-value">{stats.andamento}</h3>
            </div>
            <div className="stat-icon" style={styles.statIcon}>
              <Truck size={20} />
            </div>
          </div>
          <p className="stat-detail">Rotas ativas no dia</p>
        </article>

        <article className="stat-card" style={styles.statCard}>
          <div className="stat-card-top">
            <div>
              <p className="stat-title">Finalizadas</p>
              <h3 className="stat-value">{stats.finalizadas}</h3>
            </div>
            <div className="stat-icon" style={styles.statIcon}>
              <Flag size={20} />
            </div>
          </div>
          <p className="stat-detail">Fluxos concluídos</p>
        </article>
      </section>

      <section className="panel-card" style={styles.panelCard}>
        <div className="panel-header panel-header-stack" style={styles.panelHeader}>
          <div>
            <p style={styles.sectionKicker}>Painel operacional</p>
            <h3 style={styles.panelTitle}>Lista de rotas</h3>
            <p style={styles.panelText}>
              Filtre por responsável, observações, data e status para localizar
              rapidamente qualquer operação.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              className="secondary-button"
              onClick={loadRoutes}
              style={styles.secondaryButton}
            >
              <RefreshCcw size={16} />
              <span>Atualizar</span>
            </button>

            <Link to="/rotas/novo" className="primary-link-button">
              <Plus size={18} />
              <span>Nova rota</span>
            </Link>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por responsável manual ou observações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <input
            type="date"
            value={routeDate}
            onChange={(e) => setRouteDate(e.target.value)}
            style={styles.field}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.field}
          >
            <option value="">Todos os status</option>
            <option value="planejada">Planejada</option>
            <option value="em_andamento">Em andamento</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
            style={styles.secondaryButton}
          >
            Limpar filtros
          </button>
        </div>

        <div style={styles.filtersSummary}>
          <div style={styles.filtersGroup}>
            <span style={styles.infoChip}>
              <MapPinned size={14} />
              <span>{routes.length} resultado(s)</span>
            </span>

            <span style={styles.subtleChip}>
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filtro(s) ativo(s)`
                : "Sem filtros aplicados"}
            </span>
          </div>
        </div>

        {error ? <div className="auth-error-box">{error}</div> : null}

        {loading ? (
          <div className="empty-panel" style={styles.emptyPanel}>
            Carregando rotas...
          </div>
        ) : routes.length === 0 ? (
          <div className="empty-panel" style={styles.emptyPanel}>
            Nenhuma rota encontrada.
          </div>
        ) : (
          <div className="table-wrap" style={styles.tableWrap}>
            <table className="records-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Responsável</th>
                  <th style={styles.th}>Saída</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Observações</th>
                  <th style={{ ...styles.th, width: 260 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr
                    key={route.id}
                    onClick={() => navigate(`/rotas/${route.id}`)}
                    onMouseEnter={() => setHoveredRow(route.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      ...styles.row,
                      ...(hoveredRow === route.id ? styles.rowHover : {}),
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {formatDate(route.route_date)}
                      </div>
                      <div style={styles.secondaryText}>Operação programada</div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {getResponsibleName(route)}
                      </div>
                      <div style={styles.secondaryText}>
                        {getResponsibleRegistration(route) || "Sem matrícula"}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {getDepartureLocation(route)}
                      </div>
                      <div style={styles.secondaryText}>Ponto de saída</div>
                    </td>

                    <td style={styles.td}>
                      <span style={getStatusStyle(route.status)}>
                        {statusLabel(route.status)}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.notesCell}>
                        {route.notes || "Sem observações cadastradas."}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div
                        className="row-actions"
                        style={styles.actions}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/rotas/${route.id}`}
                          className="icon-action-button"
                          title="Visualizar"
                          style={styles.actionButton}
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          to={`/rotas/${route.id}/editar`}
                          className="icon-action-button"
                          title="Editar"
                          style={styles.actionButton}
                        >
                          <Pencil size={16} />
                        </Link>

                        {route.status !== "em_andamento" && (
                          <button
                            type="button"
                            className="icon-action-button"
                            title="Marcar em andamento"
                            onClick={() =>
                              handleQuickStatus(route, "em_andamento")
                            }
                            style={styles.actionButton}
                          >
                            <Truck size={16} />
                          </button>
                        )}

                        {route.status !== "finalizada" && (
                          <button
                            type="button"
                            className="icon-action-button"
                            title="Marcar finalizada"
                            onClick={() =>
                              handleQuickStatus(route, "finalizada")
                            }
                            style={styles.actionButton}
                          >
                            <Flag size={16} />
                          </button>
                        )}

                        {route.status !== "planejada" && (
                          <button
                            type="button"
                            className="icon-action-button"
                            title="Voltar para planejada"
                            onClick={() =>
                              handleQuickStatus(route, "planejada")
                            }
                            style={styles.actionButton}
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}

                        {route.status !== "cancelada" && (
                          <button
                            type="button"
                            className="icon-action-button"
                            title="Cancelar rota"
                            onClick={() =>
                              handleQuickStatus(route, "cancelada")
                            }
                            style={styles.actionButton}
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "26px",
    padding: "28px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    background:
      "linear-gradient(135deg, #17233f 0%, #1a2646 45%, #0f172a 100%)",
    boxShadow: "0 22px 55px rgba(15, 23, 42, 0.22)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    color: "#ffffff",
  },

  heroGlowA: {
    position: "absolute",
    top: "-80px",
    right: "-40px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.08)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },

  heroGlowB: {
    position: "absolute",
    bottom: "-90px",
    left: "-30px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
    filter: "blur(32px)",
    pointerEvents: "none",
  },

  heroContent: {
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "760px",
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
    fontWeight: "700",
    letterSpacing: "0.02em",
  },

  heroTitle: {
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.03em",
    fontSize: "54px",
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
  marginTop: "12px",
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
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "flex-start",
  },

  statCard: {
    borderRadius: "24px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
    color: "#ffffff",
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
  statCardTop: {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "18px",
},

  panelCard: {
    borderRadius: "26px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    padding: "22px",
    color: "#ffffff",
  },

  panelHeader: {
    gap: "18px",
    marginBottom: "18px",
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
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },

  page: {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
  paddingBottom: "8px",
},

statsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
  alignItems: "stretch",
},

heroCard: {
  position: "relative",
  overflow: "hidden",
  borderRadius: "26px",
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
  gap: "20px",
  marginBottom: "22px",
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

filtersSummary: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  margin: "18px 0 10px",
},

tableWrap: {
  marginTop: "18px",
  overflowX: "auto",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(9,15,28,0.42)",
},

headerActions: {
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
  alignItems: "center",
},
  
  toolbar: {
    marginTop: "8px",
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(15,23,42,0.38)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    gap: "12px",
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

  filtersSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    margin: "18px 0 6px",
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

  emptyPanel: {
  minHeight: "220px",
  display: "grid",
  placeItems: "center",
  color: "#94a3b8",
  fontWeight: 600,
  borderRadius: "18px",
},

  tableWrap: {
    marginTop: "14px",
    overflowX: "auto",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(9,15,28,0.42)",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },

  th: {
    textAlign: "left",
    fontSize: "0.76rem",
    textTransform: "uppercase",
    color: "#94a3b8",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.04)",
    letterSpacing: "0.08em",
    fontWeight: 800,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  td: {
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "0.92rem",
    verticalAlign: "middle",
    color: "#e2e8f0",
  },

  row: {
    cursor: "pointer",
    transition: "all 0.18s ease",
    background: "transparent",
  },

  rowHover: {
    background: "rgba(255,255,255,0.03)",
  },

  primaryText: {
    fontWeight: 700,
    color: "#ffffff",
  },

  secondaryText: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    marginTop: "4px",
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

  notesCell: {
    maxWidth: "340px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#cbd5e1",
  },

  statCard: {
  borderRadius: "24px",
  padding: "18px", // 👈 isso ajuda MUITO
  background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
  color: "#ffffff",
},

  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  actionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
    transition: "0.2s",
    color: "#ffffff",
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
    cursor: "pointer",
  },
};