import { styled } from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  Window,
  Thread,
  ChannelList,
  LoadingIndicator,
  useChannelStateContext,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { supabase } from "../supabase";
import { MagnifyingGlassIcon, PhoneIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

const Wrapper = styled.div`
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 360px 1fr;
  min-height: calc(100vh - 64px - 120px);
  /* header approx 64px, footer approx 120px */
  width: 100%;
  background: #fff;
`;

const Sidebar = styled.aside`
  border-right: 1px solid #e5e7eb;
  min-width: 0;
  overflow: hidden;
`;

const Panel = styled.section`
  min-width: 0;
  overflow: hidden;
`;

const SidebarInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SidebarHeader = styled.div`
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
`;

const SidebarTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const IconBtn = styled.button`
  appearance: none;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  border-radius: 10px;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: #f9fafb; }
`;

const SidebarScroll = styled.div`
  flex: 1 1 auto;
  overflow: auto;
`;

const PanelHeader = styled.div`
  height: 56px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const PanelTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

function CustomChannelHeader() {
  const { channel } = useChannelStateContext();
  const channelData = (channel?.data as Record<string, unknown> | undefined);
  const title = (channelData?.name as string | undefined) || channel?.id || "Direct Message";
  const membersCount = channel ? Object.keys(channel.state.members).length : 0;
  return (
    <PanelHeader>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <PanelTitle>{title}</PanelTitle>
        {membersCount > 0 && (
          <span style={{ color: "#6b7280", fontSize: 12 }}>· {membersCount} members</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <IconBtn aria-label="Search">
          <MagnifyingGlassIcon width={18} height={18} />
        </IconBtn>
        <IconBtn aria-label="Call">
          <PhoneIcon width={18} height={18} />
        </IconBtn>
        <IconBtn aria-label="More">
          <EllipsisHorizontalIcon width={18} height={18} />
        </IconBtn>
      </div>
    </PanelHeader>
  );
}

export default function Messages() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);

  const filters = useMemo(() => ({ type: { $in: ["messaging"] } }), []);
  const sort = useMemo(() => ({ last_message_at: -1 } as const), []);
  const options = useMemo(() => ({ limit: 30, state: true, watch: true }), []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error("Not authenticated");

        const apiKey = import.meta.env.VITE_STREAM_API_KEY as string;
        if (!apiKey) throw new Error("Missing VITE_STREAM_API_KEY");

        const { data: fnRes, error: fnErr } = await supabase.functions.invoke(
          "stream-token",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (fnErr) throw fnErr;
        const { token, user } = fnRes as any;

        const c = StreamChat.getInstance(apiKey);
        await c.connectUser(
          { id: user.id, name: user.name, image: user.image },
          token
        );

        if (!isMounted) return;
        setClient(c);
      } catch (e) {
        console.error("Failed to init Stream chat:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
      if (client) client.disconnectUser();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingIndicator size={28} />
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
        Unable to initialize chat.
      </div>
    );
  }

  return (
    <Wrapper>
      <Chat client={client} theme="str-chat__theme-light">
        <Sidebar>
          <SidebarInner>
            <SidebarHeader>
              <SidebarTitle>Messages</SidebarTitle>
            </SidebarHeader>
            <SidebarScroll>
              <ChannelList filters={filters} sort={sort} options={options} />
            </SidebarScroll>
          </SidebarInner>
        </Sidebar>
        <Panel>
          <Channel>
            <Window>
              <CustomChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Panel>
      </Chat>
    </Wrapper>
  );
}