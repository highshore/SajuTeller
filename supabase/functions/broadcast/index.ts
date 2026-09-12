// Supabase Edge Function: broadcast
// Admin-only endpoint to broadcast a message to all Supabase users via Stream Chat.

import { createClient } from "npm:@supabase/supabase-js";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function base64UrlDecode(input: string): Uint8Array {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad !== 0) throw new Error("Invalid base64url string");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getServerJwt(secret: string) {
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const token = await create(
    { alg: "HS256", typ: "JWT" },
    { user_id: "server-side", iat: getNumericDate(0) },
    hmacKey
  );
  return { token, hmacKey };
}

async function upsertUsers(streamApiKey: string, serverJwt: string, users: Array<{ id: string; name?: string; image?: string; email?: string }>) {
  if (users.length === 0) return;
  await fetch(`https://chat.stream-io-api.com/users?api_key=${encodeURIComponent(streamApiKey)}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serverJwt}`,
        "stream-auth-type": "jwt",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users }),
    }
  );
}

async function ensureDmChannelAndSend(streamApiKey: string, serverJwt: string, adminId: string, userId: string, text: string) {
  // Create or get a distinct DM channel
  const createResp = await fetch(`https://chat.stream-io-api.com/channels?api_key=${encodeURIComponent(streamApiKey)}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serverJwt}`,
        "stream-auth-type": "jwt",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "messaging", members: [adminId, userId], distinct: true }),
    }
  );
  if (!createResp.ok) {
    const t = await createResp.text();
    console.error("Create channel failed", createResp.status, t);
    return false;
  }
  const { channel } = await createResp.json();
  const channelId = channel?.id as string | undefined;
  if (!channelId) return false;

  const sendResp = await fetch(`https://chat.stream-io-api.com/channels/messaging/${encodeURIComponent(channelId)}/message?api_key=${encodeURIComponent(streamApiKey)}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serverJwt}`,
        "stream-auth-type": "jwt",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: { text } }),
    }
  );
  if (!sendResp.ok) {
    const t = await sendResp.text();
    console.error("Send message failed", sendResp.status, t);
    return false;
  }
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  try {
    const streamApiKey = Deno.env.get("STREAM_API_KEY");
    const streamApiSecret = Deno.env.get("STREAM_API_SECRET");
    const sbUrl = Deno.env.get("SB_URL");
    const sbServiceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!streamApiKey || !streamApiSecret) {
      return new Response(JSON.stringify({ error: "Missing Stream secrets" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (!sbUrl || !sbServiceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase admin secrets" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const bearerPrefix = "Bearer ";
    if (!authHeader.startsWith(bearerPrefix)) {
      return new Response(JSON.stringify({ error: "Missing Authorization Bearer token" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    const jwt = authHeader.slice(bearerPrefix.length);
    const payloadB64 = jwt.split(".")[1];
    if (!payloadB64) {
      return new Response(JSON.stringify({ error: "Malformed JWT" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson);
    const callerId = payload.sub as string | undefined;
    if (!callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const body = await req.json().catch(() => ({}));
    const text = (body?.text as string | undefined)?.trim();
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing 'text'" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Verify admin via profiles table using service role
    const sb = createClient(sbUrl, sbServiceRoleKey);
    const { data: prof } = await sb.from('profiles').select('is_admin').eq('id', callerId).single();
    if (!prof?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Prepare Stream server auth
    const { token: serverJwt } = await getServerJwt(streamApiSecret);

    // List all Supabase users (paged)
    const pageSize = 100;
    let page = 1;
    let sent = 0;
    let totalProcessed = 0;
    // Upsert in batches for Stream users
    while (true) {
      const { data, error } = await sb.auth.admin.listUsers({ page, perPage: pageSize });
      if (error) {
        console.error("listUsers error", error.message);
        break;
      }
      const users = data?.users ?? [];
      if (users.length === 0) break;

      // Upsert users to Stream (batch)
      const batch = users.map((u) => ({
        id: u.id,
        name: (u.user_metadata as any)?.full_name || (u.email?.split("@")[0] ?? "User"),
        image: (u.user_metadata as any)?.avatar_url,
        email: u.email ?? undefined,
      }));
      try { await upsertUsers(streamApiKey, serverJwt, batch); } catch (e) { console.error("upsertUsers failed", e); }

      for (const u of users) {
        totalProcessed++;
        if (u.id === callerId) continue;
        const ok = await ensureDmChannelAndSend(streamApiKey, serverJwt, callerId, u.id, text);
        if (ok) sent++;
      }

      page += 1;
      // Prevent runaway long executions
      if (page > 50) break; // cap ~5k users per call
    }

    return new Response(JSON.stringify({ ok: true, sent, totalProcessed }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    console.error("broadcast error", e?.message || e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});


