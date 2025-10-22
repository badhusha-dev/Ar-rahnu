import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, User, Lock, Shield, QrCode, Smartphone, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const [twoFactorQR, setTwoFactorQR] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordForm) => {
      const res = await apiRequest('POST', '/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully',
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/2fa/setup');
      return await res.json();
    },
    onSuccess: (data) => {
      setTwoFactorQR(data.qrCode);
      setTwoFactorSecret(data.secret);
      toast({
        title: '2FA Setup Started',
        description: 'Scan the QR code with your authenticator app',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to setup 2FA',
        variant: 'destructive',
      });
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest('POST', '/api/auth/2fa/enable', { token: code });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled successfully',
      });
      setTwoFactorQR(null);
      setTwoFactorSecret(null);
      setVerificationCode('');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest('POST', '/api/auth/2fa/disable', { password });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
    },
  });

  const onPasswordSubmit = (data: ChangePasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-profile">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and security preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account" data-testid="tab-account">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="2fa" data-testid="tab-2fa">
            <Shield className="mr-2 h-4 w-4" />
            Two-Factor Auth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <p className="mt-1 text-sm" data-testid="text-first-name">{user.firstName || 'N/A'}</p>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <p className="mt-1 text-sm" data-testid="text-last-name">{user.lastName || 'N/A'}</p>
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <p className="mt-1 text-sm" data-testid="text-email">{user.email}</p>
              </div>
              <div>
                <Label>Role</Label>
                <p className="mt-1 text-sm capitalize" data-testid="text-role">{user.role}</p>
              </div>
              <div>
                <Label>Email Verified</Label>
                <p className="mt-1 text-sm" data-testid="text-email-verified">
                  {user.emailVerified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600">⚠ Not Verified</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    data-testid="input-current-password"
                    {...passwordForm.register('currentPassword')}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    data-testid="input-new-password"
                    {...passwordForm.register('newPassword')}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    data-testid="input-confirm-password"
                    {...passwordForm.register('confirmPassword')}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  data-testid="button-change-password"
                >
                  {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Status: {user.twoFactorEnabled ? (
                    <span className="text-green-600 font-semibold">Enabled</span>
                  ) : (
                    <span className="text-muted-foreground font-semibold">Disabled</span>
                  )}
                </AlertDescription>
              </Alert>

              {!user.twoFactorEnabled && !twoFactorQR && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use an authenticator app like Google Authenticator or Authy to generate verification codes.
                  </p>
                  <Button
                    onClick={() => setup2FAMutation.mutate()}
                    disabled={setup2FAMutation.isPending}
                    data-testid="button-setup-2fa"
                  >
                    {setup2FAMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Smartphone className="mr-2 h-4 w-4" />
                    Setup Two-Factor Authentication
                  </Button>
                </div>
              )}

              {twoFactorQR && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <img src={twoFactorQR} alt="2FA QR Code" className="w-48 h-48" data-testid="img-2fa-qr" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Manual Entry Code:</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded" data-testid="text-2fa-secret">
                        {twoFactorSecret}
                      </code>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Enter Verification Code</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      data-testid="input-2fa-verification"
                    />
                  </div>
                  <Button
                    onClick={() => enable2FAMutation.mutate(verificationCode)}
                    disabled={!verificationCode || enable2FAMutation.isPending}
                    data-testid="button-enable-2fa"
                  >
                    {enable2FAMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enable 2FA
                  </Button>
                </div>
              )}

              {user.twoFactorEnabled && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication is currently enabled on your account.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const password = prompt('Enter your password to disable 2FA:');
                      if (password) {
                        disable2FAMutation.mutate(password);
                      }
                    }}
                    disabled={disable2FAMutation.isPending}
                    data-testid="button-disable-2fa"
                  >
                    {disable2FAMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Disable Two-Factor Authentication
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
