import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Coins,
  FileText,
  Vault,
  Building2,
  TrendingUp,
  RefreshCw,
  LogOut,
  User,
  Activity,
  Settings,
  Package,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["teller", "manager", "auditor", "admin"],
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    roles: ["teller", "manager", "admin"],
  },
  {
    title: "New Pawn Transaction",
    url: "/transactions/new",
    icon: Coins,
    roles: ["teller", "manager", "admin"],
  },
  {
    title: "Loan Ledger",
    url: "/loans",
    icon: FileText,
    roles: ["teller", "manager", "auditor", "admin"],
  },
  {
    title: "Renewals",
    url: "/renewals",
    icon: RefreshCw,
    roles: ["teller", "manager", "admin"],
  },
  {
    title: "Vault Inventory",
    url: "/vault",
    icon: Vault,
    roles: ["teller", "manager", "auditor", "admin"],
  },
  {
    title: "Gold Prices",
    url: "/gold-prices",
    icon: TrendingUp,
    roles: ["teller", "manager", "admin"],
  },
  {
    title: "Branches",
    url: "/branches",
    icon: Building2,
    roles: ["manager", "admin"],
  },
];

const accountMenuItems = [
  {
    title: "Profile & Settings",
    url: "/profile",
    icon: User,
    roles: ["teller", "manager", "auditor", "admin"],
  },
  {
    title: "Activity Log",
    url: "/activity",
    icon: Activity,
    roles: ["teller", "manager", "auditor", "admin"],
  },
];

const masterDataMenuItems = [
  {
    title: "Branches",
    url: "/master/branches",
    icon: Building2,
    roles: ["manager", "admin"],
  },
  {
    title: "Gold Prices",
    url: "/master/gold-prices",
    icon: TrendingUp,
    roles: ["manager", "admin"],
  },
  {
    title: "Suppliers",
    url: "/master/suppliers",
    icon: Package,
    roles: ["manager", "admin"],
  },
  {
    title: "Users",
    url: "/master/users",
    icon: Users,
    roles: ["admin"],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { logout } = useAuthContext();

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "teller")
  );

  const filteredAccountItems = accountMenuItems.filter((item) =>
    item.roles.includes(user?.role || "teller")
  );

  const filteredMasterDataItems = masterDataMenuItems.filter((item) =>
    item.roles.includes(user?.role || "teller")
  );

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "AR";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.64v8.18c0 4.52-3.13 8.75-8 9.82-4.87-1.07-8-5.3-8-9.82V7.82l8-3.64z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-heading font-semibold">Ar-Rahnu</h1>
            <p className="text-xs text-muted-foreground">Islamic Pawn Broking</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredAccountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredMasterDataItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Master Data</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMasterDataItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} className="object-cover" />
            <AvatarFallback className="text-xs">
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize" data-testid="text-user-role">
              {user?.role}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          data-testid="button-logout"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
