import { useAuth } from "@/contexts/AuthContext";

export function WelcomeBanner() {
  const { memberInfo } = useAuth();
  const firstName = memberInfo?.name?.split(" ")[0] ?? "bruker";

  return (
    <div className="rounded-xl px-8 py-6 text-primary-foreground" style={{ background: "var(--banner-gradient)" }}>
      <h2 className="text-xl font-bold mb-1">Hei, {firstName} 👋</h2>
      <p className="text-sm opacity-90 max-w-lg leading-relaxed">
        Velkommen til dashboardet. Her ser du en oversikt over gruppens økonomi, avstemninger og kommende hendelser.
      </p>
    </div>
  );
}
