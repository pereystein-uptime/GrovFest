import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGroupId, useMembers } from "@/hooks/useGroupData";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendForSigneringModal({ open, onOpenChange }: Props) {
  const [mal, setMal] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const { data: members = [] } = useMembers();
  const groupId = useGroupId();
  const queryClient = useQueryClient();

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSend = async () => {
    if (!mal || selectedMemberIds.length === 0 || !groupId) {
      toast.error("Velg mal og minst én mottaker");
      return;
    }
    const { data: contract, error } = await supabase.from("contracts").insert({
      group_id: groupId,
      title: mal === "intern" ? "Internkontrakt" : mal === "delplass" ? "Delplass-kontrakt" : "Leie av buss",
      type: mal,
      status: "pending",
    }).select().single();

    if (error || !contract) { toast.error("Kunne ikke opprette kontrakt"); return; }

    const sigs = selectedMemberIds.map((mid) => ({
      contract_id: contract.id,
      member_id: mid,
    }));
    await supabase.from("contract_signatures").insert(sigs);

    queryClient.invalidateQueries({ queryKey: ["contracts"] });
    toast.success(`Kontrakt sendt til ${selectedMemberIds.length} mottaker(e)`);
    setMal(""); setSelectedMemberIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send ut for signering</DialogTitle>
          <DialogDescription>Velg mal og mottakere</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Velg mal</Label>
            <Select value={mal} onValueChange={setMal}>
              <SelectTrigger><SelectValue placeholder="Velg kontraktsmal..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="intern">Internkontrakt</SelectItem>
                <SelectItem value="delplass">Delplass-kontrakt</SelectItem>
                <SelectItem value="buss">Leie av buss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mottakere</Label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${selectedMemberIds.includes(m.id) ? "bg-primary/5" : "hover:bg-accent/50"}`}
                >
                  <span className="text-foreground">{m.name}</span>
                  {selectedMemberIds.includes(m.id) && <span className="text-primary text-xs font-semibold">Valgt ✓</span>}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedMemberIds(members.map((m) => m.id))} className="text-xs">
              <Plus className="h-3 w-3" /> Velg alle
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={handleSend}>Send for signering</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
