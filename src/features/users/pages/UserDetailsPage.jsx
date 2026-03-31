import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Eye,
  IdCard,
  LockKeyhole,
  Mail,
  Pencil,
  Shield,
  Sparkles,
  UserRound,
  AlertTriangle,
  CalendarDays,
  Image as ImageIcon,
  ToggleLeft,
} from "lucide-react";
import { getUserById } from "../services/usersService";

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return "-";
  }
}

function getRoleLabel(role) {
  if (role === "admin") return "Administrador";
  if (role === "gestor") return "Gestor";
  if (role === "tecnico") return "Técnico";
  return role || "-";
}

export default function UserDetailsPage() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUser() {
    try {
      setLoading(true);
      setError("");

      const data = await getUserById(id);
      setUser(data || null);
    } catch (err) {
      setError(err.message || "Não foi possível carregar os dados do usuário.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, [id]);

  const summary = useMemo(() => {
    return {
      roleLabel: getRoleLabel(user?.role),
      statusLabel: user?.active ? "Ativo" : "Inativo",
      passwordPolicy: user?.must_change_password
        ? "Troca obrigatória no primeiro acesso"
        : "Sem obrigatoriedade de troca inicial",
    };
  }, [user]);

  if (loading) {
    return (
      <div style={styles.page}>
        <section style={styles.panelCard}>
          <div style={styles.emptyPanel}>Carregando usuário...</div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <section style={styles.panelCard}>
          <div style={styles.errorBox}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>

          <div style={styles.formActions}>
            <Link to="/usuarios" style={styles.ghostButton}>
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.page}>
        <section style={styles.panelCard}>
          <div style={styles.emptyPanel}>Usuário não encontrado.</div>

          <div style={styles.formActions}>
            <Link to="/usuarios" style={styles.ghostButton}>
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </Link>
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
            <Eye size={15} />
            <span>Visualização detalhada</span>
          </div>

          <h1 style={styles.heroTitle}>Detalhes do usuário</h1>

          <p style={styles.heroText}>
            Consulte as informações cadastrais, o perfil de acesso e o status
            operacional deste usuário em um painel alinhado ao padrão visual
            premium do sistema.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Perfil</span>
              <strong style={styles.heroMetricValue}>{summary.roleLabel}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Situação</span>
              <strong style={styles.heroMetricValue}>{summary.statusLabel}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Segurança</span>
              <strong style={styles.heroMetricValue}>
                {user.must_change_password ? "Reforçada" : "Padrão"}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/usuarios" style={styles.ghostButton}>
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </Link>

          <Link to={`/usuarios/${user.id}/editar`} style={styles.primaryButton}>
            <Pencil size={18} />
            <span>Editar usuário</span>
          </Link>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Perfil de acesso</p>
              <h3 style={styles.statValue}>{summary.roleLabel}</h3>
            </div>
            <div style={styles.statIcon}>
              <Shield size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Permissão principal do usuário</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Situação</p>
              <h3 style={styles.statValue}>{summary.statusLabel}</h3>
            </div>
            <div style={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Controle atual de acesso ao sistema</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Primeiro acesso</p>
              <h3 style={styles.statValue}>
                {user.must_change_password ? "Obrigatório" : "Livre"}
              </h3>
            </div>
            <div style={styles.statIcon}>
              <LockKeyhole size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Política de senha inicial</p>
        </article>
      </section>

      <section style={styles.panelCard}>
        <div style={styles.panelHeader}>
          <div>
            <p style={styles.sectionKicker}>Painel cadastral</p>
            <h3 style={styles.panelTitle}>Resumo do cadastro</h3>
            <p style={styles.panelText}>
              Visualize os dados principais do usuário, a situação do acesso e a
              configuração de segurança aplicada ao perfil.
            </p>
          </div>
        </div>

        <div style={styles.detailsLayout}>
          <div style={styles.mainColumn}>
            <div style={styles.infoGrid}>
              <article style={styles.infoCard}>
                <div style={styles.infoCardHeader}>
                  <div style={styles.infoCardIcon}>
                    <UserRound size={18} />
                  </div>
                  <div>
                    <h4 style={styles.infoCardTitle}>Informações pessoais</h4>
                    <p style={styles.infoCardText}>
                      Dados principais do cadastro administrativo.
                    </p>
                  </div>
                </div>

                <div style={styles.infoList}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Nome completo</span>
                    <strong style={styles.infoValue}>{user.full_name || "-"}</strong>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>E-mail</span>
                    <strong style={styles.infoValue}>{user.email || "-"}</strong>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Matrícula</span>
                    <strong style={styles.infoValue}>
                      {user.registration || "Não informada"}
                    </strong>
                  </div>
                </div>
              </article>

              <article style={styles.infoCard}>
                <div style={styles.infoCardHeader}>
                  <div style={styles.infoCardIcon}>
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h4 style={styles.infoCardTitle}>Acesso e perfil</h4>
                    <p style={styles.infoCardText}>
                      Definições administrativas do nível de acesso.
                    </p>
                  </div>
                </div>

                <div style={styles.infoList}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Perfil</span>
                    <div style={styles.inlineValueRow}>
                      <span style={styles.infoChip}>
                        <Shield size={14} />
                        <span>{summary.roleLabel}</span>
                      </span>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Status</span>
                    <div style={styles.inlineValueRow}>
                      <span
                        style={
                          user.active
                            ? { ...styles.badgeBase, ...styles.badgeSuccess }
                            : { ...styles.badgeBase, ...styles.badgeDanger }
                        }
                      >
                        {summary.statusLabel}
                      </span>
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Troca de senha inicial</span>
                    <strong style={styles.infoValue}>{summary.passwordPolicy}</strong>
                  </div>
                </div>
              </article>

              <article style={styles.infoCard}>
                <div style={styles.infoCardHeader}>
                  <div style={styles.infoCardIcon}>
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h4 style={styles.infoCardTitle}>Rastreabilidade</h4>
                    <p style={styles.infoCardText}>
                      Datas de criação e atualização do cadastro.
                    </p>
                  </div>
                </div>

                <div style={styles.infoList}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Criado em</span>
                    <strong style={styles.infoValue}>
                      {formatDateTime(user.created_at)}
                    </strong>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Atualizado em</span>
                    <strong style={styles.infoValue}>
                      {formatDateTime(user.updated_at)}
                    </strong>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>ID do usuário</span>
                    <strong style={styles.infoValueMono}>{user.id}</strong>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <aside style={styles.sideColumn}>
            <article style={styles.previewPanel}>
              <div style={styles.previewHeader}>
                <div style={styles.previewAvatar}>
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar do usuário"
                      style={styles.previewAvatarImage}
                    />
                  ) : (
                    <span>
                      {(user.full_name || "U").trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h4 style={styles.previewName}>{user.full_name || "Usuário"}</h4>
                  <p style={styles.previewEmail}>{user.email || "-"}</p>
                </div>
              </div>

              <div style={styles.previewChips}>
                <span style={styles.infoChip}>
                  <Shield size={14} />
                  <span>{summary.roleLabel}</span>
                </span>

                <span
                  style={
                    user.active
                      ? { ...styles.badgeBase, ...styles.badgeSuccess }
                      : { ...styles.badgeBase, ...styles.badgeDanger }
                  }
                >
                  {summary.statusLabel}
                </span>

                <span style={styles.subtleChip}>
                  {user.registration || "Sem matrícula"}
                </span>
              </div>
            </article>

            <article style={styles.infoCard}>
              <div style={styles.infoCardHeader}>
                <div style={styles.infoCardIcon}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 style={styles.infoCardTitle}>Painel rápido</h4>
                  <p style={styles.infoCardText}>
                    Resumo visual das informações essenciais do cadastro.
                  </p>
                </div>
              </div>

              <div style={styles.quickInfoList}>
                <div style={styles.quickInfoItem}>
                  <Mail size={16} color="#94a3b8" />
                  <span style={styles.quickInfoText}>{user.email || "-"}</span>
                </div>

                <div style={styles.quickInfoItem}>
                  <IdCard size={16} color="#94a3b8" />
                  <span style={styles.quickInfoText}>
                    {user.registration || "Sem matrícula"}
                  </span>
                </div>

                <div style={styles.quickInfoItem}>
                  <ToggleLeft size={16} color="#94a3b8" />
                  <span style={styles.quickInfoText}>{summary.statusLabel}</span>
                </div>

                <div style={styles.quickInfoItem}>
                  <ImageIcon size={16} color="#94a3b8" />
                  <span style={styles.quickInfoText}>
                    {user.avatar_url ? "Avatar configurado" : "Sem avatar"}
                  </span>
                </div>
              </div>
            </article>
          </aside>
        </div>

        <div style={styles.formActions}>
          <Link to="/usuarios" style={styles.ghostButton}>
            <ArrowLeft size={18} />
            <span>Voltar para lista</span>
          </Link>

          <Link to={`/usuarios/${user.id}/editar`} style={styles.primaryButton}>
            <Pencil size={18} />
            <span>Editar usuário</span>
          </Link>
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
    maxWidth: "820px",
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
    fontSize: "52px",
    lineHeight: 1.05,
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
    gap: "20px",
    marginBottom: "22px",
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

  detailsLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 0.9fr)",
    gap: "22px",
    alignItems: "start",
  },

  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "18px",
  },

  infoCard: {
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(15,23,42,0.38)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  infoCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  infoCardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(59,130,246,0.18)",
    color: "#60a5fa",
    flexShrink: 0,
  },

  infoCardTitle: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 800,
  },

  infoCardText: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.5,
    fontSize: "0.9rem",
  },

  infoList: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },

  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    paddingBottom: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: "0.82rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
  },

  infoValue: {
    color: "#ffffff",
    fontSize: "0.98rem",
    fontWeight: 700,
    lineHeight: 1.45,
  },

  infoValueMono: {
    color: "#cbd5e1",
    fontSize: "0.88rem",
    fontWeight: 700,
    lineHeight: 1.45,
    wordBreak: "break-all",
    fontFamily: "monospace",
  },

  inlineValueRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
  },

  previewPanel: {
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(9,15,28,0.42)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  previewAvatar: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "1.15rem",
    boxShadow: "0 14px 28px rgba(37,99,235,0.22)",
    flexShrink: 0,
  },

  previewAvatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  previewName: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 800,
  },

  previewEmail: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.9rem",
  },

  previewChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  quickInfoList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  quickInfoItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  quickInfoText: {
    color: "#e2e8f0",
    fontSize: "0.9rem",
    fontWeight: 600,
    lineHeight: 1.4,
    wordBreak: "break-word",
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

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "22px",
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

  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 700,
    cursor: "pointer",
  },
};