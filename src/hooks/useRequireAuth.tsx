import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function useRequireAuth(redirectPath: string) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/connexion", search: { mode: "login", redirect: redirectPath } });
    }
  }, [user, loading, navigate, redirectPath]);
  return { user, loading };
}
