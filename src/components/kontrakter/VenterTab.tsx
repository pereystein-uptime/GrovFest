import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  contracts: any[];
}

export function VenterTab({ contracts }: Props) {
  const queryClient = useQueryClient();

  if (contracts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border px-6 py-16 text-center">
        <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Ingen kontrakter venter på signering</p>
      </div>
    );
  }

  const handlePurr = async (sigId: string, name: string) => {
    await supabase.from("contract_signatures").update({ sent_at: new Date().toISOString() }).eq("id", sigId);
    queryClient.invalidateQueries({ queryKey: ["contracts"] });
    toast.success(`Purring sendt til ${name}`);
  };

  return (
    <div className="space-y-5">
      {contracts.map((c) => {
        const sigs = c.contract_signatures ?? [];
        const signed = sigs.filter((s: any) => s.signed_at).length;
        const total = sigs.length;
        const pct = total > 0 ? Math.round((signed / total) * 100) : 0;
        const missing = sigs.filter((s: any) => !s.signed_at);

        return (
          <div key={c.id} className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Opprettet {new Date(c.created_at).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{c.type}</Badge>
            </div>

            {missing.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-3">Mangler signatur fra:</p>
                <div className="space-y-2">
                  {missing.map((s: any) => {
                    const name = s.members?.name ?? "Ukjent";
                    const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <div key={s.id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-warning">{initials}</span>
                          <div>
                            <span className="text-sm font-medium text-foreground">{name}</span>
                            <p className="text-xs text-muted-foreground">
                              Sendt {new Date(s.sent_at).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                              {s.opened_at ? ` · Åpnet ${new Date(s.opened_at).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}` : " · Ikke åpnet"}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handlePurr(s.id, name)}>Purring</Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{signed} av {total} har signert</span>
                <Progress value={pct} className="w-24 h-2" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
