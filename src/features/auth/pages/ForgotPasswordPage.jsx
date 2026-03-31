import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck, Send } from "lucide-react";
import { sendPasswordReset } from "../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordReset(email);
      setMessage("Enviamos o link de recuperação para o seu email.");
    } catch (err) {
      setError(err.message || "Não foi possível enviar o email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      <div style={styles.wrapper}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBadge}>
            <ShieldCheck size={16} />
            <span>Recuperação segura</span>
          </div>

          <h1 style={styles.heroTitle}>Recupere seu acesso</h1>
          <p style={styles.heroText}>
            Informe seu email corporativo para receber o link de redefinição de
            senha e voltar ao sistema com segurança.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Fluxo seguro de recuperação de senha</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Redefinição rápida e prática</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Proteção de acesso com Supabase Auth</span>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logoCircle}>
              <Mail size={22} />
            </div>
            <div>
              <p style={styles.kicker}>Recuperação de acesso</p>
              <h2 style={styles.title}>Esqueci minha senha</h2>
            </div>
          </div>

          <p style={styles.description}>
            Digite o email vinculado à sua conta. Enviaremos um link para você
            criar uma nova senha.
          </p>

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {message ? <div style={styles.successBox}>{message}</div> : null}
            {error ? <div style={styles.errorBox}>{error}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              style={styles.button}
            >
              <span>{submitting ? "Enviando..." : "Enviar link"}</span>
              {!submitting ? <Send size={18} /> : null}
            </button>

            <Link to="/login" style={styles.backLink}>
              <ArrowLeft size={16} />
              <span>Voltar para login</span>
            </Link>
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
    marginBottom: "20px",
  },

  logoCircle: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 45%, #3b82f6 100%)",
    color: "#ffffff",
    boxShadow: "0 14px 34px rgba(34, 197, 94, 0.28)",
    flexShrink: 0,
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

  description: {
    margin: "0 0 28px 0",
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: 1.7,
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

  successBox: {
    borderRadius: "14px",
    padding: "14px 16px",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.24)",
    color: "#bbf7d0",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  errorBox: {
    borderRadius: "14px",
    padding: "14px 16px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.22)",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  button: {
    marginTop: "4px",
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

  backLink: {
    marginTop: "6px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
};