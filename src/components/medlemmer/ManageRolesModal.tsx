import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Key, User, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const ROLE_COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  gray: "bg-secondary text-muted-foreground border-border",
};

const COLOR_OPTIONS = [
  { value: "blue", label: "Blå", dot: "bg-blue-500" },
  { value: "green", label: "Grønn", dot: "bg-green-500" },
  { value: "purple", label: "Lilla", dot: "bg-purple-500" },
  { value: "amber", label: "Amber", dot: "bg-amber-500" },
  { value: "red", label: "Rød", dot: "bg-red-500" },
  { value: "cyan", label: "Cyan", dot: "bg-cyan-500" },
  { value: "pink", label: "Rosa", dot: "bg-pink-500" },
  { value: "gray", label: "Grå", dot: "bg-gray-400" },
];

interface Role {
  id: string;
  group_id: string;
  name: string;
  permission_level: string;
  color: string;
  is_default: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  roles: Role[];
  groupId: string;
}

export function ManageRolesModal({ open, onOpenChange, roles, groupId }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState<"admin" | "member">("member");
  const [newColor, setNewColor] = useState("blue");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("roles").insert({
      group_id: groupId,
      name: newName.trim(),
      permission_level: newLevel,
      color: newColor,
      is_default: false,
    });
    if (error) {
      toast.error("Kunne ikke opprette rolle");
      return;
    }
    toast.success(`Rolle "${newName}" opprettet`);
    setNewName("");
    setNewLevel("member");
    setNewColor("blue");
    setCreating(false);
    queryClient.invalidateQueries({ queryKey: ["roles"] });
  };

  const handleUpdateLevel = async (roleId: string, level: string) => {
    await supabase.from("roles").update({ permission_level: level }).eq("id", roleId);
    queryClient.invalidateQueries({ queryKey: ["roles"] });
    toast.success("Rettighetsnivå oppdatert");
    setEditingId(null);
  };

  const handleDelete = async (role: Role) => {
    // Get default Medlem role
    const medlemRole = roles.find(r => r.name === "Medlem" && r.is_default);
    if (!medlemRole) return;

    // Reassign members with this role to Medlem
    await (supabase.from("members").update({ role_id: medlemRole.id, role: "medlem" } as any) as any).eq("role_id", role.id);
    await supabase.from("roles").delete().eq("id", role.id);

    queryClient.invalidateQueries({ queryKey: ["roles"] });
    queryClient.invalidateQueries({ queryKey: ["members"] });
    toast.success(`Rolle "${role.name}" slettet. Medlemmer er satt til Medlem.`);
    setDeleteConfirm(null);
  };

  const isBussjefRole = (r: Role) => r.is_default && r.name === "Bussjef";
  const canEditLevel = (r: Role) => r.is_default && !isBussjefRole(r) && r.name !== "Medlem";
  const canDelete = (r: Role) => !r.is_default;
  const canEditCustom = (r: Role) => !r.is_default;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Administrer roller</DialogTitle>
            <DialogDescription>Administrer roller og rettighetsnivåer for gruppen din.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {roles.map(role => (
              <div key={role.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={ROLE_COLORS[role.color] ?? ROLE_COLORS.gray}>
                    {role.name}
                  </Badge>
                  <Badge variant="outline" className={role.permission_level === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"}>
                    {role.permission_level === "admin" ? "Admin" : "Medlem"}
                  </Badge>
                  {isBussjefRole(role) && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>

                <div className="flex items-center gap-1">
                  {canEditLevel(role) && (
                    <Select
                      value={role.permission_level}
                      onValueChange={(v) => handleUpdateLevel(role.id, v)}
                    >
                      <SelectTrigger className="w-24 h-8 text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Medlem</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {canDelete(role) && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(role.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create new role */}
          {!creating ? (
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Opprett ny rolle
            </Button>
          ) : (
            <div className="space-y-4 p-4 rounded-xl border border-border bg-card">
              <div className="space-y-2">
                <Label>Rollenavn</Label>
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder='F.eks. "Sponsorsjef"'
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Rettighetsnivå</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewLevel("admin")}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${newLevel === "admin" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
                  >
                    <Key className="w-5 h-5 text-primary mb-1" />
                    <p className="text-sm font-semibold text-foreground">Admin</p>
                    <p className="text-xs text-muted-foreground">Samme rettigheter som bussjef</p>
                  </button>
                  <button
                    onClick={() => setNewLevel("member")}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${newLevel === "member" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
                  >
                    <User className="w-5 h-5 text-muted-foreground mb-1" />
                    <p className="text-sm font-semibold text-foreground">Medlem</p>
                    <p className="text-xs text-muted-foreground">Kan se egen økonomi, stemme og chatte</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Farge</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setNewColor(c.value)}
                      className={`w-8 h-8 rounded-full ${c.dot} transition-all ${newColor === c.value ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100"}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setCreating(false)}>Avbryt</Button>
                <Button className="flex-1 rounded-xl" onClick={handleCreate} disabled={!newName.trim()}>Opprett rolle</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slett rolle</DialogTitle>
            <DialogDescription>
              Alle medlemmer med denne rollen blir satt til Medlem. Fortsette?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Avbryt</Button>
            <Button variant="destructive" onClick={() => {
              const role = roles.find(r => r.id === deleteConfirm);
              if (role) handleDelete(role);
            }}>Slett rolle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
