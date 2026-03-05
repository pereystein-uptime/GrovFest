import { useState } from "react";
import { Hash, Bell, Lock, Plus, MessageCircle, Store, ShieldCheck } from "lucide-react";
import type { ChatTarget } from "@/pages/Chat";
import { useChatChannels, useIsAdmin, useMembers, useMemberId, useLastMessages, useUnreadCounts, useSuppliers } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { NewChannelModal } from "./NewChannelModal";
import { NewDMModal } from "./NewDMModal";
import { Badge } from "@/components/ui/badge";

interface ChatSidebarProps {
  active: ChatTarget;
  onSelect: (target: ChatTarget) => void;
  onlineUserIds: string[];
}

const iconMap: Record<string, any> = { group: Hash, announcement: Bell, admin: Lock, dm: MessageCircle };

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Nå";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}t`;
  return `${Math.floor(hrs / 24)}d`;
}

export function ChatSidebar({ active, onSelect, onlineUserIds }: ChatSidebarProps) {
  const { data: channels = [] } = useChatChannels();
  const { data: members = [] } = useMembers();
  const { data: myMemberId } = useMemberId();
  const { data: lastMessages = {} } = useLastMessages();
  const { data: unreadCounts = {} } = useUnreadCounts(myMemberId ?? null);
  const { data: suppliers = [] } = useSuppliers();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);

  const groupChannels = channels.filter((ch) => ch.type !== "dm" && ch.type !== "supplier");
  const dmChannels = channels.filter((ch) => ch.type === "dm");
  const supplierChannels = channels.filter((ch) => ch.type === "supplier");

  const getDMName = (ch: any) => {
    const participants: string[] = ch.participants ?? [];
    const otherUserId = participants.find((p: string) => p !== user?.id);
    const otherMember = members.find((m) => m.user_id === otherUserId);
    return otherMember?.name ?? ch.name;
  };

  const getDMUserId = (ch: any) => {
    const participants: string[] = ch.participants ?? [];
    return participants.find((p: string) => p !== user?.id) ?? "";
  };

  const getSupplierInfo = (ch: any) => {
    const supplier = suppliers.find((s) => s.id === ch.supplier_id);
    return supplier;
  };

  return (
    <div className="w-[260px] max-md:w-full shrink-0 border-r max-md:border-r-0 border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Meldinger</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Channels */}
        <div className="flex items-center justify-between px-3 pt-4 pb-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Kanaler</span>
          {isAdmin && (
            <button onClick={() => setShowNewChannel(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {groupChannels.length === 0 && (
          <p className="px-4 py-3 text-xs text-muted-foreground">Ingen kanaler ennå</p>
        )}
        {groupChannels.map((ch) => {
          const selected = active.type === "channel" && active.id === ch.id;
          const Icon = iconMap[ch.type] || Hash;
          const last = lastMessages[ch.id];
          const unread = unreadCounts[ch.id] ?? 0;

          return (
            <button
              key={ch.id}
              onClick={() => onSelect({ type: "channel", id: ch.id })}
              className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${selected ? "bg-primary/10" : "hover:bg-accent/50"}`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5 ${selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium truncate ${selected ? "text-primary" : unread > 0 ? "text-foreground font-semibold" : "text-foreground"}`}>{ch.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {last && <span className="text-[10px] text-muted-foreground">{timeAgo(last.created_at)}</span>}
                    {unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
                {last && (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    <span className="font-medium">{last.sender}</span>: {last.content}
                  </p>
                )}
              </div>
            </button>
          );
        })}

        {/* DMs */}
        <div className="flex items-center justify-between px-3 pt-5 pb-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Direktemeldinger</span>
          <button onClick={() => setShowNewDM(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {dmChannels.length === 0 && (
          <p className="px-4 py-3 text-xs text-muted-foreground">Ingen samtaler ennå</p>
        )}
        {dmChannels.map((ch) => {
          const selected = active.type === "channel" && active.id === ch.id;
          const name = getDMName(ch);
          const otherUserId = getDMUserId(ch);
          const isOnline = onlineUserIds.includes(otherUserId);
          const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
          const last = lastMessages[ch.id];
          const unread = unreadCounts[ch.id] ?? 0;

          return (
            <button
              key={ch.id}
              onClick={() => onSelect({ type: "channel", id: ch.id })}
              className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${selected ? "bg-primary/10" : "hover:bg-accent/50"}`}
            >
              <div className="relative shrink-0 mt-0.5">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {initials}
                </span>
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium truncate ${selected ? "text-primary" : unread > 0 ? "text-foreground font-semibold" : "text-foreground"}`}>{name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {last && <span className="text-[10px] text-muted-foreground">{timeAgo(last.created_at)}</span>}
                    {unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
                {last ? (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{last.content}</p>
                ) : !isOnline ? (
                  <p className="text-[11px] text-muted-foreground mt-0.5">Ingen meldinger ennå</p>
                ) : null}
              </div>
            </button>
          );
        })}

        {/* Suppliers */}
        {supplierChannels.length > 0 && (
          <>
            <div className="flex items-center justify-between px-3 pt-5 pb-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Store className="h-3 w-3" />
                Leverandører
              </span>
            </div>
            {supplierChannels.map((ch) => {
              const selected = active.type === "channel" && active.id === ch.id;
              const supplier = getSupplierInfo(ch);
              const logoColor = supplier?.logo_color ?? "#1a1f36";
              const logoInitials = supplier?.logo_initials ?? ch.name.slice(0, 2).toUpperCase();
              const last = lastMessages[ch.id];
              const unread = unreadCounts[ch.id] ?? 0;

              return (
                <button
                  key={ch.id}
                  onClick={() => onSelect({ type: "channel", id: ch.id })}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${selected ? "bg-primary/10" : "hover:bg-accent/50"}`}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: logoColor }}
                  >
                    {logoInitials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium truncate flex items-center gap-1 ${selected ? "text-primary" : unread > 0 ? "text-foreground font-semibold" : "text-foreground"}`}>
                        {ch.name}
                        <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {last && <span className="text-[10px] text-muted-foreground">{timeAgo(last.created_at)}</span>}
                        {unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                    {last && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        <span className="font-medium">{last.sender}</span>: {last.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      <NewChannelModal open={showNewChannel} onOpenChange={setShowNewChannel} />
      <NewDMModal open={showNewDM} onOpenChange={setShowNewDM} onSelect={onSelect} onlineUserIds={onlineUserIds} />
    </div>
  );
}
