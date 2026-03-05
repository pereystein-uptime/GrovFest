import { useEvents, usePaymentPlan, fmt } from "@/hooks/useGroupData";
import { CalendarDays } from "lucide-react";

const typeLabels: Record<string, string> = { payment: "Innbetaling", event: "Arrangement", deadline: "Frist", meeting: "Møte" };
const typeColors: Record<string, string> = { payment: "border-l-primary text-primary", event: "border-l-success text-success", deadline: "border-l-warning text-warning", meeting: "border-l-destructive text-destructive" };

interface Props {
  selectedDate: string | null;
}

export function EventSidebar({ selectedDate }: Props) {
  const { data: events = [] } = useEvents();
  const { data: plan = [] } = usePaymentPlan();

  const paymentEvents = plan.map((p) => ({
    id: `pay-${p.id}`,
    title: "Innbetalingsfrist",
    description: `${fmt(Number(p.amount_per_member))} per medlem`,
    event_date: p.due_date,
    event_type: "payment",
  }));

  const all = [...events, ...paymentEvents];

  const filtered = selectedDate
    ? all.filter((e) => {
        const d = new Date(e.event_date);
        const eStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return eStr === selectedDate;
      })
    : all.filter((e) => new Date(e.event_date) >= new Date());

  const sorted = [...filtered].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  };

  return (
    <div className="w-[320px] shrink-0">
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">
            {selectedDate ? `Hendelser ${formatDate(selectedDate)}` : "Kommende hendelser"}
          </h3>
          {selectedDate && <p className="text-xs text-muted-foreground mt-0.5">{sorted.length} hendelse(r)</p>}
        </div>

        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {sorted.length === 0 && (
            <div className="px-5 py-8 text-center">
              <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{selectedDate ? "Ingen hendelser denne dagen" : "Ingen kommende hendelser"}</p>
            </div>
          )}
          {sorted.map((ev) => {
            const color = typeColors[ev.event_type] ?? typeColors.event;
            return (
              <div key={ev.id} className={`px-5 py-3.5 border-l-[3px] ${color.split(" ")[0]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-muted-foreground">{formatDate(ev.event_date)}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
                    {typeLabels[ev.event_type] ?? ev.event_type}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{ev.title}</p>
                {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
