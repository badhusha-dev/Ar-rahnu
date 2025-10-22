import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Phone, User } from "lucide-react";
import type { Branch } from "@shared/schema";

export default function Branches() {
  const { data: branches, isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const activeBranches = branches?.filter(b => b.isActive) || [];
  const inactiveBranches = branches?.filter(b => !b.isActive) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-branches">
          Branches
        </h1>
        <p className="text-muted-foreground mt-1">Manage branch locations and operations</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card data-testid="card-total-branches">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-total-branches">
                  {branches?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered locations
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-active-branches">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums text-chart-1" data-testid="text-active-branches">
                  {activeBranches.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently operating
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-inactive-branches">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Branches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums text-muted-foreground" data-testid="text-inactive-branches">
                  {inactiveBranches.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Temporarily closed
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Branches List */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !branches || branches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center" data-testid="empty-branches">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No branches registered</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {branches.map((branch) => (
            <Card key={branch.id} className="hover-elevate transition-all duration-200" data-testid={`card-branch-${branch.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-branch-name-${branch.id}`}>
                      {branch.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      Code: {branch.code}
                    </p>
                  </div>
                  <Badge 
                    variant={branch.isActive ? "default" : "secondary"} 
                    data-testid={`badge-status-${branch.id}`}
                  >
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {branch.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground font-mono">{branch.phone}</span>
                  </div>
                )}
                {branch.managerName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Manager: <span className="font-medium text-foreground">{branch.managerName}</span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
