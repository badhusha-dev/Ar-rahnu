import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, UserPlus, ArrowDownUp, TrendingUp, Package, Receipt } from "lucide-react";
import { Link } from "wouter";

export default function TellerDashboard() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold text-foreground flex items-center gap-3" data-testid="heading-teller-dashboard">
            <Coins className="h-10 w-10 text-amber-600" />
            Teller Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Daily transaction processing and customer service
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
          Gold Teller
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-today-transactions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-today-transactions">
                  {stats?.todayTransactions || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Processed today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-pending-approvals">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-pending-approvals">
                  {stats?.pendingApprovals || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting manager approval
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-gold-processed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Processed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-gold-processed">
                  {stats?.goldProcessedGrams || 0}g
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-transactions-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-transactions-value">
                  RM {(stats?.transactionsValue || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Today's total
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Daily teller operations</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-auto py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" data-testid="button-buy-gold">
              <Link href="/transactions/buy">
                <div className="text-left w-full">
                  <Coins className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Buy Gold</div>
                  <div className="text-sm font-normal opacity-90">Process purchase transaction</div>
                </div>
              </Link>
            </Button>
            <Button asChild className="h-auto py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700" data-testid="button-sell-gold">
              <Link href="/transactions/sell">
                <div className="text-left w-full">
                  <ArrowDownUp className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Sell Gold</div>
                  <div className="text-sm font-normal opacity-90">Process sell transaction</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-register-customer">
              <Link href="/customers/new">
                <div className="text-left w-full">
                  <UserPlus className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Register Customer</div>
                  <div className="text-sm font-normal opacity-70">Add new customer account</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
