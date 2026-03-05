import { Copy, MessageSquare, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { OnboardingData } from "@/pages/Onboarding";

interface Props {
  data: OnboardingData;
  onFinish: () => void;
}

export function Step4Invite({ data, onFinish }: Props) {
  const link = `russebussos.no/join/${data.inviteCode}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert!`);
  };

  const shareSMS = () => {
    const body = encodeURIComponent(`Hei! Bli med i ${data.groupName} på Russebuss OS. Bruk koden ${data.inviteCode} eller lenken: ${link}`);
    window.open(`sms:?body=${body}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Inviter medlemmene dine</h2>
        <p className="text-muted-foreground mt-1">Del koden eller lenken med gruppen din. De oppretter bruker og kobles automatisk til gruppen.</p>
      </div>

      <Card className="border-2 border-primary/20 bg-accent/30">
        <CardContent className="py-8 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Invitasjonskode</p>
          <p className="text-3xl font-mono font-bold text-foreground tracking-widest">{data.inviteCode}</p>
          <p className="text-sm text-muted-foreground mt-2">{link}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => copy(data.inviteCode, "Kode")} className="gap-2">
          <Copy className="w-4 h-4" /> Kopier kode
        </Button>
        <Button variant="outline" onClick={() => copy(link, "Lenke")} className="gap-2">
          <Copy className="w-4 h-4" /> Kopier lenke
        </Button>
        <Button variant="outline" onClick={shareSMS} className="gap-2">
          <MessageSquare className="w-4 h-4" /> Del via SMS
        </Button>
        <Button variant="outline" onClick={() => toast.info("Snapchat-deling kommer snart!")} className="gap-2">
          <Share2 className="w-4 h-4" /> Del via Snapchat
        </Button>
      </div>

      <Button onClick={onFinish} size="lg" className="w-full gap-2">
        Gå til dashboard <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
