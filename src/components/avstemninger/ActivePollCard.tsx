import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, CheckCircle2, Banknote } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMemberId, useGroupInfo, fmt } from "@/hooks/useGroupData";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  poll: any;
  totalVoters: number;
}

export function ActivePollCard({ poll, totalVoters }: Props) {
  const options = poll.poll_options ?? [];
  const { data: myMemberId } = useMemberId();
  const { data: group } = useGroupInfo();
  const queryClient = useQueryClient();
  const memberCount = group?.member_count ?? 1;

  const myVoteOptionId = options.find((o: any) =>
    (o.poll_votes ?? []).some((v: any) => v.member_id === myMemberId)
  )?.id;
  const [hasVoted, setHasVoted] = useState(!!myVoteOptionId);
  const [selectedOption, setSelectedOption] = useState<string | null>(myVoteOptionId ?? null);

  const totalVotes = options.reduce((s: number, o: any) => s + (o.poll_votes?.length ?? 0), 0);
  const daysLeft = Math.max(0, Math.ceil((new Date(poll.deadline).getTime() - Date.now()) / 86400000));

  const handleVote = async (optionId: string) => {
    if (hasVoted || !myMemberId) return;
    setSelectedOption(optionId);
    setHasVoted(true);
    const { error } = await supabase.from("poll_votes").insert({
      poll_option_id: optionId,
      member_id: myMemberId,
    });
    if (error) { toast.error("Kunne ikke registrere stemme"); setHasVoted(false); setSelectedOption(null); return; }
    queryClient.invalidateQueries({ queryKey: ["polls"] });
    const label = options.find((o: any) => o.id === optionId)?.label;
    toast.success(`Du stemte "${label}"`);
  };

  const perMember = poll.financial_amount ? Math.round(Number(poll.financial_amount) / memberCount) : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{poll.question}</h3>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Krav: {poll.threshold}%</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Resultat: {totalVotes > 0 ? Math.round((Math.max(...options.map((o: any) => o.poll_votes?.length ?? 0)) / totalVotes) * 100) : 0}%
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 shrink-0">Aktiv ✦</Badge>
      </div>

      {/* Financial impact box */}
      {poll.has_financial_impact && poll.financial_amount && (
        <div className="bg-accent/50 border border-border rounded-lg p-3 flex items-start gap-3">
          <Banknote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Økonomisk konsekvens: {fmt(Number(poll.financial_amount))}</p>
            <p className="text-xs text-muted-foreground">{fmt(perMember)} per medlem</p>
            {poll.financial_due_date && (
              <p className="text-xs text-muted-foreground">Forfallsdato: {new Date(poll.financial_due_date).toLocaleDateString("nb-NO")}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {options.map((opt: any) => {
          const votes = opt.poll_votes?.length ?? 0;
          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isSelected = selectedOption === opt.id;
          const isWinning = votes === Math.max(...options.map((o: any) => o.poll_votes?.length ?? 0));

          return (
            <button key={opt.id} onClick={() => handleVote(opt.id)} disabled={hasVoted}
              className={`w-full text-left rounded-lg border p-3 transition-all ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30 hover:bg-accent/50"} ${hasVoted && !isSelected ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                    {isSelected && "✓"}
                  </span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{votes} stemmer</span>
                  <span className="text-sm font-semibold text-foreground ml-2">{pct}%</span>
                </div>
              </div>
              <Progress value={pct} className={`h-2 ${isWinning ? "[&>div]:bg-success" : "[&>div]:bg-primary/40"}`} />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {totalVotes} av {totalVoters} har stemt</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {daysLeft} dager igjen</span>
      </div>
    </div>
  );
}
