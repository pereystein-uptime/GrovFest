import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { useMembers } from "@/hooks/useGroupData";
import { Users } from "lucide-react";

export function MembersTable() {
  const { data: members = [] } = useMembers();

  if (members.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Alle medlemmer</h3>
        </div>
        <div className="px-6 py-10 text-center">
          <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Ingen medlemmer ennå</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Alle medlemmer</h3>
        <p className="text-xs text-muted-foreground">{members.length} medlemmer</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            <th className="text-left px-6 py-3">Medlem</th>
            <th className="text-left px-4 py-3">Rolle</th>
            <th className="text-left px-4 py-3">Ble med</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((m) => {
            const initials = m.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <tr key={m.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 text-xs font-bold">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{m.role}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(m.joined_at).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
