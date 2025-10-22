import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (!tokenParam) {
      toast({
        title: 'Invalid Link',
        description: 'Password reset token is missing',
        variant: 'destructive',
      });
      setLocation('/forgot-password');
    } else {
      setToken(tokenParam);
    }
  }, [location]);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: ResetPasswordForm) {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invalid reset token',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest('POST', '/api/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      const result = await res.json();

      setResetSuccess(true);
      toast({
        title: 'Password Reset Successful',
        description: result.message,
      });

      setTimeout(() => {
        setLocation('/login');
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-2xl" data-testid="card-reset-password">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              {resetSuccess ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <Lock className="h-8 w-8 text-primary" />
              )}
            </motion.div>
            <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {resetSuccess
                ? 'Your password has been reset successfully'
                : 'Choose a new strong password for your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-500/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to the login page...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      data-testid="input-password"
                      {...form.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      data-testid="input-confirm-password"
                      {...form.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      data-testid="button-toggle-confirm-password"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>At least 8 characters long</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-reset-password"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>
          {!resetSuccess && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Remember your password?{' '}
                <Button
                  variant="link"
                  className="px-1 font-semibold"
                  onClick={() => setLocation('/login')}
                  data-testid="link-login"
                >
                  Sign in here
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
