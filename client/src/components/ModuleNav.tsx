import { Building2, Coins } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";

export function ModuleNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Admin can see both modules
  const canAccessRahnu = user.scope === 'rahnu' || user.scope === 'admin';
  const canAccessBse = user.scope === 'bse' || user.scope === 'admin';
  
  const isRahnuActive = location.startsWith('/rahnu') || location.startsWith('/loans') || location.startsWith('/vault');
  const isBseActive = location.startsWith('/bse') || location.startsWith('/gold') || location.startsWith('/inventory');
  
  return (
    <div className="border-b bg-background">
      <div className="container mx-auto">
        <div className="flex items-center gap-1">
          {canAccessRahnu && (
            <Link href="/rahnu/dashboard">
              <a
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                  isRahnuActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Building2 className="h-4 w-4" />
                Ar-Rahnu
                <span className="text-xs text-muted-foreground">(Pawn Broking)</span>
              </a>
            </Link>
          )}
          
          {canAccessBse && (
            <Link href="/bse/dashboard">
              <a
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                  isBseActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Coins className="h-4 w-4" />
                BSE
                <span className="text-xs text-muted-foreground">(Gold Savings)</span>
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

