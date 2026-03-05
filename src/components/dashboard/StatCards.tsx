import { Banknote, Users, Clock, CalendarDays } from "lucide-react";
import { useTransactions, useMembers, useGroupInfo, fmt } from "@/hooks/useGroupData";
import { useMyPaymentStatus } from "@/hooks/useMyPaymentStatus";

export function StatCards() {
  const { data: transactions = [] } = useTransactions();
  const { data: members = [] } = useMembers();
  const { data: group } = useGroupInfo();
  const { remaining, nextInstallment, daysUntilNext } = useMyPaymentStatus();

  const balance = transactions.reduce((s, t) => s + (t.type === "in" ? Number(t.amount) : -Number(t.amount)), 0);
  const totalBudget = Number(group?.total_budget ?? 0);
  const paidPct = totalBudget > 0 ? Math.round((balance / totalBudget) * 100) : 0;

  const nextDate = nextInstallment
    ? nextInstallment.dueDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long" })
    : "Ingen";

  const stats = [
    { label: "Total saldo", value: fmt(balance), sub: `${paidPct}% av totalbudsjett`, subColor: "text-[hsl(var(--success))]", icon: Banknote },
    { label: "Medlemmer", value: `${members.length}`, sub: `av ${group?.member_count ?? 0} registrert`, subColor: "text-primary", icon: Users },
    { label: "Min gjenstående", value: fmt(remaining), sub: `Totalbudsjett: ${fmt(totalBudget)}`, subColor: "text-muted-foreground", icon: Clock },
    { label: "Neste innbetaling", value: nextDate, sub: nextInstallment ? `${fmt(nextInstallment.amount)} per medlem` : "Ingen plan satt", subColor: "text-muted-foreground", icon: CalendarDays },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card rounded-xl border border-border p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
            <s.icon className="w-5 h-5 text-muted-foreground/60" />
          </div>
          <p className="text-2xl font-bold text-foreground">{s.value}</p>
          <p className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
