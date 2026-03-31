import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import logo from "../../../assets/branding/logo-rr.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from || "/dashboard";

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!isMounted) return;
        setSession(session || null);
      } catch (_err) {
        if (!isMounted) return;
        setSession(null);
      } finally {
        if (!isMounted) return;
        setCheckingSession(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session || null);
      setCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div style={styles.page}>
        <div style={styles.bgGlowOne} />
        <div style={styles.bgGlowTwo} />

        <div style={styles.loadingCard}>
          <ShieldCheck size={22} style={styles.loadingIcon} />
          <div>
            <h2 style={styles.loadingTitle}>Verificando acesso</h2>
            <p style={styles.loadingText}>
              Validando sua sessão para entrar no sistema...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      <div style={styles.wrapper}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBadge}>
            <ShieldCheck size={16} />
            <span>Acesso seguro</span>
          </div>

          <h1 style={styles.heroTitle}>Bem-vindo de volta</h1>
          <p style={styles.heroText}>
            Entre na plataforma para gerenciar rotas, equipes, registros e
            operações com uma experiência moderna, segura e profissional.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Painel centralizado e intuitivo</span>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Controle operacional em tempo real</span>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Autenticação segura com Supabase</span>
            </div>
          </div>

          <div style={styles.sideInfoCard}>
            <div style={styles.sideInfoBadge}>
              <Sparkles size={14} />
              <span>Fluxo corporativo</span>
            </div>

            <p style={styles.sideInfoText}>
              Esqueceu a senha? Recupere o acesso. Foi convidado por um administrador?
              Ative sua conta com segurança no primeiro acesso.
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logoWrapper}>
  <img src={logo} alt="RR Equipamentos" style={styles.logoImage} />
</div>
            <div>
              <p style={styles.kicker}>Sistema Web de Rotas</p>
              <h2 style={styles.title}>Entrar na conta</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>

              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="voce@empresa.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <div style={styles.passwordHeader}>
                <label htmlFor="password" style={styles.label}>
                  Senha
                </label>

                <Link to="/esqueci-senha" style={styles.forgotLink}>
                  Esqueci minha senha
                </Link>
              </div>

              <div style={styles.inputWrapper}>
                <LockKeyhole size={18} style={styles.inputIcon} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Digite sua senha"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={styles.inputWithAction}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((old) => !old)}
                  style={styles.passwordToggle}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? (
              <div style={styles.errorBox}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={loading ? styles.buttonDisabled : styles.button}
            >
              <span>{loading ? "Entrando..." : "Entrar"}</span>
              {!loading ? <ArrowRight size={18} /> : null}
            </button>

            <div style={styles.footerLinks}>
              <span style={styles.footerText}>Primeiro acesso?</span>
              <Link to="/ativar-acesso" style={styles.activateLink}>
                Ativar acesso
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at top left, #1e293b 0%, #0f172a 42%, #020617 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  bgGlowOne: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.14)",
    filter: "blur(70px)",
    top: "-80px",
    left: "-80px",
    pointerEvents: "none",
  },

  bgGlowTwo: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.14)",
    filter: "blur(70px)",
    bottom: "-100px",
    right: "-60px",
    pointerEvents: "none",
  },

  wrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1120px",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    background: "rgba(15, 23, 42, 0.55)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    borderRadius: "28px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 25px 80px rgba(0, 0, 0, 0.45)",
    overflow: "hidden",
  },

  leftPanel: {
    padding: "56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderRight: "1px solid rgba(148, 163, 184, 0.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
  },

  brandBadge: {
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.55)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "24px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "48px",
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    color: "#f8fafc",
    fontWeight: 800,
    maxWidth: "520px",
  },

  heroText: {
    marginTop: "18px",
    marginBottom: "32px",
    color: "#94a3b8",
    fontSize: "17px",
    lineHeight: 1.7,
    maxWidth: "520px",
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#e2e8f0",
    fontSize: "15px",
  },

  featureDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #22c55e, #3b82f6)",
    boxShadow: "0 0 18px rgba(34, 197, 94, 0.45)",
    flexShrink: 0,
  },

  sideInfoCard: {
    marginTop: "34px",
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(15, 23, 42, 0.42)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  },

  sideInfoBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#dcfce7",
    border: "1px solid rgba(34, 197, 94, 0.14)",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "12px",
  },

  sideInfoText: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.7,
    fontSize: "14px",
  },

  card: {
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background:
      "linear-gradient(180deg, rgba(2,6,23,0.78) 0%, rgba(15,23,42,0.68) 100%)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
  },

  logoWrapper: {
  width: "200px",
  height: "200px",
  borderRadius: "24px",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

logoImage: {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.5))",
},

  kicker: {
    margin: 0,
    color: "#22c55e",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  title: {
    margin: "6px 0 0 0",
    color: "#f8fafc",
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  label: {
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 600,
  },

  passwordHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  forgotLink: {
    color: "#22c55e",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#64748b",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: "54px",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#f8fafc",
    padding: "0 16px 0 44px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  inputWithAction: {
    width: "100%",
    height: "54px",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#f8fafc",
    padding: "0 48px 0 44px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  passwordToggle: {
    position: "absolute",
    right: "10px",
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "10px",
    background: "transparent",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  errorBox: {
    borderRadius: "14px",
    padding: "14px 16px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.22)",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: 1.5,
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },

  button: {
    marginTop: "8px",
    height: "56px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 45%, #3b82f6 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(34, 197, 94, 0.28)",
  },

  buttonDisabled: {
    marginTop: "8px",
    height: "56px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #475569 0%, #334155 100%)",
    color: "#cbd5e1",
    fontSize: "15px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "not-allowed",
    boxShadow: "none",
    opacity: 0.9,
  },

  footerLinks: {
    marginTop: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  footerText: {
    color: "#94a3b8",
    fontSize: "13px",
  },

  activateLink: {
    color: "#60a5fa",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
  },

  loadingCard: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "520px",
    borderRadius: "28px",
    padding: "28px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 24px 55px rgba(15,23,42,0.28)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  loadingIcon: {
    color: "#22c55e",
    flexShrink: 0,
  },

  loadingTitle: {
    margin: "0 0 6px",
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#ffffff",
  },

  loadingText: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },
};