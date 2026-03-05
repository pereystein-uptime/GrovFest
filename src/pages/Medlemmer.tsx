import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Search, Users, CheckCircle2, AlertTriangle, Bell, Settings } from "lucide-react";
import { useMembers, useGroupInfo, usePaymentPlan, useTransactions, useIsBussjef, useMemberId, useRoles, fmt } from "@/hooks/useGroupData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MemberDetailPanel } from "@/components/medlemmer/MemberDetailPanel";
import { ManageRolesModal, ROLE_COLORS } from "@/components/medlemmer/ManageRolesModal";

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const Medlemmer = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);

  const { data: members = [] } = useMembers();
  const { data: group } = useGroupInfo();
  const { data: paymentPlan = [] } = usePaymentPlan();
  const { data: transactions = [] } = useTransactions();
  const { data: myMemberId } = useMemberId();
  const { data: roles = [] } = useRoles();
  const isBussjef = useIsBussjef();

  const memberStatuses = useMemo(() => {
    const now = new Date();
    const statuses: Record<string, { status: "ajour" | "skyldig" | "forfalt" | "invitert"; paid: number; expected: number; owing: number }> = {};

    const activeMembers = members.filter((m: any) => !m.removed_at);

    for (const member of activeMembers) {
      if ((member as any).invited_email && !member.user_id) {
        statuses[member.id] = { status: "invitert", paid: 0, expected: 0, owing: 0 };
        continue;
      }

      const pastDue = paymentPlan.filter(p => new Date(p.due_date) <= now);
      const totalExpected = pastDue.reduce((s, p) => s + Number(p.amount_per_member), 0);
      const memberPayments = transactions.filter(t => t.member_id === member.id && t.type === "in");
      const totalPaid = memberPayments.reduce((s, t) => s + Number(t.amount), 0);
      const owing = Math.max(0, totalExpected - totalPaid);
      const hasOverdue = pastDue.some(p => {
        const dueDate = new Date(p.due_date);
        return dueDate < now && totalPaid < totalExpected;
      });

      if (owing <= 0) {
        statuses[member.id] = { status: "ajour", paid: totalPaid, expected: totalExpected, owing: 0 };
      } else if (hasOverdue) {
        statuses[member.id] = { status: "forfalt", paid: totalPaid, expected: totalExpected, owing };
      } else {
        statuses[member.id] = { status: "skyldig", paid: totalPaid, expected: totalExpected, owing };
      }
    }
    return statuses;
  }, [members, paymentPlan, transactions]);

  const activeMembers = members.filter((m: any) => !m.removed_at);

  const filteredMembers = useMemo(() => {
    let list = activeMembers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    if (filter === "ajour") list = list.filter(m => memberStatuses[m.id]?.status === "ajour");
    if (filter === "skyldig") list = list.filter(m => ["skyldig", "forfalt"].includes(memberStatuses[m.id]?.status ?? ""));
    if (filter === "invitert") list = list.filter(m => memberStatuses[m.id]?.status === "invitert");
    return list;
  }, [activeMembers, search, filter, memberStatuses]);

  const totalCount = activeMembers.length;
  const activeCount = activeMembers.filter(m => memberStatuses[m.id]?.status === "ajour").length;
  const owingCount = activeMembers.filter(m => ["skyldig", "forfalt"].includes(memberStatuses[m.id]?.status ?? "")).length;

  const copyInviteLink = async () => {
    if (!group?.invite_code) return;
    const url = `${window.location.origin}/join/${group.invite_code}`;
    await navigator.clipboard.writeText(url);
    toast.success("Invitasjonslenke kopiert!");
  };

  const sendReminderToAll = async () => {
    const owingMembers = activeMembers.filter(m => ["skyldig", "forfalt"].includes(memberStatuses[m.id]?.status ?? ""));
    if (owingMembers.length === 0) return;

    for (const member of owingMembers) {
      if (member.id === myMemberId) continue;
      const owing = memberStatuses[member.id]?.owing ?? 0;
      
      const { data: existingDm } = await supabase
        .from("chat_channels")
        .select("id")
        .eq("group_id", group!.id)
        .eq("type", "dm")
        .contains("participants", [myMemberId, member.id])
        .maybeSingle();

      let channelId = existingDm?.id;
      if (!channelId) {
        const { data: newDm } = await supabase
          .from("chat_channels")
          .insert({ group_id: group!.id, type: "dm", name: "DM", participants: [myMemberId, member.id], created_by: myMemberId })
          .select("id")
          .single();
        channelId = newDm?.id;
      }

      if (channelId && myMemberId) {
        await supabase.from("chat_messages").insert({
          channel_id: channelId,
          member_id: myMemberId,
          content: `Hei ${member.name}, du har en utestående innbetaling på ${fmt(owing)}. Betal via Bank-siden.`,
        });
      }
    }
    toast.success(`Påminnelse sendt til ${owingMembers.length} medlemmer`);
  };

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setDetailOpen(true);
  };

  const getRoleBadge = (member: any) => {
    const role = (member as any).roles;
    if (role) {
      return (
        <Badge variant="outline" className={ROLE_COLORS[role.color] ?? ROLE_COLORS.gray}>
          {role.name}
        </Badge>
      );
    }
    return <Badge variant="outline" className={ROLE_COLORS.gray}>{member.role}</Badge>;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ajour": return <Badge className="bg-success/15 text-success border-success/20">Ajour ✓</Badge>;
      case "skyldig": return <Badge className="bg-warning/15 text-warning border-warning/20">Skyldig</Badge>;
      case "forfalt": return <Badge className="bg-destructive/15 text-destructive border-destructive/20">Forfalt</Badge>;
      case "invitert": return <Badge variant="outline" className="border-dashed text-muted-foreground">Invitert</Badge>;
      default: return <Badge variant="secondary">—</Badge>;
    }
  };

  const subtitle = `${totalCount} medlemmer · ${activeCount} aktive · ${owingCount} mangler innbetaling`;

  return (
    <DashboardLayout
      title="Medlemmer"
      subtitle={subtitle}
      action={
        <div className="flex items-center gap-2">
          {isBussjef && (
            <Button variant="outline" onClick={() => setRolesModalOpen(true)} className="rounded-xl">
              <Settings className="w-4 h-4 mr-2" />
              Administrer roller
            </Button>
          )}
          {isBussjef && owingCount > 0 && (
            <Button variant="outline" onClick={sendReminderToAll} className="rounded-xl">
              <Bell className="w-4 h-4 mr-2" />
              Send påminnelse til alle som skylder
            </Button>
          )}
          <Button variant="outline" onClick={copyInviteLink} className="rounded-xl">
            <Link2 className="w-4 h-4 mr-2" />
            Kopier invitasjonslenke
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1200px]">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Totalt</p>
                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Aktive</p>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Mangler innbetaling</p>
                <p className="text-2xl font-bold text-foreground">{owingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter medlem..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="ajour">Ajour</SelectItem>
              <SelectItem value="skyldig">Skylder</SelectItem>
              <SelectItem value="invitert">Ikke registrert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Members table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  <th className="text-left px-6 py-3">Medlem</th>
                  <th className="text-left px-4 py-3">Rolle</th>
                  <th className="text-left px-4 py-3">E-post</th>
                  <th className="text-left px-4 py-3">Innbetalt</th>
                  <th className="text-left px-4 py-3">Gjenstående</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map(member => {
                  const ms = memberStatuses[member.id];
                  const isInvited = ms?.status === "invitert";
                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-secondary/50 transition-colors cursor-pointer ${isInvited ? "opacity-60" : ""}`}
                      onClick={() => handleMemberClick(member)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 text-xs font-bold">
                            <AvatarFallback className={`${isInvited ? "bg-muted text-muted-foreground border-2 border-dashed border-border" : "bg-primary text-primary-foreground"}`}>
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getRoleBadge(member)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{member.email || (member as any).invited_email || "—"}</td>
                      <td className="px-4 py-4 text-foreground">{fmt(ms?.paid ?? 0)}</td>
                      <td className="px-4 py-4 text-foreground">{fmt(ms?.owing ?? 0)}</td>
                      <td className="px-4 py-4">{statusBadge(ms?.status ?? "ajour")}</td>
                    </tr>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Ingen medlemmer funnet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MemberDetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        member={selectedMember}
        memberStatus={selectedMember ? memberStatuses[selectedMember.id] : undefined}
      />

      {isBussjef && group && (
        <ManageRolesModal
          open={rolesModalOpen}
          onOpenChange={setRolesModalOpen}
          roles={roles}
          groupId={group.id}
        />
      )}
    </DashboardLayout>
  );
};

export default Medlemmer;
