import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, Monitor, Smartphone, Tablet, LogOut, Calendar, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  loginAt: string;
  userAgent: string;
}

export default function SessionsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['/api/user/sessions'],
    enabled: !!user,
  });

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout-all');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'All Sessions Terminated',
        description: 'You have been logged out from all devices',
      });
      logout();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout from all sessions',
        variant: 'destructive',
      });
    },
  });

  const getDeviceIcon = (device: string) => {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loader-sessions" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-sessions">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
          <p className="text-muted-foreground">Manage your active login sessions across devices</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => logoutAllMutation.mutate()}
          disabled={logoutAllMutation.isPending}
          data-testid="button-logout-all"
        >
          {logoutAllMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <LogOut className="mr-2 h-4 w-4" />
          Logout All Sessions
        </Button>
      </div>

      <div className="grid gap-4">
        {sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <Card key={session.id} data-testid={`card-session-${session.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">{getDeviceIcon(session.device)}</div>
                    <div>
                      <CardTitle className="text-lg">
                        {session.device || 'Unknown Device'}
                      </CardTitle>
                      <CardDescription>
                        {session.browser} on {session.os}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span data-testid={`text-ip-${session.id}`}>{session.ipAddress}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span data-testid={`text-login-time-${session.id}`}>
                    {formatDistanceToNow(new Date(session.loginAt), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No active sessions found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
