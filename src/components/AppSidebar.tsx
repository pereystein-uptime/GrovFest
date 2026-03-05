import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Wallet, Landmark, Vote, MessageCircle, Users, FileText, CalendarDays, Truck, Bus, LogOut, CreditCard, Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupInfo } from "@/hooks/useGroupData";

const navGroups = [
  { label: "OVERSIKT", items: [{ title: "Dashboard", path: "/", icon: LayoutDashboard }] },
  { label: "ØKONOMI", items: [{ title: "Min økonomi", path: "/min-okonomi", icon: Wallet }, { title: "Budsjetter", path: "/budsjetter", icon: CreditCard }, { title: "Bank", path: "/bank", icon: Landmark }] },
  { label: "SAMARBEID", items: [{ title: "Avstemninger", path: "/avstemninger", icon: Vote }, { title: "Chat", path: "/chat", icon: MessageCircle }, { title: "Medlemmer", path: "/medlemmer", icon: Users }, { title: "Kontrakter", path: "/kontrakter", icon: FileText }] },
  { label: "PLANLEGGING", items: [{ title: "Kalender", path: "/kalender", icon: CalendarDays }, { title: "Leverandører", path: "/leverandorer", icon: Truck }] },
  { label: "", items: [{ title: "Innstillinger", path: "/innstillinger", icon: Settings }] },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const location = useLocation();
  const { memberInfo, signOut } = useAuth();
  const { data: group } = useGroupInfo();

  const initials = memberInfo?.name
    ? memberInfo.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const displayRole = memberInfo?.role_name ?? memberInfo?.role ?? "";

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bus className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground text-base tracking-tight">
          Russebuss <span className="text-primary">OS</span>
        </span>
      </div>

      <div className="mx-4 mb-4 px-3 py-2.5 rounded-lg bg-secondary">
        <p className="text-sm font-semibold text-foreground">{group?.name ?? "Laster..."} 🚌</p>
        <p className="text-xs text-muted-foreground">{group?.member_count ?? 0} medlemmer · Aktiv</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-5">
        {navGroups.map((g, gi) => (
          <div key={g.label || `group-${gi}`}>
            {g.label && <p className="text-[11px] font-semibold text-muted-foreground tracking-wider px-3 mb-1.5">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link to={item.path} onClick={onNavigate} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-accent text-accent-foreground" : "text-sidebar-foreground hover:bg-secondary"}`}>
                      <item.icon className="w-[18px] h-[18px]" />
                      <span className="flex-1">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border flex items-center gap-3">
        <Avatar className="w-9 h-9 bg-primary text-primary-foreground text-xs font-bold">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{memberInfo?.name ?? ""}</p>
          <p className="text-xs text-muted-foreground">{displayRole}</p>
        </div>
        <button onClick={signOut} className="text-muted-foreground hover:text-destructive" title="Logg ut">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
