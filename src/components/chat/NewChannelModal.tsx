import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, Megaphone, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGroupId, useMembers } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface NewChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeOptions = [
  { value: "group", label: "Åpen kanal", desc: "Alle kan se og skrive", icon: Globe },
  { value: "announcement", label: "Kunngjøring", desc: "Kun admin kan poste, alle kan lese", icon: Megaphone },
  { value: "admin", label: "Privat kanal", desc: "Velg hvem som har tilgang", icon: Lock },
] as const;

export function NewChannelModal({ open, onOpenChange }: NewChannelModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"group" | "announcement" | "admin">("group");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const groupId = useGroupId();
  const { data: members = [] } = useMembers();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const filteredMembers = members
    .filter((m) => m.user_id !== user?.id)
    .filter((m) => m.name.toLowerCase().includes(memberSearch.toLowerCase()));

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || !groupId || !user) return;
    setLoading(true);
    const participants = type === "admin" ? [...selectedMembers, user.id] : [];
    const { error } = await supabase.from("chat_channels").insert({
      group_id: groupId,
      name: name.trim(),
      type,
      participants,
      created_by: user.id,
    } as any);
    setLoading(false);
    if (error) {
      toast.error("Kunne ikke opprette kanal");
      return;
    }
    toast.success("Kanal opprettet");
    queryClient.invalidateQueries({ queryKey: ["chat-channels"] });
    setName("");
    setType("group");
    setSelectedMembers([]);
    setMemberSearch("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Opprett ny kanal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Kanalnavn</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="f.eks. arrangementer" />
          </div>
          <div>
            <Label className="mb-2 block">Type</Label>
            <div className="grid gap-2">
              {typeOptions.map((opt) => {
                const Icon = opt.icon;
                const selected = type === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value as any)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className={`text-sm font-medium ${selected ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {type === "admin" && (
            <div>
              <Label className="mb-2 block">Velg medlemmer</Label>
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Søk etter medlem..."
                className="mb-2"
              />
              <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
                {filteredMembers.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 cursor-pointer">
                    <Checkbox
                      checked={selectedMembers.includes(m.user_id)}
                      onCheckedChange={() => toggleMember(m.user_id)}
                    />
                    <span className="text-sm">{m.name}</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">{m.role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleCreate} disabled={!name.trim() || loading} className="w-full">
            Opprett kanal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
