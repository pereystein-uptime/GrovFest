import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, Users, Banknote, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useGroupId, useGroupInfo, useIsBussjef, useMemberId, useBudgetItems, useChatChannels, useMembers, fmt } from "@/hooks/useGroupData";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { notifyAllMembers, notifyAdminMembers } from "@/lib/notifications";

interface Props {
  poll: any;
  totalVoters: number;
}

export function ArchivedPollCard({ poll, totalVoters }: Props) {
  const options = poll.poll_options ?? [];
  const totalVotes = options.reduce((s: number, o: any) => s + (o.poll_votes?.length ?? 0), 0);
  const maxVotes = Math.max(...options.map((o: any) => o.poll_votes?.length ?? 0));
  const topPct = totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0;
  const isVedtatt = topPct >= poll.threshold;

  const isBussjef = useIsBussjef();
  const groupId = useGroupId();
  const { data: group } = useGroupInfo();
  const { data: memberId } = useMemberId();
  const { data: budgetItems = [] } = useBudgetItems();
  const { data: channels = [] } = useChatChannels();
  const queryClient = useQueryClient();
  const memberCount = group?.member_count ?? 1;

  const [dismissed, setDismissed] = useState(false);
  const [adding, setAdding] = useState(false);

  // Check if already added to budget
  const alreadyAdded = budgetItems.some(bi => (bi as any).source_poll_id === poll.id);

  const hasFinancial = poll.has_financial_impact && poll.financial_amount;
  const showAction = isVedtatt && hasFinancial && isBussjef && !alreadyAdded && !dismissed;
  const perMember = hasFinancial ? Math.round(Number(poll.financial_amount) / memberCount) : 0;

  const handleAddToBudget = async () => {
    if (!groupId || !memberId) return;
    setAdding(true);
    try {
      // Create or update budget item
      let budgetItemId = poll.financial_budget_item_id;
      
      if (!budgetItemId || budgetItemId === "new" || !budgetItems.find(bi => bi.id === budgetItemId)) {
        // Create new budget item
        const { data: newItem, error } = await supabase.from("budget_items").insert({
          group_id: groupId,
          name: poll.question.substring(0, 100),
          amount: Number(poll.financial_amount),
          source_type: "poll",
          source_poll_id: poll.id,
        }).select().single();
        if (error || !newItem) throw error;
        budgetItemId = newItem.id;
      } else {
        // Increase existing budget item amount
        const existing = budgetItems.find(bi => bi.id === budgetItemId);
        if (existing) {
          await supabase.from("budget_items").update({
            amount: Number(existing.amount) + Number(poll.financial_amount),
          }).eq("id", budgetItemId);
        }
      }

      // Add payment schedule if due date exists
      if (poll.financial_due_date && budgetItemId) {
        await supabase.from("budget_payment_schedule").insert({
          budget_item_id: budgetItemId,
          description: poll.question.substring(0, 100),
          amount: Number(poll.financial_amount),
          due_date: poll.financial_due_date,
        });
      }

      // Post announcement
      const announcementChannel = channels.find(c => c.type === "announcement");
      if (announcementChannel && memberId) {
        const totalBudget = budgetItems.reduce((s, bi) => s + Number(bi.amount), 0) + Number(poll.financial_amount);
        await supabase.from("chat_messages").insert({
          channel_id: announcementChannel.id,
          member_id: memberId,
          content: `📢 Budsjettet er oppdatert — ${poll.question} (${fmt(Number(poll.financial_amount))}) er lagt til etter avstemning. Ny totalbudsjett: ${fmt(totalBudget)}.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      queryClient.invalidateQueries({ queryKey: ["budget-payment-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["polls"] });

      // Notify all members about budget update
      if (groupId && memberId) {
        await notifyAllMembers(groupId, memberId, {
          type: "budget",
          title: "Budsjettet er oppdatert",
          description: `${poll.question} (${fmt(Number(poll.financial_amount))}) er lagt til etter avstemning`,
          link: "/budsjetter",
          icon: "budget",
        });
      }

      toast.success("Lagt til i budsjettet!");
    } catch {
      toast.error("Kunne ikke oppdatere budsjettet");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      {/* Vedtatt action box */}
      {showAction && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">✅ Vedtatt — oppdater budsjettet</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gruppen har vedtatt {poll.question}. Vil du legge til kostnaden ({fmt(Number(poll.financial_amount))}) i budsjettet?
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddToBudget} disabled={adding}>
              <ArrowRight className="w-4 h-4 mr-1" />
              {adding ? "Legger til..." : "Legg til i budsjettet"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDismissed(true)}>Senere</Button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{poll.question}</h3>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Krav: {poll.threshold}%</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Resultat: {topPct}%</span>
          </div>
        </div>
        <Badge className={`shrink-0 ${isVedtatt ? "bg-success/10 text-success border-success/20 hover:bg-success/10" : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10"}`} variant="outline">
          {isVedtatt ? "Vedtatt ✓" : "Ikke vedtatt ✗"}
        </Badge>
      </div>

      {/* Financial impact box */}
      {hasFinancial && (
        <div className="bg-accent/50 border border-border rounded-lg p-3 flex items-start gap-3">
          <Banknote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Økonomisk konsekvens: {fmt(Number(poll.financial_amount))}</p>
            <p className="text-xs text-muted-foreground">{fmt(perMember)} per medlem</p>
            {poll.financial_due_date && (
              <p className="text-xs text-muted-foreground">Forfallsdato: {new Date(poll.financial_due_date).toLocaleDateString("nb-NO")}</p>
            )}
            {alreadyAdded && (
              <p className="text-xs text-success mt-1 font-medium">✓ Lagt til i budsjettet</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {options.map((opt: any) => {
          const votes = opt.poll_votes?.length ?? 0;
          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isWinner = votes === maxVotes;
          return (
            <div key={opt.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isWinner && isVedtatt && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                  <span className={`text-sm ${isWinner && isVedtatt ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{opt.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{votes} stemmer</span>
                  <span className="text-sm font-semibold text-foreground ml-2">{pct}%</span>
                </div>
              </div>
              <Progress value={pct} className={`h-2 ${isWinner && isVedtatt ? "[&>div]:bg-success" : "[&>div]:bg-muted-foreground/20"}`} />
            </div>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground pt-1">{totalVotes} av {totalVoters} har stemt</div>
    </div>
  );
}
