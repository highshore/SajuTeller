import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AdminRoute({ children }: { children: ReactElement }) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setAllowed] = useState(false);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      let isAdmin = false;
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        isAdmin = Boolean(prof?.is_admin);
      }
      setAllowed(!!user && isAdmin);
      setLoading(false);
      const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
        const u = s?.user;
        let ok = false;
        if (u) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", u.id)
            .single();
          ok = Boolean(prof?.is_admin);
        }
        setAllowed(!!u && ok);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);
  if (loading) return null;
  if (!isAllowed) return <Navigate to="/" />;
  return children;
}


