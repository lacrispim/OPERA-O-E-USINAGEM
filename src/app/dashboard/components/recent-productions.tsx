import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ProductionRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type RecentProductionsProps = {
  records: ProductionRecord[];
};

export function RecentProductions({ records }: RecentProductionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produções Recentes</CardTitle>
        <CardDescription>As 5 produções mais recentes registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="font-medium">{record.partName}</div>
                  <div className="text-sm text-muted-foreground">{record.requestingFactory}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">{record.material}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {record.manufacturingTime}h
                </TableCell>
              </TableRow>
            ))}
             {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Nenhuma produção recente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
