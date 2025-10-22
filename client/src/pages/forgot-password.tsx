import { useState } from 'react';
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
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordForm) {
    setIsLoading(true);
    try {
      const res = await apiRequest('POST', '/api/auth/forgot-password', data);
      const result = await res.json();

      setSubmitted(true);
      toast({
        title: 'Reset Email Sent',
        description: result.message,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
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
        <Card className="border-2 shadow-2xl" data-testid="card-forgot-password">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <KeyRound className="h-8 w-8 text-primary" />
            </motion.div>
            <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              {submitted
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive a password reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    If an account exists with that email, you will receive password reset instructions shortly.
                    The link will expire in 10 minutes.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setLocation('/login')}
                  data-testid="button-back-to-login"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      data-testid="input-email"
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-send-reset-link"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>
          {!submitted && (
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
