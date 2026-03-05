import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  saving: boolean;
}

const months = [
  "2025-08","2025-09","2025-10","2025-11","2025-12",
  "2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11","2026-12",
];

const monthLabel = (m: string) => {
  const [y, mo] = m.split("-");
  const names = ["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"];
  return `${names[parseInt(mo) - 1]} ${y}`;
};

export function Step3PaymentPlan({ data, update, onNext, saving }: Props) {
  const perMember = data.totalBudget > 0 && data.memberCount > 0 ? data.totalBudget / data.memberCount : 0;

  useEffect(() => {
    generatePlan();
  }, [data.startMonth, data.endMonth]);

  const generatePlan = () => {
    const si = months.indexOf(data.startMonth);
    const ei = months.indexOf(data.endMonth);
    if (si < 0 || ei < 0 || ei < si || perMember <= 0) {
      update({ paymentPlan: [] });
      return;
    }
    const count = ei - si + 1;
    const perMonth = Math.round(perMember / count);
    const plan = [];
    for (let i = si; i <= ei; i++) {
      const isLast = i === ei;
      const amount = isLast ? perMember - perMonth * (count - 1) : perMonth;
      plan.push({ due_date: `${months[i]}-01`, amount_per_member: Math.round(amount) });
    }
    update({ paymentPlan: plan });
  };

  const updateAmount = (idx: number, val: number) => {
    const next = [...data.paymentPlan];
    next[idx] = { ...next[idx], amount_per_member: val };
    update({ paymentPlan: next });
  };

  const planTotal = data.paymentPlan.reduce((s, p) => s + p.amount_per_member, 0);
  const totalMatches = Math.abs(planTotal - perMember) < 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Lag innbetalingsplan</h2>
        <p className="text-muted-foreground mt-1">Velg periode, så fordeler vi beløpet jevnt per måned.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Startmåned</Label>
          <Select value={data.startMonth} onValueChange={v => update({ startMonth: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sluttmåned</Label>
          <Select value={data.endMonth} onValueChange={v => update({ endMonth: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.paymentPlan.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Dato</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Beløp per medlem</th>
              </tr>
            </thead>
            <tbody>
              {data.paymentPlan.map((p, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2.5 text-foreground">1. {monthLabel(p.due_date.slice(0, 7))}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="relative inline-block w-28">
                      <Input
                        type="number"
                        value={p.amount_per_member}
                        onChange={e => updateAmount(i, Number(e.target.value))}
                        className="h-8 text-right pr-8 text-sm"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kr</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td className="px-4 py-2.5 font-semibold text-foreground">Totalt per medlem</td>
                <td className={`px-4 py-2.5 text-right font-bold ${totalMatches ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                  {planTotal.toLocaleString("nb-NO")} kr
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <Button onClick={onNext} disabled={!totalMatches || data.paymentPlan.length === 0 || saving} className="w-full">
        {saving ? "Lagrer..." : "Neste →"}
      </Button>
    </div>
  );
}
