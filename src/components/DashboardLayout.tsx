import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const DashboardLayout = ({ children, title, subtitle, action }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { memberInfo } = useAuth();

  const initials = memberInfo?.name
    ? memberInfo.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      {!isMobile && <AppSidebar />}

      {/* Mobile sidebar sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px] [&>button]:hidden">
            <AppSidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-3 md:py-5 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {!isMobile && action && <div>{action}</div>}
            <NotificationBell />
            {isMobile && (
              <Avatar className="w-8 h-8 bg-primary text-primary-foreground text-xs font-bold">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>
        {/* Mobile action below header */}
        {isMobile && action && (
          <div className="px-4 py-3 border-b border-border">
            <div className="mobile-action-wrapper">{action}</div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
