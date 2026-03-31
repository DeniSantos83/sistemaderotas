import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-background-glow auth-glow-1" />
      <div className="auth-background-glow auth-glow-2" />

      <div className="auth-wrapper">
        <Outlet />
      </div>
    </div>
  );
}