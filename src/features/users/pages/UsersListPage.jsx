import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  RefreshCcw,
  Shield,
  Users,
  BadgeCheck,
  UserRound,
  Filter,
  LockKeyhole,
  ToggleLeft,
  XCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getUsers, toggleUserActive } from "../services/usersService";

function getRoleLabel(role) {
  if (role === "admin") return "Administrador";
  if (role === "gestor") return "Gestor";
  if (role === "tecnico") return "Técnico";
  return role || "-";
}

function getRoleStyle(role) {
  switch (role) {
    case "admin":
      return { ...styles.badgeBase, ...styles.badgeDangerSoft };
    case "gestor":
      return { ...styles.badgeBase, ...styles.badgeInfo };
    case "tecnico":
    default:
      return { ...styles.badgeBase, ...styles.badgeSuccessSoft };
  }
}

function getStatusStyle(active) {
  return active
    ? { ...styles.badgeBase, ...styles.badgeSuccess }
    : { ...styles.badgeBase, ...styles.badgeDanger };
}

function getInitials(name) {
  if (!name) return "U";

  const parts = String(name).trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default function UsersListPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return (users || []).filter((user) => {
      const matchesSearch =
        !search.trim() ||
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.registration?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = !role || user.role === role;

      const matchesStatus =
        !status ||
        (status === "ativo" && user.active === true) ||
        (status === "inativo" && user.active === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  const stats = useMemo(() => {
    const total = users.length;
    const ativos = users.filter((item) => item.active).length;
    const inativos = users.filter((item) => !item.active).length;
    const admins = users.filter((item) => item.role === "admin").length;
    const gestores = users.filter((item) => item.role === "gestor").length;
    const tecnicos = users.filter((item) => item.role === "tecnico").length;

    return { total, ativos, inativos, admins, gestores, tecnicos };
  }, [users]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (role) count += 1;
    if (status) count += 1;
    return count;
  }, [search, role, status]);

  async function handleToggleActive(user) {
    const actionLabel = user.active ? "desativar" : "ativar";
    const confirmed = window.confirm(
      `Deseja realmente ${actionLabel} o usuário "${user.full_name}"?`
    );

    if (!confirmed) return;

    try {
      await toggleUserActive(user.id, !user.active);
      await loadUsers();
    } catch (err) {
      alert(err.message || "Não foi possível atualizar o status do usuário.");
    }
  }

  function clearFilters() {
    setSearch("");
    setRole("");
    setStatus("");
  }

  return (
    <div style={styles.page}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Shield size={15} />
            <span>Controle administrativo</span>
          </div>

          <h1 style={styles.heroTitle}>Usuários do sistema</h1>

          <p style={styles.heroText}>
            Gerencie acessos administrativos e operacionais em um painel premium,
            com visual consistente, filtros rápidos, status de acesso e ações
            diretas para consulta e manutenção dos perfis cadastrados.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Base total</span>
              <strong style={styles.heroMetricValue}>{stats.total} usuários</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Ativos</span>
              <strong style={styles.heroMetricValue}>{stats.ativos}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Administradores</span>
              <strong style={styles.heroMetricValue}>{stats.admins}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/usuarios/novo" style={styles.primaryButton}>
            <Plus size={18} />
            <span>Novo usuário</span>
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
              <Users size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Usuários cadastrados no sistema</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Ativos</p>
              <h3 style={styles.statValue}>{stats.ativos}</h3>
            </div>
            <div style={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Com acesso liberado ao sistema</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Gestores</p>
              <h3 style={styles.statValue}>{stats.gestores}</h3>
            </div>
            <div style={styles.statIcon}>
              <Sparkles size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Perfis gerenciais cadastrados</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Técnicos</p>
              <h3 style={styles.statValue}>{stats.tecnicos}</h3>
            </div>
            <div style={styles.statIcon}>
              <LockKeyhole size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Perfis operacionais ativos ou não</p>
        </article>
      </section>

      <section style={styles.panelCard}>
        <div style={styles.panelHeader}>
          <div>
            <p style={styles.sectionKicker}>Painel operacional</p>
            <h3 style={styles.panelTitle}>Lista de usuários</h3>
            <p style={styles.panelText}>
              Filtre por nome, e-mail, matrícula, perfil ou situação para localizar
              rapidamente qualquer acesso cadastrado na plataforma.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button type="button" onClick={loadUsers} style={styles.secondaryButton}>
              <RefreshCcw size={16} />
              <span>Atualizar</span>
            </button>

            <Link to="/usuarios/novo" style={styles.primaryLinkButton}>
              <Plus size={18} />
              <span>Novo usuário</span>
            </Link>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou matrícula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.field}
          >
            <option value="">Todos os perfis</option>
            <option value="admin">Administrador</option>
            <option value="gestor">Gestor</option>
            <option value="tecnico">Técnico</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.field}
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>

          <button type="button" onClick={clearFilters} style={styles.secondaryButton}>
            <Filter size={16} />
            <span>Limpar filtros</span>
          </button>
        </div>

        <div style={styles.filtersSummary}>
          <div style={styles.filtersGroup}>
            <span style={styles.infoChip}>
              <Users size={14} />
              <span>{filteredUsers.length} resultado(s)</span>
            </span>

            <span style={styles.subtleChip}>
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filtro(s) ativo(s)`
                : "Sem filtros aplicados"}
            </span>
          </div>
        </div>

        {error ? (
          <div style={styles.errorBox}>
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div style={styles.emptyPanel}>Carregando usuários...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.emptyPanel}>Nenhum usuário encontrado.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Usuário</th>
                  <th style={styles.th}>Perfil</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Segurança</th>
                  <th style={styles.th}>Cadastro</th>
                  <th style={{ ...styles.th, width: 220 }}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/usuarios/${user.id}`)}
                    onMouseEnter={() => setHoveredRow(user.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      ...styles.row,
                      ...(hoveredRow === user.id ? styles.rowHover : {}),
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatarWrap}>
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              style={styles.avatarImage}
                            />
                          ) : (
                            <span style={styles.avatarFallback}>
                              {getInitials(user.full_name)}
                            </span>
                          )}
                        </div>

                        <div>
                          <div style={styles.primaryText}>
                            {user.full_name || "Usuário sem nome"}
                          </div>
                          <div style={styles.secondaryText}>
                            {user.email || "Sem e-mail"}
                          </div>
                          <div style={styles.tertiaryText}>
                            {user.registration || "Sem matrícula"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={getRoleStyle(user.role)}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={getStatusStyle(user.active)}>
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {user.must_change_password
                          ? "Troca obrigatória"
                          : "Padrão"}
                      </div>
                      <div style={styles.secondaryText}>Primeiro acesso</div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.primaryText}>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("pt-BR")
                          : "-"}
                      </div>
                      <div style={styles.secondaryText}>Data de criação</div>
                    </td>

                    <td style={styles.td}>
                      <div
                        style={styles.actions}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          to={`/usuarios/${user.id}`}
                          title="Visualizar"
                          style={styles.actionButton}
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          to={`/usuarios/${user.id}/editar`}
                          title="Editar"
                          style={styles.actionButton}
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          title={user.active ? "Desativar" : "Ativar"}
                          onClick={() => handleToggleActive(user)}
                          style={styles.actionButton}
                        >
                          {user.active ? <XCircle size={16} /> : <BadgeCheck size={16} />}
                        </button>
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
    lineHeight: 1.04,
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

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },

  statCard: {
    borderRadius: "24px",
    padding: "18px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
    color: "#ffffff",
  },

  statCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
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

  statTitle: {
    margin: "0 0 6px",
    fontSize: "0.82rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },

  statValue: {
    margin: 0,
    fontSize: "1.55rem",
    color: "#ffffff",
    letterSpacing: "-0.03em",
  },

  statDetail: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.92rem",
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
    maxWidth: "760px",
  },

  headerActions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "46px",
    padding: "0 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  primaryLinkButton: {
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
    minWidth: "190px",
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
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.18)",
    color: "#fecaca",
    fontWeight: 700,
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

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: "260px",
  },

  avatarWrap: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
    boxShadow: "0 12px 24px rgba(37,99,235,0.18)",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  avatarFallback: {
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.92rem",
    letterSpacing: "0.03em",
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

  tertiaryText: {
    fontSize: "0.76rem",
    color: "#64748b",
    marginTop: "3px",
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

  badgeDangerSoft: {
    background: "rgba(244,63,94,0.12)",
    color: "#fda4af",
    borderColor: "rgba(244,63,94,0.18)",
  },

  badgeSuccessSoft: {
    background: "rgba(16,185,129,0.12)",
    color: "#6ee7b7",
    borderColor: "rgba(16,185,129,0.18)",
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