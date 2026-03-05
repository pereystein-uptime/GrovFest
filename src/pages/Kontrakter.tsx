import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send } from "lucide-react";
import { MalerTab } from "@/components/kontrakter/MalerTab";
import { SignerteTab } from "@/components/kontrakter/SignerteTab";
import { VenterTab } from "@/components/kontrakter/VenterTab";
import { SendForSigneringModal } from "@/components/kontrakter/SendForSigneringModal";
import { useContracts, useIsAdmin } from "@/hooks/useGroupData";

const Kontrakter = () => {
  const [sendOpen, setSendOpen] = useState(false);
  const { data: contracts = [] } = useContracts();
  const isAdmin = useIsAdmin();

  const signed = contracts.filter((c) => c.status === "signed");
  const pending = contracts.filter((c) => c.status === "pending");

  return (
    <DashboardLayout
      title="Kontrakter"
      subtitle={`3 maler · ${signed.length} signert · ${pending.length} venter`}
      action={
        isAdmin ? (
          <Button onClick={() => setSendOpen(true)} size="sm">
            <Send className="h-4 w-4" />
            Send ut for signering
          </Button>
        ) : undefined
      }
    >
      <Tabs defaultValue="maler" className="space-y-6">
        <TabsList>
          <TabsTrigger value="maler">Maler · 3</TabsTrigger>
          <TabsTrigger value="signerte">Signerte avtaler · {signed.length}</TabsTrigger>
          <TabsTrigger value="venter">Venter på signering · {pending.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="maler"><MalerTab /></TabsContent>
        <TabsContent value="signerte"><SignerteTab contracts={signed} /></TabsContent>
        <TabsContent value="venter"><VenterTab contracts={pending} /></TabsContent>
      </Tabs>

      <SendForSigneringModal open={sendOpen} onOpenChange={setSendOpen} />
    </DashboardLayout>
  );
};

export default Kontrakter;
