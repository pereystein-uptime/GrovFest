import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTransactions, fmt } from "@/hooks/useGroupData";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";

export function RecentTransactions() {
  const { data: transactions = [] } = useTransactions();
  const recent = transactions.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Siste transaksjoner</h3>
        <Link to="/bank" className="text-sm text-primary font-medium hover:underline">Se alle →</Link>
      </div>
      {recent.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Ingen transaksjoner ennå</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((tx) => {
            const isIn = tx.type === "in";
            const name = (tx as any).members?.name ?? tx.description;
            const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <li key={tx.id} className="flex items-center gap-4 px-6 py-3.5">
                <Avatar className="w-9 h-9 text-xs font-bold bg-primary/10 text-primary">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">{tx.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${isIn ? "text-success" : "text-destructive"}`}>
                    {isIn ? "+" : "-"}{fmt(Number(tx.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
