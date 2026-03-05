import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useChatChannels, useMemberId, useMembers, useSuppliers } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft } from "lucide-react";

export type ChatTarget =
  | { type: "channel"; id: string }
  | { type: "dm"; id: string };

const Chat = () => {
  const { data: channels = [] } = useChatChannels();
  const { data: myMemberId } = useMemberId();
  const { data: members = [] } = useMembers();
  const { data: suppliers = [] } = useSuppliers();
  const { user, memberInfo } = useAuth();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState<ChatTarget | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [presenceMembers, setPresenceMembers] = useState<{ user_id: string; member_id: string; name: string }[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const isMobile = useIsMobile();
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Handle ?channel= query parameter
  useEffect(() => {
    const channelParam = searchParams.get("channel");
    if (channelParam && channels.some((c) => c.id === channelParam)) {
      setActive({ type: "channel", id: channelParam });
      if (isMobile) setMobileShowChat(true);
    }
  }, [searchParams, channels, isMobile]);

  // Auto-select first channel (desktop only)
  useEffect(() => {
    if (!active && channels.length > 0 && !isMobile && !searchParams.get("channel")) {
      setActive({ type: "channel", id: channels[0].id });
    }
  }, [channels, active, isMobile, searchParams]);

  // Global online presence
  useEffect(() => {
    if (!user || !memberInfo) return;
    const channel = supabase.channel("online-users", { config: { presence: { key: user.id } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineUserIds(Object.keys(state));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, name: memberInfo.name });
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, [user, memberInfo]);

  // Channel presence
  const channelId = active?.type === "channel" ? active.id : null;
  useEffect(() => {
    if (!channelId || !user || !myMemberId || !memberInfo) return;
    const channel = supabase.channel(`presence-${channelId}`, { config: { presence: { key: user.id } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const pres = Object.values(state).flat().map((p: any) => ({
          user_id: p.user_id,
          member_id: p.member_id,
          name: p.name,
        }));
        setPresenceMembers(pres);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, member_id: myMemberId, name: memberInfo.name });
        }
      });
    return () => {
      supabase.removeChannel(channel);
      setPresenceMembers([]);
    };
  }, [channelId, user, myMemberId, memberInfo]);

  // Typing indicator
  useEffect(() => {
    if (!channelId || !memberInfo) return;
    const channel = supabase.channel(`typing-${channelId}`);
    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.name === memberInfo.name) return;
        setTypingUsers((prev) => prev.includes(payload.name) ? prev : [...prev, payload.name]);
        clearTimeout(typingTimers.current[payload.name]);
        typingTimers.current[payload.name] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((n) => n !== payload.name));
        }, 3500);
      })
      .on("broadcast", { event: "stop-typing" }, ({ payload }) => {
        setTypingUsers((prev) => prev.filter((n) => n !== payload.name));
        clearTimeout(typingTimers.current[payload.name]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      setTypingUsers([]);
    };
  }, [channelId, memberInfo]);

  const activeChannel = active?.type === "channel" ? channels.find((c) => c.id === active.id) : null;

  const getSupplierInfo = () => {
    if (!activeChannel || activeChannel.type !== "supplier") return null;
    const supplier = suppliers.find((s) => s.id === (activeChannel as any).supplier_id);
    if (!supplier) return null;
    return { logo_color: supplier.logo_color ?? "#1a1f36", logo_initials: supplier.logo_initials ?? "?", name: supplier.name };
  };

  const getChannelName = () => {
    if (!activeChannel) return undefined;
    if (activeChannel.type === "dm") {
      const participants: string[] = (activeChannel as any).participants ?? [];
      const otherUserId = participants.find((p: string) => p !== user?.id);
      const otherMember = members.find((m) => m.user_id === otherUserId);
      return otherMember?.name ?? activeChannel.name;
    }
    return activeChannel.name;
  };

  const handleSelect = (target: ChatTarget) => {
    setActive(target);
    if (isMobile) setMobileShowChat(true);
  };

  const handleMobileBack = () => {
    setMobileShowChat(false);
  };

  // Mobile: single panel view
  if (isMobile) {
    return (
      <DashboardLayout title="Chat" subtitle="Gruppekommunikasjon">
        <div className="-m-4 h-[calc(100vh-120px)] relative flex flex-col">
          {!mobileShowChat ? (
            <ChatSidebar active={active ?? { type: "channel", id: "" }} onSelect={handleSelect} onlineUserIds={onlineUserIds} />
          ) : active ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0">
                <button onClick={handleMobileBack} className="p-2 rounded-lg hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-foreground text-sm truncate">{getChannelName() ?? "Chat"}</span>
              </div>
              <div className="flex-1 min-h-0">
                <ChatArea
                  active={active}
                  channelName={getChannelName()}
                  channelType={activeChannel?.type}
                  channelParticipants={(activeChannel as any)?.participants}
                  presenceMembers={presenceMembers}
                  typingUsers={typingUsers}
                  supplierInfo={getSupplierInfo()}
                />
              </div>
            </div>
          ) : null}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Chat" subtitle="Gruppekommunikasjon">
      <div className="flex -m-8 h-[calc(100vh-73px)] relative">
        <ChatSidebar active={active ?? { type: "channel", id: "" }} onSelect={handleSelect} onlineUserIds={onlineUserIds} />
        {active ? (
          <ChatArea
            active={active}
            channelName={getChannelName()}
            channelType={activeChannel?.type}
            channelParticipants={(activeChannel as any)?.participants}
            presenceMembers={presenceMembers}
            typingUsers={typingUsers}
            supplierInfo={getSupplierInfo()}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Velg en kanal for å starte
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Chat;
