import { useSuppliers, useChatChannels } from "@/hooks/useGroupData";
import { ShieldCheck, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VendorDetailModal } from "./VendorDetailModal";
import { Button } from "@/components/ui/button";

export function VerifiserteTab() {
  const { data: suppliers = [] } = useSuppliers();
  const { data: channels = [] } = useChatChannels();
  const navigate = useNavigate();
  const verified = suppliers.filter((s) => s.verified);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = verified.find((s) => s.id === selectedId);

  const getSupplierChannel = (supplierId: string) => {
    return channels.find((ch) => ch.type === "supplier" && (ch as any).supplier_id === supplierId);
  };

  const handleOpenChat = (e: React.MouseEvent, supplierId: string) => {
    e.stopPropagation();
    const channel = getSupplierChannel(supplierId);
    if (channel) {
      navigate(`/chat?channel=${channel.id}`);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-success/20 bg-success/5 p-4 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-success">Verifiserte leverandører</p>
          <p className="text-xs text-muted-foreground mt-0.5">Kvalitetssikret av Russebuss OS. Disse leverandørene har dokumentert erfaring, gode tilbakemeldinger fra tidligere russegrupper, og ryddige avtalevilkår.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {verified.map((v) => (
          <button key={v.id} onClick={() => setSelectedId(v.id)}
            className="bg-card rounded-xl border border-border p-5 text-left transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: v.logo_color ?? "#1a1f36" }}>{v.logo_initials}</div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-foreground">{v.name}</span>
                <span className="ml-2 text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">✓ Verifisert</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{v.category}</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{v.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <span>⭐ {Number(v.rating).toFixed(1)}</span>
              <span>{v.location}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex flex-wrap gap-1">
                {(v.tags ?? []).map((t: string) => (
                  <span key={t} className="text-[10px] bg-secondary text-foreground px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              {getSupplierChannel(v.id) && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs gap-1.5 shrink-0"
                  onClick={(e) => handleOpenChat(e, v.id)}
                >
                  <MessageCircle className="h-3 w-3" />
                  Åpne chat
                </Button>
              )}
            </div>
          </button>
        ))}
      </div>
      <VendorDetailModal open={!!selected} onOpenChange={() => setSelectedId(null)} vendor={selected} />
    </>
  );
}
