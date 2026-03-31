import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function AtivarAcessoPage() {
  const navigate = useNavigate();

  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSessionAndProfile() {
      try {
        setLoadingSession(true);
        setError("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!active) return;

        if (!session?.user) {
          setSession(null);
          setProfile(null);
          return;
        }

        setSession(session);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email, role, active, must_change_password")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (!active) return;
        setProfile(profileData || null);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Não foi possível validar seu acesso.");
      } finally {
        if (!active) return;
        setLoadingSession(false);
      }
    }

    loadSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!active) return;

      setSession(currentSession || null);

      if (!currentSession?.user) {
        setProfile(null);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, active, must_change_password")
        .eq("id", currentSession.user.id)
        .single();

      if (!active) return;
      setProfile(profileData || null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const passwordChecks = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      matches: password.length > 0 && password === confirmPassword,
    }),
    [password, confirmPassword]
  );

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordChecks.minLength) score += 1;
    if (passwordChecks.hasUpper) score += 1;
    if (passwordChecks.hasLower) score += 1;
    if (passwordChecks.hasNumber) score += 1;
    return score;
  }, [passwordChecks]);

  const strength = useMemo(() => {
    if (passwordScore <= 1) {
      return { label: "Fraca", color: "#ef4444", width: "25%" };
    }
    if (passwordScore === 2) {
      return { label: "Regular", color: "#f59e0b", width: "50%" };
    }
    if (passwordScore === 3) {
      return { label: "Boa", color: "#3b82f6", width: "75%" };
    }
    return { label: "Forte", color: "#22c55e", width: "100%" };
  }, [passwordScore]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!session?.user) {
      setError("Sua sessão de ativação não foi encontrada. Abra novamente o link enviado por email.");
      return;
    }

    if (!profile?.active) {
      setError("Seu acesso está inativo. Fale com o administrador do sistema.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação de senha não confere.");
      return;
    }

    try {
      setSubmitting(true);

      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password,
      });

      if (updatePasswordError) {
        throw updatePasswordError;
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          must_change_password: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      setSuccess("Acesso ativado com sucesso. Redirecionando...");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Não foi possível ativar seu acesso.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingSession) {
    return (
      <div style={styles.page}>
        <div style={styles.glowTop} />
        <div style={styles.glowBottom} />

        <div style={styles.loadingCard}>
          <div style={styles.loadingIconWrap}>
            <ShieldCheck size={24} />
          </div>

          <div>
            <h1 style={styles.loadingTitle}>Validando acesso</h1>
            <p style={styles.loadingText}>
              Estamos verificando sua sessão de ativação para liberar o primeiro acesso.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div style={styles.page}>
        <div style={styles.glowTop} />
        <div style={styles.glowBottom} />

        <div style={styles.wrapper}>
          <div style={styles.brandPanel}>
            <span style={styles.brandBadge}>Sistema de Rotas</span>
            <h1 style={styles.brandTitle}>Ativação de acesso não encontrada</h1>
            <p style={styles.brandText}>
              O link pode ter expirado ou a sessão de ativação não está mais disponível.
              Solicite um novo convite ou volte para a tela de login.
            </p>

            <div style={styles.brandList}>
              <div style={styles.brandListItem}>
                <CheckCircle2 size={16} />
                <span>Convite controlado por administrador</span>
              </div>
              <div style={styles.brandListItem}>
                <CheckCircle2 size={16} />
                <span>Ativação segura no primeiro acesso</span>
              </div>
              <div style={styles.brandListItem}>
                <CheckCircle2 size={16} />
                <span>Controle corporativo por perfil</span>
              </div>
            </div>
          </div>

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.iconWrap}>
                <AlertCircle size={22} />
              </div>

              <div>
                <p style={styles.kicker}>Sessão inválida</p>
                <h2 style={styles.title}>Não foi possível ativar</h2>
                <p style={styles.subtitle}>
                  Abra novamente o link do email ou solicite um novo acesso.
                </p>
              </div>
            </div>

            <div style={styles.actionStack}>
              <Link to="/login" style={styles.secondaryLinkButton}>
                <ArrowLeft size={16} />
                <span>Voltar para o login</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.glowTop} />
      <div style={styles.glowBottom} />

      <div style={styles.wrapper}>
        <div style={styles.brandPanel}>
          <span style={styles.brandBadge}>Primeiro acesso</span>

          <h1 style={styles.brandTitle}>
            Ative sua conta com uma senha segura
          </h1>

          <p style={styles.brandText}>
            Finalize a ativação do seu acesso ao painel administrativo e entre
            no sistema com segurança e controle corporativo.
          </p>

          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              {(profile?.full_name || session.user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div style={styles.userMeta}>
              <strong style={styles.userName}>
                {profile?.full_name || "Usuário"}
              </strong>
              <span style={styles.userEmail}>
                {profile?.email || session.user.email}
              </span>
              <span style={styles.userRole}>
                Perfil: {profile?.role || "operador"}
              </span>
            </div>
          </div>

          <div style={styles.brandList}>
            <div style={styles.brandListItem}>
              <CheckCircle2 size={16} />
              <span>Fluxo seguro de ativação</span>
            </div>
            <div style={styles.brandListItem}>
              <CheckCircle2 size={16} />
              <span>Senha definida pelo próprio usuário</span>
            </div>
            <div style={styles.brandListItem}>
              <CheckCircle2 size={16} />
              <span>Acesso controlado por perfil</span>
            </div>
          </div>
        </div>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrap}>
              <KeyRound size={22} />
            </div>

            <div>
              <div style={styles.kickerRow}>
                <p style={styles.kicker}>Ativar acesso</p>
                <span style={styles.sparkBadge}>
                  <Sparkles size={12} />
                  <span>Premium</span>
                </span>
              </div>

              <h2 style={styles.title}>Defina sua nova senha</h2>
              <p style={styles.subtitle}>
                Crie uma senha forte para concluir o primeiro acesso ao sistema.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nova senha</label>

              <div style={styles.inputWrap}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((old) => !old)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmar senha</label>

              <div style={styles.inputWrap}>
                <ShieldCheck size={18} style={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((old) => !old)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={styles.strengthBox}>
              <div style={styles.strengthHeader}>
                <span style={styles.strengthLabel}>Força da senha</span>
                <span style={{ ...styles.strengthValue, color: strength.color }}>
                  {strength.label}
                </span>
              </div>

              <div style={styles.strengthTrack}>
                <div
                  style={{
                    ...styles.strengthFill,
                    width: strength.width,
                    background: strength.color,
                  }}
                />
              </div>

              <div style={styles.checkList}>
                <div style={styles.checkItem}>
                  <CheckCircle2
                    size={15}
                    color={passwordChecks.minLength ? "#22c55e" : "#64748b"}
                  />
                  <span>Mínimo de 8 caracteres</span>
                </div>
                <div style={styles.checkItem}>
                  <CheckCircle2
                    size={15}
                    color={passwordChecks.hasUpper ? "#22c55e" : "#64748b"}
                  />
                  <span>Ao menos uma letra maiúscula</span>
                </div>
                <div style={styles.checkItem}>
                  <CheckCircle2
                    size={15}
                    color={passwordChecks.hasLower ? "#22c55e" : "#64748b"}
                  />
                  <span>Ao menos uma letra minúscula</span>
                </div>
                <div style={styles.checkItem}>
                  <CheckCircle2
                    size={15}
                    color={passwordChecks.hasNumber ? "#22c55e" : "#64748b"}
                  />
                  <span>Ao menos um número</span>
                </div>
                <div style={styles.checkItem}>
                  <CheckCircle2
                    size={15}
                    color={passwordChecks.matches ? "#22c55e" : "#64748b"}
                  />
                  <span>As senhas devem coincidir</span>
                </div>
              </div>
            </div>

            {error ? (
              <div style={styles.errorBox}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div style={styles.successBox}>
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}

            <div style={styles.footerActions}>
              <Link to="/login" style={styles.backButton}>
                <ArrowLeft size={16} />
                <span>Voltar ao login</span>
              </Link>

              <button
                type="submit"
                disabled={submitting}
                style={submitting ? styles.submitButtonDisabled : styles.submitButton}
              >
                <ShieldCheck size={16} />
                <span>{submitting ? "Ativando..." : "Ativar acesso"}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 20px",
    background: "linear-gradient(135deg, #020617 0%, #0f172a 42%, #111827 100%)",
  },

  glowTop: {
    position: "absolute",
    top: "-120px",
    right: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.16)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },

  glowBottom: {
    position: "absolute",
    bottom: "-140px",
    left: "-80px",
    width: "340px",
    height: "340px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.12)",
    filter: "blur(70px)",
    pointerEvents: "none",
  },

  wrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1180px",
    display: "grid",
    gridTemplateColumns: "minmax(320px, 1fr) minmax(420px, 520px)",
    gap: "24px",
    alignItems: "stretch",
  },

  brandPanel: {
    borderRadius: "32px",
    padding: "34px",
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.82) 60%, rgba(37,99,235,0.14) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 30px 60px rgba(2,6,23,0.38)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  brandBadge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    height: "32px",
    padding: "0 14px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.14)",
    border: "1px solid rgba(147,197,253,0.20)",
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "18px",
  },

  brandTitle: {
    margin: "0 0 14px",
    fontSize: "2.3rem",
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    color: "#f8fafc",
    fontWeight: 800,
  },

  brandText: {
    margin: "0 0 24px",
    color: "#94a3b8",
    fontSize: "1rem",
    lineHeight: 1.75,
    maxWidth: "560px",
  },

  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "24px",
  },

  userAvatar: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
    color: "#ffffff",
    fontSize: "1.15rem",
    fontWeight: 800,
    boxShadow: "0 14px 26px rgba(37,99,235,0.24)",
    flexShrink: 0,
  },

  userMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },

  userName: {
    color: "#ffffff",
    fontSize: "1rem",
  },

  userEmail: {
    color: "#cbd5e1",
    fontSize: "0.95rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  userRole: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    textTransform: "capitalize",
  },

  brandList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  brandListItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#dbeafe",
    fontSize: "0.96rem",
  },

  card: {
    borderRadius: "32px",
    padding: "30px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border: "1px solid rgba(226,232,240,0.94)",
    boxShadow: "0 26px 60px rgba(15,23,42,0.14)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "22px",
  },

  iconWrap: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "rgba(37,99,235,0.10)",
    color: "#2563eb",
    border: "1px solid rgba(37,99,235,0.14)",
    flexShrink: 0,
  },

  kickerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "6px",
  },

  kicker: {
    margin: 0,
    color: "#16a34a",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  sparkBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    height: "24px",
    padding: "0 10px",
    borderRadius: "999px",
    background: "rgba(34,197,94,0.10)",
    color: "#15803d",
    border: "1px solid rgba(34,197,94,0.16)",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  title: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: "1.7rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.96rem",
    lineHeight: 1.7,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    color: "#0f172a",
    fontSize: "0.95rem",
    fontWeight: 700,
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "56px",
    borderRadius: "18px",
    border: "1px solid #dbe4f0",
    background: "#ffffff",
    padding: "0 14px",
    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
  },

  inputIcon: {
    color: "#64748b",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#0f172a",
    fontSize: "0.96rem",
  },

  eyeButton: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  strengthBox: {
    borderRadius: "22px",
    padding: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  strengthHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },

  strengthLabel: {
    fontSize: "0.92rem",
    fontWeight: 700,
    color: "#334155",
  },

  strengthValue: {
    fontSize: "0.92rem",
    fontWeight: 800,
  },

  strengthTrack: {
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
    marginBottom: "14px",
  },

  strengthFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "all 0.25s ease",
  },

  checkList: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
  },

  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#475569",
    fontSize: "0.92rem",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    fontSize: "0.93rem",
    fontWeight: 600,
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "0.93rem",
    fontWeight: 600,
  },

  footerActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "4px",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    height: "48px",
    padding: "0 16px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
  },

  secondaryLinkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    height: "50px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
  },

  actionStack: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "18px",
  },

  submitButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    height: "48px",
    padding: "0 18px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 18px 30px rgba(37,99,235,0.22)",
  },

  submitButtonDisabled: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    height: "48px",
    padding: "0 18px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 800,
    cursor: "not-allowed",
    opacity: 0.9,
  },

  loadingCard: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "560px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "28px",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border: "1px solid rgba(226,232,240,0.94)",
    boxShadow: "0 24px 60px rgba(15,23,42,0.14)",
  },

  loadingIconWrap: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "rgba(37,99,235,0.10)",
    color: "#2563eb",
    border: "1px solid rgba(37,99,235,0.14)",
    flexShrink: 0,
  },

  loadingTitle: {
    margin: "0 0 6px",
    color: "#0f172a",
    fontSize: "1.25rem",
    fontWeight: 800,
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.6,
  },
};