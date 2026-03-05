import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Inbox, Trash2, AlertTriangle, CheckCircle2, AlertCircle, X, Lightbulb, Vote } from "lucide-react";
import { NewPostingModal } from "@/components/budsjetter/NewPostingModal";
import { BudgetItemDetailPanel } from "@/components/budsjetter/BudgetItemDetailPanel";
import { useBudgetItems, useTransactions, useGroupInfo, useIsAdmin, useBudgetPaymentSchedules, fmt } from "@/hooks/useGroupData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Budsjetter = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => localStorage.getItem("budget-tip-dismissed") === "true");

  const { data: items = [] } = useBudgetItems();
  const { data: transactions = [] } = useTransactions();
  const { data: group } = useGroupInfo();
  const { data: schedules = [] } = useBudgetPaymentSchedules();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();

  const totalBudget = items.reduce((s, i) => s + Number(i.amount), 0);
  const balance = transactions.reduce((s, t) => s + (t.type === "in" ? Number(t.amount) : -Number(t.amount)), 0);
  const progressPct = totalBudget > 0 ? Math.min(100, Math.round((balance / totalBudget) * 100)) : 0;
  const memberCount = group?.member_count ?? 1;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await supabase.from("budget_items").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["budget-items"] });
    toast.success("Postering slettet");
  };

  const handleRowClick = (item: any) => {
    if (!isAdmin) return;
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("budget-tip-dismissed", "true");
  };

  const getNextDue = (itemId: string) => {
    const itemSchedules = schedules
      .filter(s => s.budget_item_id === itemId && new Date(s.due_date) > new Date())
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    if (itemSchedules.length === 0) return null;
    const next = itemSchedules[0];
    const daysUntil = differenceInDays(new Date(next.due_date), new Date());
    const enough = balance >= Number(next.amount);
    let status: "covered" | "warning" | "urgent" = "covered";
    if (!enough && daysUntil < 30) status = "urgent";
    else if (!enough) status = "warning";
    return { date: new Date(next.due_date), status, amount: Number(next.amount) };
  };

  const hasItemsWithoutDates = items.some(i => !schedules.some(s => s.budget_item_id === i.id));

  return (
    <DashboardLayout title="Budsjetter" subtitle="Budsjettstyring og kategorier">
      <div className="space-y-6 max-w-[1200px]">
        {isAdmin && !bannerDismissed && items.length > 0 && hasItemsWithoutDates && (
          <div className="bg-accent/60 rounded-xl p-4 flex items-start gap-3 relative">
            <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Tips: Legg inn når leverandørene skal ha betalt</p>
              <p className="text-sm text-muted-foreground">Så hjelper vi deg å planlegge innbetalingene. Klikk på en postering for å komme i gang.</p>
            </div>
            <button onClick={dismissBanner} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Totalbudsjett</p>
            <p className="text-4xl font-bold text-foreground mt-1">{fmt(totalBudget)}</p>
            <p className="text-sm text-muted-foreground mt-1">{fmt(Math.round(totalBudget / memberCount))} per medlem · {memberCount} medlemmer</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2.5 font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Ny postering
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground font-medium mb-1">Innbetalt totalt</p>
            <p className="text-2xl font-bold text-foreground">{fmt(balance)}</p>
            <Progress value={progressPct} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">{progressPct}% av totalbudsjett</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground font-medium mb-1">Gjenstående</p>
            <p className="text-2xl font-bold text-foreground">{fmt(Math.max(0, totalBudget - balance))}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground font-medium mb-1">Antall posteringer</p>
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-card rounded-xl border border-border px-6 py-16 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Ingen budsjettposteringer ennå</p>
            {isAdmin && <p className="text-xs text-muted-foreground mt-1">Klikk «Ny postering» for å komme i gang</p>}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Budsjettfordeling</h3>
            </div>
            <div className="overflow-x-auto">
              <TooltipProvider>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                      <th className="text-left px-6 py-3">Postering</th>
                      <th className="text-left px-4 py-3">Budsjettert</th>
                      <th className="text-left px-4 py-3">Andel</th>
                      <th className="text-left px-4 py-3">Innbetalt</th>
                      <th className="text-left px-4 py-3">Gjenstående</th>
                      <th className="text-left px-4 py-3">Neste forfall</th>
                      <th className="text-left px-4 py-3 pr-6">Fremdrift</th>
                      {isAdmin && <th className="px-4 py-3"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => {
                      const share = totalBudget > 0 ? ((Number(item.amount) / totalBudget) * 100).toFixed(1) : "0";
                      const paid = Math.round(Number(item.amount) * (progressPct / 100));
                      const remaining = Number(item.amount) - paid;
                      const nextDue = getNextDue(item.id);
                      const hasMissingDates = !schedules.some(s => s.budget_item_id === item.id);

                      return (
                        <tr
                          key={item.id}
                          className={cn("hover:bg-secondary/50 transition-colors", isAdmin && "cursor-pointer")}
                          onClick={() => handleRowClick(item)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {hasMissingDates && isAdmin && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="w-2 h-2 rounded-full bg-warning shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent>Legg inn forfallsdatoer</TooltipContent>
                                </Tooltip>
                              )}
                              {(item as any).source_type === "poll" && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Vote className="w-4 h-4 text-primary shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent>Vedtatt ved avstemning</TooltipContent>
                                </Tooltip>
                              )}
                              <p className="font-medium text-foreground">{item.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium text-foreground">{fmt(Number(item.amount))}</td>
                          <td className="px-4 py-4 text-muted-foreground">{share}%</td>
                          <td className="px-4 py-4 text-foreground">{fmt(paid)}</td>
                          <td className="px-4 py-4 text-foreground">{fmt(remaining)}</td>
                          <td className="px-4 py-4">
                            {nextDue ? (
                              <div className="flex items-center gap-1.5">
                                {nextDue.status === "covered" && <CheckCircle2 className="w-4 h-4 text-success" />}
                                {nextDue.status === "warning" && <AlertTriangle className="w-4 h-4 text-warning" />}
                                {nextDue.status === "urgent" && <AlertCircle className="w-4 h-4 text-destructive" />}
                                <span className={cn("text-sm", nextDue.status === "covered" && "text-success", nextDue.status === "warning" && "text-warning", nextDue.status === "urgent" && "text-destructive")}>
                                  {format(nextDue.date, "d. MMM", { locale: nb })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {isAdmin ? "Sett dato →" : "—"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 pr-6">
                            <div className="flex items-center gap-2">
                              <Progress value={progressPct} className="h-2 w-16" />
                              <span className="text-xs text-muted-foreground">{progressPct}%</span>
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-4">
                              <button onClick={(e) => handleDelete(e, item.id)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
      <NewPostingModal open={modalOpen} onOpenChange={setModalOpen} />
      <BudgetItemDetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedItem}
      />
    </DashboardLayout>
  );
};

export default Budsjetter;
