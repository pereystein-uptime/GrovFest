import { useMemo } from "react";
import { usePaymentPlan, useTransactions, useMemberId, useGroupInfo, fmt } from "@/hooks/useGroupData";

export type InstallmentStatus = "paid" | "overdue" | "upcoming";

export interface InstallmentItem {
  id: string;
  due_date: string;
  dueDate: Date;
  amount: number;
  status: InstallmentStatus;
}

export interface MyPaymentStatus {
  /** All installments with computed status */
  installments: InstallmentItem[];
  /** Sum of member's "in" transactions */
  totalPaid: number;
  /** Sum of all installment amounts */
  totalExpected: number;
  /** totalExpected - totalPaid, min 0 */
  remaining: number;
  /** Percentage paid of total expected */
  progressPct: number;
  /** Amount overdue (due so far minus paid, min 0) */
  overdueAmount: number;
  /** True when no overdue amount */
  isAjour: boolean;
  /** Next upcoming installment (first with status "upcoming") */
  nextInstallment: InstallmentItem | null;
  /** Days until next installment */
  daysUntilNext: number | null;
  /** Count of paid installments */
  paidCount: number;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Single source of truth for the logged-in user's payment status.
 *
 * Logic per installment:
 *  - Cumulate installment amounts in chronological order.
 *  - If cumulative total paid >= cumulative expected at that installment → "paid"
 *  - Else if due date is in the past (< today start-of-day) → "overdue"
 *  - Else → "upcoming"
 */
export function useMyPaymentStatus(): MyPaymentStatus {
  const { data: plan, isLoading: planLoading } = usePaymentPlan();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: myMemberId, isLoading: memberLoading } = useMemberId();

  const isLoading = planLoading || txLoading || memberLoading;

  return useMemo(() => {
    const allInstallments = (plan ?? [])
      .map((p) => ({
        id: p.id,
        due_date: p.due_date,
        dueDate: new Date(p.due_date),
        amount: Number(p.amount_per_member),
      }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    // Only count "in" transactions for this member
    const totalPaid = (transactions ?? [])
      .filter((t) => t.member_id === myMemberId && t.type === "in")
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalExpected = allInstallments.reduce((s, p) => s + p.amount, 0);

    // Start of today (midnight) so that an installment due today is NOT overdue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let cumulativeExpected = 0;
    const installments: InstallmentItem[] = allInstallments.map((inst) => {
      cumulativeExpected += inst.amount;
      const isPaid = totalPaid >= cumulativeExpected;
      const isPast = inst.dueDate < todayStart; // strictly before today

      let status: InstallmentStatus;
      if (isPaid) {
        status = "paid";
      } else if (isPast) {
        status = "overdue";
      } else {
        status = "upcoming";
      }

      return { ...inst, status };
    });

    const dueSoFar = allInstallments
      .filter((p) => p.dueDate < todayStart)
      .reduce((s, p) => s + p.amount, 0);
    const overdueAmount = Math.max(dueSoFar - totalPaid, 0);
    const remaining = Math.max(totalExpected - totalPaid, 0);
    const progressPct = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;
    const isAjour = overdueAmount <= 0;

    const nextInstallment = installments.find((i) => i.status === "upcoming") ?? null;
    const now = new Date();
    const daysUntilNext = nextInstallment
      ? Math.ceil((nextInstallment.dueDate.getTime() - now.getTime()) / 86400000)
      : null;
    const paidCount = installments.filter((i) => i.status === "paid").length;

    return {
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
      isLoading,
    };
  }, [plan, transactions, myMemberId, isLoading]);
}
