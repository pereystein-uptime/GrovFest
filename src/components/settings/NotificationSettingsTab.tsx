import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useMemberId, useIsAdmin } from "@/hooks/useGroupData";

interface PrefItem {
  key: string;
  label: string;
  description: string;
  adminOnly?: boolean;
  locked?: boolean;
}

const sections: { title: string; items: PrefItem[] }[] = [
  {
    title: "Økonomi",
    items: [
      { key: "payment_reminder", label: "Innbetalingspåminnelser", description: "Påminnelse når innbetalingsfristen nærmer seg" },
      { key: "payment_received", label: "Innbetalinger mottatt", description: "Når et medlem betaler inn", adminOnly: true },
      { key: "budget_change", label: "Budsjettendringer", description: "Når budsjettet oppdateres" },
      { key: "liquidity_warning", label: "Likviditetsadvarsler", description: "Når innbetalingsplanen ikke dekker utgifter", adminOnly: true },
    ],
  },
  {
    title: "Avstemninger",
    items: [
      { key: "new_poll", label: "Nye avstemninger", description: "Når en ny avstemning opprettes" },
      { key: "poll_result", label: "Avstemningsresultater", description: "Når en avstemning er avsluttet" },
    ],
  },
  {
    title: "Chat",
    items: [
      { key: "mention", label: "Mentions", description: "Når noen nevner deg i en kanal" },
      { key: "announcement", label: "Kunngjøringer", description: "Viktige meldinger fra ledelsen", locked: true },
      { key: "direct_message", label: "Direktemeldinger", description: "Nye direktemeldinger" },
    ],
  },
  {
    title: "Kontrakter",
    items: [
      { key: "new_contract", label: "Nye kontrakter", description: "Når en kontrakt sendes til deg for signering" },
      { key: "sign_reminder", label: "Signeringspåminnelser", description: "Påminnelse om usignerte kontrakter" },
      { key: "contract_status", label: "Kontraktstatus", description: "Når medlemmer signerer", adminOnly: true },
    ],
  },
  {
    title: "Kalender",
    items: [
      { key: "event_reminder", label: "Hendelsespåminnelser", description: "Påminnelse 24 timer før hendelser" },
      { key: "new_event", label: "Nye hendelser", description: "Når en ny hendelse legges til" },
    ],
  },
];

export function NotificationSettingsTab() {
  const { data: myMemberId } = useMemberId();
  const isAdmin = useIsAdmin();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!myMemberId) return;
    supabase
      .from("notification_preferences")
      .select("notification_type, enabled")
      .eq("member_id", myMemberId)
      .then(({ data }) => {
        const map: Record<string, boolean> = {};
        (data ?? []).forEach(d => { map[d.notification_type] = d.enabled; });
        setPrefs(map);
      });
  }, [myMemberId]);

  const toggle = useCallback(async (key: string, value: boolean) => {
    if (!myMemberId) return;
    setPrefs(prev => ({ ...prev, [key]: value }));

    const { data: existing } = await supabase
      .from("notification_preferences")
      .select("id")
      .eq("member_id", myMemberId)
      .eq("notification_type", key)
      .maybeSingle();

    if (existing) {
      await supabase.from("notification_preferences").update({ enabled: value, updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("notification_preferences").insert({
        member_id: myMemberId,
        notification_type: key,
        enabled: value,
      });
    }

    setSaved(key);
    setTimeout(() => setSaved(null), 1500);
  }, [myMemberId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Varslingsinnstillinger</h2>
        <p className="text-sm text-muted-foreground">Velg hva du vil bli varslet om</p>
      </div>

      {sections.map(section => (
        <Card key={section.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {section.items
              .filter(item => !item.adminOnly || isAdmin)
              .map(item => {
                const enabled = item.locked ? true : (prefs[item.key] ?? true);
                return (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium cursor-pointer">{item.label}</Label>
                        {item.adminOnly && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Admin</span>
                        )}
                        {saved === item.key && (
                          <span className="text-[11px] text-[hsl(var(--success))] flex items-center gap-0.5 animate-in fade-in">
                            <Check className="w-3 h-3" /> Lagret
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    {item.locked ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Switch checked disabled className="opacity-50" />
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Kunngjøringer kan ikke skrus av</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Switch checked={enabled} onCheckedChange={v => toggle(item.key, v)} />
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
