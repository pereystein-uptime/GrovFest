import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useMemberId } from "@/hooks/useGroupData";
import { Upload, LogOut, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

export function ProfileSettingsTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user, memberInfo, signOut, refreshMemberInfo } = useAuth();
  const { data: myMemberId } = useMemberId();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Leave group
  const [leaveDialog, setLeaveDialog] = useState(false);

  useEffect(() => {
    if (!myMemberId) return;
    supabase.from("members").select("name, phone, avatar_url").eq("id", myMemberId).single().then(({ data }) => {
      if (data) {
        setFullName(data.name);
        setPhone((data as any).phone ?? "");
        setAvatarUrl((data as any).avatar_url ?? null);
      }
    });
  }, [myMemberId]);

  const handleSave = async () => {
    if (!myMemberId) return;
    setSaving(true);
    await supabase.from("members").update({
      name: fullName,
      phone,
      avatar_url: avatarUrl,
    } as any).eq("id", myMemberId);
    qc.invalidateQueries({ queryKey: ["members"] });
    refreshMemberInfo();
    toast({ title: "Lagret", description: "Profilen din er oppdatert." });
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Feil", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(urlData.publicUrl);
  };

  // Password strength
  const pwStrength = newPw.length === 0 ? null : newPw.length < 8 ? "weak" : newPw.length < 12 ? "medium" : "strong";
  const pwMatch = confirmPw.length > 0 && newPw === confirmPw;
  const pwMismatch = confirmPw.length > 0 && newPw !== confirmPw;

  const handlePasswordChange = async () => {
    if (newPw.length < 8) { toast({ title: "For kort", description: "Passordet må ha minst 8 tegn.", variant: "destructive" }); return; }
    if (newPw !== confirmPw) { toast({ title: "Passord stemmer ikke", description: "Bekreftelsen matcher ikke.", variant: "destructive" }); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { toast({ title: "Feil", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Passord oppdatert", description: "Passordet ditt er endret." });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    }
    setPwSaving(false);
  };

  const handleLeaveGroup = async () => {
    if (!myMemberId) return;
    await supabase.from("members").update({ removed_at: new Date().toISOString() }).eq("id", myMemberId);
    setLeaveDialog(false);
    toast({ title: "Du har forlatt gruppen" });
    await signOut();
  };

  const initials = fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";

  return (
    <div className="space-y-6">
      {/* Personal info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Personlig informasjon</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{initials}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
              >
                <Upload className="w-3 h-3" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="text-sm text-muted-foreground">Profilbilde</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Fullt navn</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>E-post</Label>
              <Input value={user?.email ?? ""} readOnly className="mt-1 text-muted-foreground bg-muted" />
              <p className="text-[11px] text-muted-foreground mt-1">Kontakt bussjef for å endre</p>
            </div>
            <div>
              <Label>Telefonnummer (valgfritt)</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+47" className="mt-1" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Lagrer..." : "Lagre endringer"}
          </Button>
        </CardContent>
      </Card>

      {/* Role */}
      <Card>
        <CardHeader><CardTitle className="text-base">Rolle i gruppen</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge
              style={{ backgroundColor: `var(--role-${memberInfo?.role_color ?? "gray"})` }}
              className="text-xs"
            >
              {memberInfo?.role_name ?? memberInfo?.role}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {memberInfo?.permission_level === "admin" ? (
              <><Shield className="w-4 h-4 text-primary" /><span>Admin — du har utvidet tilgang</span></>
            ) : (
              <><User className="w-4 h-4 text-muted-foreground" /><span>Medlem — standard tilgang</span></>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Roller endres av bussjef</p>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader><CardTitle className="text-base">Bytt passord</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nåværende passord</Label>
            <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Nytt passord</Label>
            <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="mt-1" />
            {pwStrength && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-1">
                  <div className={`h-1 w-8 rounded-full ${pwStrength === "weak" ? "bg-destructive" : pwStrength === "medium" ? "bg-[hsl(var(--warning))]" : "bg-[hsl(var(--success))]"}`} />
                  <div className={`h-1 w-8 rounded-full ${pwStrength === "medium" || pwStrength === "strong" ? pwStrength === "medium" ? "bg-[hsl(var(--warning))]" : "bg-[hsl(var(--success))]" : "bg-muted"}`} />
                  <div className={`h-1 w-8 rounded-full ${pwStrength === "strong" ? "bg-[hsl(var(--success))]" : "bg-muted"}`} />
                </div>
                <span className={`text-xs ${pwStrength === "weak" ? "text-destructive" : pwStrength === "medium" ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--success))]"}`}>
                  {pwStrength === "weak" ? "Svak" : pwStrength === "medium" ? "Middels" : "Sterk"}
                </span>
              </div>
            )}
          </div>
          <div>
            <Label>Bekreft nytt passord</Label>
            <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="mt-1" />
            {pwMismatch && <p className="text-xs text-destructive mt-1">Passordene stemmer ikke overens</p>}
            {pwMatch && <p className="text-xs text-[hsl(var(--success))] mt-1">Passordene stemmer ✓</p>}
          </div>
          <Button onClick={handlePasswordChange} disabled={!newPw || !confirmPw || pwSaving || newPw.length < 8 || newPw !== confirmPw}>
            {pwSaving ? "Oppdaterer..." : "Oppdater passord"}
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader><CardTitle className="text-base">Konto</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Logg ut
          </Button>
          <div>
            <button onClick={() => setLeaveDialog(true)} className="text-sm text-destructive hover:underline">
              Forlat gruppen
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={leaveDialog} onOpenChange={setLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forlat gruppen?</DialogTitle>
            <DialogDescription>
              Er du sikker? Du mister tilgang til all gruppedata. Innbetalinger du har gjort vil ikke bli refundert gjennom plattformen. Kontakt bussjef ved spørsmål.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialog(false)}>Avbryt</Button>
            <Button variant="destructive" onClick={handleLeaveGroup}>Forlat gruppen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
