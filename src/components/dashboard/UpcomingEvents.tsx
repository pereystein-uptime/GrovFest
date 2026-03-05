import { useEvents, usePaymentPlan } from "@/hooks/useGroupData";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";

export function UpcomingEvents() {
  const { data: events = [] } = useEvents();
  const { data: plan = [] } = usePaymentPlan();

  const now = new Date();
  
  // Merge payment plan dates as events
  const paymentEvents = plan
    .filter((p) => new Date(p.due_date) >= now)
    .map((p) => ({
      id: `pay-${p.id}`,
      title: "Innbetalingsfrist",
      description: `${Number(p.amount_per_member).toLocaleString("nb-NO")} kr per medlem`,
      event_date: p.due_date,
      event_type: "payment" as const,
    }));

  const allEvents = [
    ...events.filter((e) => new Date(e.event_date) >= now),
    ...paymentEvents,
  ].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()).slice(0, 3);

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Kommende hendelser</h3>
        <Link to="/kalender" className="text-sm text-primary font-medium hover:underline">Se alle →</Link>
      </div>
      {allEvents.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Ingen hendelser planlagt</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {allEvents.map((ev) => {
            const d = new Date(ev.event_date);
            const month = d.toLocaleDateString("nb-NO", { month: "short" }).toUpperCase().replace(".", "");
            const day = d.getDate().toString();
            return (
              <li key={ev.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-12 h-14 rounded-lg bg-secondary flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider">{month}</span>
                  <span className="text-lg font-bold text-foreground leading-tight">{day}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">{ev.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
