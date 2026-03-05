import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Landmark, Smartphone, AlertTriangle } from "lucide-react";
import { useMyPaymentStatus } from "@/hooks/useMyPaymentStatus";
import { fmt } from "@/hooks/useGroupData";

const methods = [
  { id: "bank", label: "Bankoverføring", icon: Landmark },
  { id: "vipps", label: "Vipps", icon: Smartphone },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentModal({ open, onOpenChange }: Props) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<string | null>(null);
  const { toast } = useToast();

  const { installments, overdueAmount, remaining, nextInstallment } = useMyPaymentStatus();

  const overdueCount = installments.filter((i) => i.status === "overdue").length;
  const hasOverdue = overdueAmount > 0 && overdueCount > 0;

  const oneMonth = nextInstallment?.amount ?? 4200;
  const twoMonths = oneMonth * 2;

  type Preset = { key: string; label: string; amount: number; isOverdue?: boolean };

  const presets: Preset[] = [];

  if (hasOverdue) {
    presets.push({
      key: "ajour",
      label: "Ajourbetal",
      amount: overdueAmount,
      isOverdue: true,
    });
  }

  presets.push(
    { key: "one", label: "Én måned", amount: oneMonth },
    { key: "two", label: "To måneder", amount: twoMonths },
    { key: "all", label: "Alt gjenstående", amount: remaining },
    { key: "custom", label: "Valgfritt beløp", amount: 0 },
  );

  const reset = () => {
    setSelectedKey(null);
    setCustomAmount("");
    setMethod(null);
  };

  const selected = presets.find((p) => p.key === selectedKey);
  const amount = selected
    ? selected.amount === 0
      ? Number(customAmount) || 0
      : selected.amount
    : 0;

  const handleConfirm = () => {
    toast({
      title: "Betaling registrert",
      description: `${amount.toLocaleString("nb-NO")} kr vil bli trukket via ${method === "vipps" ? "Vipps" : "bankoverføring"}.`,
    });
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Betal inn</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Amount presets */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Velg beløp</Label>
            <div className="space-y-2">
              {/* Overdue option */}
              {hasOverdue && (
                <button
                  onClick={() => setSelectedKey("ajour")}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-l-4 border text-left text-sm transition-all ${
                    selectedKey === "ajour"
                      ? "border-l-destructive border-destructive/40 bg-destructive/5 ring-2 ring-destructive/20"
                      : "border-l-destructive border-border bg-card hover:bg-destructive/5"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Ajourbetal</span>
                      <span className="font-bold text-destructive">{fmt(overdueAmount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Du har {overdueCount} forfalt{overdueCount > 1 ? "e" : ""} innbetaling{overdueCount > 1 ? "er" : ""}. Betal {fmt(overdueAmount)} for å bli ajour.
                    </p>
                  </div>
                </button>
              )}

              {/* Regular presets */}
              <div className="grid grid-cols-2 gap-2">
                {presets.filter((p) => p.key !== "ajour").map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedKey(p.key)}
                    className={`flex flex-col items-center p-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedKey === p.key
                        ? "border-primary bg-accent text-accent-foreground ring-2 ring-primary/20"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="font-semibold">{p.label}</span>
                    {p.amount > 0 && (
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {fmt(p.amount)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom amount */}
          {selectedKey === "custom" && (
            <div>
              <Label htmlFor="custom-amount" className="text-sm font-medium">Beløp (kr)</Label>
              <Input
                id="custom-amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0"
                className="mt-1.5"
              />
            </div>
          )}

          {/* Payment method */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Betalingsmetode</Label>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    method === m.id
                      ? "border-primary bg-accent text-accent-foreground ring-2 ring-primary/20"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }}>
            Avbryt
          </Button>
          <Button disabled={amount <= 0 || !method} onClick={handleConfirm}>
            Bekreft betaling
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
