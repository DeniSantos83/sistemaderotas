import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPinned,
  Route,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
  Warehouse,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function getRouteStatusLabel(status) {
  const map = {
    planejada: "Planejada",
    em_andamento: "Em andamento",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  };

  return map[status] || status || "-";
}

function getRouteStatusStyle(status) {
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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    employees: 0,
    equipments: 0,
    sectors: 0,
    locations: 0,
    routes: 0,
    activeEmployees: 0,
    activeEquipments: 0,
    activeLocations: 0,
    activeSectors: 0,
  });

  const [recentRoutes, setRecentRoutes] = useState([]);
  const [todayRoutes, setTodayRoutes] = useState([]);

  async function loadDashboard(showRefreshState = false) {
    try {
      setError("");

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const today = new Date().toISOString().slice(0, 10);

      const [
        employeesResult,
        equipmentsResult,
        sectorsResult,
        locationsResult,
        routesResult,
        recentRoutesResult,
        todayRoutesResult,
      ] = await Promise.all([
        supabase.from("employees").select("id, active"),
        supabase.from("equipments").select("id, active"),
        supabase.from("sectors").select("id, active"),
        supabase.from("locations").select("id, active"),
        supabase.from("routes").select("id"),
        supabase
          .from("routes")
          .select(`
            id,
            route_date,
            status,
            created_at,
            route_responsible_manual_name,
            route_responsible:employees (
              name
            ),
            departure_location:locations (
              name
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("routes")
          .select(`
            id,
            route_date,
            status,
            created_at,
            route_responsible_manual_name,
            route_responsible:employees (
              name
            ),
            departure_location:locations (
              name
            )
          `)
          .eq("route_date", today)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (employeesResult.error) throw employeesResult.error;
      if (equipmentsResult.error) throw equipmentsResult.error;
      if (sectorsResult.error) throw sectorsResult.error;
      if (locationsResult.error) throw locationsResult.error;
      if (routesResult.error) throw routesResult.error;
      if (recentRoutesResult.error) throw recentRoutesResult.error;
      if (todayRoutesResult.error) throw todayRoutesResult.error;

      const employees = employeesResult.data || [];
      const equipments = equipmentsResult.data || [];
      const sectors = sectorsResult.data || [];
      const locations = locationsResult.data || [];
      const routes = routesResult.data || [];

      setStats({
        employees: employees.length,
        equipments: equipments.length,
        sectors: sectors.length,
        locations: locations.length,
        routes: routes.length,
        activeEmployees: employees.filter((item) => item.active).length,
        activeEquipments: equipments.filter((item) => item.active).length,
        activeLocations: locations.filter((item) => item.active).length,
        activeSectors: sectors.filter((item) => item.active).length,
      });

      setRecentRoutes(recentRoutesResult.data || []);
      setTodayRoutes(todayRoutesResult.data || []);
    } catch (err) {
      setError(err.message || "Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        title: "Colaboradores",
        value: stats.employees,
        detail: `${stats.activeEmployees} ativos`,
        icon: Users,
        to: "/colaboradores",
      },
      {
        title: "Equipamentos",
        value: stats.equipments,
        detail: `${stats.activeEquipments} ativos`,
        icon: Boxes,
        to: "/equipamentos",
      },
      {
        title: "Setores",
        value: stats.sectors,
        detail: `${stats.activeSectors} ativos`,
        icon: Building2,
        to: "/setores",
      },
      {
        title: "Locais",
        value: stats.locations,
        detail: `${stats.activeLocations} ativos`,
        icon: MapPinned,
        to: "/locais",
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <section style={styles.loadingCard}>
          <Loader2 size={22} style={styles.spinner} />
          <div>
            <h2 style={styles.loadingTitle}>Carregando dashboard</h2>
            <p style={styles.loadingText}>
              Preparando os indicadores operacionais do sistema...
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
            <span>Painel executivo premium</span>
          </div>

          <h1 style={styles.heroTitle}>Dashboard operacional</h1>

          <p style={styles.heroText}>
            Visualize os principais indicadores do sistema, acompanhe módulos
            estratégicos e monitore rapidamente as rotas e estruturas
            organizacionais em um painel SaaS premium.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Total de módulos base</span>
              <strong style={styles.heroMetricValue}>5 áreas principais</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Rotas cadastradas</span>
              <strong style={styles.heroMetricValue}>{stats.routes}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Rotas de hoje</span>
              <strong style={styles.heroMetricValue}>{todayRoutes.length}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
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

      {error ? <div style={styles.errorBox}>{error}</div> : null}

      <section style={styles.statsGrid}>
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.title} to={card.to} style={styles.statCardLink}>
              <article style={styles.statCard}>
                <div style={styles.statCardTop}>
                  <div>
                    <p style={styles.statTitle}>{card.title}</p>
                    <h3 style={styles.statValue}>{card.value}</h3>
                  </div>
                  <div style={styles.statIcon}>
                    <Icon size={20} />
                  </div>
                </div>

                <div style={styles.statFooter}>
                  <p style={styles.statDetail}>{card.detail}</p>
                  <span style={styles.statArrow}>
                    <ArrowRight size={16} />
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </section>

      <div style={styles.contentGrid}>
        <section style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>Hoje no painel</p>
              <h2 style={styles.cardTitle}>Rotas do dia</h2>
              <p style={styles.cardText}>
                Acompanhe rapidamente as rotas cadastradas para hoje e o status
                atual de execução.
              </p>
            </div>

            <Link to="/rotas" style={styles.ghostLink}>
              <span>Ver todas</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {todayRoutes.length === 0 ? (
            <div style={styles.emptyPanel}>
              Nenhuma rota cadastrada para hoje.
            </div>
          ) : (
            <div style={styles.listGrid}>
              {todayRoutes.map((routeItem) => {
                const responsible =
                  routeItem?.route_responsible?.name ||
                  routeItem?.route_responsible_manual_name ||
                  "Responsável não informado";

                const departure =
                  routeItem?.departure_location?.name || "Saída não informada";

                return (
                  <Link
                    key={routeItem.id}
                    to={`/rotas/${routeItem.id}`}
                    style={styles.listCard}
                  >
                    <div style={styles.listCardHeader}>
                      <div style={styles.listCardIcon}>
                        <Route size={18} />
                      </div>

                      <span style={getRouteStatusStyle(routeItem.status)}>
                        {getRouteStatusLabel(routeItem.status)}
                      </span>
                    </div>

                    <div style={styles.listCardBody}>
                      <strong style={styles.listCardTitle}>{responsible}</strong>
                      <span style={styles.listCardText}>{departure}</span>
                      <span style={styles.listCardMeta}>
                        {formatDate(routeItem.created_at)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside style={styles.sideColumn}>
          <section style={styles.sideCard}>
            <div style={styles.sideIconWrap}>
              <ClipboardList size={20} />
            </div>

            <h3 style={styles.sideTitle}>Resumo rápido</h3>

            <div style={styles.summaryList}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Colaboradores ativos</span>
                <strong style={styles.summaryValue}>{stats.activeEmployees}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Equipamentos ativos</span>
                <strong style={styles.summaryValue}>{stats.activeEquipments}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Locais ativos</span>
                <strong style={styles.summaryValue}>{stats.activeLocations}</strong>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Setores ativos</span>
                <strong style={styles.summaryValue}>{stats.activeSectors}</strong>
              </div>
            </div>
          </section>

          <section style={styles.sideCardSoft}>
            <div style={styles.sideCardHeader}>
              <Warehouse size={18} />
              <span>Atalhos estratégicos</span>
            </div>

            <div style={styles.quickLinks}>
              <Link to="/rotas" style={styles.quickLink}>
                <Route size={16} />
                <span>Gerenciar rotas</span>
              </Link>

              <Link to="/equipamentos" style={styles.quickLink}>
                <Boxes size={16} />
                <span>Ver equipamentos</span>
              </Link>

              <Link to="/colaboradores" style={styles.quickLink}>
                <Users size={16} />
                <span>Ver colaboradores</span>
              </Link>

              <Link to="/locais" style={styles.quickLink}>
                <MapPinned size={16} />
                <span>Ver locais</span>
              </Link>
            </div>
          </section>
        </aside>
      </div>

      <section style={styles.mainCard}>
        <div style={styles.cardHeader}>
          <div>
            <p style={styles.sectionKicker}>Últimas movimentações</p>
            <h2 style={styles.cardTitle}>Rotas recentes</h2>
            <p style={styles.cardText}>
              Visualize rapidamente as últimas rotas criadas no sistema.
            </p>
          </div>

          <Link to="/rotas" style={styles.ghostLink}>
            <span>Abrir módulo</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentRoutes.length === 0 ? (
          <div style={styles.emptyPanel}>Nenhuma rota recente encontrada.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Responsável</th>
                  <th style={styles.th}>Saída</th>
                  <th style={styles.th}>Data da rota</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Criada em</th>
                </tr>
              </thead>

              <tbody>
                {recentRoutes.map((routeItem) => {
                  const responsible =
                    routeItem?.route_responsible?.name ||
                    routeItem?.route_responsible_manual_name ||
                    "-";

                  const departure =
                    routeItem?.departure_location?.name || "-";

                  return (
                    <tr key={routeItem.id} style={styles.row}>
                      <td style={styles.td}>
                        <Link
                          to={`/rotas/${routeItem.id}`}
                          style={styles.tablePrimaryLink}
                        >
                          {responsible}
                        </Link>
                      </td>
                      <td style={styles.td}>{departure}</td>
                      <td style={styles.td}>{routeItem.route_date || "-"}</td>
                      <td style={styles.td}>
                        <span style={getRouteStatusStyle(routeItem.status)}>
                          {getRouteStatusLabel(routeItem.status)}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(routeItem.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    fontSize: "clamp(2rem, 4vw, 3.4rem)",
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
    minHeight: "46px",
    padding: "0 16px",
    borderRadius: "16px",
    border: "1px solid rgba(34,197,94,0.22)",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 16px 32px rgba(34,197,94,0.18)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },

  statCardLink: {
    textDecoration: "none",
  },

  statCard: {
    borderRadius: "24px",
    padding: "22px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
    color: "#ffffff",
    minHeight: "148px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
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

  statFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  statDetail: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "0.92rem",
    lineHeight: 1.5,
  },

  statArrow: {
    color: "#94a3b8",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
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
  },

  sideCardHeader: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "16px",
  },

  quickLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  quickLink: {
    display: "inline-flex",
    alignItems: "center",
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

  ghostLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontWeight: 700,
  },

  listGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  listCard: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(10,16,31,0.52)",
    border: "1px solid rgba(255,255,255,0.06)",
    textDecoration: "none",
    color: "#ffffff",
  },

  listCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  listCardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
  },

  listCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  listCardTitle: {
    fontSize: "0.98rem",
    fontWeight: 800,
    color: "#ffffff",
  },

  listCardText: {
    fontSize: "0.88rem",
    color: "#cbd5e1",
  },

  listCardMeta: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },

  emptyPanel: {
    minHeight: "180px",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    fontWeight: 600,
    borderRadius: "18px",
  },

  tableWrap: {
    marginTop: "6px",
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
    whiteSpace: "nowrap",
  },

  td: {
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "0.92rem",
    verticalAlign: "middle",
    color: "#e2e8f0",
  },

  row: {
    background: "transparent",
  },

  tablePrimaryLink: {
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
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

  errorBox: {
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.18)",
    color: "#fecaca",
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