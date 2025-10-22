import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Coins, TrendingUp, AlertTriangle, DollarSign, Eye } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface DashboardStats {
  totalActivePawns: number;
  outstandingAmountMyr: number;
  itemsMaturingThisWeek: number;
  monthlyRevenueMyr: number;
}

interface RecentTransaction {
  id: string;
  contractNumber: string;
  customerName: string;
  loanAmountMyr: string;
  pledgeDate: string;
  maturityDate: string;
  status: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<RecentTransaction[]>({
    queryKey: ["/api/dashboard/recent-transactions"],
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Active" },
      renewed: { variant: "secondary", label: "Renewed" },
      redeemed: { variant: "outline", label: "Redeemed" },
      defaulted: { variant: "destructive", label: "Defaulted" },
    };
    return variants[status] || { variant: "outline", label: status };
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-dashboard">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your Ar-Rahnu operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-stat-active-pawns">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pawns</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-active-pawns">
                  {stats?.totalActivePawns || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently pledged items
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-outstanding">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-outstanding-amount">
                  RM {(stats?.outstandingAmountMyr || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total loans disbursed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-maturing">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maturing This Week</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-maturing-count">
                  {stats?.itemsMaturingThisWeek || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requires attention
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-monthly-revenue">
                  RM {(stats?.monthlyRevenueMyr || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From fees this month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest pawn contracts processed</p>
          </div>
          <Button variant="outline" size="sm" asChild data-testid="button-view-all-transactions">
            <Link href="/loans">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !recentTransactions || recentTransactions.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-transactions">
              <Coins className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <Button variant="outline" size="sm" asChild className="mt-4" data-testid="button-create-first-transaction">
                <Link href="/transactions/new">Create First Transaction</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Loan Amount</TableHead>
                    <TableHead>Pledge Date</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => {
                    const statusInfo = getStatusBadge(transaction.status);
                    return (
                      <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                        <TableCell className="font-medium font-mono text-sm">
                          {transaction.contractNumber}
                        </TableCell>
                        <TableCell>{transaction.customerName}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          RM {parseFloat(transaction.loanAmountMyr).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                          {format(new Date(transaction.pledgeDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                          {format(new Date(transaction.maturityDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} data-testid={`badge-status-${transaction.id}`}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild data-testid={`button-view-${transaction.id}`}>
                            <Link href={`/loans/${transaction.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-auto py-4" data-testid="button-quick-new-transaction">
              <Link href="/transactions/new">
                <div className="text-left">
                  <div className="font-semibold">New Pawn Transaction</div>
                  <div className="text-sm font-normal opacity-90">Create Rahn contract</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-quick-add-customer">
              <Link href="/customers">
                <div className="text-left">
                  <div className="font-semibold">Add Customer</div>
                  <div className="text-sm font-normal opacity-70">Register new customer</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-quick-vault">
              <Link href="/vault">
                <div className="text-left">
                  <div className="font-semibold">Vault Inventory</div>
                  <div className="text-sm font-normal opacity-70">View stored items</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
