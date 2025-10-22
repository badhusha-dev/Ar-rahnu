import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Eye, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import type { Customer } from "@shared/schema";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const filteredCustomers = customers?.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(query) ||
      customer.icNumber.includes(query) ||
      customer.phone.includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      blacklisted: { variant: "destructive", label: "Blacklisted" },
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-customers">
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">Manage customer profiles and KYC verification</p>
        </div>
        <Button asChild data-testid="button-add-customer">
          <Link href="/customers/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, IC number, phone, or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-customer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : !filteredCustomers || filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center" data-testid="empty-customers">
            <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "No customers found matching your search" : "No customers registered yet"}
            </p>
            {!searchQuery && (
              <Button variant="outline" asChild data-testid="button-add-first-customer">
                <Link href="/customers/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Customer
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => {
            const statusInfo = getStatusBadge(customer.status);
            return (
              <Card key={customer.id} className="hover-elevate transition-all duration-200" data-testid={`card-customer-${customer.id}`}>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={customer.photoUrl || undefined} alt={customer.fullName} className="object-cover" />
                    <AvatarFallback>{getInitials(customer.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight truncate" data-testid={`text-customer-name-${customer.id}`}>
                        {customer.fullName}
                      </h3>
                      {customer.kycVerified && (
                        <CheckCircle2 className="w-4 h-4 text-chart-1 flex-shrink-0" data-testid={`icon-kyc-verified-${customer.id}`} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{customer.icNumber}</p>
                    <Badge variant={statusInfo.variant} className="text-xs" data-testid={`badge-status-${customer.id}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground truncate">
                      <span className="font-medium">Phone:</span> {customer.phone}
                    </p>
                    {customer.email && (
                      <p className="text-muted-foreground truncate">
                        <span className="font-medium">Email:</span> {customer.email}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full mt-3" data-testid={`button-view-${customer.id}`}>
                    <Link href={`/customers/${customer.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
