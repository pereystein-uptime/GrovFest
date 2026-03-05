import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bus, CheckCircle, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

interface GroupInfo {
  id: string;
  name: string;
  member_count: number;
  archived_at: string | null;
}

const Join = () => {
  const navigate = useNavigate();
  const { code: urlCode } = useParams();
  const [inviteCode, setInviteCode] = useState(urlCode || "");
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [currentMembers, setCurrentMembers] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    if (urlCode) lookupCode(urlCode);
  }, [urlCode]);

  const lookupCode = async (code: string) => {
    if (!code.trim()) return;
    setCodeError("");
    setCodeVerified(false);
    setGroup(null);

    const { data } = await supabase
      .from("groups")
      .select("id, name, member_count, archived_at")
      .eq("invite_code", code.trim().toUpperCase())
      .maybeSingle();

    if (!data) {
      setCodeError("Ugyldig kode — sjekk med bussjefen din");
      return;
    }

    // Check if group is archived
    if ((data as any).archived_at) {
      setCodeError("Denne gruppen er arkivert og tar ikke imot nye medlemmer.");
      return;
    }

    // Count active members
    const { count } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", data.id)
      .is("removed_at", null);

    const activeCount = count ?? 0;

    if (activeCount >= data.member_count) {
      setCodeError(`Gruppen er full (${activeCount}/${data.member_count} medlemmer).`);
      return;
    }

    setGroup(data as GroupInfo);
    setCurrentMembers(activeCount);
    setCodeVerified(true);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codeVerified) {
      await lookupCode(inviteCode);
      return;
    }

    if (!group) return;

    if (password.length < 8) {
      toast.error("Passordet må være minst 8 tegn");
      return;
    }

    setLoading(true);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      toast.error("Noe gikk galt ved opprettelse av konto.");
      setLoading(false);
      return;
    }

    // 2. Check if user already is a member of this group
    const { data: existingMember } = await supabase
      .from("members")
      .select("id, removed_at")
      .eq("group_id", group.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMember && !existingMember.removed_at) {
      toast.info("Du er allerede medlem av denne gruppen!");
      navigate("/");
      setLoading(false);
      return;
    }

    // If previously removed, re-add by clearing removed_at
    if (existingMember && existingMember.removed_at) {
      await supabase
        .from("members")
        .update({ removed_at: null, name, email })
        .eq("id", existingMember.id);
      toast.success(`Velkommen tilbake til ${group.name}!`);
      navigate("/");
      setLoading(false);
      return;
    }

    // 3. Get the default "Medlem" role for this group
    const { data: medlemRole } = await supabase
      .from("roles")
      .select("id")
      .eq("group_id", group.id)
      .eq("name", "Medlem")
      .eq("is_default", true)
      .maybeSingle();

    // 4. Insert member
    const { error: memberError } = await supabase.from("members").insert({
      group_id: group.id,
      user_id: userId,
      name,
      email,
      role: "medlem",
      role_id: medlemRole?.id ?? null,
    });

    if (memberError) {
      console.error("Member insert error:", memberError);
      toast.error("Kunne ikke bli med i gruppen: " + memberError.message);
      setLoading(false);
      return;
    }

    // 5. Update group member count
    await supabase
      .from("groups")
      .update({ member_count: currentMembers + 1 })
      .eq("id", group.id);

    toast.success(`Velkommen til ${group.name}!`);
    navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Russebuss <span className="text-primary">OS</span>
          </h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold text-center">Bli med i en gruppe</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              {/* Invite code input */}
              <div className="space-y-2">
                <Label>Invitasjonskode</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value.toUpperCase());
                      setCodeVerified(false);
                      setCodeError("");
                    }}
                    placeholder="F.eks. X7K9AB"
                    className="font-mono tracking-wider"
                  />
                  {!codeVerified && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => lookupCode(inviteCode)}
                      disabled={!inviteCode.trim()}
                    >
                      Sjekk
                    </Button>
                  )}
                </div>

                {/* Code verified */}
                {codeVerified && group && (
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="font-medium">{group.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {currentMembers}/{group.member_count} medlemmer
                      </span>
                    </div>
                  </div>
                )}

                {/* Code error */}
                {codeError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{codeError}</span>
                  </div>
                )}
              </div>

              {/* Registration fields */}
              {codeVerified && (
                <>
                  <div className="space-y-2">
                    <Label>Fullt navn</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Ola Nordmann"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-post</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="din@epost.no"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passord</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minst 8 tegn"
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Blir med..." : `Bli med i ${group?.name} →`}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Har du allerede en konto?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Logg inn →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Join;
