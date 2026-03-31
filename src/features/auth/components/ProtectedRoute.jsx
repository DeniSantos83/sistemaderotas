import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldCheck, AlertTriangle, LockKeyhole } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchProfile(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, active, must_change_password")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    }

    async function bootstrap() {
      try {
        setLoading(true);
        setProfileError("");

        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!mounted) return;

        setSession(initialSession ?? null);

        if (!initialSession?.user) {
          setProfile(null);
          return;
        }

        const profileData = await fetchProfile(initialSession.user.id);
        if (!mounted) return;

        setProfile(profileData ?? null);
      } catch (error) {
        console.error("Erro ao verificar acesso:", error);
        if (!mounted) return;

        setProfile(null);
        setProfileError(
          error?.message || "Não foi possível validar o perfil do usuário."
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession ?? null);

      // evita deadlock do callback de auth
      setTimeout(async () => {
        if (!mounted) return;

        try {
          setProfileError("");

          if (!currentSession?.user) {
            setProfile(null);
            setLoading(false);
            return;
          }

          const profileData = await fetchProfile(currentSession.user.id);
          if (!mounted) return;

          setProfile(profileData ?? null);
        } catch (error) {
          console.error("Erro ao atualizar contexto de acesso:", error);
          if (!mounted) return;

          setProfile(null);
          setProfileError(
            error?.message || "Não foi possível validar o perfil do usuário."
          );
        } finally {
          if (!mounted) return;
          setLoading(false);
        }
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <style>
          {`
            @keyframes protectedRouteSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>

        <div style={styles.glowA} />
        <div style={styles.glowB} />

        <section style={styles.card}>
          <div style={styles.iconWrap}>
            <ShieldCheck size={22} />
          </div>

          <div style={styles.content}>
            <h1 style={styles.title}>Verificando acesso</h1>
            <p style={styles.text}>
              Validando sua sessão e permissões para entrar no sistema...
            </p>
          </div>

          <Loader2 size={22} style={styles.spinner} />
        </section>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (profileError) {
    return (
      <div style={styles.page}>
        <div style={styles.glowA} />
        <div style={styles.glowB} />

        <section style={styles.errorCard}>
          <div style={styles.errorIconWrap}>
            <AlertTriangle size={22} />
          </div>

          <div style={styles.content}>
            <h1 style={styles.errorTitle}>Falha ao validar seu perfil</h1>
            <p style={styles.errorText}>{profileError}</p>
          </div>
        </section>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.page}>
        <div style={styles.glowA} />
        <div style={styles.glowB} />

        <section style={styles.errorCard}>
          <div style={styles.errorIconWrap}>
            <AlertTriangle size={22} />
          </div>

          <div style={styles.content}>
            <h1 style={styles.errorTitle}>Perfil não encontrado</h1>
            <p style={styles.errorText}>
              Seu usuário autenticado não possui cadastro em <strong>profiles</strong>.
              Solicite ao administrador a criação ou regularização do seu acesso.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (profile.active === false) {
    return (
      <div style={styles.page}>
        <div style={styles.glowA} />
        <div style={styles.glowB} />

        <section style={styles.blockedCard}>
          <div style={styles.blockedIconWrap}>
            <LockKeyhole size={22} />
          </div>

          <div style={styles.content}>
            <h1 style={styles.blockedTitle}>Acesso desativado</h1>
            <p style={styles.blockedText}>
              Sua conta está inativa no momento. Fale com o administrador do sistema
              para reativar seu acesso.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (profile.must_change_password && location.pathname !== "/ativar-acesso") {
    return <Navigate to="/ativar-acesso" replace />;
  }

  return <>{children}</>;
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
  },

  glowA: {
    position: "absolute",
    top: "-120px",
    right: "-80px",
    width: "280px",
    height: "280px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.10)",
    filter: "blur(40px)",
    pointerEvents: "none",
  },

  glowB: {
    position: "absolute",
    bottom: "-140px",
    left: "-60px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
    filter: "blur(42px)",
    pointerEvents: "none",
  },

  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "560px",
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

  errorCard: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "620px",
    borderRadius: "28px",
    padding: "28px",
    background: "linear-gradient(135deg, #3f1720 0%, #2f1018 100%)",
    border: "1px solid rgba(244,63,94,0.20)",
    boxShadow: "0 24px 55px rgba(15,23,42,0.28)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  blockedCard: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "620px",
    borderRadius: "28px",
    padding: "28px",
    background: "linear-gradient(135deg, #3a2a12 0%, #24170b 100%)",
    border: "1px solid rgba(245,158,11,0.22)",
    boxShadow: "0 24px 55px rgba(15,23,42,0.28)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  iconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.18)",
    color: "#22c55e",
    flexShrink: 0,
  },

  errorIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(244,63,94,0.12)",
    border: "1px solid rgba(244,63,94,0.20)",
    color: "#fb7185",
    flexShrink: 0,
  },

  blockedIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.22)",
    color: "#fbbf24",
    flexShrink: 0,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    margin: "0 0 6px",
    fontSize: "1.2rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#ffffff",
  },

  text: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },

  errorTitle: {
    margin: "0 0 6px",
    fontSize: "1.2rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#ffffff",
  },

  errorText: {
    margin: 0,
    color: "#fecdd3",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },

  blockedTitle: {
    margin: "0 0 6px",
    fontSize: "1.2rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#ffffff",
  },

  blockedText: {
    margin: 0,
    color: "#fde68a",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },

  spinner: {
    color: "#cbd5e1",
    flexShrink: 0,
    animation: "protectedRouteSpin 1s linear infinite",
  },
};