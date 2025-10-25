import { useState, useEffect } from 'react';
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
import { Loader2, Mail, Lock, Eye, EyeOff, Moon, Sun, Users } from 'lucide-react';
import { useTheme } from 'next-themes';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  firstName: string;
  lastName: string;
}

interface GroupedUsers {
  rahnu: DemoUser[];
  bse: DemoUser[];
  both: DemoUser[];
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [demoUsers, setDemoUsers] = useState<GroupedUsers>({ rahnu: [], bse: [], both: [] });
  const [loadingUsers, setLoadingUsers] = useState(true);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      twoFactorCode: '',
    },
  });

  // Fetch demo users on mount
  useEffect(() => {
    async function fetchDemoUsers() {
      try {
        const response = await fetch('/api/auth/demo-users');
        if (response.ok) {
          const users = await response.json();
          setDemoUsers(users);
        }
      } catch (error) {
        console.error('Failed to fetch demo users:', error);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchDemoUsers();
  }, []);

  // Password mapping for old BSE system
  const getPasswordForUser = (email: string, role: string) => {
    // Old system uses role-based passwords
    const passwordMap: Record<string, string> = {
      'admin': 'Admin@123',
      'manager': 'Manager@123',
      'teller': 'Teller@123',
      'customer': 'Customer@123',
    };
    return passwordMap[role] || 'demo123';
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    // Find user across all groups
    const allUsers = [...demoUsers.rahnu, ...demoUsers.bse, ...demoUsers.both];
    const user = allUsers.find(u => u.role === role);
    if (user) {
      form.setValue('email', user.email);
      form.setValue('password', getPasswordForUser(user.email, user.role));
    }
  };

  const handleDemoUserClick = (user: DemoUser) => {
    setSelectedRole(user.role);
    form.setValue('email', user.email);
    form.setValue('password', getPasswordForUser(user.email, user.role));
    toastify.info(`Demo credentials loaded for ${user.name}`, {
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
              {/* Quick Role Selector */}
              {(demoUsers.both.length > 0 || demoUsers.rahnu.length > 0 || demoUsers.bse.length > 0) && (
                <div className="space-y-2">
                  <Label htmlFor="role">Quick select user</Label>
                  <Select value={selectedRole} onValueChange={handleRoleSelect}>
                    <SelectTrigger id="role" data-testid="select-role">
                      <SelectValue placeholder="Choose a demo user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {demoUsers.both.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400">⚙️ Both Modules</div>
                          {demoUsers.both.map((user) => (
                            <SelectItem key={user.id} value={user.role}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {demoUsers.rahnu.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-400">🕌 Ar-Rahnu</div>
                          {demoUsers.rahnu.map((user) => (
                            <SelectItem key={user.id} value={user.role}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {demoUsers.bse.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400">🪙 BSE</div>
                          {demoUsers.bse.map((user) => (
                            <SelectItem key={user.id} value={user.role}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">⚡ Quick Demo Login</h3>
              </div>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading users...</span>
                </div>
              ) : (
                <>
                  {/* Both Modules Group */}
                  {demoUsers.both.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1">
                        ⚙️ Both Modules
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {demoUsers.both.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleDemoUserClick(user)}
                            className="p-2 text-left text-xs bg-white dark:bg-gray-700 rounded border border-purple-200 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="font-semibold text-purple-700 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300">
                              {user.name}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 truncate text-[10px]">{user.email}</div>
                            <div className="text-gray-500 dark:text-gray-500 text-[10px] mt-1">
                              <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                                {user.role}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ar-Rahnu Group */}
                  {demoUsers.rahnu.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1 flex items-center gap-1">
                        🕌 Ar-Rahnu Users
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {demoUsers.rahnu.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleDemoUserClick(user)}
                            className="p-2 text-left text-xs bg-white dark:bg-gray-700 rounded border border-yellow-200 dark:border-yellow-600 hover:border-yellow-500 dark:hover:border-yellow-400 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="font-semibold text-yellow-700 dark:text-yellow-400 group-hover:text-yellow-800 dark:group-hover:text-yellow-300">
                              {user.name}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 truncate text-[10px]">{user.email}</div>
                            <div className="text-gray-500 dark:text-gray-500 text-[10px] mt-1">
                              <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
                                {user.role}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BSE Group */}
                  {demoUsers.bse.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                        🪙 BSE Users
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {demoUsers.bse.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleDemoUserClick(user)}
                            className="p-2 text-left text-xs bg-white dark:bg-gray-700 rounded border border-green-200 dark:border-green-600 hover:border-green-500 dark:hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="font-semibold text-green-700 dark:text-green-400 group-hover:text-green-800 dark:group-hover:text-green-300">
                              {user.name}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 truncate text-[10px]">{user.email}</div>
                            <div className="text-gray-500 dark:text-gray-500 text-[10px] mt-1">
                              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                {user.role}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center">
                Passwords: <span className="font-mono font-semibold">demo123</span> (new users) or role-based
              </p>
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
