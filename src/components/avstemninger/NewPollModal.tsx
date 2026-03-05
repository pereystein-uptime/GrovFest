import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, CalendarIcon, Banknote } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGroupId, useBudgetItems, useGroupInfo, useMemberId, useMembers, fmt } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { notifyAllMembers } from "@/lib/notifications";

interface NewPollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const thresholds = [
  { value: 50, label: "50%", desc: "Simpelt flertall" },
  { value: 66, label: "66%", desc: "Kvalifisert flertall" },
  { value: 75, label: "75%", desc: "Bredt flertall" },
  { value: 100, label: "100%", desc: "Enstemmig" },
];

const durations = [
  { value: 3, label: "3 dager" },
  { value: 7, label: "7 dager" },
  { value: 14, label: "14 dager" },
  { value: 30, label: "30 dager" },
];

export function NewPollModal({ open, onOpenChange }: NewPollModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [threshold, setThreshold] = useState(50);
  const [duration, setDuration] = useState(7);
  const [hasFinancial, setHasFinancial] = useState(false);
  const [financialAmount, setFinancialAmount] = useState("");
  const [financialBudgetItemId, setFinancialBudgetItemId] = useState<string>("new");
  const [financialDueDate, setFinancialDueDate] = useState<Date | undefined>();

  const groupId = useGroupId();
  const { user } = useAuth();
  const { data: budgetItems = [] } = useBudgetItems();
  const { data: group } = useGroupInfo();
  const { data: memberId } = useMemberId();
  const queryClient = useQueryClient();
  const memberCount = group?.member_count ?? 1;

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));
  const updateOption = (idx: number, val: string) => { const next = [...options]; next[idx] = val; setOptions(next); };

  const reset = () => {
    setQuestion(""); setOptions(["", ""]); setThreshold(50); setDuration(7);
    setHasFinancial(false); setFinancialAmount(""); setFinancialBudgetItemId("new"); setFinancialDueDate(undefined);
  };

  const handlePublish = async () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2 || !groupId || !user) {
      toast.error("Fyll ut spørsmål og minst to alternativer");
      return;
    }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + duration);

    const pollData: any = {
      group_id: groupId,
      question: question.trim(),
      threshold,
      deadline: deadline.toISOString(),
      created_by: user.id,
      has_financial_impact: hasFinancial,
    };
    if (hasFinancial && financialAmount) {
      pollData.financial_amount = Number(financialAmount);
      if (financialBudgetItemId && financialBudgetItemId !== "new") {
        pollData.financial_budget_item_id = financialBudgetItemId;
      }
      if (financialDueDate) {
        pollData.financial_due_date = format(financialDueDate, "yyyy-MM-dd");
      }
    }

    const { data: poll, error } = await supabase.from("polls").insert(pollData).select().single();
    if (error || !poll) { toast.error("Kunne ikke opprette avstemning"); return; }

    const optInserts = validOptions.map((label, i) => ({
      poll_id: poll.id,
      label: label.trim(),
      sort_order: i,
    }));
    await supabase.from("poll_options").insert(optInserts);

    // Notify all members
    if (groupId && memberId) {
      await notifyAllMembers(groupId, memberId, {
        type: "poll",
        title: "Ny avstemning",
        description: question.trim(),
        link: "/avstemninger",
        icon: "poll",
      });
    }

    queryClient.invalidateQueries({ queryKey: ["polls"] });
    toast.success("Avstemning publisert!");
    reset();
    onOpenChange(false);
  };

  const perMember = financialAmount ? Math.round(Number(financialAmount) / memberCount) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ny avstemning</DialogTitle>
          <DialogDescription>Opprett en ny avstemning for gruppen</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Spørsmål</Label>
            <Input placeholder="Hva vil du spørre om?" value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Svaralternativer</Label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder={`Alternativ ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} />
                  {options.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => removeOption(i)} className="shrink-0"><X className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption} className="w-full"><Plus className="h-4 w-4 mr-1" /> Legg til alternativ</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Terskel for vedtak</Label>
            <div className="grid grid-cols-4 gap-2">
              {thresholds.map((t) => (
                <button key={t.value} onClick={() => setThreshold(t.value)}
                  className={`rounded-lg border p-2.5 text-center transition-all ${threshold === t.value ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}>
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Varighet</Label>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((d) => (
                <button key={d.value} onClick={() => setDuration(d.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${duration === d.value ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Financial impact section */}
          <div className="border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-muted-foreground" />
                <Label className="cursor-pointer">Har denne avstemningen en økonomisk konsekvens?</Label>
              </div>
              <Switch checked={hasFinancial} onCheckedChange={setHasFinancial} />
            </div>

            {hasFinancial && (
              <div className="space-y-3 pt-1">
                <div>
                  <Label className="text-xs text-muted-foreground">Hva vil dette koste gruppen?</Label>
                  <Input type="number" placeholder="Beløp i kr" value={financialAmount} onChange={e => setFinancialAmount(e.target.value)} className="mt-1" />
                  {perMember > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{fmt(perMember)} per medlem ({memberCount} medlemmer)</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Budsjettpost (valgfri)</Label>
                  <Select value={financialBudgetItemId} onValueChange={setFinancialBudgetItemId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Velg budsjettpost" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Ny postering</SelectItem>
                      {budgetItems.map(bi => (
                        <SelectItem key={bi.id} value={bi.id}>{bi.name} ({fmt(Number(bi.amount))})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Forfallsdato (valgfri)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal", !financialDueDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {financialDueDate ? format(financialDueDate, "d. MMMM yyyy", { locale: nb }) : "Velg dato"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={financialDueDate} onSelect={setFinancialDueDate} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }}>Avbryt</Button>
          <Button onClick={handlePublish}>Publiser avstemning</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
