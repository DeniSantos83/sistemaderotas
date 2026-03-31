import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Building2,
  Package,
  FileText,
  Route,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react";
import logo from "../../assets/branding/miniatura.png";

const menu = [
  {
    label: "Principal",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Cadastros",
    items: [
     
      { to: "/colaboradores", label: "Colaboradores", icon: Users },
      { to: "/locais", label: "Locais", icon: MapPin },
      { to: "/setores", label: "Setores", icon: Building2 },
      { to: "/equipamentos", label: "Equipamentos", icon: Package },
       { to: "/usuarios", label: "Usuários", icon: Users }
    ],
  },
  {
    label: "Operação",
    items: [
      { to: "/registros", label: "Registros", icon: FileText },
      { to: "/rotas", label: "Rotas", icon: Route },
      { to: "/notificacoes", label: "Notificações", icon: Bell },
    ],
  },
  {
    label: "Sistema",
    items: [{ to: "/configuracoes", label: "Configurações", icon: Settings }],
  },
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* LOGO / BRAND */}
      <div style={styles.brand}>
        <div style={styles.logoWrapper}>
          <img src={logo} alt="Sistema de Rotas" style={styles.logo} />
        </div>

        <div>
          <h1 style={styles.brandTitle}>Sistema de Rotas</h1>
          <p style={styles.brandSubtitle}>Painel administrativo</p>
        </div>
      </div>

      {/* MENU */}
      <div style={styles.menuContainer}>
        {menu.map((group) => (
          <div key={group.label}>
            <div style={styles.sectionLabel}>{group.label}</div>

            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.to} to={item.to} style={styles.link}>
                  {({ isActive }) => (
                    <div
                      style={{
                        ...styles.linkInner,
                        ...(isActive ? styles.linkActive : {}),
                      }}
                    >
                      <div style={styles.linkLeft}>
                        <span
                          style={{
                            ...styles.icon,
                            ...(isActive ? styles.iconActive : {}),
                          }}
                        >
                          <Icon size={18} />
                        </span>

                        <span style={styles.linkText}>{item.label}</span>
                      </div>

                      <ChevronRight
                        size={16}
                        style={{
                          ...styles.chevron,
                          ...(isActive ? styles.chevronActive : {}),
                        }}
                      />
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={styles.footerCard}>
          <span style={styles.statusDot} />
          <div>
            <strong style={{ color: "#f8fafc" }}>Sistema online</strong>
            <p style={styles.footerText}>Tudo funcionando perfeitamente</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
const styles = {
  sidebar: {
    width: "280px",
    height: "100vh",
    background: "#020617",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "32px",
  },

  logoWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(59,130,246,0.15))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  brandTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "16px",
    fontWeight: 800,
  },

  brandSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
  },

  menuContainer: {
    flex: 1,
    overflowY: "auto",
  },

  sectionLabel: {
    marginTop: "18px",
    marginBottom: "8px",
    fontSize: "11px",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  link: {
    textDecoration: "none",
  },

  linkInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: "12px",
    color: "#cbd5e1",
    marginBottom: "6px",
    transition: "all 0.2s ease",
  },

  linkActive: {
    background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(59,130,246,0.15))",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  linkLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  icon: {
    color: "#64748b",
  },

  iconActive: {
    color: "#22c55e",
  },

  linkText: {
    fontSize: "14px",
    fontWeight: 600,
  },

  chevron: {
    color: "#475569",
  },

  chevronActive: {
    color: "#22c55e",
  },

  footer: {
    marginTop: "20px",
  },

  footerCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "14px",
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  footerText: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
  },

  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#22c55e",
    boxShadow: "0 0 12px rgba(34,197,94,0.6)",
  },
};