import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function Step1Group({ data, update, onNext }: Props) {
  const valid = data.groupName.trim() && data.year && data.memberCount >= 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Opprett gruppen din</h2>
        <p className="text-muted-foreground mt-1">Fyll inn grunnleggende info om russegruppen</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Gruppenavn</Label>
          <Input value={data.groupName} onChange={e => update({ groupName: e.target.value })} placeholder='F.eks. "Bergansen 2026"' />
        </div>

        <div className="space-y-2">
          <Label>Avgangsår</Label>
          <Select value={String(data.year)} onValueChange={v => update({ year: Number(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
              <SelectItem value="2028">2028</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>By eller skole</Label>
          <Input value={data.city} onChange={e => update({ city: e.target.value })} placeholder="F.eks. Bergen" />
        </div>

        <div className="space-y-2">
          <Label>Antall medlemmer (inkludert deg)</Label>
          <Input type="number" min={2} max={100} value={data.memberCount} onChange={e => update({ memberCount: Number(e.target.value) })} />
        </div>
      </div>

      <Button onClick={onNext} disabled={!valid} className="w-full">Neste →</Button>
    </div>
  );
}
