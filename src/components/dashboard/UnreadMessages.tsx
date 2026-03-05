import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { useChatChannels, useMemberId, useMembers } from "@/hooks/useGroupData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGroupId } from "@/hooks/useGroupData";

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Nå";
  if (mins < 60) return `${mins} min siden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}t siden`;
  const days = Math.floor(hrs / 24);
  return `${days}d siden`;
}

interface UnreadMessage {
  id: string;
  content: string;
  created_at: string;
  channel_id: string;
  channel_name: string;
  channel_type: string;
  member_id: string;
  sender_name: string;
  has_attachments: boolean;
}

export function UnreadMessages() {
  const { data: myMemberId } = useMemberId();
  const groupId = useGroupId();
  const { data: channels = [] } = useChatChannels();
  const { data: members = [] } = useMembers();
  const navigate = useNavigate();

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["dashboard-unread", groupId, myMemberId],
    queryFn: async (): Promise<UnreadMessage[]> => {
      if (!groupId || !myMemberId || channels.length === 0) return [];

      const results: UnreadMessage[] = [];

      for (const ch of channels) {
        // Get the latest read timestamp for this member in this channel
        const { data: lastRead } = await supabase
          .from("message_reads")
          .select("read_at, message_id")
          .eq("member_id", myMemberId)
          .in(
            "message_id",
            (
              await supabase
                .from("chat_messages")
                .select("id")
                .eq("channel_id", ch.id)
            ).data?.map((m) => m.id) ?? []
          )
          .order("read_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const lastReadAt = lastRead?.read_at ?? "1970-01-01T00:00:00Z";

        // Get unread messages (not sent by me)
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("id, content, created_at, channel_id, member_id")
          .eq("channel_id", ch.id)
          .is("deleted_at", null)
          .neq("member_id", myMemberId)
          .gt("created_at", lastReadAt)
          .order("created_at", { ascending: false })
          .limit(4);

        if (msgs && msgs.length > 0) {
          // Check attachments for these messages
          const msgIds = msgs.map((m) => m.id);
          const { data: attachments } = await supabase
            .from("message_attachments")
            .select("message_id")
            .in("message_id", msgIds);

          const attachmentSet = new Set(attachments?.map((a) => a.message_id) ?? []);

          for (const msg of msgs) {
            const sender = members.find((m) => m.id === msg.member_id);
            results.push({
              id: msg.id,
              content: msg.content,
              created_at: msg.created_at,
              channel_id: msg.channel_id,
              channel_name: ch.name,
              channel_type: ch.type,
              member_id: msg.member_id,
              sender_name: sender?.name ?? "Ukjent",
              has_attachments: attachmentSet.has(msg.id),
            });
          }
        }
      }

      // Sort by newest first and return
      return results.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!groupId && !!myMemberId && channels.length > 0,
    refetchInterval: 30000,
  });

  const totalUnread = unreadMessages.length;
  const displayed = unreadMessages.slice(0, 4);

  // Hide entirely if no unread messages
  if (totalUnread === 0) return null;

  function getPreview(msg: UnreadMessage) {
    if (msg.has_attachments && (!msg.content || msg.content.trim() === "")) {
      return "📎 Vedlegg";
    }
    // Check for image/file mentions in content
    if (msg.content.startsWith("[image]") || msg.content.startsWith("[bilde]")) {
      return "📷 Bilde";
    }
    return msg.content;
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const COLORS = [
    "bg-primary/15 text-primary",
    "bg-[hsl(190,90%,50%)]/15 text-[hsl(190,90%,50%)]",
    "bg-[hsl(38,92%,50%)]/15 text-[hsl(38,92%,50%)]",
    "bg-[hsl(152,85%,40%)]/15 text-[hsl(152,85%,40%)]",
    "bg-[hsl(330,70%,55%)]/15 text-[hsl(330,70%,55%)]",
  ];

  function colorForMember(memberId: string) {
    const idx = members.findIndex((m) => m.id === memberId);
    return COLORS[(idx >= 0 ? idx : 0) % COLORS.length];
  }

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Uleste meldinger</h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
            {totalUnread}
          </Badge>
        </div>
        {totalUnread > 4 && (
          <Link to="/chat" className="text-sm text-primary font-medium hover:underline">
            Se alle {totalUnread} uleste →
          </Link>
        )}
      </div>
      <ul className="divide-y divide-border">
        {displayed.map((msg) => (
          <li
            key={msg.id}
            className="flex items-center gap-3 px-6 py-3.5 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate(`/chat?channel=${msg.channel_id}`)}
          >
            <Avatar className={`w-9 h-9 text-xs font-bold shrink-0 ${colorForMember(msg.member_id)}`}>
              <AvatarFallback className={`text-xs font-bold ${colorForMember(msg.member_id)}`}>
                {getInitials(msg.sender_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground truncate">
                  {msg.sender_name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  · {msg.channel_type === "dm" ? "DM" : `#${msg.channel_name}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {getPreview(msg)}
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
              {timeAgo(msg.created_at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
