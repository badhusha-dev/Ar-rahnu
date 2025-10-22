import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ToastContainer, toast as toastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2, Mail, Lock, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const demoAccounts = [
  { role: 'admin', email: 'admin@bse.my', password: 'Admin@123', label: 'Admin' },
  { role: 'manager', email: 'manager@bse.my', password: 'Manager@123', label: 'Manager' },
  { role: 'teller', email: 'teller@bse.my', password: 'Teller@123', label: 'Teller' },
  { role: 'customer', email: 'customer@bse.my', password: 'Customer@123', label: 'Customer' },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      twoFactorCode: '',
    },
  });

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    const account = demoAccounts.find(acc => acc.role === role);
    if (account) {
      form.setValue('email', account.email);
      form.setValue('password', account.password);
    }
  };

  const handleDemoAccountClick = (account: typeof demoAccounts[0]) => {
    setSelectedRole(account.role);
    form.setValue('email', account.email);
    form.setValue('password', account.password);
    toastify.info(`Demo credentials loaded for ${account.label}`, {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password, data.rememberMe, data.twoFactorCode);

      if (result.requiresTwoFactor) {
        toast({
          title: 'Two-Factor Authentication Required',
          description: 'Please enter your authenticator code.',
        });
        return;
      }

      toastify.success('Login successful! Welcome back!', {
        position: 'top-right',
        autoClose: 3000,
      });

      switch (result.user.role) {
        case 'admin':
          setLocation('/admin/dashboard');
          break;
        case 'manager':
          setLocation('/manager/dashboard');
          break;
        case 'teller':
          setLocation('/teller/dashboard');
          break;
        case 'customer':
          setLocation('/customer/dashboard');
          break;
        default:
          setLocation('/dashboard');
      }
    } catch (error: any) {
      toastify.error(error.message || 'Invalid credentials', {
        position: 'top-right',
        autoClose: 3000,
      });
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <ToastContainer />
      
      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-4 right-4 z-50"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          data-testid="button-theme-toggle"
          className="rounded-full bg-white dark:bg-gray-800 shadow-lg"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 shadow-2xl" data-testid="card-login">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-2 text-5xl"
            >
              🕌
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              Buku Simpanan Emas (BSE)
            </CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Login As Selector */}
              <div className="space-y-2">
                <Label htmlFor="role">Login as</Label>
                <Select value={selectedRole} onValueChange={handleRoleSelect}>
                  <SelectTrigger id="role" data-testid="select-role">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="teller">Teller</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-0 text-xs h-auto"
                    onClick={() => setLocation('/forgot-password')}
                    data-testid="link-forgot-password"
                  >
                    Forgot password?
                  </Button>
                </div>
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
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={form.watch('rememberMe')}
                  onCheckedChange={(checked) => form.setValue('rememberMe', checked as boolean)}
                  data-testid="checkbox-remember-me"
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  Remember me for 7 days
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            {/* Demo Accounts Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Demo Accounts</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleDemoAccountClick(account)}
                    className="p-2 text-left text-xs bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer"
                    data-testid={`button-demo-${account.role}`}
                  >
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400">{account.label}</div>
                    <div className="text-gray-600 dark:text-gray-400 truncate">{account.email}</div>
                    <div className="text-gray-500 dark:text-gray-500">{account.password}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Button
                variant="ghost"
                className="px-1 font-semibold h-auto"
                onClick={() => setLocation('/register')}
                data-testid="link-register"
              >
                Register here
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
