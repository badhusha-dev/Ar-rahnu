import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModuleNav } from "@/components/ModuleNav";
import { QuickActions } from "@/components/QuickActions";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import VerifyEmailPage from "@/pages/verify-email";
import ProfilePage from "@/pages/profile";
import SessionsPage from "@/pages/sessions";
import ActivityPage from "@/pages/activity";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ManagerDashboard from "@/pages/manager-dashboard";
import TellerDashboard from "@/pages/teller-dashboard";
import CustomerDashboard from "@/pages/customer-dashboard";
import Customers from "@/pages/customers";
import NewCustomer from "@/pages/new-customer";
import CustomerDetail from "@/pages/customer-detail";
import GoldPrices from "@/pages/gold-prices";
import Loans from "@/pages/loans";
import NewTransaction from "@/pages/new-transaction";
import Vault from "@/pages/vault";
import Branches from "@/pages/branches";
import Renewals from "@/pages/renewals";
import BranchesMaster from "@/pages/master/branches";
import GoldPricesMaster from "@/pages/master/gold-prices";
import SuppliersMaster from "@/pages/master/suppliers";
import UsersMaster from "@/pages/master/users";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        <Route component={LoginPage} />
      </Switch>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
            <div className="mx-auto max-w-7xl">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route path="/manager/dashboard" component={ManagerDashboard} />
                <Route path="/teller/dashboard" component={TellerDashboard} />
                <Route path="/customer/dashboard" component={CustomerDashboard} />
                <Route path="/profile" component={ProfilePage} />
                <Route path="/sessions" component={SessionsPage} />
                <Route path="/activity" component={ActivityPage} />
                <Route path="/customers" component={Customers} />
                <Route path="/customers/new" component={NewCustomer} />
                <Route path="/customers/:id" component={CustomerDetail} />
                <Route path="/gold-prices" component={GoldPrices} />
                <Route path="/loans" component={Loans} />
                <Route path="/transactions/new" component={NewTransaction} />
                <Route path="/vault" component={Vault} />
                <Route path="/branches" component={Branches} />
                <Route path="/renewals" component={Renewals} />
                <Route path="/master/branches" component={BranchesMaster} />
                <Route path="/master/gold-prices" component={GoldPricesMaster} />
                <Route path="/master/suppliers" component={SuppliersMaster} />
                <Route path="/master/users" component={UsersMaster} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
