import { usePolls } from "@/hooks/useGroupData";
import { Link } from "react-router-dom";
import { Vote } from "lucide-react";

export function ActivePolls() {
  const { data: polls = [] } = usePolls();
  const active = polls.filter((p) => new Date(p.deadline) > new Date()).slice(0, 2);

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Aktive avstemninger</h3>
        <Link to="/avstemninger" className="text-sm text-primary font-medium hover:underline">Se alle →</Link>
      </div>
      {active.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <Vote className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Ingen aktive avstemninger</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {active.map((poll) => {
            const options = poll.poll_options ?? [];
            const totalVotes = options.reduce((s: number, o: any) => s + (o.poll_votes?.length ?? 0), 0);
            return (
              <div key={poll.id} className="px-6 py-4 space-y-3">
                <p className="text-sm font-medium text-foreground">{poll.question}</p>
                <div className="flex gap-2 flex-wrap">
                  {options.map((opt: any) => {
                    const votes = opt.poll_votes?.length ?? 0;
                    const isTop = votes === Math.max(...options.map((o: any) => o.poll_votes?.length ?? 0));
                    return (
                      <span key={opt.id} className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${isTop ? "border-primary bg-accent text-accent-foreground" : "border-border bg-secondary text-foreground"}`}>
                        {opt.label} · {votes}
                      </span>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{totalVotes} stemmer</span>
                  <span>Krav: {poll.threshold}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
