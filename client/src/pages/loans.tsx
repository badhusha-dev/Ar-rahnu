import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Calendar } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface LoanWithCustomer {
  id: string;
  contractNumber: string;
  customerName: string;
  customerId: string;
  loanAmountMyr: string;
  pledgeDate: string;
  maturityDate: string;
  status: string;
  monthlyFeeMyr: string;
  totalFeesAccruedMyr: string;
}

export default function Loans() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: loans, isLoading } = useQuery<LoanWithCustomer[]>({
    queryKey: ["/api/loans"],
  });

  const filteredLoans = loans?.filter((loan) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      loan.contractNumber.toLowerCase().includes(query) ||
      loan.customerName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Active" },
      renewed: { variant: "secondary", label: "Renewed" },
      redeemed: { variant: "outline", label: "Redeemed" },
      defaulted: { variant: "destructive", label: "Defaulted" },
      auctioned: { variant: "destructive", label: "Auctioned" },
    };
    return variants[status] || { variant: "outline", label: status };
  };

  const isMaturing = (maturityDate: string) => {
    const daysUntilMaturity = Math.ceil(
      (new Date(maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilMaturity >= 0 && daysUntilMaturity <= 7;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-loans">
            Loan Ledger
          </h1>
          <p className="text-muted-foreground mt-1">Track all Qard Hasan loans and Rahn contracts</p>
        </div>
        <Button asChild data-testid="button-new-transaction">
          <Link href="/transactions/new">
            <Calendar className="w-4 h-4 mr-2" />
            New Transaction
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by contract number or customer name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-loan"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="renewed">Renewed</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredLoans || filteredLoans.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-loans">
              <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" ? "No loans found matching your criteria" : "No loans yet"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button variant="outline" asChild data-testid="button-create-first-loan">
                  <Link href="/transactions/new">Create First Transaction</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Loan Amount</TableHead>
                    <TableHead className="text-right">Monthly Fee</TableHead>
                    <TableHead className="text-right">Total Fees</TableHead>
                    <TableHead>Pledge Date</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => {
                    const statusInfo = getStatusBadge(loan.status);
                    const maturing = isMaturing(loan.maturityDate) && loan.status === "active";
                    
                    return (
                      <TableRow key={loan.id} data-testid={`row-loan-${loan.id}`} className={maturing ? "bg-destructive/5" : ""}>
                        <TableCell className="font-medium font-mono text-sm">
                          {loan.contractNumber}
                        </TableCell>
                        <TableCell>
                          <Link href={`/customers/${loan.customerId}`} className="hover:underline">
                            {loan.customerName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-bold tabular-nums">
                          RM {parseFloat(loan.loanAmountMyr).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums text-sm">
                          RM {parseFloat(loan.monthlyFeeMyr).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                          RM {parseFloat(loan.totalFeesAccruedMyr).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                          {format(new Date(loan.pledgeDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                          <div className="flex items-center gap-2">
                            {format(new Date(loan.maturityDate), 'dd MMM yyyy')}
                            {maturing && (
                              <Badge variant="destructive" className="text-xs">
                                Maturing Soon
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} data-testid={`badge-status-${loan.id}`}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild data-testid={`button-view-${loan.id}`}>
                            <Link href={`/loans/${loan.id}`}>
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
    </div>
  );
}
