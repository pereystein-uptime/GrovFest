import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Step1Group } from "@/components/onboarding/Step1Group";
import { Step2Budget } from "@/components/onboarding/Step2Budget";
import { Step3PaymentPlan } from "@/components/onboarding/Step3PaymentPlan";
import { Step4Invite } from "@/components/onboarding/Step4Invite";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OnboardingData {
  groupName: string;
  year: number;
  city: string;
  memberCount: number;
  totalBudget: number;
  budgetItems: { name: string; amount: number }[];
  startMonth: string;
  endMonth: string;
  paymentPlan: { due_date: string; amount_per_member: number }[];
  inviteCode: string;
  groupId: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    groupName: "",
    year: 2026,
    city: "",
    memberCount: 24,
    totalBudget: 0,
    budgetItems: [{ name: "", amount: 0 }],
    startMonth: "2025-08",
    endMonth: "2026-04",
    paymentPlan: [],
    inviteCode: "",
    groupId: "",
  });

  const update = (partial: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...partial }));

  const generateInviteCode = () => {
    const prefix = data.groupName.replace(/[^a-zA-ZæøåÆØÅ]/g, "").slice(0, 4).toUpperCase() || "RUSS";
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    return `${prefix}-${data.year}-${rand}`;
  };

  const handleFinishStep3 = async () => {
    if (!user) return;
    setSaving(true);
    const code = generateInviteCode();

    // Create group
    const { data: group, error: gErr } = await supabase
      .from("groups")
      .insert({
        name: data.groupName,
        year: data.year,
        city: data.city,
        member_count: data.memberCount,
        total_budget: data.totalBudget,
        invite_code: code,
        created_by: user.id,
      })
      .select()
      .single();

    if (gErr || !group) {
      toast.error(gErr?.message || "Kunne ikke opprette gruppe");
      setSaving(false);
      return;
    }

    // Seed default roles
    const defaultRoles = [
      { group_id: group.id, name: "Bussjef", permission_level: "admin", color: "blue", is_default: true },
      { group_id: group.id, name: "Økonomisjef", permission_level: "admin", color: "green", is_default: true },
      { group_id: group.id, name: "Musikksjef", permission_level: "admin", color: "purple", is_default: true },
      { group_id: group.id, name: "Medlem", permission_level: "member", color: "gray", is_default: true },
    ];
    const { data: createdRoles } = await supabase.from("roles").insert(defaultRoles).select();
    const bussjefRole = createdRoles?.find(r => r.name === "Bussjef");

    // Add bussjef as member
    const userName = user.user_metadata?.full_name || user.email || "Bussjef";
    await supabase.from("members").insert({
      group_id: group.id,
      user_id: user.id,
      name: userName,
      email: user.email,
      role: "bussjef",
      role_id: bussjefRole?.id,
    } as any);

    // Insert budget items
    if (data.budgetItems.filter(b => b.name && b.amount > 0).length > 0) {
      await supabase.from("budget_items").insert(
        data.budgetItems.filter(b => b.name && b.amount > 0).map(b => ({
          group_id: group.id,
          name: b.name,
          amount: b.amount,
        }))
      );
    }

    // Insert payment plan
    if (data.paymentPlan.length > 0) {
      await supabase.from("payment_plan").insert(
        data.paymentPlan.map(p => ({
          group_id: group.id,
          due_date: p.due_date,
          amount_per_member: p.amount_per_member,
        }))
      );
    }

    update({ inviteCode: code, groupId: group.id });
    setSaving(false);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[600px] mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bus className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-base">
            Russebuss <span className="text-primary">OS</span>
          </span>
          <span className="ml-auto text-sm text-muted-foreground">Steg {step} av 4</span>
        </div>
        <div className="max-w-[600px] mx-auto px-6 pb-4">
          <Progress value={step * 25} className="h-1.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[600px] w-full mx-auto px-6 py-8">
        {step > 1 && step < 4 && (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Tilbake
          </button>
        )}

        {step === 1 && <Step1Group data={data} update={update} onNext={() => setStep(2)} />}
        {step === 2 && <Step2Budget data={data} update={update} onNext={() => setStep(3)} />}
        {step === 3 && <Step3PaymentPlan data={data} update={update} onNext={handleFinishStep3} saving={saving} />}
        {step === 4 && <Step4Invite data={data} onFinish={() => navigate("/")} />}
      </div>
    </div>
  );
};

export default Onboarding;
