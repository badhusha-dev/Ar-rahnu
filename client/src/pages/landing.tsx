import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ShieldCheck, TrendingUp, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.64v8.18c0 4.52-3.13 8.75-8 9.82-4.87-1.07-8-5.3-8-9.82V7.82l8-3.64z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-heading font-semibold text-foreground">Ar-Rahnu</h1>
              <p className="text-xs text-muted-foreground">Islamic Pawn Broking</p>
            </div>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground leading-tight">
            Shariah-Compliant Pawn Broking<br />Management System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive solution for managing Ar-Rahnu operations with full compliance to Islamic Shariah principles. 
            Handle customer registration, gold valuations, Rahn contracts, and Qard Hasan loans seamlessly.
          </p>
          <div className="pt-4">
            <Button size="lg" asChild data-testid="button-get-started">
              <a href="/api/login" className="px-8">
                Get Started
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-2xl font-heading font-semibold text-center mb-12">Core Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="card-feature-customers">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete KYC verification, IC scanning, and customer profile management with transaction history tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-valuation">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Gold Valuation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time gold price integration with support for multiple karats (999, 916, 900) and automatic market value calculation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-compliance">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-chart-1" />
                </div>
                <CardTitle className="text-lg">Shariah Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interest-free Qard Hasan loans with transparent Ujrah (safekeeping fees) and complete audit trails for Shariah reporting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-branches">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-chart-2/20 flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6 text-chart-2" />
                </div>
                <CardTitle className="text-lg">Multi-Branch</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage multiple branches with vault tracking, inventory management, and centralized reporting across all locations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h3 className="text-3xl font-heading font-semibold text-foreground">
            Ready to streamline your Ar-Rahnu operations?
          </h3>
          <p className="text-muted-foreground">
            Sign in to access the full management system with role-based access control for tellers, managers, and auditors.
          </p>
          <Button size="lg" asChild data-testid="button-cta-signin">
            <a href="/api/login" className="px-8">
              Sign In to Continue
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ar-Rahnu Islamic Pawn Broking System. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-arabic">
            بسم الله الرحمن الرحيم
          </p>
        </div>
      </footer>
    </div>
  );
}
