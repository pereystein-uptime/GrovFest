import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Bell, Trash2, MessageSquare, Vote, LogIn, FileText, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { useIsBussjef, useIsAdmin, useMemberId, usePaymentPlan, useTransactions, useContracts, useGroupInfo, useGroupId, useRoles, fmt } from "@/hooks/useGroupData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { createNotifications, notifyAllMembers } from "@/lib/notifications";
import { ROLE_COLORS } from "./ManageRolesModal";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member: any;
  memberStatus?: { status: string; paid: number; expected: number; owing: number };
}

export function MemberDetailPanel({ open, onOpenChange, member, memberStatus }: Props) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [pendingRoleId, setPendingRoleId] = useState("");
  const isBussjef = useIsBussjef();
  const isAdmin = useIsAdmin();
  const { data: myMemberId } = useMemberId();
  const { data: paymentPlan = [] } = usePaymentPlan();
  const { data: transactions = [] } = useTransactions();
  const { data: contracts = [] } = useContracts();
  const { data: group } = useGroupInfo();
  const { data: roles = [] } = useRoles();
  const groupId = useGroupId();
  const queryClient = useQueryClient();
  const { refreshMemberInfo } = useAuth();

  if (!member) return null;

  const memberRole = member.roles || roles.find((r: any) => r.id === member.role_id);
  const roleName = memberRole?.name ?? member.role ?? "Medlem";
  const roleColor = memberRole?.color ?? "gray";
  const isMemberBussjef = memberRole?.name === "Bussjef" && memberRole?.is_default;

  const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const memberPayments = transactions.filter((t: any) => t.member_id === member.id && t.type === "in");
  const totalAllExpected = paymentPlan.reduce((s: number, p: any) => s + Number(p.amount_per_member), 0);
  const progressPct = totalAllExpected > 0 ? Math.min(100, Math.round(((memberStatus?.paid ?? 0) / totalAllExpected) * 100)) : 0;

  const memberContracts = contracts.filter((c: any) =>
    c.contract_signatures?.some((sig: any) => sig.member_id === member.id)
  );

  const chatMsgCount = "—";
  const pollCount = "—";

  const handleRoleChange = (newRoleId: string) => {
    if (newRoleId === member.role_id) return;
    setPendingRoleId(newRoleId);
    setRoleDialogOpen(true);
  };

  const pendingRole = roles.find((r: any) => r.id === pendingRoleId);

  const confirmRoleChange = async () => {
    if (!pendingRole) return;

    // Update member's role_id and legacy role field
    const legacyRole = pendingRole.name.toLowerCase() === "bussjef" ? "bussjef" : 
                       pendingRole.permission_level === "admin" ? "admin" : "medlem";
    await supabase.from("members").update({ 
      role_id: pendingRoleId, 
      role: legacyRole 
    } as any).eq("id", member.id);
    
    // Post announcement
    if (group && myMemberId) {
      const { data: annChannel } = await supabase
        .from("chat_channels")
        .select("id")
        .eq("group_id", group.id)
        .eq("type", "announcement")
        .maybeSingle();
      if (annChannel) {
        await supabase.from("chat_messages").insert({
          channel_id: annChannel.id,
          member_id: myMemberId,
          content: `📢 ${member.name} er nå ${pendingRole.name}`,
        });
      }
    }

    if (groupId) {
      await createNotifications({
        groupId,
        memberIds: [member.id],
        type: "member",
        title: "Du er nå " + pendingRole.name,
        description: `Rollen din er endret til ${pendingRole.name}`,
        link: "/medlemmer",
        icon: "member",
      });
    }

    queryClient.invalidateQueries({ queryKey: ["members"] });
    refreshMemberInfo();
    toast.success(`Rolle endret til ${pendingRole.name}`);
    setRoleDialogOpen(false);
  };

  const sendReminder = async () => {
    if (!myMemberId || !group) return;
    const owing = memberStatus?.owing ?? 0;

    const { data: existingDm } = await supabase
      .from("chat_channels")
      .select("id")
      .eq("group_id", group.id)
      .eq("type", "dm")
      .contains("participants", [myMemberId, member.id])
      .maybeSingle();

    let channelId = existingDm?.id;
    if (!channelId) {
      const { data: newDm } = await supabase
        .from("chat_channels")
        .insert({ group_id: group.id, type: "dm", name: "DM", participants: [myMemberId, member.id], created_by: myMemberId })
        .select("id")
        .single();
      channelId = newDm?.id;
    }

    if (channelId) {
      await supabase.from("chat_messages").insert({
        channel_id: channelId,
        member_id: myMemberId,
        content: `Hei ${member.name}, du har en utestående innbetaling på ${fmt(owing)}. Betal via Bank-siden.`,
      });
    }
    toast.success(`Påminnelse sendt til ${member.name}`);
  };

  const confirmRemove = async () => {
    await supabase.from("members").update({ removed_at: new Date().toISOString() } as any).eq("id", member.id);
    
    if (group && myMemberId) {
      const { data: annChannel } = await supabase
        .from("chat_channels")
        .select("id")
        .eq("group_id", group.id)
        .eq("type", "announcement")
        .maybeSingle();
      if (annChannel) {
        await supabase.from("chat_messages").insert({
          channel_id: annChannel.id,
          member_id: myMemberId,
          content: `📢 ${member.name} er fjernet fra gruppen`,
        });
      }

      if (groupId) {
        await notifyAllMembers(groupId, myMemberId, {
          type: "member",
          title: `${member.name} er fjernet`,
          description: `${member.name} er fjernet fra gruppen`,
          link: "/medlemmer",
          icon: "member",
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ["members"] });
    toast.success(`${member.name} er fjernet fra gruppen`);
    setRemoveDialogOpen(false);
    onOpenChange(false);
  };

  // Filter roles available for assignment - bussjef can assign any, can't assign bussjef role to others
  const assignableRoles = roles.filter((r: any) => {
    if (r.name === "Bussjef" && r.is_default) return false; // Can't assign bussjef to others
    return true;
  });

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 text-xl font-bold">
                <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">{member.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={ROLE_COLORS[roleColor] ?? ROLE_COLORS.gray}>
                    {roleName}
                  </Badge>
                  {memberRole?.permission_level === "admin" && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Admin</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{member.email || "—"}</p>
                <p className="text-xs text-muted-foreground">Medlem siden {format(new Date(member.joined_at), "d. MMMM yyyy", { locale: nb })}</p>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {/* Payment history */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Betalingshistorikk</h3>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Innbetalt</span>
                  <span className="font-semibold text-foreground">{fmt(memberStatus?.paid ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gjenstående</span>
                  <span className="font-semibold text-foreground">{fmt(memberStatus?.owing ?? 0)}</span>
                </div>
                <Progress value={progressPct} className="h-2" />
                <p className="text-xs text-muted-foreground">{progressPct}% av forventet innbetalt</p>
              </div>

              {paymentPlan.length > 0 && (
                <div className="mt-3 rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/30 text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="text-left px-4 py-2">Forfallsdato</th>
                        <th className="text-left px-4 py-2">Beløp</th>
                        <th className="text-left px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paymentPlan.map((p: any) => {
                        const dueDate = new Date(p.due_date);
                        const isPast = dueDate < new Date();
                        const paid = memberStatus?.paid ?? 0;
                        const cumulativeExpected = paymentPlan
                          .filter((pp: any) => new Date(pp.due_date) <= dueDate)
                          .reduce((s: number, pp: any) => s + Number(pp.amount_per_member), 0);
                        const isCovered = paid >= cumulativeExpected;

                        return (
                          <tr key={p.id}>
                            <td className="px-4 py-2.5 text-foreground">
                              {format(dueDate, "d. MMM yyyy", { locale: nb })}
                            </td>
                            <td className="px-4 py-2.5 text-foreground">{fmt(Number(p.amount_per_member))}</td>
                            <td className="px-4 py-2.5">
                              {isCovered ? (
                                <span className="flex items-center gap-1 text-success text-xs font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Betalt
                                </span>
                              ) : isPast ? (
                                <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                                  <AlertCircle className="w-3.5 h-3.5" /> Forfalt
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Kommende</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Contracts */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Kontrakter</h3>
              {memberContracts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ingen kontrakter</p>
              ) : (
                <div className="space-y-2">
                  {memberContracts.map((c: any) => {
                    const sig = c.contract_signatures?.find((s: any) => s.member_id === member.id);
                    return (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{c.title}</span>
                        </div>
                        {sig?.signed_at ? (
                          <Badge className="bg-success/15 text-success border-success/20">Signert ✓</Badge>
                        ) : sig?.opened_at ? (
                          <Badge className="bg-warning/15 text-warning border-warning/20">Åpnet</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Ikke åpnet</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Activity */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Aktivitet</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <LogIn className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Siste innlogging</p>
                  <p className="text-sm font-medium text-foreground">
                    {member.last_login_at ? format(new Date(member.last_login_at), "d. MMM", { locale: nb }) : "—"}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Meldinger</p>
                  <p className="text-sm font-medium text-foreground">{chatMsgCount}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <Vote className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Avstemninger</p>
                  <p className="text-sm font-medium text-foreground">{pollCount}</p>
                </div>
              </div>
            </div>

            {/* Admin actions - visible for bussjef, but can't edit bussjef role */}
            {isBussjef && !isMemberBussjef && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground">Administrer</h3>

                {/* Role change */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Endre rolle</label>
                  <Select value={member.role_id ?? ""} onValueChange={handleRoleChange}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Velg rolle" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          <span className="flex items-center gap-2">
                            {r.name}
                            <span className="text-xs text-muted-foreground">
                              ({r.permission_level === "admin" ? "Admin" : "Medlem"})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Send reminder */}
                {memberStatus && ["skyldig", "forfalt"].includes(memberStatus.status) && (
                  <Button variant="outline" className="w-full rounded-xl" onClick={sendReminder}>
                    <Bell className="w-4 h-4 mr-2" />
                    Send betalingspåminnelse
                  </Button>
                )}

                {/* Remove member */}
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                  onClick={() => setRemoveDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Fjern fra gruppen
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Role change dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Endre rolle</DialogTitle>
            <DialogDescription>
              Endre {member.name} sin rolle til {pendingRole?.name ?? ""}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Avbryt</Button>
            <Button onClick={confirmRoleChange}>Bekreft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove member dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fjern medlem</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil fjerne {member.name} fra gruppen? Dette kan ikke angres. Medlemmet vil miste tilgang til all gruppedata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>Avbryt</Button>
            <Button variant="destructive" onClick={confirmRemove}>Fjern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
