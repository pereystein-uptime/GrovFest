import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VerifiserteTab } from "@/components/leverandorer/VerifiserteTab";
import { FraradetTab } from "@/components/leverandorer/FraradetTab";
import { useSuppliers } from "@/hooks/useGroupData";

const Leverandorer = () => {
  const { data: suppliers = [] } = useSuppliers();
  const verified = suppliers.filter((s) => s.verified).length;
  const discouraged = suppliers.filter((s) => !s.verified).length;

  return (
    <DashboardLayout title="Leverandører" subtitle={`${verified} verifiserte · ${discouraged} frarådede`}>
      <Tabs defaultValue="verifiserte" className="space-y-6">
        <TabsList>
          <TabsTrigger value="verifiserte">Verifiserte leverandører · {verified}</TabsTrigger>
          <TabsTrigger value="fraradet" className="gap-1.5">
            Frarådet
            <Badge className="bg-destructive text-destructive-foreground text-[10px] h-5 px-1.5">{discouraged}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="verifiserte"><VerifiserteTab /></TabsContent>
        <TabsContent value="fraradet"><FraradetTab /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Leverandorer;
