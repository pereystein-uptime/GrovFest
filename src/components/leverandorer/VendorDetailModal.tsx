import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Globe, Building2, MapPin } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: any;
}

export function VendorDetailModal({ open, onOpenChange, vendor }: Props) {
  if (!vendor) return null;

  const contactRows = [
    { icon: Mail, label: "E-post", value: vendor.contact_email },
    { icon: Phone, label: "Telefon", value: vendor.contact_phone },
    { icon: Globe, label: "Nettside", value: vendor.website },
    { icon: Building2, label: "Org.nr", value: vendor.org_nr },
    { icon: MapPin, label: "Adresse", value: vendor.address },
  ].filter((r) => r.value);

  const priceGuide = vendor.price_guide ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: vendor.logo_color ?? "#1a1f36" }}>{vendor.logo_initials}</div>
            {vendor.name}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{vendor.description}</p>
        {contactRows.length > 0 && (
          <div className="space-y-1 mt-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Kontaktinformasjon</h4>
            {contactRows.map((r) => (
              <div key={r.label} className="flex items-center gap-3 py-1.5">
                <r.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground w-20">{r.label}</span>
                <span className="text-sm text-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        )}
        {priceGuide.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Prisguide</h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Tjeneste</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Pris</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {priceGuide.map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-foreground">{p.service}</td>
                      <td className="px-4 py-2 text-muted-foreground">{p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Lukk</Button>
          <Button>Kontakt leverandør</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
