// Supabase Edge Function: realtime-proxy
// WebSocket proxy for OpenAI Realtime API

Deno.serve(async (req: Request) => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 400 });
  }

  try {
    // 클라이언트 WebSocket 연결 수락
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

    clientSocket.onopen = () => {
      // 연결 성공을 클라이언트에게 알림
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({
          type: "connection.established",
          message: "Connected to proxy (testing mode)"
        }));
      }
    };

    clientSocket.onmessage = (event) => {
      // 테스트를 위해 받은 메시지를 그대로 다시 전송
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({
          type: "echo",
          original: JSON.parse(event.data),
          message: "Echo from proxy"
        }));
      }
    };

    clientSocket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
    };

    clientSocket.onclose = () => {
      console.log("Client disconnected");
    };

    return response;

  } catch (error) {
    console.error("WebSocket setup error:", error);
    return new Response("WebSocket setup failed", { status: 500 });
  }
});