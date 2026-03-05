import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useGroupInfo, usePaymentPlan, useMembers, useIsBussjef, fmt } from "@/hooks/useGroupData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Upload, RefreshCw, Link as LinkIcon, AlertTriangle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function GroupSettingsTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: group } = useGroupInfo();
  const { data: plan } = usePaymentPlan();
  const { data: members } = useMembers();
  const isBussjef = useIsBussjef();
  const { signOut } = useAuth();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [year, setYear] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Dialogs
  const [newCodeDialog, setNewCodeDialog] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [archiveConfirmText, setArchiveConfirmText] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name);
      setCity(group.city ?? "");
      setYear(String(group.year));
      setLogoUrl((group as any).logo_url ?? null);
    }
  }, [group]);

  const hasChanged = group && (name !== group.name || city !== (group.city ?? "") || year !== String(group.year) || logoUrl !== ((group as any).logo_url ?? null));

  const handleSave = async () => {
    if (!group) return;
    setSaving(true);
    await supabase.from("groups").update({
      name, city: city || null, year: Number(year),
      logo_url: logoUrl,
    } as any).eq("id", group.id);
    qc.invalidateQueries({ queryKey: ["group-info"] });
    toast({ title: "Lagret", description: "Gruppeinnstillinger oppdatert." });
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !group) return;
    const ext = file.name.split(".").pop();
    const path = `${group.id}/logo.${ext}`;
    const { error } = await supabase.storage.from("group-logos").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Feil", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("group-logos").getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopiert!", description: `${label} kopiert til utklippstavlen.` });
  };

  const handleNewCode = async () => {
    if (!group) return;
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from("groups").update({ invite_code: newCode }).eq("id", group.id);
    qc.invalidateQueries({ queryKey: ["group-info"] });
    setNewCodeDialog(false);
    toast({ title: "Ny kode generert", description: `Den nye koden er ${newCode}.` });
  };

  const handleArchive = async () => {
    if (!group || archiveConfirmText !== group.name) return;
    await supabase.from("groups").update({ archived_at: new Date().toISOString() } as any).eq("id", group.id);
    setArchiveDialog(false);
    toast({ title: "Gruppen er arkivert", description: "Alle medlemmer mister tilgang. Kan reverseres innen 30 dager." });
    await signOut();
  };

  const handleDelete = async () => {
    if (!group || deleteConfirmText !== "SLETT") return;
    // Delete all related data
    const gid = group.id;
    await supabase.from("notification_preferences").delete().in("member_id",
      (await supabase.from("members").select("id").eq("group_id", gid)).data?.map(m => m.id) ?? []
    );
    await supabase.from("notifications").delete().eq("group_id", gid);
    await supabase.from("message_reads").delete().in("message_id",
      (await supabase.from("chat_messages").select("id").in("channel_id",
        (await supabase.from("chat_channels").select("id").eq("group_id", gid)).data?.map(c => c.id) ?? []
      )).data?.map(m => m.id) ?? []
    );
    await supabase.from("message_reactions").delete().in("message_id",
      (await supabase.from("chat_messages").select("id").in("channel_id",
        (await supabase.from("chat_channels").select("id").eq("group_id", gid)).data?.map(c => c.id) ?? []
      )).data?.map(m => m.id) ?? []
    );
    await supabase.from("message_attachments").delete().in("message_id",
      (await supabase.from("chat_messages").select("id").in("channel_id",
        (await supabase.from("chat_channels").select("id").eq("group_id", gid)).data?.map(c => c.id) ?? []
      )).data?.map(m => m.id) ?? []
    );
    await supabase.from("chat_messages").delete().in("channel_id",
      (await supabase.from("chat_channels").select("id").eq("group_id", gid)).data?.map(c => c.id) ?? []
    );
    await supabase.from("chat_channels").delete().eq("group_id", gid);
    await supabase.from("poll_votes").delete().in("poll_option_id",
      (await supabase.from("poll_options").select("id").in("poll_id",
        (await supabase.from("polls").select("id").eq("group_id", gid)).data?.map(p => p.id) ?? []
      )).data?.map(o => o.id) ?? []
    );
    await supabase.from("poll_options").delete().in("poll_id",
      (await supabase.from("polls").select("id").eq("group_id", gid)).data?.map(p => p.id) ?? []
    );
    await supabase.from("polls").delete().eq("group_id", gid);
    await supabase.from("contract_signatures").delete().in("contract_id",
      (await supabase.from("contracts").select("id").eq("group_id", gid)).data?.map(c => c.id) ?? []
    );
    await supabase.from("contracts").delete().eq("group_id", gid);
    await supabase.from("transactions").delete().eq("group_id", gid);
    await supabase.from("events").delete().eq("group_id", gid);
    await supabase.from("budget_payment_schedule").delete().in("budget_item_id",
      (await supabase.from("budget_items").select("id").eq("group_id", gid)).data?.map(b => b.id) ?? []
    );
    await supabase.from("budget_items").delete().eq("group_id", gid);
    await supabase.from("plan_change_log").delete().eq("group_id", gid);
    await supabase.from("payment_plan").delete().eq("group_id", gid);
    await supabase.from("roles").delete().eq("group_id", gid);
    await supabase.from("members").delete().eq("group_id", gid);
    await supabase.from("groups").delete().eq("id", gid);

    setDeleteDialog(false);
    toast({ title: "Gruppen er slettet", description: "All data er permanent fjernet." });
    await signOut();
  };

  const registeredCount = (members ?? []).filter(m => !m.invited_email || m.user_id).length;
  const totalCount = members?.length ?? 0;
  const inviteUrl = group ? `${window.location.origin}/join/${group.invite_code}` : "";
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Generelt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generelt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                {logoUrl && <AvatarImage src={logoUrl} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {name?.[0] ?? "G"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
              >
                <Upload className="w-3 h-3" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
            <div className="text-sm text-muted-foreground">Gruppebilde/logo</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Gruppenavn</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Avgangsår</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear + i).map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>By / Skole</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} className="mt-1" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={!hasChanged || saving}>
            {saving ? "Lagrer..." : "Lagre endringer"}
          </Button>
        </CardContent>
      </Card>

      {/* Invitasjon */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invitasjon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Invitasjonskode</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-lg font-mono font-bold bg-secondary px-4 py-2 rounded-lg tracking-widest">
                {group?.invite_code ?? "..."}
              </code>
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(group?.invite_code ?? "", "Invitasjonskode")}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Invitasjonslenke</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={inviteUrl} readOnly className="font-mono text-xs" />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(inviteUrl, "Invitasjonslenke")}>
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{registeredCount} av {totalCount} medlemmer registrert</span>
            <Button variant="outline" size="sm" onClick={() => setNewCodeDialog(true)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Generer ny kode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Innbetalingsplan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Innbetalingsplan</CardTitle>
        </CardHeader>
        <CardContent>
          {(plan ?? []).length > 0 ? (
            <div className="space-y-2 mb-4">
              {(plan ?? []).map(p => (
                <div key={p.id} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-muted-foreground">
                    {new Date(p.due_date).toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}
                  </span>
                  <span className="font-medium">{fmt(Number(p.amount_per_member))}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">Ingen innbetalingsplan satt opp.</p>
          )}
          <Button variant="link" className="px-0" onClick={() => navigate("/budsjetter")}>
            Rediger innbetalingsplan →
          </Button>
        </CardContent>
      </Card>

      {/* Faresone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Faresone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Arkiver gruppen</p>
              <p className="text-xs text-muted-foreground">Alle mister tilgang. Reversibel i 30 dager.</p>
            </div>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setArchiveDialog(true)}>
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Arkiver
            </Button>
          </div>

          {isBussjef && (
            <div className="flex items-center justify-between pt-4 border-t border-destructive/20">
              <div>
                <p className="text-sm font-medium text-destructive">Slett all data permanent</p>
                <p className="text-xs text-muted-foreground">Ikke reverserbar. Kun bussjef.</p>
              </div>
              <Button variant="destructive" onClick={() => { setDeleteStep(1); setDeleteDialog(true); }}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Slett gruppen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New code dialog */}
      <Dialog open={newCodeDialog} onOpenChange={setNewCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generer ny invitasjonskode?</DialogTitle>
            <DialogDescription>
              Den gamle koden slutter å fungere umiddelbart. Medlemmer som ikke har registrert seg ennå må få den nye koden. Fortsette?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCodeDialog(false)}>Avbryt</Button>
            <Button onClick={handleNewCode}>Generer ny kode</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive dialog */}
      <Dialog open={archiveDialog} onOpenChange={setArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arkiver gruppen</DialogTitle>
            <DialogDescription>
              Skriv inn gruppenavnet «{group?.name}» for å bekrefte.
            </DialogDescription>
          </DialogHeader>
          <Input value={archiveConfirmText} onChange={e => setArchiveConfirmText(e.target.value)} placeholder={group?.name} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialog(false)}>Avbryt</Button>
            <Button variant="destructive" disabled={archiveConfirmText !== group?.name} onClick={handleArchive}>
              Arkiver gruppen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteDialog} onOpenChange={v => { setDeleteDialog(v); setDeleteStep(1); setDeleteConfirmText(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Slett all data permanent</DialogTitle>
          </DialogHeader>
          {deleteStep === 1 ? (
            <>
              <DialogDescription>
                <strong>Denne handlingen kan ikke angres.</strong> Alle data knyttet til gruppen — medlemmer, budsjetter, transaksjoner, meldinger, kontrakter og avstemninger — vil bli permanent slettet.
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialog(false)}>Avbryt</Button>
                <Button variant="destructive" onClick={() => setDeleteStep(2)}>Jeg forstår, fortsett</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogDescription>
                Skriv «SLETT» for å bekrefte permanent sletting.
              </DialogDescription>
              <Input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="SLETT" />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialog(false)}>Avbryt</Button>
                <Button variant="destructive" disabled={deleteConfirmText !== "SLETT"} onClick={handleDelete}>
                  Slett alt permanent
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
