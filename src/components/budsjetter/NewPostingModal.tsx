import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useGroupId } from "@/hooks/useGroupData";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPostingModal({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const groupId = useGroupId();
  const queryClient = useQueryClient();

  const reset = () => { setName(""); setAmount(""); };

  const handleSave = async () => {
    if (!name.trim() || !amount || !groupId) {
      toast.error("Fyll ut navn og beløp");
      return;
    }
    const { error } = await supabase.from("budget_items").insert({
      group_id: groupId,
      name: name.trim(),
      amount: Number(amount),
    });
    if (error) { toast.error("Kunne ikke lagre"); return; }
    queryClient.invalidateQueries({ queryKey: ["budget-items"] });
    toast.success("Postering lagt til");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ny postering</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Navn</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="F.eks. Russebuss, Lyd og lys..." className="mt-1.5" />
          </div>
          <div>
            <Label>Budsjettert beløp (kr)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="mt-1.5" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }}>Avbryt</Button>
          <Button disabled={!name.trim() || !amount} onClick={handleSave}>Lagre postering</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
