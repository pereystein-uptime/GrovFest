import DashboardLayout from "@/components/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCards } from "@/components/dashboard/StatCards";
import { UnreadMessages } from "@/components/dashboard/UnreadMessages";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ActivePolls } from "@/components/dashboard/ActivePolls";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";

const Index = () => {
  return (
    <DashboardLayout title="Dashboard" subtitle="Oversikt over Bergansen 2026">
      <div className="space-y-6 max-w-[1200px]">
        <WelcomeBanner />
        <StatCards />
        <UnreadMessages />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <RecentTransactions />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ActivePolls />
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
