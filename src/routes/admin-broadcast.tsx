import { useState } from "react";
import { styled } from "styled-components";
import { useI18n } from "../i18n/i18n";
import { supabase } from "../supabase";

const Wrapper = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

const Button = styled.button`
  appearance: none;
  border: 1px solid #111827;
  background: #111827;
  color: #ffffff;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
`;

export default function AdminBroadcast() {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const onSend = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      if (!accessToken) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("broadcast", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { text: text.trim() },
      });
      if (error) throw error;
      setResult(`Sent to ${data.sent} users (processed ${data.totalProcessed}).`);
      setText("");
    } catch (e: any) {
      setResult(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <Title>{t("broadcast")}</Title>
        <Textarea
          placeholder="Type a broadcast message to send to all users..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Row>
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            {result}
          </div>
          <Button onClick={onSend} disabled={busy}>
            {busy ? "…" : t("send")}
          </Button>
        </Row>
      </Card>
    </Wrapper>
  );
}


