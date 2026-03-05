import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useGroupId, useMembers, useChatChannels } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChatTarget } from "@/pages/Chat";

interface NewDMModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (target: ChatTarget) => void;
  onlineUserIds: string[];
}

export function NewDMModal({ open, onOpenChange, onSelect, onlineUserIds }: NewDMModalProps) {
  const [search, setSearch] = useState("");
  const groupId = useGroupId();
  const { data: members = [] } = useMembers();
  const { data: channels = [] } = useChatChannels();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const otherMembers = members.filter(
    (m) => m.user_id !== user?.id && m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (member: (typeof members)[0]) => {
    if (!groupId || !user) return;

    const existingDM = channels.find(
      (ch) =>
        ch.type === "dm" &&
        (ch as any).participants?.includes(user.id) &&
        (ch as any).participants?.includes(member.user_id)
    );

    if (existingDM) {
      onSelect({ type: "channel", id: existingDM.id });
      onOpenChange(false);
      setSearch("");
      return;
    }

    const { data, error } = await supabase
      .from("chat_channels")
      .insert({
        group_id: groupId,
        name: member.name,
        type: "dm",
        participants: [user.id, member.user_id],
        created_by: user.id,
      } as any)
      .select()
      .single();

    if (error || !data) {
      toast.error("Kunne ikke starte samtale");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["chat-channels"] });
    onSelect({ type: "channel", id: data.id });
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ny direktemelding</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk etter medlem..."
            autoFocus
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {otherMembers.length === 0 && (
              <p className="text-xs text-muted-foreground py-3 text-center">Ingen medlemmer funnet</p>
            )}
            {otherMembers.map((m) => {
              const initials = m.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              const isOnline = onlineUserIds.includes(m.user_id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors"
                >
                  <div className="relative shrink-0">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      {initials}
                    </span>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-popover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    {isOnline && <span className="text-[11px] text-emerald-600 ml-2">Aktiv nå</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
