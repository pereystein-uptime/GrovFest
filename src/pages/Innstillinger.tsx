import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { GroupSettingsTab } from "@/components/settings/GroupSettingsTab";
import { ProfileSettingsTab } from "@/components/settings/ProfileSettingsTab";
import { NotificationSettingsTab } from "@/components/settings/NotificationSettingsTab";
import { useIsAdmin } from "@/hooks/useGroupData";
import { Building2, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const Innstillinger = () => {
  const isAdmin = useIsAdmin();
  const [activeTab, setActiveTab] = useState(isAdmin ? "group" : "profile");

  const tabs = [
    ...(isAdmin ? [{ id: "group", label: "Gruppe", icon: Building2 }] : []),
    { id: "profile", label: "Min profil", icon: User },
    { id: "notifications", label: "Varsler", icon: Bell },
  ];

  return (
    <DashboardLayout title="Innstillinger" subtitle="Gruppe og personlige innstillinger">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 max-w-[1000px] settings-tabs-mobile">
        {/* Tab nav */}
        <nav className="w-full md:w-[200px] shrink-0 flex md:flex-col gap-1 overflow-x-auto md:space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground md:w-full"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground md:w-full"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "group" && isAdmin && <GroupSettingsTab />}
          {activeTab === "profile" && <ProfileSettingsTab />}
          {activeTab === "notifications" && <NotificationSettingsTab />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Innstillinger;
