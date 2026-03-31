import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  Pencil,
  Search,
  ShieldCheck,
  Wrench,
  XCircle,
  Sparkles,
  Plus,
  RefreshCcw,
  FileText,
  BadgeInfo,
} from "lucide-react";
import {
  cancelRecord,
  confirmMaintenance,
  fetchRecords,
} from "../services/recordsService";
import {
  RECORD_STATUS_OPTIONS,
  RECORD_TYPE_OPTIONS,
} from "../Utils/recordOptions";
import {
  formatRecordDateTime,
  getRecordEquipmentLabel,
  getRecordLocationLabel,
  getRecordResponsibleLabel,
  getRecordStatusLabel,
  getRecordTypeLabel,
} from "../Utils/recordsFormatters";

function getStatusBadgeStyle(status) {
  switch (status) {
    case "completed":
    case "received":
    case "delivered":
      return {
        ...styles.badgeBase,
        ...styles.badgeSuccess,
      };
    case "cancelled":
      return {
        ...styles.badgeBase,
        ...styles.badgeDanger,
      };
    case "pending":
      return {
        ...styles.badgeBase,
        ...styles.badgeWarning,
      };
    default:
      return {
        ...styles.badgeBase,
        ...styles.badgeInfo,
      };
  }
}

function getTypeBadgeStyle(type) {
  switch (type) {
    case "delivery":
      return {
        ...styles.badgeBase,
        color: "#bfdbfe",
        background: "rgba(59, 130, 246, 0.12)",
        border: "1px solid rgba(59, 130, 246, 0.18)",
      };
    case "receipt":
      return {
        ...styles.badgeBase,
        color: "#bbf7d0",
        background: "rgba(34, 197, 94, 0.12)",
        border: "1px solid rgba(34, 197, 94, 0.18)",
      };
    case "transfer":
      return {
        ...styles.badgeBase,
        color: "#e9d5ff",
        background: "rgba(168, 85, 247, 0.12)",
        border: "1px solid rgba(168, 85, 247, 0.18)",
      };
    case "maintenance_out":
    case "maintenance_return":
      return {
        ...styles.badgeBase,
        color: "#fde68a",
        background: "rgba(245, 158, 11, 0.12)",
        border: "1px solid rgba(245, 158, 11, 0.18)",
      };
    default:
      return {
        ...styles.badgeBase,
        color: "#cbd5e1",
        background: "rgba(148, 163, 184, 0.12)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
      };
  }
}

export default function RecordsListPage() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [maintenanceFilter, setMaintenanceFilter] = useState("all");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadRecords(showRefreshing = false) {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const data = await fetchRecords();
      setRecords(data || []);
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível carregar os registros.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  async function handleCancelRecord(record) {
    const reason = window.prompt(
      "Informe o motivo do cancelamento:",
      record.cancellation_reason || ""
    );

    if (reason === null) return;

    setBusyId(record.id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await cancelRecord(record.id, reason);

      setRecords((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: "cancelled",
                cancellation_reason: reason,
              }
            : item
        )
      );

      setSuccessMessage("Registro cancelado com sucesso.");
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível cancelar o registro.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmMaintenance(record) {
    setBusyId(record.id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await confirmMaintenance(record.id);

      setRecords((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? {
                ...item,
                maintenance_confirmation: true,
                maintenance_confirmed_at: new Date().toISOString(),
              }
            : item
        )
      );

      setSuccessMessage("Manutenção confirmada com sucesso.");
    } catch (err) {
      setErrorMessage(
        err.message || "Não foi possível confirmar a manutenção."
      );
    } finally {
      setBusyId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setMaintenanceFilter("all");
  }

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        !search ||
        record.app_number?.toLowerCase().includes(searchValue) ||
        record.call_number?.toLowerCase().includes(searchValue) ||
        record.grp_number?.toLowerCase().includes(searchValue) ||
        record.tombamento_manual?.toLowerCase().includes(searchValue) ||
        getRecordEquipmentLabel(record).toLowerCase().includes(searchValue) ||
        getRecordLocationLabel(record).toLowerCase().includes(searchValue) ||
        getRecordResponsibleLabel(record).toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === "all" || record.record_type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;

      const matchesMaintenance =
        maintenanceFilter === "all" ||
        (maintenanceFilter === "confirmed" &&
          record.maintenance_confirmation === true) ||
        (maintenanceFilter === "not_confirmed" &&
          record.maintenance_confirmation !== true);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesMaintenance
      );
    });
  }, [records, search, typeFilter, statusFilter, maintenanceFilter]);

  const summary = useMemo(() => {
    const total = records.length;
    const pending = records.filter((r) => r.status === "pending").length;
    const completed = records.filter(
      (r) =>
        r.status === "completed" ||
        r.status === "received" ||
        r.status === "delivered"
    ).length;
    const cancelled = records.filter((r) => r.status === "cancelled").length;
    const maintenanceConfirmed = records.filter(
      (r) => r.maintenance_confirmation === true
    ).length;

    return {
      total,
      pending,
      completed,
      cancelled,
      maintenanceConfirmed,
    };
  }, [records]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (typeFilter !== "all") count += 1;
    if (statusFilter !== "all") count += 1;
    if (maintenanceFilter !== "all") count += 1;
    return count;
  }, [search, typeFilter, statusFilter, maintenanceFilter]);

  return (
    <div style={styles.page}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Sparkles size={15} />
            <span>Operação centralizada</span>
          </div>

          <h1 style={styles.heroTitle}>Gestão de registros</h1>

          <p style={styles.heroText}>
            Gerencie entregas, recebimentos, movimentações e manutenções em um
            painel premium, com controle operacional completo e leitura rápida
            das principais informações do fluxo.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Total no painel</span>
              <strong style={styles.heroMetricValue}>
                {summary.total} registro(s)
              </strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Pendentes</span>
              <strong style={styles.heroMetricValue}>{summary.pending}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Concluídos</span>
              <strong style={styles.heroMetricValue}>{summary.completed}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/registros/novo" style={styles.primaryButton}>
            <Plus size={18} />
            <span>Novo registro</span>
          </Link>
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
              <ClipboardList size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Registros cadastrados no sistema</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Pendentes</p>
              <h3 style={styles.statValue}>{summary.pending}</h3>
            </div>
            <div style={styles.statIcon}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Aguardando andamento operacional</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Concluídos</p>
              <h3 style={styles.statValue}>{summary.completed}</h3>
            </div>
            <div style={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Fluxos encerrados com sucesso</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Cancelados</p>
              <h3 style={styles.statValue}>{summary.cancelled}</h3>
            </div>
            <div style={styles.statIcon}>
              <XCircle size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Com motivo registrado no histórico</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Manutenção</p>
              <h3 style={styles.statValue}>{summary.maintenanceConfirmed}</h3>
            </div>
            <div style={styles.statIcon}>
              <Wrench size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Confirmações de manutenção realizadas</p>
        </article>
      </section>

      <section style={styles.panelCard}>
        <div style={styles.panelHeader}>
          <div>
            <p style={styles.sectionKicker}>Painel operacional</p>
            <h3 style={styles.panelTitle}>Lista de registros</h3>
            <p style={styles.panelText}>
              Filtre por APP, chamado, GRP, tombamento, tipo, status e
              manutenção para localizar rapidamente qualquer registro.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={() => loadRecords(true)}
              style={styles.ghostButton}
            >
              <RefreshCcw
                size={16}
                style={refreshing ? styles.spinner : undefined}
              />
              <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
            </button>

            <Link to="/registros/novo" style={styles.primaryButton}>
              <Plus size={18} />
              <span>Novo registro</span>
            </Link>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por APP, chamado, GRP, tombamento, equipamento..."
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
            {RECORD_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            style={styles.field}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            {RECORD_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            style={styles.field}
            value={maintenanceFilter}
            onChange={(e) => setMaintenanceFilter(e.target.value)}
          >
            <option value="all">Toda manutenção</option>
            <option value="confirmed">Confirmada</option>
            <option value="not_confirmed">Não confirmada</option>
          </select>

          <button type="button" onClick={clearFilters} style={styles.ghostButton}>
            Limpar filtros
          </button>
        </div>

        <div style={styles.filtersSummary}>
          <div style={styles.filtersGroup}>
            <span style={styles.infoChip}>
              <FileText size={14} />
              <span>{filteredRecords.length} resultado(s)</span>
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
          <div style={styles.emptyPanel}>Carregando registros...</div>
        ) : filteredRecords.length === 0 ? (
          <div style={styles.emptyPanel}>Nenhum registro encontrado.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data/Hora</th>
                  <th style={styles.th}>Identificação</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Equipamento</th>
                  <th style={styles.th}>Local / Setor</th>
                  <th style={styles.th}>Responsável</th>
                  <th style={styles.th}>Manutenção</th>
                  <th style={{ ...styles.th, width: 180 }}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const statusStyle = getStatusBadgeStyle(record.status);
                  const typeStyle = getTypeBadgeStyle(record.record_type);

                  return (
                    <tr
                      key={record.id}
                      onClick={() => navigate(`/registros/${record.id}`)}
                      onMouseEnter={() => setHoveredRow(record.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        ...styles.row,
                        ...(hoveredRow === record.id ? styles.rowHover : {}),
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.primaryText}>
                          {formatRecordDateTime(record.occurred_at || record.created_at)}
                        </div>
                        <div style={styles.secondaryText}>Data da ocorrência</div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.primaryText}>
                          {record.app_number || "Sem APP"}
                        </div>
                        <div style={styles.secondaryText}>
                          Chamado: {record.call_number || "-"} • GRP:{" "}
                          {record.grp_number || "-"}
                        </div>
                        <div style={styles.secondaryText}>
                          Tombamento: {record.tombamento_manual || "-"}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={typeStyle}>
                          {getRecordTypeLabel(record)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span style={statusStyle}>
                          {getRecordStatusLabel(record)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.primaryText}>
                          {getRecordEquipmentLabel(record)}
                        </div>
                        <div style={styles.secondaryText}>Equipamento vinculado</div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.primaryText}>
                          {getRecordLocationLabel(record)}
                        </div>
                        <div style={styles.secondaryText}>Local / setor relacionado</div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.primaryText}>
                          {getRecordResponsibleLabel(record)}
                        </div>
                        <div style={styles.secondaryText}>Responsável pela operação</div>
                      </td>

                      <td style={styles.td}>
                        {record.maintenance_confirmation ? (
                          <span style={styles.maintenanceConfirmed}>
                            <ShieldCheck size={14} />
                            Confirmada
                          </span>
                        ) : (
                          <span style={styles.maintenancePending}>
                            <BadgeInfo size={14} />
                            Pendente
                          </span>
                        )}
                      </td>

                      <td
                        style={styles.td}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={styles.actions}>
                          <Link
                            to={`/registros/${record.id}`}
                            style={styles.actionButton}
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            to={`/registros/${record.id}/editar`}
                            style={styles.actionButton}
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </Link>

                          {!record.maintenance_confirmation && (
                            <button
                              type="button"
                              style={styles.successActionButton}
                              onClick={() => handleConfirmMaintenance(record)}
                              disabled={busyId === record.id}
                              title="Confirmar manutenção"
                            >
                              <Wrench size={14} />
                            </button>
                          )}

                          {record.status !== "cancelled" && (
                            <button
                              type="button"
                              style={styles.dangerActionButton}
                              onClick={() => handleCancelRecord(record)}
                              disabled={busyId === record.id}
                              title="Cancelar registro"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
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

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
    minWidth: "1380px",
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
    maxWidth: "290px",
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

  maintenanceConfirmed: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 10px",
    borderRadius: "999px",
    color: "#86efac",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.18)",
    fontSize: "12px",
    fontWeight: 700,
  },

  maintenancePending: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 10px",
    borderRadius: "999px",
    color: "#fde68a",
    background: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.18)",
    fontSize: "12px",
    fontWeight: 700,
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

  successActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    border: "1px solid rgba(34,197,94,0.18)",
    borderRadius: "12px",
    background: "rgba(34,197,94,0.12)",
    cursor: "pointer",
    transition: "0.2s",
    color: "#bbf7d0",
  },

  dangerActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    border: "1px solid rgba(239,68,68,0.18)",
    borderRadius: "12px",
    background: "rgba(239,68,68,0.12)",
    cursor: "pointer",
    transition: "0.2s",
    color: "#fecaca",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },
};