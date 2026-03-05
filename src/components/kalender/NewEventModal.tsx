import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGroupId } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventTypes = [
  { value: "payment", label: "Innbetaling", dot: "bg-primary" },
  { value: "event", label: "Arrangement", dot: "bg-success" },
  { value: "deadline", label: "Frist", dot: "bg-warning" },
  { value: "meeting", label: "Møte", dot: "bg-destructive" },
];

export function NewEventModal({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [type, setType] = useState("meeting");
  const [description, setDescription] = useState("");
  const groupId = useGroupId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!title.trim() || !date || !groupId || !user) {
      toast.error("Fyll ut tittel og dato");
      return;
    }
    const { error } = await supabase.from("events").insert({
      group_id: groupId,
      title: title.trim(),
      description: description.trim() || null,
      event_type: type,
      event_date: date.toISOString(),
      created_by: user.id,
    });
    if (error) { toast.error("Kunne ikke lagre"); return; }
    queryClient.invalidateQueries({ queryKey: ["events"] });
    toast.success(`"${title}" lagt til i kalenderen`);
    setTitle(""); setDate(undefined); setType("meeting"); setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ny hendelse</DialogTitle>
          <DialogDescription>Legg til en hendelse i kalenderen</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Tittel</Label>
            <Input placeholder="Hva skjer?" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Dato</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Velg dato..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              {eventTypes.map((t) => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${type === t.value ? "border-primary bg-primary/5 ring-1 ring-primary/20 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground/40"}`}>
                  <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Beskrivelse (valgfritt)</Label>
            <Textarea placeholder="Legg til detaljer..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={handleSave}>Lagre hendelse</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
