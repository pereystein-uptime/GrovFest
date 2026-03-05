import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useGroupId() {
  const { memberInfo } = useAuth();
  return memberInfo?.group_id ?? null;
}

export function useMemberId() {
  const { memberInfo, user } = useAuth();
  const groupId = memberInfo?.group_id;
  return useQuery({
    queryKey: ["my-member-id", groupId, user?.id],
    queryFn: async () => {
      if (!groupId || !user) return null;
      const { data } = await supabase
        .from("members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.id ?? null;
    },
    enabled: !!groupId && !!user,
  });
}

export function useGroupInfo() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["group-info", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId!)
        .single();
      return data;
    },
    enabled: !!groupId,
  });
}

export function useMembers() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["members", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select("*, roles(*)")
        .eq("group_id", groupId!);
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function useRoles() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["roles", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("roles")
        .select("*")
        .eq("group_id", groupId!)
        .order("is_default", { ascending: false })
        .order("name");
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function useBudgetItems() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["budget-items", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("budget_items")
        .select("*")
        .eq("group_id", groupId!);
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function usePaymentPlan() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["payment-plan", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_plan")
        .select("*")
        .eq("group_id", groupId!)
        .order("due_date", { ascending: true });
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function useTransactions() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["transactions", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*, members(name)")
        .eq("group_id", groupId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function usePolls() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["polls", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("polls")
        .select("*, poll_options(*, poll_votes(*))")
        .eq("group_id", groupId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function useEvents() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["events", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("group_id", groupId!)
        .order("event_date", { ascending: true });
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function useContracts() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["contracts", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("contracts")
        .select("*, contract_signatures(*, members(name))")
        .eq("group_id", groupId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function useChatChannels() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["chat-channels", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_channels")
        .select("*")
        .eq("group_id", groupId!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function useChatMessages(channelId: string | null) {
  return useQuery({
    queryKey: ["chat-messages", channelId],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*, members(name, role), supplier_contact_id")
        .eq("channel_id", channelId!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!channelId,
  });
}

export function useMessageReactions(channelId: string | null) {
  return useQuery({
    queryKey: ["message-reactions", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const { data: messages } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("channel_id", channelId);
      if (!messages || messages.length === 0) return [];
      const msgIds = messages.map((m) => m.id);
      const { data } = await supabase
        .from("message_reactions")
        .select("*, members(name)")
        .in("message_id", msgIds);
      return data ?? [];
    },
    enabled: !!channelId,
  });
}

export function useMessageReads(channelId: string | null) {
  return useQuery({
    queryKey: ["message-reads", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const { data: messages } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("channel_id", channelId);
      if (!messages || messages.length === 0) return [];
      const msgIds = messages.map((m) => m.id);
      const { data } = await supabase
        .from("message_reads")
        .select("*")
        .in("message_id", msgIds);
      return data ?? [];
    },
    enabled: !!channelId,
  });
}

export function useUnreadCounts(memberId: string | null) {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["unread-counts", groupId, memberId],
    queryFn: async () => {
      if (!groupId || !memberId) return {};
      const { data: channels } = await supabase
        .from("chat_channels")
        .select("id")
        .eq("group_id", groupId);
      if (!channels) return {};

      const counts: Record<string, number> = {};
      for (const ch of channels) {
        const { count: totalCount } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("channel_id", ch.id);

        const { count: readCount } = await supabase
          .from("message_reads")
          .select("id", { count: "exact", head: true })
          .eq("member_id", memberId)
          .in("message_id",
            (await supabase.from("chat_messages").select("id").eq("channel_id", ch.id)).data?.map(m => m.id) ?? []
          );

        const unread = (totalCount ?? 0) - (readCount ?? 0);
        if (unread > 0) counts[ch.id] = unread;
      }
      return counts;
    },
    enabled: !!groupId && !!memberId,
    refetchInterval: 30000,
  });
}

export function useLastMessages() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["last-messages", groupId],
    queryFn: async () => {
      if (!groupId) return {};
      const { data: channels } = await supabase
        .from("chat_channels")
        .select("id")
        .eq("group_id", groupId);
      if (!channels) return {};

      // Fetch supplier contacts for name resolution
      const { data: supplierContacts } = await supabase
        .from("supplier_contacts")
        .select("id, name");
      const contactMap = new Map((supplierContacts ?? []).map((c: any) => [c.id, c.name]));

      const lastMsgs: Record<string, { content: string; sender: string; created_at: string }> = {};
      for (const ch of channels) {
        const { data } = await supabase
          .from("chat_messages")
          .select("content, created_at, members(name), supplier_contact_id")
          .eq("channel_id", ch.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          const sender = (data as any).supplier_contact_id
            ? contactMap.get((data as any).supplier_contact_id) ?? "Leverandør"
            : (data.members as any)?.name ?? "";
          lastMsgs[ch.id] = {
            content: data.content,
            sender,
            created_at: data.created_at,
          };
        }
      }
      return lastMsgs;
    },
    enabled: !!groupId,
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      return data ?? [];
    },
  });
}

export function useSupplierContacts() {
  return useQuery({
    queryKey: ["supplier-contacts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("supplier_contacts")
        .select("*")
        .order("name");
      return data ?? [];
    },
  });
}

// Check if current user is THE bussjef (the specific role, not just any admin)
export function useIsBussjef() {
  const { memberInfo } = useAuth();
  // Bussjef is always the one with the Bussjef default role or legacy role text
  return memberInfo?.role === "bussjef";
}

// Check if current user has admin permission level (any admin role)
export function useIsAdmin() {
  const { memberInfo } = useAuth();
  return memberInfo?.permission_level === "admin";
}

export function useBudgetPaymentSchedules() {
  const groupId = useGroupId();
  return useQuery({
    queryKey: ["budget-payment-schedules", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data: items } = await supabase
        .from("budget_items")
        .select("id")
        .eq("group_id", groupId);
      if (!items || items.length === 0) return [];
      const { data } = await supabase
        .from("budget_payment_schedule")
        .select("*")
        .in("budget_item_id", items.map(i => i.id))
        .order("due_date", { ascending: true });
      return data ?? [];
    },
    enabled: !!groupId,
  });
}

export function useBudgetScheduleForItem(budgetItemId: string | null) {
  return useQuery({
    queryKey: ["budget-schedule", budgetItemId],
    queryFn: async () => {
      const { data } = await supabase
        .from("budget_payment_schedule")
        .select("*")
        .eq("budget_item_id", budgetItemId!)
        .order("due_date", { ascending: true });
      return data ?? [];
    },
    enabled: !!budgetItemId,
  });
}

export function fmt(n: number) {
  return n.toLocaleString("nb-NO") + " kr";
}
