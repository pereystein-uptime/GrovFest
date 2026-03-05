import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents, usePaymentPlan } from "@/hooks/useGroupData";

const eventTypeColors: Record<string, { dot: string; bg: string; text: string }> = {
  payment: { dot: "bg-primary", bg: "bg-primary/5", text: "text-primary" },
  event: { dot: "bg-success", bg: "bg-success/5", text: "text-success" },
  deadline: { dot: "bg-warning", bg: "bg-warning/5", text: "text-warning" },
  meeting: { dot: "bg-destructive", bg: "bg-destructive/5", text: "text-destructive" },
};

interface Props {
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
  selectedDate: string | null;
  onSelectDate: (d: string | null) => void;
}

const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MONTH_NAMES = ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfWeek(year: number, month: number) { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; }

export function MonthGrid({ currentMonth, onMonthChange, selectedDate, onSelectDate }: Props) {
  const { data: events = [] } = useEvents();
  const { data: plan = [] } = usePaymentPlan();

  // Convert payment plan to virtual events
  const paymentEvents = plan.map((p) => ({
    id: `pay-${p.id}`,
    title: "Innbetalingsfrist",
    event_date: p.due_date,
    event_type: "payment",
  }));
  const allEvents = [...events, ...paymentEvents];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));
  const goToday = () => { onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1)); onSelectDate(todayStr); };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const eventsForDay = (day: number) => {
    const dateStr = getDateStr(day);
    return allEvents.filter((e) => {
      const d = new Date(e.event_date);
      const eStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return eStr === dateStr;
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-base font-semibold text-foreground min-w-[160px] text-center">{MONTH_NAMES[month]} {year}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>I dag</Button>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-semibold text-muted-foreground uppercase py-2.5">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-24 border-b border-r border-border last:border-r-0 bg-muted/20" />;
          const dateStr = getDateStr(day);
          const dayEvents = eventsForDay(day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button key={dateStr} onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`h-24 border-b border-r border-border text-left p-2 transition-colors hover:bg-accent/30 relative ${isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}`}>
              <span className={`text-sm font-medium ${isToday ? "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center" : "text-foreground"}`}>{day}</span>
              {dayEvents.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const cfg = eventTypeColors[ev.event_type] ?? eventTypeColors.event;
                      return <span key={ev.id} className={`w-2 h-2 rounded-full ${cfg.dot}`} />;
                    })}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const cfg = eventTypeColors[ev.event_type] ?? eventTypeColors.event;
                      return (
                        <div key={ev.id} className={`text-[10px] font-medium truncate leading-tight px-1 py-0.5 rounded ${cfg.bg}`}>
                          <span className={cfg.text}>{ev.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} til</span>}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
