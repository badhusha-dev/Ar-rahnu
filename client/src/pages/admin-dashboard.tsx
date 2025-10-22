import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  Database,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold text-foreground flex items-center gap-3" data-testid="heading-admin-dashboard">
            <Shield className="h-10 w-10 text-emerald-600" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            System-wide overview and management controls
          </p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
          Administrator
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-total-users">
                  {stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-branches">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-total-branches">
                  {stats?.totalBranches || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Operating locations
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-gold">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gold Holdings</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-total-gold">
                  {stats?.totalGoldGrams || 0}g
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-system-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-system-revenue">
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
          <CardTitle>Admin Controls</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Quick access to system management</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-manage-users">
              <Link href="/users">
                <div className="text-left w-full">
                  <Users className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Manage Users</div>
                  <div className="text-sm font-normal opacity-70">View and edit user accounts</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-manage-branches">
              <Link href="/branches">
                <div className="text-left w-full">
                  <Building2 className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Branch Management</div>
                  <div className="text-sm font-normal opacity-70">Manage branch locations</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-system-settings">
              <Link href="/settings">
                <div className="text-left w-full">
                  <Settings className="h-5 w-5 mb-2" />
                  <div className="font-semibold">System Settings</div>
                  <div className="text-sm font-normal opacity-70">Configure system options</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-reports">
              <Link href="/reports">
                <div className="text-left w-full">
                  <BarChart3 className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Reports & Analytics</div>
                  <div className="text-sm font-normal opacity-70">View detailed reports</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-gold-prices">
              <Link href="/gold-prices">
                <div className="text-left w-full">
                  <DollarSign className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Gold Pricing</div>
                  <div className="text-sm font-normal opacity-70">Update market rates</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4" data-testid="button-audit-logs">
              <Link href="/audit">
                <div className="text-left w-full">
                  <Shield className="h-5 w-5 mb-2" />
                  <div className="font-semibold">Audit Logs</div>
                  <div className="text-sm font-normal opacity-70">System activity tracking</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
