import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, TrendingUp, DollarSign, Package, FileText } from "lucide-react";
import { Link } from "wouter";

export default function ManagerDashboard() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold text-foreground flex items-center gap-3" data-testid="heading-manager-dashboard">
            <Briefcase className="h-10 w-10 text-blue-600" />
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Branch operations and team management
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
          Branch Manager
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-branch-transactions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branch Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-branch-transactions">
                  {stats?.branchTransactions || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-team-members">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-team-members">
                  {stats?.teamMembers || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active staff
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-inventory-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-inventory-value">
                  RM {(stats?.inventoryValue || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gold stock value
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-branch-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branch Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-branch-revenue">
                  RM {(stats?.monthlyRevenueMyr || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manager Controls</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Branch management and oversight</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-team-management">
              <Link href="/team">
                <div className="text-left w-full">
                  <Users className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Team Management</div>
                  <div className="text-sm font-normal opacity-70">Manage staff and schedules</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-inventory">
              <Link href="/inventory">
                <div className="text-left w-full">
                  <Package className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Inventory</div>
                  <div className="text-sm font-normal opacity-70">Manage gold stock</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-branch-reports">
              <Link href="/reports">
                <div className="text-left w-full">
                  <FileText className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Branch Reports</div>
                  <div className="text-sm font-normal opacity-70">Performance analytics</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
