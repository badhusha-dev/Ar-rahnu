# ✅ Modular System - Configuration Complete

## 🎉 System Overview

The Ar-Rahnu + BSE modular system is now fully configured and running with a **microservices architecture**.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (React + Vite)             │
│         Port: 5173                          │
│    Unified UI for both modules              │
└────────────┬────────────────────────────────┘
             │
       ┌─────┴─────┐
       │           │
   ┌───▼───────┐   ┌──▼─────────┐
   │  Rahnu    │   │    BSE     │
   │  Backend  │   │  Backend   │
   │ Port:4001 │   │ Port:4002  │
   │           │   │            │
   │ Pawn/Loan │   │ Gold Trade │
   │  System   │   │  & Savings │
   └───┬───────┘   └──┬─────────┘
       │              │
       └──────┬───────┘
              │
       ┌──────▼───────┐
       │  PostgreSQL  │
       │   Database   │
       │   ar_rahnu   │
       └──────────────┘
```

## 🌐 Service Configuration

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Frontend** | 5173 | http://localhost:5173 | ✅ Running |
| **Rahnu API** | 4001 | http://localhost:4001 | ✅ Running |
| **BSE API** | 4002 | http://localhost:4002 | ✅ Running |

## 📁 Monorepo Structure

```
/ar-rahnu (root)
├── /apps
│   ├── /rahnu-api          # Ar-Rahnu pawn broking service
│   │   ├── /src
│   │   │   ├── index.ts    # Entry point (Port 4001)
│   │   │   └── /routes
│   │   │       ├── loans.ts
│   │   │       └── vault.ts
│   │   └── package.json
│   │
│   └── /bse-api            # BSE gold trading service
│       ├── /src
│       │   ├── index.ts    # Entry point (Port 4002)
│       │   └── /routes
│       │       └── transactions.ts
│       └── package.json
│
├── /packages
│   ├── /auth               # Shared authentication & RBAC
│   │   └── /src
│   │       ├── middleware/
│   │       │   ├── auth.ts
│   │       │   └── rbac.ts
│   │       └── utils/
│   │           ├── jwt.ts
│   │           └── password.ts
│   │
│   ├── /db                 # Shared database layer
│   │   └── /src
│   │       ├── client.ts           # Drizzle client
│   │       ├── seed.ts             # Demo data seeder
│   │       ├── /shared/schema.ts   # Users, branches, sessions
│   │       ├── /rahnu/schema.ts    # Loans, vault, customers
│   │       └── /bse/schema.ts      # Accounts, transactions
│   │
│   ├── /types              # TypeScript type definitions
│   └── /ui                 # Shared UI components
│
└── /client                 # React frontend
    ├── /src
    │   ├── App.tsx         # Main app with ThemeProvider
    │   ├── /config
    │   │   └── api.ts      # API endpoint configuration
    │   ├── /contexts
    │   │   ├── AuthContext.tsx
    │   │   └── ThemeContext.tsx
    │   └── /components
    │       ├── ThemeToggle.tsx
    │       ├── ModuleNav.tsx
    │       └── QuickActions.tsx
    └── package.json
```

## 🔧 Configuration Files Updated

### 1. Backend API Ports

**`apps/rahnu-api/src/index.ts`**
- Port: 4001 (was 5001)
- CORS: http://localhost:5173 (was 5000)

**`apps/bse-api/src/index.ts`**
- Port: 4002 (was 5002)
- CORS: http://localhost:5173 (was 5000)

### 2. Frontend Configuration

**`vite.config.ts`**
```typescript
server: {
  port: 5173,
  strictPort: true,
  // ...
}
```

**`client/src/config/api.ts`** (NEW FILE)
```typescript
export const API_ENDPOINTS = {
  RAHNU: 'http://localhost:4001',
  BSE: 'http://localhost:4002',
};
```

### 3. Root Package Scripts

**`package.json`**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:rahnu\" \"npm run dev:bse\" \"npm run dev:client\"",
    "dev:all": "concurrently \"npm run dev:rahnu\" \"npm run dev:bse\" \"npm run dev:client\"",
    "dev:rahnu": "npm run dev --workspace=@ar-rahnu/rahnu-api",
    "dev:bse": "npm run dev --workspace=@ar-rahnu/bse-api",
    "dev:client": "vite",
    "dev:web": "vite",
    "db:push": "npm run db:push --workspace=@ar-rahnu/db",
    "db:seed": "npm run seed --workspace=@ar-rahnu/db",
    "seed": "npm run seed --workspace=@ar-rahnu/db"
  }
}
```

### 4. Startup Scripts

**`start-modular-system.cmd`** (NEW FILE)
- Sets all environment variables
- Runs `npm run dev` to start all services

## 🗄️ Database Schema

### Shared Tables (Multi-tenant)
- `users` - System users with role & scope
- `branches` - Physical branch locations
- `sessions` - Active user sessions
- `refresh_tokens` - JWT refresh tokens
- `login_history` - Login audit trail
- `audit_logs` - System-wide activity logs
- `gold_prices` - Current gold rates

### Ar-Rahnu Module Tables
- `rahnu_customers` - Pawn customers
- `rahnu_loans` - Loan/pawn agreements
- `rahnu_payments` - Loan payments
- `rahnu_vault_items` - Physical items in vault
- `rahnu_renewals` - Loan renewals
- `rahnu_auctions` - Defaulted item auctions

### BSE Module Tables
- `bse_accounts` - Gold savings accounts
- `bse_transactions` - Buy/sell transactions
- `bse_inventory` - Branch gold stock
- `bse_suppliers` - Gold suppliers

## 👥 Demo User Accounts

| Role | Email | Password | Scope | Access |
|------|-------|----------|-------|--------|
| **Admin** | admin@demo.com | demo123 | `admin` | Full access to both modules |
| **Manager** | manager.rahnu@demo.com | demo123 | `rahnu` | Ar-Rahnu management |
| **Manager** | manager.bse@demo.com | demo123 | `bse` | BSE management |
| **Staff** | ali@demo.com | demo123 | `rahnu` | Rahnu operations |
| **Staff** | sara@demo.com | demo123 | `bse` | BSE operations |
| **Customer** | rahim@demo.com | demo123 | `rahnu` | Rahnu customer portal |
| **Customer** | aisha@demo.com | demo123 | `bse` | BSE customer portal |

## 📊 Demo Data Summary

### Branches
- HQ (Kuala Lumpur)
- Branch A (Petaling Jaya) - Rahnu focused
- Branch B (Shah Alam) - BSE focused

### Ar-Rahnu Module
- ✅ 2 customers
- ✅ 2 loans (1 active RM 3,400, 1 redeemed RM 5,100)
- ✅ 2 vault items (1 active, 1 released)
- ✅ 3 payments recorded
- ✅ Ujrah revenue: RM 255

### BSE Module
- ✅ 1 active customer account (Aisha)
- ✅ 5g gold in customer wallet (RM 1,750 value)
- ✅ 3 transactions (2 buys, 1 sell)
- ✅ 200g inventory in Branch B
- ✅ Gold rate: RM 350/gram (999)

### Gold Prices
- 999: RM 350.00/g (buy) / RM 345.00/g (sell)
- 916: RM 320.00/g (buy) / RM 315.00/g (sell)
- 875: RM 306.25/g (buy) / RM 301.25/g (sell)

## 🚀 How to Start

### Quick Start
```bash
.\start-modular-system.cmd
```

### Manual Start
```bash
# Set environment
$env:DATABASE_URL="postgresql://postgres:badsha@123@localhost:5432/ar_rahnu"
$env:RAHNU_API_PORT="4001"
$env:BSE_API_PORT="4002"
$env:CLIENT_URL="http://localhost:5173"

# Start all services
npm run dev
```

### Start Individual Services
```bash
npm run dev:rahnu    # Rahnu API only
npm run dev:bse      # BSE API only  
npm run dev:web      # Frontend only
```

## 🧪 Health Check Endpoints

Test if services are running:

```bash
# Rahnu API
curl http://localhost:4001/health
# Expected: {"status":"ok","service":"rahnu-api","timestamp":"..."}

# BSE API
curl http://localhost:4002/health
# Expected: {"status":"ok","service":"bse-api","timestamp":"..."}
```

## 🎯 Frontend Features

### Dynamic Module Navigation
The frontend shows tabs based on user scope:
- **Admin** → Full Dashboard | Ar-Rahnu | BSE | Analytics | Settings
- **Rahnu Staff** → Dashboard | Ar-Rahnu | Reports
- **BSE Staff** → Dashboard | BSE | Reports
- **Customer** → My Account | Transactions | History

### Theme Toggle
- Dark/Light mode switcher in header
- Persists to localStorage
- Respects system preference

### Quick Actions Bar
- Create Loan (Rahnu staff)
- Buy Gold (BSE staff)
- Renew Pawn (Rahnu customers)
- Dynamically shown based on role

## 🔐 Authentication Flow

1. User logs in at http://localhost:5173/login
2. Backend (via proxy) validates credentials
3. JWT token issued with claims:
   ```json
   {
     "userId": "...",
     "role": "staff",
     "scope": "rahnu",
     "branchId": "...",
     "iat": ...,
     "exp": ...
   }
   ```
4. Frontend stores token
5. API calls include `Authorization: Bearer <token>`
6. Backend validates scope & permissions

## 📚 Documentation

- [Modular System Guide](./MODULAR_SYSTEM_GUIDE.md) - This overview
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Technical details
- [Demo Guide](./DEMO_GUIDE.md) - 10 demo scenarios
- [Quick Start](./QUICK_START.md) - Fast setup
- [Main README](./README.md) - Full project documentation

## ✅ Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | All tables created |
| Demo Data | ✅ Seeded | 7 users, 3 branches, sample transactions |
| Rahnu API | ✅ Running | Port 4001 |
| BSE API | ✅ Running | Port 4002 |
| Frontend | ✅ Running | Port 5173 |
| Authentication | ✅ Working | JWT + RBAC |
| Theme System | ✅ Working | Dark/Light mode |
| CORS | ✅ Configured | APIs accept frontend origin |

## 🎉 Ready to Use!

Your modular Ar-Rahnu + BSE system is fully operational!

### Access the App:
1. Open http://localhost:5173
2. Login with `admin@demo.com` / `demo123`
3. Explore both Ar-Rahnu and BSE modules

### Test the APIs:
- Rahnu: http://localhost:4001/health
- BSE: http://localhost:4002/health

---

**Last Updated:** October 24, 2025  
**System Version:** 2.0.0 (Modular Architecture)

