import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Package } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface VaultItemWithDetails {
  id: string;
  pawnTransactionId: string;
  contractNumber: string;
  customerName: string;
  vaultSection: string;
  vaultPosition: string;
  barcode: string | null;
  rfidTag: string | null;
  status: string;
  storedDate: string;
  lastAuditDate: string | null;
}

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vaultItems, isLoading } = useQuery<VaultItemWithDetails[]>({
    queryKey: ["/api/vault"],
  });

  const filteredItems = vaultItems?.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.contractNumber.toLowerCase().includes(query) ||
      item.customerName.toLowerCase().includes(query) ||
      item.vaultSection.toLowerCase().includes(query) ||
      item.vaultPosition.toLowerCase().includes(query) ||
      (item.barcode && item.barcode.toLowerCase().includes(query)) ||
      (item.rfidTag && item.rfidTag.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      stored: { variant: "default", label: "Stored" },
      released: { variant: "secondary", label: "Released" },
      transferred: { variant: "secondary", label: "Transferred" },
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  const storedCount = vaultItems?.filter(item => item.status === "stored").length || 0;
  const totalCapacity = 100; // Example capacity
  const occupancyPercentage = Math.round((storedCount / totalCapacity) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-vault">
          Vault Inventory
        </h1>
        <p className="text-muted-foreground mt-1">Track gold items in secure storage</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card data-testid="card-vault-occupancy">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vault Occupancy</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-occupancy-percentage">
                  {occupancyPercentage}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {storedCount} of {totalCapacity} positions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-items-stored">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Stored</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-items-stored">
                  {storedCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently in vault
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-items">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold tabular-nums" data-testid="text-total-items">
                  {vaultItems?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time records
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by contract, customer, location, barcode, or RFID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-vault"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vault Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vault Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredItems || filteredItems.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-vault">
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No vault items found matching your search" : "No items in vault"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vault Section</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Barcode/RFID</TableHead>
                    <TableHead>Stored Date</TableHead>
                    <TableHead>Last Audit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const statusInfo = getStatusBadge(item.status);
                    return (
                      <TableRow key={item.id} data-testid={`row-vault-${item.id}`}>
                        <TableCell className="font-medium font-mono text-sm">
                          <Link href={`/loans/${item.pawnTransactionId}`} className="hover:underline">
                            {item.contractNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {item.vaultSection}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {item.vaultPosition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.barcode && (
                            <div className="font-mono text-xs">{item.barcode}</div>
                          )}
                          {item.rfidTag && (
                            <div className="font-mono text-xs text-muted-foreground">{item.rfidTag}</div>
                          )}
                          {!item.barcode && !item.rfidTag && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                          {format(new Date(item.storedDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-sm tabular-nums">
                          {item.lastAuditDate 
                            ? format(new Date(item.lastAuditDate), 'dd MMM yyyy')
                            : <span className="text-muted-foreground">Not audited</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} data-testid={`badge-status-${item.id}`}>
                            {statusInfo.label}
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
    </div>
  );
}
