import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface RenewalWithDetails {
  id: string;
  contractNumber: string;
  customerName: string;
  previousMaturityDate: string;
  newMaturityDate: string;
  extensionMonths: number;
  renewalFeeMyr: string;
  renewalDate: string;
}

export default function Renewals() {
  const { data: renewals, isLoading } = useQuery<RenewalWithDetails[]>({
    queryKey: ["/api/renewals"],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-renewals">
          Contract Renewals
        </h1>
        <p className="text-muted-foreground mt-1">Track contract extensions and tenure renewals</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card data-testid="card-total-renewals">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Renewals</CardTitle>
            <RefreshCw className="h-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-total-renewals">
                  {renewals?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time extensions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-this-month">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-renewals-this-month">
                  {renewals?.filter(r => {
                    const renewalDate = new Date(r.renewalDate);
                    const now = new Date();
                    return renewalDate.getMonth() === now.getMonth() && 
                           renewalDate.getFullYear() === now.getFullYear();
                  }).length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recent renewals
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-renewal-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-renewal-fees">
                  RM {renewals?.reduce((sum, r) => sum + parseFloat(r.renewalFeeMyr), 0).toLocaleString('en-MY', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From renewals
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Renewals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !renewals || renewals.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-renewals">
              <RefreshCw className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No renewals yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Previous Maturity</TableHead>
                    <TableHead>New Maturity</TableHead>
                    <TableHead className="text-center">Extension</TableHead>
                    <TableHead className="text-right">Renewal Fee</TableHead>
                    <TableHead>Renewal Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renewals.map((renewal) => (
                    <TableRow key={renewal.id} data-testid={`row-renewal-${renewal.id}`}>
                      <TableCell className="font-medium font-mono text-sm">
                        {renewal.contractNumber}
                      </TableCell>
                      <TableCell>{renewal.customerName}</TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {format(new Date(renewal.previousMaturityDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums font-medium">
                        {format(new Date(renewal.newMaturityDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          +{renewal.extensionMonths} {renewal.extensionMonths === 1 ? 'month' : 'months'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        RM {parseFloat(renewal.renewalFeeMyr).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {format(new Date(renewal.renewalDate), 'dd MMM yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
