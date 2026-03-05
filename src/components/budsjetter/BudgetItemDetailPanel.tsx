import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths, differenceInDays } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2, CheckCircle2, AlertTriangle, AlertCircle, Lightbulb, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useBudgetScheduleForItem, usePaymentPlan, useTransactions, useGroupInfo, fmt } from "@/hooks/useGroupData";
import { SuggestedPlanModal } from "./SuggestedPlanModal";

interface SubPayment {
  id?: string;
  description: string;
  amount: string;
  due_date: Date | undefined;
  isNew?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: string; name: string; amount: number; description?: string } | null;
}

const PRESETS: Record<string, { description: string; pct: number }[]> = {
  russebuss: [
    { description: "Depositum", pct: 25 },
    { description: "2. termin", pct: 25 },
    { description: "Sluttoppgjør", pct: 50 },
  ],
  lydanlegg: [
    { description: "Depositum", pct: 40 },
    { description: "Ved installasjon", pct: 60 },
  ],
  "lyd og lys": [
    { description: "Depositum", pct: 40 },
    { description: "Ved installasjon", pct: 60 },
  ],
};

function getPreset(name: string): { description: string; pct: number }[] | null {
  const lower = name.toLowerCase();
  for (const key of Object.keys(PRESETS)) {
    if (lower.includes(key)) return PRESETS[key];
  }
  return null;
}

export function BudgetItemDetailPanel({ open, onOpenChange, item }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [subPayments, setSubPayments] = useState<SubPayment[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSuggestedPlan, setShowSuggestedPlan] = useState(false);

  const { data: existingSchedules = [] } = useBudgetScheduleForItem(item?.id ?? null);
  const { data: paymentPlan = [] } = usePaymentPlan();
  const { data: transactions = [] } = useTransactions();
  const { data: group } = useGroupInfo();
  const queryClient = useQueryClient();

  const memberCount = group?.member_count ?? 1;
  const currentBalance = transactions.reduce((s, t) => s + (t.type === "in" ? Number(t.amount) : -Number(t.amount)), 0);

  useEffect(() => {
    if (item && open) {
      setName(item.name);
      setAmount(String(item.amount));
      setDescription((item as any).description ?? "");

      if (existingSchedules.length > 0) {
        setSubPayments(existingSchedules.map(s => ({
          id: s.id,
          description: s.description,
          amount: String(s.amount),
          due_date: new Date(s.due_date),
        })));
      } else {
        const preset = getPreset(item.name);
        if (preset) {
          const baseDate = addMonths(new Date(), 2);
          setSubPayments(preset.map((p, i) => ({
            description: p.description,
            amount: String(Math.round(item.amount * p.pct / 100)),
            due_date: addMonths(baseDate, i * 2),
            isNew: true,
          })));
        } else {
          setSubPayments([]);
        }
      }
    }
  }, [item?.id, open, existingSchedules.length]);

  const subTotal = subPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalAmount = Number(amount) || 0;
  const mismatch = subPayments.length > 0 && Math.abs(subTotal - totalAmount) > 1;

  // Liquidity check
  const liquidityCheck = useMemo(() => {
    if (subPayments.length === 0) return null;
    const sortedSubs = [...subPayments]
      .filter(p => p.due_date)
      .sort((a, b) => a.due_date!.getTime() - b.due_date!.getTime());
    if (sortedSubs.length === 0) return null;

    // Cumulative income from payment plan
    const monthlyIncome = paymentPlan.reduce((s, p) => s + Number(p.amount_per_member) * memberCount, 0) / Math.max(paymentPlan.length, 1);
    
    let cumulativeIncome = currentBalance;
    const issues: { description: string; amount: number; due_date: Date; shortfall: number }[] = [];

    for (const sub of sortedSubs) {
      const monthsUntil = Math.max(0, differenceInDays(sub.due_date!, new Date()) / 30);
      const projectedIncome = currentBalance + monthlyIncome * monthsUntil;
      const subAmount = Number(sub.amount) || 0;
      if (projectedIncome < subAmount) {
        issues.push({
          description: sub.description,
          amount: subAmount,
          due_date: sub.due_date!,
          shortfall: subAmount - projectedIncome,
        });
      }
    }

    return { ok: issues.length === 0, issues };
  }, [subPayments, paymentPlan, currentBalance, memberCount]);

  const addSubPayment = () => {
    setSubPayments(prev => [...prev, { description: "", amount: "", due_date: undefined, isNew: true }]);
  };

  const removeSubPayment = (index: number) => {
    setSubPayments(prev => prev.filter((_, i) => i !== index));
  };

  const updateSubPayment = (index: number, field: keyof SubPayment, value: any) => {
    setSubPayments(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const getStatusForSub = (sub: SubPayment) => {
    if (!sub.due_date) return null;
    const daysUntil = differenceInDays(sub.due_date, new Date());
    const subAmount = Number(sub.amount) || 0;
    const monthsUntil = Math.max(0, daysUntil / 30);
    const monthlyIncome = paymentPlan.length > 0
      ? paymentPlan.reduce((s, p) => s + Number(p.amount_per_member) * memberCount, 0) / paymentPlan.length
      : 0;
    const projected = currentBalance + monthlyIncome * monthsUntil;

    if (projected >= subAmount) return "covered";
    if (daysUntil < 30) return "urgent";
    return "warning";
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      // Update budget item
      await supabase.from("budget_items").update({
        name: name.trim(),
        amount: Number(amount),
        description: description.trim(),
      }).eq("id", item.id);

      // Delete existing schedules
      await supabase.from("budget_payment_schedule").delete().eq("budget_item_id", item.id);

      // Insert new ones
      const validSubs = subPayments.filter(p => p.description && p.amount && p.due_date);
      if (validSubs.length > 0) {
        await supabase.from("budget_payment_schedule").insert(
          validSubs.map(p => ({
            budget_item_id: item.id,
            description: p.description,
            amount: Number(p.amount),
            due_date: format(p.due_date!, "yyyy-MM-dd"),
          }))
        );
      }

      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      queryClient.invalidateQueries({ queryKey: ["budget-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["budget-payment-schedules"] });
      toast.success("Postering og betalingsplan lagret");
      onOpenChange(false);
    } catch {
      toast.error("Kunne ikke lagre");
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detaljer for postering</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Basic fields */}
            <div className="space-y-3">
              <div>
                <Label>Navn</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Totalbeløp (kr)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Beskrivelse</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Valgfri beskrivelse..." className="mt-1" rows={2} />
              </div>
            </div>

            {/* Payment schedule */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">Når skal dette betales?</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Legg inn når leverandøren skal ha betalt, så hjelper vi deg å planlegge innbetalingene fra gruppen.</p>
              </div>

              {subPayments.length === 0 && (
                <div className="bg-accent/50 rounded-xl p-4 flex gap-3">
                  <Lightbulb className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Tips</p>
                    <p className="text-sm text-muted-foreground">Legg inn forfallsdatoer så systemet kan hjelpe deg å sikre at pengene er på konto i tide. De fleste bussleverandører krever delbetaling — legg inn hver termin.</p>
                  </div>
                </div>
              )}

              {subPayments.map((sub, idx) => {
                const status = getStatusForSub(sub);
                return (
                  <div key={idx} className="bg-secondary/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Beskrivelse (f.eks. Depositum)"
                          value={sub.description}
                          onChange={e => updateSubPayment(idx, "description", e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Beløp"
                            value={sub.amount}
                            onChange={e => updateSubPayment(idx, "amount", e.target.value)}
                            className="w-32"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !sub.due_date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {sub.due_date ? format(sub.due_date, "d. MMM yyyy", { locale: nb }) : "Velg dato"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={sub.due_date}
                                onSelect={d => updateSubPayment(idx, "due_date", d)}
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 pt-1">
                        {status === "covered" && <CheckCircle2 className="w-5 h-5 text-success" />}
                        {status === "warning" && <AlertTriangle className="w-5 h-5 text-warning" />}
                        {status === "urgent" && <AlertCircle className="w-5 h-5 text-destructive" />}
                        <button onClick={() => removeSubPayment(idx)} className="text-muted-foreground hover:text-destructive mt-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {status && (
                      <p className={cn("text-xs", status === "covered" && "text-success", status === "warning" && "text-warning", status === "urgent" && "text-destructive")}>
                        {status === "covered" && "Dekket — nok midler på konto ved forfall"}
                        {status === "warning" && "Kritisk — ikke nok midler med nåværende innbetalingsplan"}
                        {status === "urgent" && `Forfall om under 30 dager — mangler ${fmt(Math.round(Number(sub.amount) - currentBalance))}`}
                      </p>
                    )}
                  </div>
                );
              })}

              <Button variant="outline" onClick={addSubPayment} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Legg til delbetaling
              </Button>

              {subPayments.length > 0 && (
                <div className={cn("flex justify-between text-sm font-medium px-1", mismatch ? "text-destructive" : "text-foreground")}>
                  <span>Sum delbetalinger:</span>
                  <span>{fmt(subTotal)} {mismatch && `(avvik: ${fmt(Math.abs(subTotal - totalAmount))})`}</span>
                </div>
              )}
            </div>

            {/* Liquidity check result */}
            {liquidityCheck && !liquidityCheck.ok && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Innbetalingsplanen dekker ikke alle utgifter i tide</p>
                    {liquidityCheck.issues.map((issue, i) => (
                      <p key={i} className="text-sm text-muted-foreground mt-1">
                        {issue.description} på {fmt(issue.amount)} forfaller {format(issue.due_date, "d. MMMM yyyy", { locale: nb })}, men det mangler ca. {fmt(Math.round(issue.shortfall))}.
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowSuggestedPlan(true)}>
                    Se foreslått ny plan →
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {}}>
                    Behold nåværende plan
                  </Button>
                </div>
              </div>
            )}

            {liquidityCheck && liquidityCheck.ok && subPayments.length > 0 && (
              <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-foreground">Innbetalingsplanen dekker alle kommende utgifter i tide.</p>
              </div>
            )}

            {/* Save */}
            <Button onClick={handleSave} disabled={saving || !name.trim() || !amount} className="w-full">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Lagrer..." : "Lagre endringer"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <SuggestedPlanModal
        open={showSuggestedPlan}
        onOpenChange={setShowSuggestedPlan}
        liquidityIssues={liquidityCheck?.issues ?? []}
      />
    </>
  );
}
