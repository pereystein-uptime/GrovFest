import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { GroupAccountCard } from "@/components/bank/GroupAccountCard";
import { PaymentStatusCard } from "@/components/bank/PaymentStatusCard";
import { InstallmentPlan } from "@/components/bank/InstallmentPlan";
import { MembersTable } from "@/components/bank/MembersTable";
import { TransactionLog } from "@/components/bank/TransactionLog";
import { PaymentModal } from "@/components/bank/PaymentModal";

const Bank = () => {
  const [payModalOpen, setPayModalOpen] = useState(false);

  return (
    <DashboardLayout title="Bank" subtitle="Gruppekonto og transaksjoner — live">
      <div className="space-y-6 max-w-[1200px]">
        {/* Top cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <GroupAccountCard />
          </div>
          <div className="lg:col-span-2">
            <PaymentStatusCard onPayClick={() => setPayModalOpen(true)} />
          </div>
        </div>

        {/* Middle two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InstallmentPlan />
          <MembersTable />
        </div>

        {/* Transaction log */}
        <TransactionLog />
      </div>

      <PaymentModal open={payModalOpen} onOpenChange={setPayModalOpen} />
    </DashboardLayout>
  );
};

export default Bank;
