import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const contractContent: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
  intern: {
    title: "Internkontrakt — Bergansen 2026",
    sections: [
      { heading: "§1 Formål", text: "Denne avtalen regulerer forholdet mellom det individuelle medlemmet og russegruppen «Bergansen 2026». Formålet er å sikre en trygg, inkluderende og økonomisk forsvarlig russefeiring for alle involverte parter." },
      { heading: "§2 Innbetalingsplan", text: "Medlemmet forplikter seg til å betale månedlige avdrag på 4 200 kr fra september 2025 til juni 2026, totalt 75 800 kr. Ved forsinket betaling påløper purregebyr på 200 kr etter 14 dager." },
      { heading: "§3 Plikter", text: "Medlemmet skal delta i dugnader, møter og felles aktiviteter som vedtatt av styret. Fravær uten gyldig grunn kan medføre trekk i privilegier." },
      { heading: "§4 Regler og oppførsel", text: "Alle medlemmer skal opptre respektfullt og inkluderende. Nulltoleranse for mobbing, trakassering eller hærverk. Brudd kan medføre utestengelse." },
      { heading: "§5 Konsekvenser ved brudd", text: "Ved vesentlig brudd på denne avtalen kan styret vedta suspensjon eller permanent utestengelse med 2/3 flertall. Innbetalte midler refunderes ikke ved selvforskyldt utestengelse." },
    ],
  },
  delplass: {
    title: "Delplass-kontrakt — Bergansen 2026",
    sections: [
      { heading: "§1 Formål", text: "Avtale for medlemmer med delplass. Spesifiserer tilgangsperioder og kostnadsandel." },
      { heading: "§2 Periode og tilgang", text: "Delplassmedlemmet har tilgang til bussen i avtalte perioder. Tilgang til arrangementer avtales separat." },
      { heading: "§3 Kostnader", text: "Redusert andel basert på avtalt bruksperiode. Betalingsplan tilpasses individuelt." },
    ],
  },
  buss: {
    title: "Leieavtale — Russebuss",
    sections: [
      { heading: "§1 Parter", text: "Avtale mellom Bergansen 2026 og bussleverandør om leie av russebuss for russeperioden 2026." },
      { heading: "§2 Leieobjekt", text: "Bussen leveres med avtalt utstyr og i kjørbar stand. Leveringsdato og tilstand spesifiseres i vedlegg." },
      { heading: "§3 Betalingsvilkår", text: "Leie betales i avtalte terminer. Depositum på 50 000 kr forfaller ved signering." },
      { heading: "§4 Forsikring", text: "Leietaker er ansvarlig for forsikring i leieperioden. Kaskoforsikring er obligatorisk." },
      { heading: "§5 Ansvar og skader", text: "Leietaker er ansvarlig for skader utover normal slitasje. Skader dokumenteres ved overtakelse og tilbakelevering." },
      { heading: "§6 Tilbakelevering", text: "Bussen returneres i rengjort stand innen avtalt dato. Forsinkelse medfører dagmulkt." },
    ],
  },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
}

export function ContractPreviewModal({ open, onOpenChange, templateId }: Props) {
  const content = templateId ? contractContent[templateId] : null;
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>Forhåndsvisning av kontraktsmal</DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 rounded-lg border border-border p-6 space-y-5 my-2">
          {content.sections.map((s) => (
            <div key={s.heading}>
              <h4 className="text-sm font-semibold text-foreground mb-1">{s.heading}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Lukk</Button>
          <Button>
            <Send className="h-4 w-4" />
            Send ut for signering
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
