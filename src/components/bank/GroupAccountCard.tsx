import { Landmark } from "lucide-react";
import { useTransactions, useGroupInfo, fmt } from "@/hooks/useGroupData";

export function GroupAccountCard() {
  const { data: transactions = [] } = useTransactions();
  const { data: group } = useGroupInfo();

  const balance = transactions.reduce((s, t) => s + (t.type === "in" ? Number(t.amount) : -Number(t.amount)), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = transactions.filter((t) => new Date(t.created_at) >= startOfMonth);
  const inThisMonth = thisMonth.filter((t) => t.type === "in").reduce((s, t) => s + Number(t.amount), 0);
  const outThisMonth = thisMonth.filter((t) => t.type === "out").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="rounded-xl p-6 h-full flex flex-col justify-between" style={{ background: "var(--banner-gradient)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-primary-foreground/70 font-medium">Gruppekonto · {group?.name ?? ""}</p>
          <p className="text-4xl font-bold text-primary-foreground mt-1">{fmt(balance)}</p>
        </div>
        <Landmark className="w-8 h-8 text-primary-foreground/30" />
      </div>
      <div className="flex gap-8 mt-6 pt-4 border-t border-primary-foreground/10">
        <div>
          <p className="text-xs text-primary-foreground/50 uppercase tracking-wider font-semibold">Inn denne mnd</p>
          <p className="text-sm font-bold text-[hsl(152,85%,55%)] mt-0.5">+{fmt(inThisMonth)}</p>
        </div>
        <div>
          <p className="text-xs text-primary-foreground/50 uppercase tracking-wider font-semibold">Ut denne mnd</p>
          <p className="text-sm font-bold text-[hsl(0,72%,65%)] mt-0.5">-{fmt(outThisMonth)}</p>
        </div>
        <div>
          <p className="text-xs text-primary-foreground/50 uppercase tracking-wider font-semibold">Sist oppdatert</p>
          <p className="text-sm font-bold text-primary-foreground mt-0.5 flex items-center gap-1.5">
            Nå <span className="w-2 h-2 rounded-full bg-[hsl(152,85%,55%)] animate-pulse" />
          </p>
        </div>
      </div>
    </div>
  );
}
