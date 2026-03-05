import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Bus, FileText } from "lucide-react";
import { ContractPreviewModal } from "./ContractPreviewModal";

const templates = [
  {
    id: "intern",
    title: "Internkontrakt",
    icon: Users,
    iconBg: "bg-primary/10 text-primary",
    description: "Standard avtale mellom gruppemedlem og russegruppen. Dekker plikter, innbetalingsplan, regler og konsekvenser ved brudd.",
    pages: 4,
    updated: "12. jan 2026",
  },
  {
    id: "delplass",
    title: "Delplass-kontrakt",
    icon: UserPlus,
    iconBg: "bg-success/10 text-success",
    description: "Avtale for medlemmer med delplass på bussen. Spesifiserer perioder, andel av kostnad, og tilgang til arrangementer.",
    pages: 3,
    updated: "20. jan 2026",
  },
  {
    id: "buss",
    title: "Leie av buss — avtale",
    icon: Bus,
    iconBg: "bg-warning/10 text-warning",
    description: "Leieavtale mellom russegruppen og bussleverandør. Vilkår, betalingsplan, forsikring, leveringsdato og ansvarsfordeling.",
    pages: 6,
    updated: "8. feb 2026",
  },
];

export function MalerTab() {
  const [previewId, setPreviewId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {templates.map((t) => (
          <div key={t.id} className="bg-card rounded-xl border border-border p-5 flex flex-col">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${t.iconBg}`}>
              <t.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{t.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">{t.description}</p>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-3 mb-4">
              <FileText className="h-3 w-3" />
              {t.pages} sider · Sist oppdatert: {t.updated}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewId(t.id)}>
                Forhåndsvis
              </Button>
              <Button size="sm" className="flex-1">Send ut</Button>
            </div>
          </div>
        ))}
      </div>
      <ContractPreviewModal
        open={!!previewId}
        onOpenChange={() => setPreviewId(null)}
        templateId={previewId}
      />
    </>
  );
}
