import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DashboardMetrics {
  totalLoans: number;
  activeLoans: number;
  totalUjrah: number;
  defaultedLoans: number;
  goldHoldings: number;
  customerCount: number;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLoans: 0,
    activeLoans: 0,
    totalUjrah: 0,
    defaultedLoans: 0,
    goldHoldings: 0,
    customerCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const branchPerformance = [
    { name: 'KL Main', loans: 145, ujrah: 45000, defaults: 5 },
    { name: 'Shah Alam', loans: 98, ujrah: 32000, defaults: 3 },
    { name: 'Penang', loans: 87, ujrah: 28000, defaults: 2 },
    { name: 'Johor', loans: 76, ujrah: 25000, defaults: 4 },
  ];

  const monthlyRevenue = [
    { month: 'Jan', rahnu: 35000, bse: 28000 },
    { month: 'Feb', rahnu: 42000, bse: 31000 },
    { month: 'Mar', rahnu: 38000, bse: 35000 },
    { month: 'Apr', rahnu: 45000, bse: 38000 },
    { month: 'May', rahnu: 48000, bse: 42000 },
    { month: 'Jun', rahnu: 52000, bse: 45000 },
  ];

  const loanStatus = [
    { name: 'Active', value: 245, color: '#10b981' },
    { name: 'Matured', value: 87, color: '#f59e0b' },
    { name: 'Defaulted', value: 14, color: '#ef4444' },
    { name: 'Redeemed', value: 398, color: '#3b82f6' },
  ];

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setMetrics({
        totalLoans: 744,
        activeLoans: 245,
        totalUjrah: 145000,
        defaultedLoans: 14,
        goldHoldings: 12.5,
        customerCount: 1289,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const exportCSV = () => {
    const csvContent = [
      ['Branch', 'Total Loans', 'Ujrah Revenue', 'Defaults'],
      ...branchPerformance.map(b => [b.name, b.loans, b.ujrah, b.defaults])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportPDF = async () => {
    // In production, call backend API to generate PDF
    alert('PDF export would generate a comprehensive report via backend API');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' ? 'Enterprise-wide' : `Branch: ${user?.branchId}`} Performance Metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Loans</p>
              <p className="text-3xl font-bold">{metrics.totalLoans}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Ujrah Revenue</p>
              <p className="text-3xl font-bold">RM {metrics.totalUjrah.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Default Rate</p>
              <p className="text-3xl font-bold">{((metrics.defaultedLoans / metrics.totalLoans) * 100).toFixed(1)}%</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                {metrics.defaultedLoans} loans
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Branch Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="loans" fill="#3b82f6" name="Total Loans" />
              <Bar dataKey="defaults" fill="#ef4444" name="Defaults" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Loan Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Loan Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={loanStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {loanStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend (RM)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rahnu" stroke="#10b981" name="Ar-Rahnu" strokeWidth={2} />
            <Line type="monotone" dataKey="bse" stroke="#f59e0b" name="BSE" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

