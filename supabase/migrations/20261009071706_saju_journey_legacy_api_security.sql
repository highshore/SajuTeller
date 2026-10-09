-- Keep the legacy view subject to caller RLS; internal event-trigger code is not a public RPC.
alter view public.locations set (security_invoker = true);
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
