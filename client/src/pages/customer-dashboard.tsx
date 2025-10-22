import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, History, DollarSign, Coins, Eye } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: goldAccount, isLoading: accountLoading } = useQuery<any>({
    queryKey: ["/api/gold-account"],
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions/recent"],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold text-foreground flex items-center gap-3" data-testid="heading-customer-dashboard">
            <Wallet className="h-10 w-10 text-purple-600" />
            My Gold Account
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName || 'Customer'}!
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
          Customer
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-gold-balance" className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Balance</CardTitle>
            <Coins className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums text-amber-900 dark:text-amber-100" data-testid="text-gold-balance">
                  {parseFloat(goldAccount?.balanceGrams || '0').toLocaleString('en-MY', { minimumFractionDigits: 4 })}g
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Current holdings
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-myr-balance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MYR Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-myr-balance">
                  RM {parseFloat(goldAccount?.balanceMyr || '0').toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available funds
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-bought">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gold Bought</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-total-bought">
                  {parseFloat(goldAccount?.totalBoughtGrams || '0').toLocaleString('en-MY', { minimumFractionDigits: 4 })}g
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime purchases
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-sold">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gold Sold</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-total-sold">
                  {parseFloat(goldAccount?.totalSoldGrams || '0').toLocaleString('en-MY', { minimumFractionDigits: 4 })}g
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime sales
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Manage your gold savings</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-auto py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" data-testid="button-view-transactions">
              <Link href="/my-transactions">
                <div className="text-left w-full">
                  <History className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Transaction History</div>
                  <div className="text-sm font-normal opacity-90">View all transactions</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-gold-prices">
              <Link href="/gold-prices">
                <div className="text-left w-full">
                  <TrendingUp className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Current Gold Prices</div>
                  <div className="text-sm font-normal opacity-70">View market rates</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-profile">
              <Link href="/profile">
                <div className="text-left w-full">
                  <Eye className="h-5 w-5 mb-2" />
                  <div className="font-semibold">My Profile</div>
                  <div className="text-sm font-normal opacity-70">View and update details</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
