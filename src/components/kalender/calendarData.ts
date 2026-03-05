export type EventType = "innbetaling" | "arrangement" | "frist" | "møte";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: EventType;
}

export const eventTypeConfig: Record<EventType, { label: string; color: string; dot: string }> = {
  innbetaling: { label: "Innbetaling", color: "border-l-primary text-primary bg-primary/5", dot: "bg-primary" },
  arrangement: { label: "Arrangement", color: "border-l-success text-success bg-success/5", dot: "bg-success" },
  frist: { label: "Frist", color: "border-l-warning text-warning bg-warning/5", dot: "bg-warning" },
  møte: { label: "Møte", color: "border-l-destructive text-destructive bg-destructive/5", dot: "bg-destructive" },
};

export const calendarEvents: CalendarEvent[] = [
  { id: "1", title: "Innbetalingsfrist", description: "4 200 kr per medlem", date: "2026-03-01", type: "innbetaling" },
  { id: "2", title: "Signeringsfrist internkontrakt", description: "3 gjenstår", date: "2026-03-01", type: "frist" },
  { id: "3", title: "Gruppemøte", description: "Agenda: buss-status og slippfest", date: "2026-03-08", time: "18:00", type: "møte" },
  { id: "4", title: "Wrapping-dag hos Fristil", description: "Heldagsarrangement", date: "2026-03-15", time: "09:00–16:00", type: "arrangement" },
  { id: "5", title: "Styremøte ledelse", description: "Budsjettgjennomgang", date: "2026-03-22", time: "19:00", type: "møte" },
  { id: "6", title: "Frist artistbooking", description: "Må bestemme innen denne dato", date: "2026-03-28", type: "frist" },
  { id: "7", title: "Innbetalingsfrist", description: "4 200 kr per medlem", date: "2026-04-01", type: "innbetaling" },
  { id: "8", title: "Buss-henting hos Fristil", description: "Scania leveres 🚌", date: "2026-04-14", time: "10:00", type: "arrangement" },
  { id: "9", title: "Russetiden starter!", description: "🎉", date: "2026-04-17", type: "arrangement" },
];
