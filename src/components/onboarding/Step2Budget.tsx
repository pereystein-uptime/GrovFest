import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function Step2Budget({ data, update, onNext }: Props) {
  const items = data.budgetItems;
  const sum = items.reduce((s, i) => s + (i.amount || 0), 0);
  const perMember = data.totalBudget > 0 && data.memberCount > 0 ? Math.round(data.totalBudget / data.memberCount) : 0;
  const sumMatches = sum === data.totalBudget;
  const validItems = items.filter(i => i.name && i.amount > 0).length > 0;

  const setItem = (idx: number, field: "name" | "amount", val: string | number) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: field === "amount" ? Number(val) : val };
    update({ budgetItems: next });
  };

  const addItem = () => update({ budgetItems: [...items, { name: "", amount: 0 }] });
  const removeItem = (idx: number) => update({ budgetItems: items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sett opp budsjettet</h2>
        <p className="text-muted-foreground mt-1">Definer totalbudsjett og posteringer</p>
      </div>

      <div className="space-y-2">
        <Label>Totalbudsjett</Label>
        <div className="relative">
          <Input
            type="number"
            value={data.totalBudget || ""}
            onChange={e => update({ totalBudget: Number(e.target.value) })}
            placeholder="0"
            className="pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kr</span>
        </div>
        {perMember > 0 && (
          <p className="text-sm text-muted-foreground">
            {perMember.toLocaleString("nb-NO")} kr per medlem · {data.memberCount} medlemmer
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Budsjettposteringer</Label>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Input
              value={item.name}
              onChange={e => setItem(idx, "name", e.target.value)}
              placeholder="F.eks. Russebuss"
              className="flex-1"
            />
            <div className="relative w-32">
              <Input
                type="number"
                value={item.amount || ""}
                onChange={e => setItem(idx, "amount", e.target.value)}
                placeholder="0"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kr</span>
            </div>
            {items.length > 1 && (
              <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Legg til postering
        </Button>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium text-foreground">Sum posteringer</span>
          <span className={`text-sm font-bold ${sumMatches ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
            {sum.toLocaleString("nb-NO")} kr
          </span>
        </div>
        {!sumMatches && data.totalBudget > 0 && validItems && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="w-3.5 h-3.5" />
            Summen matcher ikke totalbudsjettet ({(data.totalBudget - sum).toLocaleString("nb-NO")} kr {sum < data.totalBudget ? "gjenstår" : "over"})
          </div>
        )}
      </div>

      <Button onClick={onNext} disabled={!sumMatches || !validItems} className="w-full">Neste →</Button>
    </div>
  );
}
