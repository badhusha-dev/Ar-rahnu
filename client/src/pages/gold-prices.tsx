import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface GoldPrice {
  karat: string;
  pricePerGramMyr: number;
  pricePerOunceMyr: number;
  lastUpdated: string;
}

interface GoldPriceResponse {
  prices: GoldPrice[];
  timestamp: string;
  source: string;
}

export default function GoldPrices() {
  const { data, isLoading, refetch, isRefetching } = useQuery<GoldPriceResponse>({
    queryKey: ["/api/gold-prices"],
  });

  const karatDescriptions: Record<string, string> = {
    "999": "24K - Purest gold",
    "916": "22K - Most common in Malaysia",
    "900": "21.6K - Traditional jewelry",
    "875": "21K - Standard gold",
    "750": "18K - Mixed alloy",
    "585": "14K - Lower purity",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-gold-prices">
            Gold Prices
          </h1>
          <p className="text-muted-foreground mt-1">Real-time gold prices in Malaysian Ringgit</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          data-testid="button-refresh-prices"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          {isRefetching ? "Refreshing..." : "Refresh Prices"}
        </Button>
      </div>

      {/* Current Prices */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Current Gold Prices</CardTitle>
              <CardDescription>
                {data?.timestamp ? (
                  <>Last updated: {format(new Date(data.timestamp), "dd MMM yyyy, hh:mm a")}</>
                ) : (
                  <>Current gold prices</>
                )}
              </CardDescription>
            </div>
            {data?.source && (
              <Badge variant="outline" data-testid="badge-source">
                Source: {data.source}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.prices || data.prices.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-prices">
              <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No price data available</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()} data-testid="button-load-prices">
                Load Prices
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karat</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price per Gram (MYR)</TableHead>
                    <TableHead className="text-right">Price per Ounce (MYR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.prices.map((price) => (
                    <TableRow key={price.karat} data-testid={`row-price-${price.karat}`}>
                      <TableCell className="font-semibold">
                        <Badge variant="secondary" data-testid={`badge-karat-${price.karat}`}>{price.karat}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {karatDescriptions[price.karat] || "Standard gold"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg tabular-nums" data-testid={`price-gram-${price.karat}`}>
                        RM {price.pricePerGramMyr.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-muted-foreground" data-testid={`price-ounce-${price.karat}`}>
                        RM {price.pricePerOunceMyr.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market Reference</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Prices are sourced from international gold markets and converted to MYR at current exchange rates.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Karat Purity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>999 (24K) is the purest form. 916 (22K) is most commonly used for jewelry in Malaysia and Islamic gold trading.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loan Margin</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Typical Ar-Rahnu loans are 70-80% of the gold's market value based on current prices.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
