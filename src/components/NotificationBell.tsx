import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, DollarSign, BarChart3, FileText, MessageSquare, CalendarDays, Users, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useMemberId } from "@/hooks/useGroupData";
import { timeAgo } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  payment: DollarSign,
  poll: BarChart3,
  contract: FileText,
  chat: MessageSquare,
  calendar: CalendarDays,
  member: Users,
  budget: AlertTriangle,
  bell: Bell,
};

const colorMap: Record<string, string> = {
  payment: "bg-success/15 text-success",
  poll: "bg-primary/15 text-primary",
  contract: "bg-purple-100 text-purple-700",
  chat: "bg-secondary text-muted-foreground",
  calendar: "bg-warning/15 text-warning",
  member: "bg-cyan-100 text-cyan-700",
  budget: "bg-destructive/15 text-destructive",
  bell: "bg-secondary text-muted-foreground",
};

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  link: string;
  icon: string;
  read_at: string | null;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const { data: memberId } = useMemberId();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!memberId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
  }, [memberId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!memberId) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `member_id=eq.${memberId}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [memberId]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  const handleClick = (n: Notification) => {
    markAsRead(n.id);
    setOpen(false);
    navigate(n.link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Varsler</h3>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
              Marker alle som lest
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ingen varsler ennå</p>
            </div>
          ) : (
            <div>
              {notifications.map(n => {
                const IconComp = iconMap[n.icon] ?? Bell;
                const color = colorMap[n.icon] ?? colorMap.bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0",
                      !n.read_at && "bg-accent/40"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5", color)}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-1">{timeAgo(n.created_at)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
