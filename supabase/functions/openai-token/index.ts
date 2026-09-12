// Supabase Edge Function: openai-token
// Validates Supabase auth session and returns user info for OpenAI Realtime API

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function base64UrlDecode(input: string): Uint8Array {
  // Replace URL-safe chars
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // Pad to length multiple of 4
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad !== 0) throw new Error("Invalid base64url string");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const bearerPrefix = "Bearer ";
    if (!authHeader.startsWith(bearerPrefix)) {
      return new Response(JSON.stringify({ error: "Missing Authorization Bearer token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const jwt = authHeader.slice(bearerPrefix.length);
    // Decode JWT payload without verification (Supabase verifies before invoking the function)
    const payloadB64 = jwt.split(".")[1];
    if (!payloadB64) {
      return new Response(JSON.stringify({ error: "Malformed JWT" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let payloadJson = "";
    try {
      const payloadBytes = base64UrlDecode(payloadB64);
      payloadJson = new TextDecoder().decode(payloadBytes);
    } catch (err) {
      console.error("Failed to decode JWT payload:", err);
      return new Response(JSON.stringify({ error: "Could not decode JWT payload" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload = JSON.parse(payloadJson);
    const userId = payload.sub as string | undefined;
    const userEmail = payload.email as string | undefined;
    const userMetadata = (payload.user_metadata || {}) as Record<string, unknown>;

    if (!userId) {
      return new Response(JSON.stringify({ error: "JWT missing sub (user id)" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const nameFromEmail = userEmail?.split("@")[0] || "User";
    const user = {
      id: userId,
      name: (userMetadata as any)?.full_name || nameFromEmail,
      email: userEmail || undefined,
      avatar_url: (userMetadata as any)?.avatar_url,
    };

    return new Response(JSON.stringify({
      success: true,
      user: user,
      message: "User authenticated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});