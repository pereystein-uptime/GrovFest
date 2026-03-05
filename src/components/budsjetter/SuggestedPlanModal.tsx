import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, addMonths } from "date-fns";
import { nb } from "date-fns/locale";
import { Lock, Lightbulb, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePaymentPlan, useTransactions, useGroupInfo, useBudgetPaymentSchedules, useBudgetItems, useGroupId, useMemberId, fmt } from "@/hooks/useGroupData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface LiquidityIssue {
  description: string;
  amount: number;
  due_date: Date;
  shortfall: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liquidityIssues: LiquidityIssue[];
}

interface MonthRow {
  month: string;
  date: Date;
  currentAmount: number;
  suggestedAmount: number;
  locked: boolean;
}

export function SuggestedPlanModal({ open, onOpenChange, liquidityIssues }: Props) {
  const { data: paymentPlan = [] } = usePaymentPlan();
  const { data: transactions = [] } = useTransactions();
  const { data: group } = useGroupInfo();
  const { data: allSchedules = [] } = useBudgetPaymentSchedules();
  const { data: budgetItems = [] } = useBudgetItems();
  const groupId = useGroupId();
  const { data: memberId } = useMemberId();
  const queryClient = useQueryClient();

  const memberCount = group?.member_count ?? 1;
  const currentBalance = transactions.reduce((s, t) => s + (t.type === "in" ? Number(t.amount) : -Number(t.amount)), 0);
  const bufferMonths = 2;
  const bufferDate = addMonths(new Date(), bufferMonths);

  const [manualMode, setManualMode] = useState(false);

  // Build month rows
  const monthRows = useMemo((): MonthRow[] => {
    const now = new Date();
    const months: MonthRow[] = [];

    // Current monthly amount from payment plan
    const currentMonthly = paymentPlan.length > 0
      ? paymentPlan.reduce((s, p) => s + Number(p.amount_per_member), 0) / paymentPlan.length
      : 0;

    // Total outstanding expenses
    const totalOutstanding = allSchedules
      .filter(s => new Date(s.due_date) > now)
      .reduce((s, p) => s + Number(p.amount), 0);

    // Months remaining (12 months plan)
    const totalMonths = 12;
    const adjustableMonths = totalMonths - bufferMonths;
    const neededTotal = Math.max(0, totalOutstanding - currentBalance - currentMonthly * bufferMonths * memberCount);
    const suggestedMonthly = adjustableMonths > 0 ? Math.ceil(neededTotal / (adjustableMonths * memberCount)) : currentMonthly;
    const finalSuggested = Math.max(currentMonthly, suggestedMonthly);

    for (let i = 0; i < totalMonths; i++) {
      const monthDate = addMonths(now, i + 1);
      const isLocked = i < bufferMonths;
      months.push({
        month: format(monthDate, "MMMM yyyy", { locale: nb }),
        date: monthDate,
        currentAmount: Math.round(currentMonthly),
        suggestedAmount: isLocked ? Math.round(currentMonthly) : Math.round(finalSuggested),
        locked: isLocked,
      });
    }
    return months;
  }, [paymentPlan, allSchedules, currentBalance, memberCount]);

  const [editedAmounts, setEditedAmounts] = useState<Record<number, number>>({});

  const getAmount = (idx: number, row: MonthRow) => {
    if (row.locked) return row.currentAmount;
    if (manualMode && editedAmounts[idx] !== undefined) return editedAmounts[idx];
    return row.suggestedAmount;
  };

  const currentAvg = monthRows.length > 0 ? monthRows[0].currentAmount : 0;
  const suggestedAvg = monthRows.length > 0
    ? Math.round(monthRows.filter(r => !r.locked).reduce((s, r, i) => s + getAmount(monthRows.indexOf(r), r), 0) / Math.max(1, monthRows.filter(r => !r.locked).length))
    : 0;

  const pctChange = currentAvg > 0 ? Math.round(((suggestedAvg - currentAvg) / currentAvg) * 100) : 0;

  const tips = useMemo(() => {
    const t: string[] = [];
    if (pctChange > 20) t.push("Vurder å fordele økningen over flere måneder for å gjøre det lettere for medlemmene");
    if (liquidityIssues.length > 0 && liquidityIssues[0].due_date) {
      const daysUntil = Math.round((liquidityIssues[0].due_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 120) t.push(`Dere har god tid — en liten økning fra ${format(addMonths(new Date(), 3), "MMMM", { locale: nb })} er nok til å dekke dette`);
      if (daysUntil < 60 && liquidityIssues[0].shortfall > 50000) t.push("Vurder om gruppen kan gjennomføre en dugnad eller søke sponsormidler for å dekke gapet raskere");
    }
    t.push("Husk å informere gruppen om hvorfor innbetalingene endres — åpenhet skaper tillit");
    return t;
  }, [pctChange, liquidityIssues]);

  const handleApprove = async () => {
    if (!groupId || !memberId) return;
    try {
      const effectiveFrom = format(bufferDate, "yyyy-MM-dd");
      // Insert new payment plan entries for adjusted months
      for (const row of monthRows) {
        if (row.locked) continue;
        const idx = monthRows.indexOf(row);
        const amt = getAmount(idx, row);
        await supabase.from("payment_plan").insert({
          group_id: groupId,
          amount_per_member: amt,
          due_date: format(row.date, "yyyy-MM-dd"),
          effective_from: effectiveFrom,
        });
      }
      // Log the change
      await supabase.from("plan_change_log").insert({
        group_id: groupId,
        old_amount: currentAvg,
        new_amount: suggestedAvg,
        effective_from: effectiveFrom,
        reason: "Automatisk justering for å dekke kommende utgifter",
        created_by: memberId,
      });

      queryClient.invalidateQueries({ queryKey: ["payment-plan"] });
      toast.success("Ny innbetalingsplan godkjent!");
      onOpenChange(false);
    } catch {
      toast.error("Kunne ikke lagre planen");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Foreslått innbetalingsplan</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Denne planen sikrer at alle utgifter er dekket i tide. Endringer trer i kraft om 2 måneder for å gi medlemmene forutsigbarhet.
          </p>
        </DialogHeader>

        <div className="bg-accent/50 rounded-lg p-3 flex gap-2 text-sm">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            For å sikre forutsigbarhet for medlemmene trer endringer i kraft tidligst {format(bufferDate, "d. MMMM yyyy", { locale: nb })}. Innbetalinger før dette forblir uendret.
          </p>
        </div>

        {/* Two-column comparison */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Nåværende plan</h4>
            <div className="space-y-1">
              {monthRows.map((row, idx) => (
                <div key={idx} className="flex justify-between text-sm px-2 py-1.5 rounded bg-secondary/30">
                  <span className="text-muted-foreground capitalize">{row.month}</span>
                  <span className="font-medium text-foreground">{fmt(row.currentAmount)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Foreslått plan</h4>
            <div className="space-y-1">
              {monthRows.map((row, idx) => {
                const amt = getAmount(idx, row);
                const changed = amt !== row.currentAmount;
                return (
                  <div key={idx} className={cn("flex justify-between items-center text-sm px-2 py-1.5 rounded", changed ? "bg-warning/10" : "bg-secondary/30")}>
                    <span className="text-muted-foreground capitalize flex items-center gap-1">
                      {row.locked && <Lock className="w-3 h-3" />}
                      {row.month}
                    </span>
                    {manualMode && !row.locked ? (
                      <Input
                        type="number"
                        value={editedAmounts[idx] ?? row.suggestedAmount}
                        onChange={e => setEditedAmounts(prev => ({ ...prev, [idx]: Number(e.target.value) }))}
                        className="w-24 h-7 text-sm text-right"
                      />
                    ) : (
                      <span className={cn("font-medium", row.locked ? "text-muted-foreground" : "text-foreground")}>
                        {row.locked ? `${fmt(amt)}` : fmt(amt)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mt-2">
          <p>Endring per medlem: fra {fmt(currentAvg)}/mnd til {fmt(suggestedAvg)}/mnd (fra {format(bufferDate, "MMMM yyyy", { locale: nb })})</p>
          <p className="text-xs mt-0.5">Alle medlemmer vil bli varslet om endringen</p>
        </div>

        {/* Tips */}
        <div className="space-y-2 mt-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => setManualMode(!manualMode)}>
            {manualMode ? "Vis forslag" : "Juster manuelt"}
          </Button>
          <Button onClick={handleApprove}>Godkjenn ny plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
