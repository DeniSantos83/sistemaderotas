import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          if (!mounted) return;
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email, role, active, must_change_password")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profileData) {
          console.error("Perfil não encontrado para o usuário logado.");
          await supabase.auth.signOut();

          if (!mounted) return;
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (!profileData.active) {
          console.error("Usuário inativo.");
          await supabase.auth.signOut();

          if (!mounted) return;
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (!mounted) return;
        setSession(session);
        setProfile(profileData);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao verificar acesso:", error);
        await supabase.auth.signOut();

        if (!mounted) return;
        setSession(null);
        setProfile(null);
        setLoading(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Verificando acesso...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}