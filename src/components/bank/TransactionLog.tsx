import { useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTransactions, fmt } from "@/hooks/useGroupData";
import { Inbox } from "lucide-react";

type Filter = "all" | "inn" | "ut";

export function TransactionLog() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: transactions = [] } = useTransactions();

  const filtered = transactions.filter((tx) => {
    if (filter === "inn") return tx.type === "in";
    if (filter === "ut") return tx.type === "out";
    return true;
  });

  // Compute running balance
  let runningBalance = 0;
  const allSorted = [...transactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const balanceMap: Record<string, number> = {};
  allSorted.forEach((tx) => {
    runningBalance += tx.type === "in" ? Number(tx.amount) : -Number(tx.amount);
    balanceMap[tx.id] = runningBalance;
  });

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          Kontoutskrift <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </h3>
        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger className="w-[200px] h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle transaksjoner</SelectItem>
            <SelectItem value="inn">Kun innbetalinger</SelectItem>
            <SelectItem value="ut">Kun utbetalinger</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Ingen transaksjoner ennå</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                <th className="text-left px-6 py-3">Dato</th>
                <th className="text-left px-4 py-3">Beskrivelse</th>
                <th className="text-left px-4 py-3">Inn</th>
                <th className="text-left px-4 py-3">Ut</th>
                <th className="text-right px-6 py-3">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((tx) => {
                const d = new Date(tx.created_at);
                const name = (tx as any).members?.name;
                return (
                  <tr key={tx.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-foreground">{d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}</span>
                      <br />
                      <span className="text-xs text-muted-foreground">{d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-foreground">{name ?? ""}</span>
                      <br />
                      <span className="text-xs text-muted-foreground">{tx.description}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-success">{tx.type === "in" ? `+${fmt(Number(tx.amount))}` : ""}</td>
                    <td className="px-4 py-3.5 font-semibold text-destructive">{tx.type === "out" ? `-${fmt(Number(tx.amount))}` : ""}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-foreground">{fmt(balanceMap[tx.id] ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
