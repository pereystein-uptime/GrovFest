import { TrendingUp, Landmark } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMyPaymentStatus } from "@/hooks/useMyPaymentStatus";
import { fmt } from "@/hooks/useGroupData";

interface Props {
  onPayClick: () => void;
}

export function PaymentStatusCard({ onPayClick }: Props) {
  const { totalPaid, totalExpected, progressPct, remaining } = useMyPaymentStatus();

  return (
    <div className="bg-card rounded-xl border border-border p-6 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground font-medium">Min innbetaling</p>
        <TrendingUp className="w-5 h-5 text-muted-foreground/50" />
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">
          {fmt(totalPaid)} <span className="text-base font-normal text-muted-foreground">av {fmt(totalExpected)}</span>
        </p>
        <Progress value={progressPct} className="mt-3 h-2.5" />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">{progressPct}% innbetalt</p>
          <p className="text-xs text-muted-foreground">Gjenstående: {fmt(remaining)}</p>
        </div>
      </div>
      <Button onClick={onPayClick} className="w-full mt-4 rounded-xl h-11 font-semibold">
        <Landmark className="w-4 h-4 mr-2" />
        Betal inn nå
      </Button>
    </div>
  );
}
