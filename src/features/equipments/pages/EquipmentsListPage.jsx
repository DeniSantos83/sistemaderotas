import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  RefreshCcw,
  Package2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Boxes,
  MonitorSmartphone,
  Hash,
  Warehouse,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function normalizeText(value) {
  return String(value || "").trim();
}

function getEquipmentStatusLabel(active) {
  return active ? "Ativo" : "Inativo";
}

function getEquipmentStatusStyle(active) {
  if (active) {
    return { ...styles.badgeBase, ...styles.badgeSuccess };
  }

  return { ...styles.badgeBase, ...styles.badgeDanger };
}

export default function EquipmentsListPage() {
  const navigate = useNavigate();

  const [equipments, setEquipments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  async function loadEquipments(showRefreshState = false) {
    try {
      setError("");

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let query = supabase
        .from("equipments")
        .select("*")
        .order("name", { ascending: true });

      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        query = query.or(
          `name.ilike.%${trimmedSearch}%,serial_number.ilike.%${trimmedSearch}%,tombamento.ilike.%${trimmedSearch}%,brand.ilike.%${trimmedSearch}%,model.ilike.%${trimmedSearch}%,notes.ilike.%${trimmedSearch}%`
        );
      }

      if (status === "active") {
        query = query.eq("active", true);
      }

      if (status === "inactive") {
        query = query.eq("active", false);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEquipments(data || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar equipamentos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEquipments();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, status]);

  const stats = useMemo(() => {
    const total = equipments.length;
    const active = equipments.filter((item) => item.active).length;
    const inactive = equipments.filter((item) => !item.active).length;
    const withSerial = equipments.filter(
      (item) => normalizeText(item.serial_number)
    ).length;

    return {
      total,
      active,
      inactive,
      withSerial,
    };
  }, [equipments]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (status) count += 1;
    return count;
  }, [search, status]);

  function clearFilters() {
    setSearch("");
    setStatus("");
  }

  return (
    <div style={styles.page}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <MonitorSmartphone size={15} />
            <span>Inventário operacional</span>
          </div>

          <h1 style={styles.heroTitle}>Gestão de equipamentos</h1>

          <p style={styles.heroText}>
            Centralize o controle dos ativos do sistema, acompanhe o status dos
            equipamentos cadastrados e mantenha informações como tombamento,
            número de série, marca e modelo organizadas em uma experiência SaaS
            premium.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Total no painel</span>
              <strong style={styles.heroMetricValue}>
                {stats.total} equipamento(s)
              </strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Ativos</span>
              <strong style={styles.heroMetricValue}>{stats.active}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Inativos</span>
              <strong style={styles.heroMetricValue}>{stats.inactive}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/equipamentos/novo" style={styles.primaryButton}>
            <Plus size={18} />
            <span>Novo equipamento</span>
          </Link>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Total</p>
              <h3 style={styles.statValue}>{stats.total}</h3>
            </div>
            <div style={styles.statIcon}>
              <Boxes size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Equipamentos localizados</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Ativos</p>
              <h3 style={styles.statValue}>{stats.active}</h3>
            </div>
            <div style={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Disponíveis no inventário</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Inativos</p>
              <h3 style={styles.statValue}>{stats.inactive}</h3>
            </div>
            <div style={styles.statIcon}>
              <XCircle size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Fora de uso ou desativados</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Com série</p>
              <h3 style={styles.statValue}>{stats.withSerial}</h3>
            </div>
            <div style={styles.statIcon}>
              <Hash size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Controle com identificação técnica</p>
        </article>
      </section>

      <section style={styles.panelCard}>
        <div style={styles.panelHeader}>
          <div>
            <p style={styles.sectionKicker}>Painel operacional</p>
            <h3 style={styles.panelTitle}>Lista de equipamentos</h3>
            <p style={styles.panelText}>
              Filtre por nome, tombamento, número de série, marca, modelo ou
              status para localizar rapidamente qualquer ativo.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={() => loadEquipments(true)}
              style={styles.ghostButton}
            >
              <RefreshCcw
                size={16}
                style={refreshing ? styles.spinner : undefined}
              />
              <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
            </button>

            <Link to="/equipamentos/novo" style={styles.primaryButton}>
              <Plus size={18} />
              <span>Novo equipamento</span>
            </Link>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por nome, tombamento, série, marca, modelo ou observações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.field}
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <button type="button" onClick={clearFilters} style={styles.ghostButton}>
            Limpar filtros
          </button>
        </div>

        <div style={styles.filtersSummary}>
          <div style={styles.filtersGroup}>
            <span style={styles.infoChip}>
              <Warehouse size={14} />
              <span>{equipments.length} resultado(s)</span>
            </span>

            <span style={styles.subtleChip}>
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filtro(s) ativo(s)`
                : "Sem filtros aplicados"}
            </span>
          </div>
        </div>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        {loading ? (
          <div style={styles.emptyPanel}>Carregando equipamentos...</div>
        ) : equipments.length === 0 ? (
          <div style={styles.emptyPanel}>
            Nenhum equipamento encontrado.
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Equipamento</th>
                  <th style={styles.th}>Tombamento</th>
                  <th style={styles.th}>Série</th>
                  <th style={styles.th}>Marca / Modelo</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Atualizado em</th>
                  <th style={{ ...styles.th, width: 160 }}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {equipments.map((equipment) => (
                  <tr
                    key={equipment.id}
                    onClick={() => navigate(`/equipamentos/${equipment.id}`)}
                    onMouseEnter={() => setHoveredRow(equipment.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      ...styles.row,
                      ...(hoveredRow === equipment.id ? styles.rowHover : {}),
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {equipment.name || "-"}
                      </div>
                      <div style={styles.secondaryText}>
                        {equipment.notes
                          ? equipment.notes
                          : "Sem observações cadastradas"}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {equipment.tombamento || "-"}
                      </div>
                      <div style={styles.secondaryText}>Patrimônio</div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {equipment.serial_number || "-"}
                      </div>
                      <div style={styles.secondaryText}>
                        Número de série
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {[equipment.brand, equipment.model]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </div>
                      <div style={styles.secondaryText}>
                        Identificação técnica
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={getEquipmentStatusStyle(equipment.active)}>
                        {getEquipmentStatusLabel(equipment.active)}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {formatDateTime(equipment.updated_at)}
                      </div>
                      <div style={styles.secondaryText}>
                        Última modificação
                      </div>
                    </td>

                    <td
                      style={styles.td}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={styles.actions}>
                        <Link
                          to={`/equipamentos/${equipment.id}`}
                          title="Visualizar"
                          style={styles.actionButton}
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          to={`/equipamentos/${equipment.id}/editar`}
                          title="Editar"
                          style={styles.actionButton}
                        >
                          <Pencil size={16} />
                        </Link>
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

  errorBox: {
    marginBottom: "16px",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.18)",
    color: "#fecaca",
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
    marginTop: "18px",
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
    maxWidth: "280px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
    textDecoration: "none",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },
};