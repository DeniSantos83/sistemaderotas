import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  LockKeyhole,
  Mail,
  Save,
  Shield,
  Sparkles,
  UserPlus,
  UserRound,
  IdCard,
  Image as ImageIcon,
  ToggleLeft,
  AlertTriangle,
} from "lucide-react";

export default function UserCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    registration: "",
    role: "tecnico",
    active: true,
    must_change_password: true,
    avatar_url: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  const summary = useMemo(() => {
    return {
      roleLabel:
        form.role === "admin"
          ? "Administrador"
          : form.role === "gestor"
          ? "Gestor"
          : "Técnico",
      accessLabel: form.active ? "Acesso liberado" : "Acesso inativo",
      firstAccess: form.must_change_password
        ? "Troca de senha obrigatória"
        : "Troca de senha não obrigatória",
    };
  }, [form]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.full_name.trim()) {
      setError("Informe o nome completo do usuário.");
      return;
    }

    if (!form.email.trim()) {
      setError("Informe o e-mail do usuário.");
      return;
    }

    try {
      setSubmitting(true);

      // TODO:
      // integrar aqui com sua Edge Function / serverless
      // para criar usuário no Auth + enviar convite + salvar profile

      console.log("Payload novo usuário:", form);

      setSuccessMessage(
        "Formulário validado com sucesso. Agora conecte esta tela à função de convite por e-mail."
      );
    } catch (err) {
      setError(err.message || "Não foi possível preparar o convite do usuário.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <UserPlus size={15} />
            <span>Gestão de acessos</span>
          </div>

          <h1 style={styles.heroTitle}>Novo usuário do sistema</h1>

          <p style={styles.heroText}>
            Cadastre novos acessos administrativos e operacionais com um fluxo
            visual consistente com o restante do sistema. Defina perfil,
            matrícula, status e regras de segurança antes de enviar o convite.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Perfil selecionado</span>
              <strong style={styles.heroMetricValue}>{summary.roleLabel}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status</span>
              <strong style={styles.heroMetricValue}>{summary.accessLabel}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Primeiro acesso</span>
              <strong style={styles.heroMetricValue}>{summary.firstAccess}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <Link to="/usuarios" style={styles.ghostButton}>
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </Link>

          <button
            type="submit"
            form="user-create-form"
            style={styles.primaryButton}
            disabled={submitting}
          >
            <Save size={18} />
            <span>{submitting ? "Enviando..." : "Salvar e convidar"}</span>
          </button>
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
          <p style={styles.statDetail}>Defina o nível de permissão do usuário</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Situação</p>
              <h3 style={styles.statValue}>
                {form.active ? "Ativo" : "Inativo"}
              </h3>
            </div>
            <div style={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Controle imediato do acesso ao sistema</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Segurança</p>
              <h3 style={styles.statValue}>
                {form.must_change_password ? "Reforçada" : "Padrão"}
              </h3>
            </div>
            <div style={styles.statIcon}>
              <LockKeyhole size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Primeiro acesso com política configurável</p>
        </article>
      </section>

      <section style={styles.panelCard}>
        <div style={styles.panelHeader}>
          <div>
            <p style={styles.sectionKicker}>Cadastro administrativo</p>
            <h3 style={styles.panelTitle}>Dados do usuário</h3>
            <p style={styles.panelText}>
              Preencha os dados principais do acesso. O envio do convite por
              e-mail será ligado à função segura do backend na próxima etapa.
            </p>
          </div>
        </div>

        {error ? (
          <div style={styles.errorBox}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div style={styles.successBox}>
            <BadgeCheck size={18} />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <form id="user-create-form" onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nome completo</label>
              <div style={styles.inputWrap}>
                <UserRound size={16} color="#94a3b8" />
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Ex.: Valdenir da Silva Santos"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>E-mail</label>
              <div style={styles.inputWrap}>
                <Mail size={16} color="#94a3b8" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="usuario@empresa.com"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Matrícula</label>
              <div style={styles.inputWrap}>
                <IdCard size={16} color="#94a3b8" />
                <input
                  type="text"
                  name="registration"
                  value={form.registration}
                  onChange={handleChange}
                  placeholder="Ex.: 12345"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Perfil de acesso</label>
              <div style={styles.selectWrap}>
                <Briefcase size={16} color="#94a3b8" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="admin">Administrador</option>
                  <option value="gestor">Gestor</option>
                  <option value="tecnico">Técnico</option>
                </select>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Avatar URL</label>
              <div style={styles.inputWrap}>
                <ImageIcon size={16} color="#94a3b8" />
                <input
                  type="text"
                  name="avatar_url"
                  value={form.avatar_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Situação do acesso</label>
              <div style={styles.toggleCard}>
                <div style={styles.toggleCardIcon}>
                  <ToggleLeft size={18} />
                </div>
                <div style={styles.toggleCardText}>
                  <strong style={styles.toggleTitle}>Usuário ativo</strong>
                  <span style={styles.toggleDescription}>
                    Quando inativo, o usuário não consegue entrar no sistema.
                  </span>
                </div>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                    style={styles.switchInput}
                  />
                  <span
                    style={{
                      ...styles.switchSlider,
                      ...(form.active ? styles.switchSliderChecked : {}),
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div style={styles.securityPanel}>
            <div style={styles.securityHeader}>
              <div style={styles.securityIcon}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={styles.securityTitle}>Política de primeiro acesso</h4>
                <p style={styles.securityText}>
                  Configure o comportamento inicial de segurança do usuário ao
                  aceitar o convite.
                </p>
              </div>
            </div>

            <div style={styles.checkboxRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="must_change_password"
                  checked={form.must_change_password}
                  onChange={handleChange}
                />
                <span>Obrigar troca de senha no primeiro acesso</span>
              </label>
            </div>
          </div>

          <div style={styles.previewPanel}>
            <div style={styles.previewHeader}>
              <div style={styles.previewAvatar}>
                {form.avatar_url ? (
                  <img
                    src={form.avatar_url}
                    alt="Avatar"
                    style={styles.previewAvatarImage}
                  />
                ) : (
                  <span>
                    {(form.full_name || "U").trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h4 style={styles.previewName}>
                  {form.full_name || "Novo usuário"}
                </h4>
                <p style={styles.previewEmail}>
                  {form.email || "email@empresa.com"}
                </p>
              </div>
            </div>

            <div style={styles.previewChips}>
              <span style={styles.infoChip}>
                <Shield size={14} />
                <span>{summary.roleLabel}</span>
              </span>

              <span
                style={
                  form.active
                    ? { ...styles.badgeBase, ...styles.badgeSuccess }
                    : { ...styles.badgeBase, ...styles.badgeDanger }
                }
              >
                {form.active ? "Ativo" : "Inativo"}
              </span>

              <span style={styles.subtleChip}>
                {form.registration || "Sem matrícula informada"}
              </span>
            </div>
          </div>

          <div style={styles.formActions}>
            <Link to="/usuarios" style={styles.ghostButton}>
              <ArrowLeft size={18} />
              <span>Cancelar</span>
            </Link>

            <button type="submit" style={styles.primaryButton} disabled={submitting}>
              <Save size={18} />
              <span>{submitting ? "Enviando..." : "Salvar e convidar"}</span>
            </button>
          </div>
        </form>
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

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.18)",
    color: "#bbf7d0",
    fontWeight: 700,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  label: {
    fontSize: "0.88rem",
    color: "#cbd5e1",
    fontWeight: 700,
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minHeight: "52px",
    borderRadius: "16px",
    padding: "0 16px",
    background: "#0b1326",
    border: "1px solid rgba(59,130,246,0.18)",
  },

  selectWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minHeight: "52px",
    borderRadius: "16px",
    padding: "0 16px",
    background: "#0b1326",
    border: "1px solid rgba(59,130,246,0.18)",
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#ffffff",
    fontSize: "0.95rem",
  },

  select: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#ffffff",
    fontSize: "0.95rem",
  },

  toggleCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minHeight: "96px",
    borderRadius: "18px",
    padding: "18px",
    background: "rgba(15,23,42,0.38)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  toggleCardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
    flexShrink: 0,
  },

  toggleCardText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },

  toggleTitle: {
    color: "#ffffff",
    fontSize: "0.95rem",
  },

  toggleDescription: {
    color: "#94a3b8",
    fontSize: "0.84rem",
    lineHeight: 1.45,
  },

  switch: {
    position: "relative",
    display: "inline-flex",
    width: "52px",
    height: "30px",
    flexShrink: 0,
  },

  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
    position: "absolute",
  },

  switchSlider: {
    position: "absolute",
    inset: 0,
    borderRadius: "999px",
    background: "rgba(148,163,184,0.35)",
    transition: "0.2s ease",
    cursor: "pointer",
  },

  switchSliderChecked: {
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
  },

  securityPanel: {
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(15,23,42,0.38)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  securityHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  securityIcon: {
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

  securityTitle: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: "1rem",
  },

  securityText: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.5,
    fontSize: "0.9rem",
  },

  checkboxRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },

  checkboxLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    color: "#e2e8f0",
    fontWeight: 600,
    fontSize: "0.92rem",
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

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "4px",
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