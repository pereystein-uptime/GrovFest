import { useSuppliers } from "@/hooks/useGroupData";
import { AlertTriangle, X } from "lucide-react";

export function FraradetTab() {
  const { data: suppliers = [] } = useSuppliers();
  const discouraged = suppliers.filter((s) => !s.verified);

  return (
    <>
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-destructive">Frarådede leverandører</p>
          <p className="text-xs text-muted-foreground mt-0.5">Disse leverandørene har fått gjentatte klager fra russegrupper. Manglende leveranser, dårlige vilkår, eller urealistiske løfter. Vi anbefaler å unngå disse.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {discouraged.map((v) => (
          <div key={v.id} className="bg-card rounded-xl border border-border p-5 hover:border-destructive/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-destructive/10 text-destructive">{v.logo_initials}</div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-foreground">{v.name}</span>
                <span className="ml-2 text-[10px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">⚠ Frarådet</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{v.category}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{v.description}</p>
            <ul className="space-y-1 mb-3">
              {(v.warnings ?? []).map((w: string) => (
                <li key={w} className="flex items-center gap-2 text-xs text-destructive"><X className="w-3 h-3 shrink-0" /> {w}</li>
              ))}
            </ul>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-destructive font-semibold">⭐ {Number(v.rating).toFixed(1)}</span>
              <span className="text-destructive font-semibold">{v.complaint_count} Klager</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
