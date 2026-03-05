import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Vote } from "lucide-react";
import { ActivePollCard } from "@/components/avstemninger/ActivePollCard";
import { ArchivedPollCard } from "@/components/avstemninger/ArchivedPollCard";
import { NewPollModal } from "@/components/avstemninger/NewPollModal";
import { usePolls, useIsAdmin, useMembers } from "@/hooks/useGroupData";

const Avstemninger = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: polls = [] } = usePolls();
  const { data: members = [] } = useMembers();
  const isAdmin = useIsAdmin();

  const now = new Date();
  const active = polls.filter((p) => new Date(p.deadline) > now);
  const archived = polls.filter((p) => new Date(p.deadline) <= now);

  return (
    <DashboardLayout
      title="Avstemninger"
      subtitle="Gruppens beslutninger"
      action={
        isAdmin ? (
          <Button onClick={() => setModalOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            Ny avstemning
          </Button>
        ) : undefined
      }
    >
      <Tabs defaultValue="aktive" className="space-y-6">
        <TabsList>
          <TabsTrigger value="aktive">Aktive · {active.length}</TabsTrigger>
          <TabsTrigger value="arkiv">Arkiv · {archived.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="aktive" className="space-y-6">
          {active.length === 0 ? (
            <div className="bg-card rounded-xl border border-border px-6 py-16 text-center">
              <Vote className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Ingen aktive avstemninger</p>
              {isAdmin && <p className="text-xs text-muted-foreground mt-1">Opprett din første avstemning</p>}
            </div>
          ) : (
            active.map((poll) => (
              <ActivePollCard key={poll.id} poll={poll} totalVoters={members.length} />
            ))
          )}
        </TabsContent>

        <TabsContent value="arkiv" className="space-y-6">
          {archived.length === 0 ? (
            <div className="bg-card rounded-xl border border-border px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">Ingen arkiverte avstemninger</p>
            </div>
          ) : (
            archived.map((poll) => (
              <ArchivedPollCard key={poll.id} poll={poll} totalVoters={members.length} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <NewPollModal open={modalOpen} onOpenChange={setModalOpen} />
    </DashboardLayout>
  );
};

export default Avstemninger;
