# Buku Simpanan Emas (BSE) - Gold Savings & Trading System

## 🌟 System Overview

Buku Simpanan Emas (BSE) is a Shariah-compliant digital gold savings and trading platform that allows customers to buy, sell, and manage gold holdings online. The system provides complete lifecycle management of gold trading operations, inventory tracking, and multi-role access control.

## 👥 User Roles

The system supports four role levels, each with dedicated access permissions:

### 1. Customer 
- View digital gold wallet balance (grams + MYR equivalent)
- Buy gold instantly with live price lock
- Sell gold from their balance
- View transaction history
- Download receipts
- Update profile and security settings

### 2. Teller
- Execute customer transactions (buy/sell)
- Record payments
- View customer accounts
- Issue receipts
- Access branch inventory

### 3. Manager
- All teller permissions
- Approve large transactions
- View branch performance reports
- Manage tellers
- Access financial analytics

### 4. Admin
- Full system access
- Manage all users and roles
- Adjust gold buy/sell margins
- Manage inventory across all branches
- Approve supplier invoices
- Access Shariah and accounting reports
- Manage branches

## 🎯 Core Features

### Gold Trading Module
- **Buy Gold**: Purchase digital gold by RM or grams with instant price lock
- **Sell Gold**: Convert gold holdings back to cash
- **Live Pricing**: Real-time gold price updates with configurable margins
- **Multi-Karat Support**: 999, 916, 900, 875, 750, 585
- **Instant Settlement**: Immediate balance updates post-transaction
- **Bai' al-Sarf Compliance**: All transactions follow Islamic trading principles

### Inventory Management
- Track physical gold stock (bars, coins, jewelry, wafers)
- Manage vault inventory across branches
- RFID/Barcode ready structure
- Serial number tracking
- Supplier invoice management
- Stock level monitoring

### Financial & Accounting
- Auto-updated gold account balances
- Transaction ledger with audit trails
- Buy/sell spread profit tracking
- Branch-level reporting
- Zakat calculation ready

### Payment Integration (Ready Structure)
- FPX payment gateway integration ready
- DuitNow QR payment support ready
- Credit/Debit card processing ready
- Cash transaction recording
- Payment reference tracking

## 📊 Database Schema

### Core Tables

**users** - User accounts with role-based access
- Supports: customer, teller, manager, admin roles
- Includes 2FA, email verification, session tracking

**gold_accounts** - Customer digital gold wallets
- Balance tracking (grams and MYR equivalent)
- Total buy/sell history
- Real-time value calculation

**gold_transactions** - Buy/sell transaction records
- Transaction type (buy/sell)
- Rate lock at transaction time
- Payment method and status
- Shariah-compliant contract generation

**inventory** - Physical gold stock management
- Product types: bars, coins, jewelry, wafers
- Karat variations: 999 to 585
- Serial number and barcode tracking
- Branch-level inventory

**gold_prices** - Historical price tracking
- Buy/sell prices per karat
- Margin percentage tracking
- Effective date for price changes

**suppliers** - Gold supplier management
- Contact and banking details
- Invoice tracking
- Active/inactive status

**branches** - Multi-branch support
- Branch codes and locations
- Manager assignments
- Operating status

**audit_logs** - System-wide activity tracking
- User actions
- Entity changes
- IP and timestamp logging

## 🔐 Security Features

- JWT access + refresh token authentication
- Password hashing (bcrypt with 12 salt rounds)
- Role-based authorization middleware
- CSRF + XSS protection
- Rate limiting on sensitive endpoints
- Account lockout after failed attempts
- Email verification for new accounts
- Optional 2FA (TOTP/Email OTP)
- Comprehensive audit logging

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/user` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/2fa/setup` - Setup 2FA

### Gold Trading (Customer)
- `GET /api/gold-prices` - Get current gold prices
- `GET /api/gold-account` - Get user's gold wallet
- `GET /api/gold-transactions` - Get user's transaction history
- `POST /api/gold/buy` - Buy gold
- `POST /api/gold/sell` - Sell gold

### Management (Admin/Manager)
- `GET /api/users` - Get all users
- `GET /api/transactions` - Get all transactions
- `PATCH /api/transactions/:id/approve` - Approve transaction
- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create branch
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Add inventory item
- `GET /api/suppliers` - Get suppliers
- `POST /api/suppliers` - Create supplier
- `POST /api/gold-prices` - Update gold prices
- `GET /api/audit-logs` - Get audit logs

### Reports & Analytics
- `GET /api/dashboard/stats` - Dashboard statistics

## 💰 Gold Price Management

The system supports dynamic gold pricing with configurable buy/sell spreads:

**Current Prices (Development Mode)**:
- 999 (24K): Buy RM336.53/g | Sell RM304.48/g
- 916 (22K): Buy RM308.26/g | Sell RM278.90/g
- 900 (21.6K): Buy RM302.87/g | Sell RM274.03/g
- 875 (21K): Buy RM294.46/g | Sell RM266.42/g
- 750 (18K): Buy RM252.40/g | Sell RM228.36/g
- 585 (14K): Buy RM196.86/g | Sell RM178.12/g

**Live Integration**: Configure `GOLD_API_KEY` to use Metals-API for real-time pricing.

## 🗄️ Database Setup

The system uses PostgreSQL with Drizzle ORM:

```bash
# Push schema to database
npm run db:push

# Run seed data (creates branches and gold prices)
# Note: Seed data already inserted via SQL
```

## 🌐 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- SMTP server (optional, for emails)

### Environment Variables
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
SESSION_SECRET=your_secret
SMTP_HOST=smtp.example.com (optional)
SMTP_PORT=587 (optional)
SMTP_USER=user@example.com (optional)
SMTP_PASSWORD=password (optional)
GOLD_API_KEY=your_key (optional)
FRONTEND_URL=https://your-domain.com
```

### Running the Application

```bash
# Development
npm run dev

# Production Build
npm run build
npm run start
```

## 📱 Frontend Architecture

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: Wouter for client-side routing
- **State**: TanStack Query for server state
- **UI**: shadcn/ui components + Tailwind CSS
- **Forms**: React Hook Form + Zod validation

### Key Pages (To Be Built)
- `/` - Login page
- `/register` - Customer registration
- `/dashboard` - Role-based dashboard
- `/wallet` - Customer gold wallet (buy/sell)
- `/transactions` - Transaction history
- `/admin/users` - User management
- `/admin/inventory` - Inventory management
- `/manager/reports` - Branch reports
- `/teller/transactions` - Create transactions

## 📋 Shariah Compliance

### Islamic Trading Principles

**Bai' al-Sarf** (Gold Trading):
- Spot transactions only (no futures/options)
- Instant settlement and delivery
- No interest-bearing loans
- Transparent pricing
- Fair exchange rates

**Wadiah** (Safekeeping):
- Secure storage of physical gold
- Customer retains ownership
- No mixing of customer assets
- Insurance and vault management

**Contract Documentation**:
- Clear terms and conditions
- Both parties' signatures
- Transaction date and details
- Delivery/settlement terms

## 🎨 Design System

- **Color Palette**: Green/Gold theme (Islamic cultural customization)
- **Light/Dark Mode**: Full theme support
- **Responsive Design**: Mobile-first approach
- **Icons**: Lucide React + React Icons

## 📈 Future Enhancements

- [ ] Dark/Light mode toggle in dashboard
- [ ] Activity logs for login/logout events
- [ ] AI-powered gold savings plan recommendations
- [ ] Multi-language support (EN/BM/AR)
- [ ] Physical gold delivery requests
- [ ] Zakat auto-calculation
- [ ] Gold accumulation plans (auto-buy)
- [ ] Mobile app (React Native)

## 🛠️ Tech Stack

**Backend**:
- Node.js + Express.js
- PostgreSQL + Drizzle ORM
- JWT Authentication
- Passport.js
- TypeScript

**Frontend**:
- React 18
- Vite
- TailwindCSS
- TanStack Query
- Wouter
- shadcn/ui

**DevOps**:
- Replit Deployment Platform
- Automatic scaling
- PostgreSQL (Neon-backed)

## 📞 Support

For issues or questions, contact the BSE support team or refer to the system documentation.

---

**Built with ❤️ following Islamic principles**
