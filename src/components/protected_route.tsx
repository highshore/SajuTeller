import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setAuthed] = useState(false);
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setAuthed(!!data.session);
      setLoading(false);
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setAuthed(!!session);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);
  if (loading) return null;
  if (!isAuthed) return <Navigate to="/sign-in" />;
  return children;
}