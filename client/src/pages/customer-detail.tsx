import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, Mail, MapPin, Phone, User } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Customer } from "@shared/schema";

interface LoanWithDetails {
  id: string;
  contractNumber: string;
  loanAmountMyr: string;
  pledgeDate: string;
  maturityDate: string;
  status: string;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: [`/api/customers/${id}`],
  });

  const { data: customerLoans } = useQuery<LoanWithDetails[]>({
    queryKey: [`/api/customers/${id}/loans`],
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      blacklisted: { variant: "destructive", label: "Blacklisted" },
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  const getLoanStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Active" },
      renewed: { variant: "secondary", label: "Renewed" },
      redeemed: { variant: "outline", label: "Redeemed" },
      defaulted: { variant: "destructive", label: "Defaulted" },
    };
    return variants[status] || { variant: "outline", label: status };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild data-testid="button-back">
          <Link href="/customers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusBadge(customer.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4" data-testid="button-back">
          <Link href="/customers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={customer.photoUrl || undefined} alt={customer.fullName} className="object-cover" />
              <AvatarFallback className="text-xl">{getInitials(customer.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-customer-name">
                {customer.fullName}
              </h1>
              <p className="text-muted-foreground font-mono mt-1">{customer.icNumber}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusInfo.variant} data-testid="badge-status">
                  {statusInfo.label}
                </Badge>
                {customer.kycVerified && (
                  <Badge variant="outline" className="gap-1" data-testid="badge-kyc-verified">
                    <CheckCircle2 className="w-3 h-3" />
                    KYC Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="loans" data-testid="tab-loans">Active Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium font-mono" data-testid="text-phone">{customer.phone}</p>
                </div>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium" data-testid="text-email">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium" data-testid="text-address">{customer.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-medium">{format(new Date(customer.createdAt!), 'dd MMM yyyy, hh:mm a')}</p>
              </div>
              {customer.kycVerifiedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">KYC Verified Date</p>
                  <p className="font-medium">{format(new Date(customer.kycVerifiedAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              )}
              {customer.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium" data-testid="text-notes">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
              <CardDescription>Pawn transactions for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {!customerLoans || customerLoans.length === 0 ? (
                <div className="text-center py-12" data-testid="empty-loans">
                  <p className="text-sm text-muted-foreground">No loans yet</p>
                  <Button variant="outline" size="sm" asChild className="mt-4" data-testid="button-create-transaction">
                    <Link href="/transactions/new">Create Transaction</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contract No.</TableHead>
                        <TableHead className="text-right">Loan Amount</TableHead>
                        <TableHead>Pledge Date</TableHead>
                        <TableHead>Maturity Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerLoans.map((loan) => {
                        const loanStatusInfo = getLoanStatusBadge(loan.status);
                        return (
                          <TableRow key={loan.id} data-testid={`row-loan-${loan.id}`}>
                            <TableCell className="font-medium font-mono text-sm">
                              <Link href={`/loans/${loan.id}`} className="hover:underline">
                                {loan.contractNumber}
                              </Link>
                            </TableCell>
                            <TableCell className="text-right font-bold tabular-nums">
                              RM {parseFloat(loan.loanAmountMyr).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums">
                              {format(new Date(loan.pledgeDate), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell className="text-sm tabular-nums">
                              {format(new Date(loan.maturityDate), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={loanStatusInfo.variant}>
                                {loanStatusInfo.label}
                              </Badge>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
