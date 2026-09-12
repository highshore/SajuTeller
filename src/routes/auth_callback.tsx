import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function GlobalLoading() {
  return <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>Processing sign-in…</div>;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasExchangedRef = useRef(false);

  useEffect(() => {
    if (hasExchangedRef.current) return;
    hasExchangedRef.current = true;
    const run = async () => {
      try {
        // If a session already exists, skip handling
        const existing = await supabase.auth.getSession();
        if (existing.data.session) {
          navigate("/profile");
          return;
        }

        const url = new URL(window.location.href);
        const hasCode = !!url.searchParams.get("code");
        const fragment = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
        const hashParams = new URLSearchParams(fragment);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          // Clean up URL fragment after storing session
          window.history.replaceState({}, document.title, url.origin + url.pathname + url.search);
        } else {
          throw new Error("No code or tokens present in callback URL");
        }

        const returnUrl = localStorage.getItem("returnUrl");
        if (returnUrl) {
          localStorage.removeItem("returnUrl");
          navigate(returnUrl);
        } else {
          navigate("/profile");
        }
      } catch (e) {
        console.error("Auth callback handling error:", e, "href:", window.location.href);
        await supabase.auth.signOut().catch(() => {});
        navigate("/sign_in");
      }
    };

    run();
  }, [navigate]);

  return <GlobalLoading />;
}



