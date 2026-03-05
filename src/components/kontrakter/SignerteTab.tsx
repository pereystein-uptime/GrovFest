import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";

interface Props {
  contracts: any[];
}

export function SignerteTab({ contracts }: Props) {
  if (contracts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border px-6 py-16 text-center">
        <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Ingen signerte kontrakter ennå</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avtale</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Signert</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <span className="text-sm font-medium text-foreground">{c.title}</span>
                {c.parties && <p className="text-xs text-muted-foreground">{c.parties}</p>}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">{c.type}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {c.signed_at ? new Date(c.signed_at).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }) : "-"}
              </TableCell>
              <TableCell>
                <span className="text-sm text-success font-medium">Signert ✓</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
