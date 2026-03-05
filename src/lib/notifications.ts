import { supabase } from "@/integrations/supabase/client";

interface NotifyParams {
  groupId: string;
  memberIds: string[];
  type: string;
  title: string;
  description: string;
  link: string;
  icon: string;
}

export async function createNotifications({ groupId, memberIds, type, title, description, link, icon }: NotifyParams) {
  if (memberIds.length === 0) return;
  const rows = memberIds.map(mid => ({
    group_id: groupId,
    member_id: mid,
    type,
    title,
    description,
    link,
    icon,
  }));
  await supabase.from("notifications").insert(rows);
}

export async function notifyAllMembers(groupId: string, excludeMemberId: string | null, params: Omit<NotifyParams, "groupId" | "memberIds">) {
  const { data: members } = await supabase
    .from("members")
    .select("id")
    .eq("group_id", groupId)
    .is("removed_at" as any, null);
  if (!members) return;
  const ids = members.map(m => m.id).filter(id => id !== excludeMemberId);
  await createNotifications({ groupId, memberIds: ids, ...params });
}

export async function notifyAdminMembers(groupId: string, excludeMemberId: string | null, params: Omit<NotifyParams, "groupId" | "memberIds">) {
  // Fetch members with their roles to check permission_level
  const { data: members } = await supabase
    .from("members")
    .select("id, role, roles(permission_level)")
    .eq("group_id", groupId)
    .is("removed_at" as any, null);
  if (!members) return;
  const ids = members
    .filter(m => {
      const permLevel = (m.roles as any)?.permission_level;
      return permLevel === "admin" || m.role === "bussjef";
    })
    .map(m => m.id)
    .filter(id => id !== excludeMemberId);
  await createNotifications({ groupId, memberIds: ids, ...params });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Nå";
  if (mins < 60) return `${mins} min siden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} t siden`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "I går";
  return `${days} d siden`;
}
