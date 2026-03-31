import { useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";

const pageTitles = [
  {
    match: (pathname) => pathname === "/" || pathname === "/dashboard",
    title: "Dashboard",
    subtitle: "Visão geral da operação",
  },
  {
    match: (pathname) => pathname.startsWith("/colaboradores"),
    title: "Colaboradores",
    subtitle: "Gerencie os responsáveis e servidores",
  },
  {
    match: (pathname) => pathname.startsWith("/locais"),
    title: "Locais",
    subtitle: "Cadastre e acompanhe os locais atendidos",
  },
  {
    match: (pathname) => pathname.startsWith("/setores"),
    title: "Setores",
    subtitle: "Organize os setores por local",
  },
  {
    match: (pathname) => pathname.startsWith("/equipamentos"),
    title: "Equipamentos",
    subtitle: "Controle os itens movimentados",
  },
  {
    match: (pathname) => pathname.startsWith("/registros"),
    title: "Registros",
    subtitle: "Acompanhe entregas, recepções e alterações",
  },
  {
    match: (pathname) => pathname.startsWith("/rotas"),
    title: "Rotas",
    subtitle: "Monitore os itinerários operacionais",
  },
  {
    match: (pathname) => pathname.startsWith("/notificacoes"),
    title: "Notificações",
    subtitle: "Avisos e alertas do sistema",
  },
  {
    match: (pathname) => pathname.startsWith("/configuracoes"),
    title: "Configurações",
    subtitle: "Preferências e identidade do sistema",
  },
];

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const current =
    pageTitles.find((item) => item.match(location.pathname)) || {
      title: "Sistema de Rotas",
      subtitle: "Painel administrativo",
    };

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erro ao sair:", error);
      navigate("/login", { replace: true });
    }
  }

  return (
    <header style={styles.container}>
      <div style={styles.backgroundGlowLeft} />
      <div style={styles.backgroundGlowRight} />

      <div style={styles.leftBlock}>
        <div style={styles.kickerRow}>
          <span style={styles.kickerDot} />
          <p style={styles.kicker}>Bem-vindo ao painel</p>
        </div>

        <div style={styles.titleRow}>
          <h2 style={styles.title}>{current.title}</h2>
          <span style={styles.badge}>
            <Sparkles size={12} />
            <span>Premium UI</span>
          </span>
        </div>

        <p style={styles.subtitle}>{current.subtitle}</p>
      </div>

      <div style={styles.actions}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input
            style={styles.input}
            type="text"
            placeholder="Buscar no sistema..."
          />
        </div>

        <button type="button" style={styles.iconButton} title="Notificações">
          <Bell size={18} />
          <span style={styles.ping} />
        </button>

        <button type="button" style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}

const styles = {
  container: {
    position: "sticky",
    top: 0,
    zIndex: 40,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    padding: "22px 24px",
    overflow: "hidden",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    borderTop: "1px solid rgba(59,130,246,0.10)",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.94) 0%, rgba(30,41,59,0.88) 58%, rgba(37,99,235,0.16) 100%)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 14px 40px rgba(2,6,23,0.35)",
  },

  backgroundGlowLeft: {
    position: "absolute",
    left: "-80px",
    top: "-60px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.14)",
    filter: "blur(50px)",
    pointerEvents: "none",
  },

  backgroundGlowRight: {
    position: "absolute",
    right: "-60px",
    bottom: "-80px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.10)",
    filter: "blur(55px)",
    pointerEvents: "none",
  },

  leftBlock: {
    position: "relative",
    zIndex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  kickerRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  kickerDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
    boxShadow: "0 0 0 4px rgba(34,197,94,0.10)",
    flexShrink: 0,
  },

  kicker: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: "800",
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    color: "#f8fafc",
    textShadow: "0 2px 14px rgba(0,0,0,0.22)",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    height: "28px",
    padding: "0 10px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(59,130,246,0.18) 100%)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#dbeafe",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  subtitle: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.5,
    color: "#94a3b8",
    maxWidth: "680px",
  },

  actions: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "260px",
    height: "46px",
    padding: "0 14px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,41,59,0.72) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 24px rgba(2,6,23,0.18)",
  },

  searchIcon: {
    color: "#94a3b8",
    flexShrink: 0,
  },

  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e2e8f0",
    fontSize: "13px",
  },

  iconButton: {
    position: "relative",
    height: "46px",
    width: "46px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,41,59,0.72) 100%)",
    color: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 24px rgba(2,6,23,0.18)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  ping: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "9px",
    height: "9px",
    borderRadius: "999px",
    background: "#ef4444",
    boxShadow: "0 0 0 4px rgba(239,68,68,0.15)",
  },

  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    height: "46px",
    padding: "0 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,41,59,0.72) 100%)",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 24px rgba(2,6,23,0.18)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};