import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck, CheckCircle } from "lucide-react";
import { updatePassword } from "../services/authService";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);

    try {
      await updatePassword(password);
      setSuccess(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || "Não foi possível redefinir a senha.");
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
            <span>Redefinição segura</span>
          </div>

          <h1 style={styles.heroTitle}>Nova senha</h1>
          <p style={styles.heroText}>
            Crie uma nova senha para sua conta e continue usando o sistema com
            segurança.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Proteção de acesso reforçada</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Atualização imediata da senha</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureDot} />
              <span>Segurança integrada com Supabase</span>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logoCircle}>
              <KeyRound size={22} />
            </div>
            <div>
              <p style={styles.kicker}>Segurança</p>
              <h2 style={styles.title}>Criar nova senha</h2>
            </div>
          </div>

          {success ? (
            <div style={styles.successState}>
              <CheckCircle size={48} />
              <p>Senha redefinida com sucesso!</p>
              <span>Redirecionando para o login...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Nova senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Confirmar senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  required
                  style={styles.input}
                />
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <button
                type="submit"
                disabled={submitting}
                style={styles.button}
              >
                {submitting ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}
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
  },

  wrapper: {
    width: "100%",
    maxWidth: "1120px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderRadius: "28px",
    overflow: "hidden",
    backdropFilter: "blur(14px)",
  },

  leftPanel: {
    padding: "56px",
    color: "#fff",
  },

  brandBadge: {
    marginBottom: "20px",
  },

  heroTitle: {
    fontSize: "40px",
    fontWeight: "800",
  },

  heroText: {
    marginTop: "10px",
    color: "#94a3b8",
  },

  featureList: {
    marginTop: "30px",
  },

  featureItem: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },

  featureDot: {
    width: "8px",
    height: "8px",
    background: "#22c55e",
    borderRadius: "50%",
  },

  card: {
    padding: "48px",
    background: "#020617",
  },

  cardHeader: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },

  logoCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  kicker: {
    color: "#22c55e",
  },

  title: {
    color: "#fff",
    fontSize: "26px",
    fontWeight: "800",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    color: "#cbd5e1",
    marginBottom: "6px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#fff",
  },

  errorBox: {
    color: "#ef4444",
    fontSize: "14px",
  },

  button: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#22c55e",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  successState: {
    textAlign: "center",
    color: "#22c55e",
  },
};