import { createClient } from "@supabase/supabase-js";

const configuredUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const configuredAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(configuredUrl && configuredAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    "K-Saju: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. The public UI will still render, but data/auth features will be unavailable until the deployment environment is configured."
  );
}

// Keep the app renderable even when a preview/production deployment is missing env vars.
// Supabase-backed screens already handle request failures and can show their fallback UI.
const supabaseUrl = configuredUrl || "https://missing-config.supabase.co";
const supabaseAnonKey = configuredAnonKey || "missing-config";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
  },
});

export default supabase;
