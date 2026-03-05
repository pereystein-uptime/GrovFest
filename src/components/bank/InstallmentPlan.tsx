import { Check, AlertCircle, Clock, Inbox } from "lucide-react";
import { useMyPaymentStatus } from "@/hooks/useMyPaymentStatus";
import { fmt } from "@/hooks/useGroupData";

export function InstallmentPlan() {
  const { installments } = useMyPaymentStatus();

  if (installments.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Innbetalingsplan</h3>
        </div>
        <div className="px-6 py-10 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Ingen innbetalingsplan satt opp</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Innbetalingsplan</h3>
        <p className="text-xs text-muted-foreground">{installments.length} terminer</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            <th className="text-left px-6 py-3">Dato</th>
            <th className="text-left px-4 py-3">Beløp</th>
            <th className="text-left px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {installments.map((row) => {
            const dateStr = row.dueDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
            const isNext = row.status === "upcoming" && installments.find((i) => i.status === "upcoming")?.id === row.id;
            return (
              <tr key={row.id} className={isNext ? "bg-accent/50" : ""}>
                <td className={`px-6 py-3 ${isNext ? "font-semibold text-primary" : "text-foreground"}`}>{dateStr}</td>
                <td className="px-4 py-3 text-foreground">{fmt(row.amount)}</td>
                <td className="px-4 py-3">
                  {row.status === "paid" ? (
                    <span className="inline-flex items-center gap-1 text-[hsl(var(--success))] text-xs font-semibold">
                      Betalt <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : row.status === "overdue" ? (
                    <span className="inline-flex items-center gap-1 text-destructive text-xs font-semibold">
                      Forfalt <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-medium">
                      Kommende <Clock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
