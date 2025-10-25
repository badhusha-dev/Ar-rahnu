import { Plus, Vault, RefreshCw, ShoppingCart, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";
import { Link } from "wouter";

export function QuickActions() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const canAccessRahnu = user.scope === 'rahnu' || user.scope === 'admin';
  const canAccessBse = user.scope === 'bse' || user.scope === 'admin';
  const isStaff = ['teller', 'manager', 'admin'].includes(user.role);
  
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Rahnu Quick Actions */}
        {canAccessRahnu && isStaff && (
          <>
            <Link href="/loans/new">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Plus className="h-5 w-5" />
                <span className="text-xs">New Loan</span>
              </Button>
            </Link>
            
            <Link href="/vault">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <Vault className="h-5 w-5" />
                <span className="text-xs">Vault</span>
              </Button>
            </Link>
            
            <Link href="/renewals">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <RefreshCw className="h-5 w-5" />
                <span className="text-xs">Renew Loan</span>
              </Button>
            </Link>
          </>
        )}
        
        {/* BSE Quick Actions */}
        {canAccessBse && (
          <>
            <Link href="/bse/buy">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs">Buy Gold</span>
              </Button>
            </Link>
            
            <Link href="/bse/sell">
              <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Sell Gold</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}

