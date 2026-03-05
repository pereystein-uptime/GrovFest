import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MonthGrid } from "@/components/kalender/MonthGrid";
import { EventSidebar } from "@/components/kalender/EventSidebar";
import { NewEventModal } from "@/components/kalender/NewEventModal";
import { useIsAdmin } from "@/hooks/useGroupData";

const Kalender = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const isAdmin = useIsAdmin();

  return (
    <DashboardLayout
      title="Kalender"
      subtitle="Hendelser og frister"
      action={
        isAdmin ? (
          <Button onClick={() => setModalOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            Ny hendelse
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <MonthGrid currentMonth={currentMonth} onMonthChange={setCurrentMonth} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
        <EventSidebar selectedDate={selectedDate} />
      </div>
      <NewEventModal open={modalOpen} onOpenChange={setModalOpen} />
    </DashboardLayout>
  );
};

export default Kalender;
