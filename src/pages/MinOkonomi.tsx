import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PaymentModal } from "@/components/bank/PaymentModal";
import { useBudgetItems, useGroupInfo, useTransactions, useMemberId, fmt } from "@/hooks/useGroupData";
import { useMyPaymentStatus } from "@/hooks/useMyPaymentStatus";
import {
  Check,
  Clock,
  CircleDot,
  ArrowRight,
  Wallet,
  ChevronDown,
  ChevronUp,
  Circle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const CHART_COLORS = [
  "hsl(243, 100%, 68%)",
  "hsl(190, 90%, 50%)",
  "hsl(210, 80%, 60%)",
  "hsl(152, 85%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(270, 80%, 65%)",
  "hsl(330, 70%, 55%)",
];

const MinOkonomi = () => {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [overdueExpanded, setOverdueExpanded] = useState(false);
  const { data: group } = useGroupInfo();
  const { data: transactions } = useTransactions();
  const { data: budgetItems } = useBudgetItems();
  const { data: myMemberId } = useMemberId();

  const {
    installments,
    totalPaid,
    totalExpected,
    remaining,
    progressPct,
    overdueAmount,
    isAjour,
    nextInstallment,
    daysUntilNext,
    paidCount,
  } = useMyPaymentStatus();

  const now = new Date();
  const overdueItems = installments.filter((i) => i.status === "overdue");
  const nonOverdueItems = installments.filter((i) => i.status !== "overdue");
  const showNextPayment = nextInstallment && daysUntilNext !== null && daysUntilNext <= 14;

  // My transactions only
  const myTransactions = useMemo(
    () =>
      (transactions ?? [])
        .filter((t) => t.member_id === myMemberId && t.type === "in")
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [transactions, myMemberId]
  );

  // Budget chart data
  const budgetTotal = (budgetItems ?? []).reduce((s, b) => s + Number(b.amount), 0);
  const budgetChartData = (budgetItems ?? []).map((b) => ({
    name: b.name,
    value: Number(b.amount),
    pct: budgetTotal > 0 ? Math.round((Number(b.amount) / budgetTotal) * 100) : 0,
  }));

  const memberCount = group?.member_count ?? 1;
  const perMember = budgetTotal > 0 ? Math.round(budgetTotal / memberCount) : 0;

  // Next payment label
  function nextPaymentLabel() {
    if (!daysUntilNext && daysUntilNext !== 0) return "";
    if (daysUntilNext === 0) return "Forfaller i dag";
    if (daysUntilNext === 1) return "Forfaller i morgen";
    return `Forfaller om ${daysUntilNext} dager`;
  }

  return (
    <DashboardLayout
      title="Min økonomi"
      subtitle={`Din betalingsoversikt for ${group?.name ?? "..."}`}
    >
      <div className="space-y-6 max-w-[1200px]">
        {/* Status card */}
        <Card className="overflow-hidden">
          <div className={`p-6 md:p-8 ${isAjour ? "bg-[#F0FDF4]" : "bg-[#FFFBEB]"}`}>
            <div className="flex flex-col gap-4">
              {/* Status heading — soft, not alarming */}
              <div className="flex items-center gap-3">
                {isAjour ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-[#BBF7D0] flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#166534]" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[#166534]">Alt i orden — du er ajour ✓</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-[#FDE68A] flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#92400E]" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[#92400E]">Du har utestående innbetalinger</p>
                      <p className="text-sm text-[#A16207]">{fmt(overdueAmount)} gjenstår fra forfalte terminer</p>
                    </div>
                  </>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Innbetalt {fmt(totalPaid)} av {fmt(totalExpected)}</span>
                  <span>{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-3" />
              </div>

              {/* Two numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/80 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">Totalt innbetalt</p>
                  <p className="text-lg font-bold text-foreground">{fmt(totalPaid)}</p>
                </div>
                <div className="bg-card/80 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground">Gjenstående</p>
                  <p className="text-lg font-bold text-foreground">{fmt(remaining)}</p>
                </div>
              </div>

              {/* Next payment CTA — always blue/primary, inviting */}
              {showNextPayment && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Neste innbetaling: {fmt(nextInstallment!.amount)} · {nextPaymentLabel()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {nextInstallment!.dueDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setPayModalOpen(true)}>
                    Betal nå <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Standalone pay button if no next payment shown but has overdue */}
              {!showNextPayment && !isAjour && (
                <Button onClick={() => setPayModalOpen(true)} className="w-full rounded-xl h-11">
                  Betal nå <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Din innbetalingsplan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {/* Collapsed overdue summary */}
                {overdueItems.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setOverdueExpanded(!overdueExpanded)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-left transition-colors hover:bg-[#FDE68A]/60"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#D97706] flex items-center justify-center shrink-0">
                        <Circle className="w-3 h-3 text-[#D97706]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#92400E]">
                          {overdueItems.length} forfalt{overdueItems.length > 1 ? "e" : ""} innbetaling{overdueItems.length > 1 ? "er" : ""} · {fmt(overdueAmount)}
                        </p>
                        <p className="text-xs text-[#A16207]">
                          {overdueExpanded ? "Skjul detaljer" : "Vis detaljer"}
                        </p>
                      </div>
                      {overdueExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#A16207] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#A16207] shrink-0" />
                      )}
                    </button>

                    {/* Expanded overdue details */}
                    {overdueExpanded && (
                      <div className="mt-2 ml-4 pl-4 border-l-2 border-dashed border-[#FDE68A] space-y-2">
                        {overdueItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-1.5">
                            <div>
                              <p className="text-sm text-muted-foreground">{fmt(item.amount)}</p>
                              <p className="text-xs text-muted-foreground/70">
                                {item.dueDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                              <span className="text-[#A16207]">Forfalt</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Non-overdue items in timeline */}
                {nonOverdueItems.map((item, i) => (
                  <div key={item.id} className="flex gap-4 relative">
                    {i < nonOverdueItems.length - 1 && (
                      <div className="absolute left-[15px] top-[32px] w-0.5 h-[calc(100%)] bg-border" />
                    )}
                    <div className="relative z-10 mt-1 shrink-0">
                      {item.status === "paid" && (
                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--success))] flex items-center justify-center">
                          <Check className="w-4 h-4 text-[hsl(var(--success-foreground))]" />
                        </div>
                      )}
                      {item.status === "upcoming" && item.id === nextInstallment?.id && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/20 animate-pulse">
                          <CircleDot className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      {item.status === "upcoming" && item.id !== nextInstallment?.id && (
                        <div className="w-8 h-8 rounded-full border-2 border-border bg-card flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm font-semibold ${
                            item.status === "upcoming" && item.id === nextInstallment?.id ? "text-primary" : "text-foreground"
                          }`}>
                            {fmt(item.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.dueDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        {item.status === "paid" && (
                          <Badge variant="outline" className="text-[hsl(var(--success))] border-[hsl(var(--success))]/30 text-[10px]">Betalt</Badge>
                        )}
                        {item.status === "upcoming" && item.id === nextInstallment?.id && (
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                            {(() => {
                              const d = Math.ceil((item.dueDate.getTime() - now.getTime()) / 86400000);
                              if (d === 0) return "Forfaller i dag";
                              if (d === 1) return "Forfaller i morgen";
                              return `Forfaller om ${d} dager`;
                            })()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {installments.length > 0 && (
                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  Totalt: {fmt(totalExpected)} · {paidCount} av {installments.length} innbetalinger fullført
                </div>
              )}
              {installments.length === 0 && (
                <p className="text-sm text-muted-foreground">Ingen innbetalingsplan satt opp ennå.</p>
              )}
            </CardContent>
          </Card>

          {/* My transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mine innbetalinger</CardTitle>
            </CardHeader>
            <CardContent>
              {myTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Wallet className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Ingen innbetalinger registrert ennå</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTransactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[hsl(var(--success))]">+{fmt(Number(t.amount))}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget insight */}
        {budgetChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hva pengene går til</CardTitle>
              <CardDescription>Slik er gruppens budsjett fordelt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-48 h-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={budgetChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                        {budgetChartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => fmt(value)}
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {budgetChartData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-foreground flex-1">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.pct}%</span>
                      <span className="text-sm font-medium text-foreground w-28 text-right">{fmt(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                Din andel: ca. {fmt(perMember)} (totalt {fmt(budgetTotal)} ÷ {memberCount} medlemmer)
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <PaymentModal open={payModalOpen} onOpenChange={setPayModalOpen} />
    </DashboardLayout>
  );
};

export default MinOkonomi;
