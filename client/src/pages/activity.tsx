import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, XCircle, Shield, Calendar, MapPin, Monitor } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LoginHistoryItem {
  id: string;
  loginAt: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  success: boolean;
  failureReason?: string;
  twoFactorUsed: boolean;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  const { data: loginHistory, isLoading } = useQuery<LoginHistoryItem[]>({
    queryKey: ['/api/user/activity'],
    enabled: !!user,
  });

  const filteredHistory = loginHistory?.filter((item) => {
    if (filter === 'success') return item.success;
    if (filter === 'failed') return !item.success;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loader-activity" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-activity">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">View your account login history and security events</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Login History</CardTitle>
              <CardDescription>Track all login attempts to your account</CardDescription>
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40" data-testid="select-filter">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attempts</SelectItem>
                <SelectItem value="success">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredHistory && filteredHistory.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>2FA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item) => (
                    <TableRow key={item.id} data-testid={`row-activity-${item.id}`}>
                      <TableCell>
                        {item.success ? (
                          <Badge variant="default" className="bg-green-500" data-testid={`status-success-${item.id}`}>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive" data-testid={`status-failed-${item.id}`}>
                            <XCircle className="mr-1 h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-date-${item.id}`}>
                            {format(new Date(item.loginAt), 'PPp')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span data-testid={`text-device-${item.id}`}>
                              {item.device || 'Unknown'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.browser} • {item.os}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-ip-${item.id}`}>{item.ipAddress}</span>
                        </div>
                        {item.failureReason && (
                          <div className="text-xs text-destructive mt-1" data-testid={`text-failure-${item.id}`}>
                            {item.failureReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.twoFactorUsed ? (
                          <Badge variant="outline" className="bg-primary/10" data-testid={`badge-2fa-${item.id}`}>
                            <Shield className="mr-1 h-3 w-3" />
                            2FA
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No login history found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
