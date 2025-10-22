import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setError('Verification token is missing');
      setIsLoading(false);
      return;
    }

    verifyEmail(token);
  }, [location]);

  async function verifyEmail(token: string) {
    try {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setVerified(true);
      toast({
        title: 'Email Verified',
        description: data.message,
      });

      setTimeout(() => {
        setLocation('/login');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to verify email');
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-2xl" data-testid="card-verify-email">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              {isLoading ? (
                <Mail className="h-8 w-8 text-primary" />
              ) : verified ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive" />
              )}
            </motion.div>
            <CardTitle className="text-3xl font-bold">Email Verification</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Verifying your email address...'
                : verified
                ? 'Your email has been verified successfully'
                : 'Email verification failed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="loader-verifying" />
                <p className="mt-4 text-sm text-muted-foreground">Please wait...</p>
              </div>
            ) : verified ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-500/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Your email has been successfully verified. You can now log in to your account.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Redirecting you to the login page in 3 seconds...
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setLocation('/login')}
                  data-testid="button-go-to-login"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-destructive/10 p-4 text-center">
                  <p className="text-sm text-destructive font-semibold">
                    {error || 'Unable to verify your email address'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    The verification link may have expired or is invalid.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/login')}
                    data-testid="button-back-to-login"
                  >
                    Back to Login
                  </Button>
                  <Button
                    onClick={() => setLocation('/register')}
                    data-testid="button-register-again"
                  >
                    Register Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
