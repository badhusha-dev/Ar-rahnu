# Modular Financial System Implementation Guide

## 🎯 Overview

This guide tracks the transformation of the monolithic Ar-Rahnu system into a modular financial platform with separate **Ar-Rahnu** (pawn broking) and **BSE** (gold savings/trading) domains.

---

## ✅ Phase 1: Split & Harden - COMPLETED

### What's Been Done

#### 1. Monorepo Structure ✅
```
D:\project\Ar-rahnu\
├── apps/
│   ├── rahnu-api/      # Pawn broking API
│   └── bse-api/        # Gold savings/trading API
├── packages/
│   ├── auth/           # JWT, session, 2FA, RBAC
│   ├── db/             # Drizzle ORM schemas & migrations
│   ├── types/          # Shared TypeScript interfaces
│   └── ui/             # Shared UI components
├── client/             # React frontend (existing)
├── server/             # Legacy server (to be migrated)
└── shared/             # Legacy shared (to be migrated)
```

#### 2. Database Schema Split ✅

**Shared Schema** (`packages/db/src/shared/schema.ts`)
- ✅ `sessions` - Session storage
- ✅ `users` - Enhanced with `scope` field (rahnu/bse/admin)
- ✅ `branches` - Branch management
- ✅ `refreshTokens` - JWT refresh tokens
- ✅ `loginHistory` - Security tracking
- ✅ `auditLogs` - Compliance logging with module field

**BSE Schema** (`packages/db/src/bse/schema.ts`)
- ✅ `bse_accounts` - Gold savings accounts
- ✅ `bse_transactions` - Buy/sell transactions
- ✅ `bse_inventory` - Physical gold inventory
- ✅ `bse_suppliers` - Gold suppliers
- ✅ `gold_prices` - Shared gold pricing

**Rahnu Schema** (`packages/db/src/rahnu/schema.ts`)
- ✅ `rahnu_customers` - Customer KYC data
- ✅ `rahnu_loans` - Pawn loan transactions
- ✅ `rahnu_payments` - Ujrah and redemption payments
- ✅ `rahnu_vault_items` - Vault management with dual approval
- ✅ `rahnu_renewals` - Loan renewals
- ✅ `rahnu_auctions` - Default loan auctions

#### 3. Enhanced RBAC ✅

**Module Scopes Added:**
- `rahnu` - Access to pawn broking modules
- `bse` - Access to gold savings modules  
- `admin` - Full system access

**Middleware Created:**
- ✅ `authenticateToken()` - JWT verification
- ✅ `requireRole()` - Role-based access
- ✅ `requireScope()` - Module scope checking
- ✅ `requireBranchAccess()` - Branch-scoped data access
- ✅ `requireAccess()` - Combined RBAC middleware

**Example Usage:**
```typescript
// Rahnu-only endpoint
app.get('/api/rahnu/loans', 
  authenticateToken,
  requireScope('rahnu', 'admin'),
  requireStaff,
  getLoan
s);

// BSE-only endpoint
app.post('/api/bse/buy-gold',
  authenticateToken,
  requireScope('bse', 'admin'),
  buyGold
);
```

#### 4. Type System ✅
- ✅ Rahnu types (`packages/types/src/rahnu.ts`)
- ✅ BSE types (`packages/types/src/bse.ts`)
- ✅ Common API types

---

## 🚧 Phase 1: Next Steps

### Step 1: Create API Applications

#### A. Rahnu API (`apps/rahnu-api/src/`)

Create the following files:

```typescript
// apps/rahnu-api/src/index.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { loansRouter } from './routes/loans';
import { paymentsRouter } from './routes/payments';
import { vaultRouter } from './routes/vault';
import { renewalsRouter } from './routes/renewals';
import { auctionsRouter } from './routes/auctions';

const app = express();
const PORT = process.env.RAHNU_API_PORT || 5001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rahnu-api' });
});

// Routes
app.use('/api/rahnu/loans', loansRouter);
app.use('/api/rahnu/payments', paymentsRouter);
app.use('/api/rahnu/vault', vaultRouter);
app.use('/api/rahnu/renewals', renewalsRouter);
app.use('/api/rahnu/auctions', auctionsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🏦 Rahnu API running on port ${PORT}`);
});
```

**Create Route Files:**
- `apps/rahnu-api/src/routes/loans.ts` - Loan CRUD operations
- `apps/rahnu-api/src/routes/payments.ts` - Payment processing
- `apps/rahnu-api/src/routes/vault.ts` - Vault in/out operations
- `apps/rahnu-api/src/routes/renewals.ts` - Loan renewals
- `apps/rahnu-api/src/routes/auctions.ts` - Auction management

#### B. BSE API (`apps/bse-api/src/`)

```typescript
// apps/bse-api/src/index.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { accountsRouter } from './routes/accounts';
import { transactionsRouter } from './routes/transactions';
import { inventoryRouter } from './routes/inventory';
import { suppliersRouter } from './routes/suppliers';
import { pricesRouter } from './routes/prices';

const app = express();
const PORT = process.env.BSE_API_PORT || 5002;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bse-api' });
});

// Routes
app.use('/api/bse/accounts', accountsRouter);
app.use('/api/bse/transactions', transactionsRouter);
app.use('/api/bse/inventory', inventoryRouter);
app.use('/api/bse/suppliers', suppliersRouter);
app.use('/api/bse/prices', pricesRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`💰 BSE API running on port ${PORT}`);
});
```

**Create Route Files:**
- `apps/bse-api/src/routes/accounts.ts` - Account management
- `apps/bse-api/src/routes/transactions.ts` - Buy/sell gold
- `apps/bse-api/src/routes/inventory.ts` - Inventory management
- `apps/bse-api/src/routes/suppliers.ts` - Supplier management
- `apps/bse-api/src/routes/prices.ts` - Gold price updates

### Step 2: Database Migration

```powershell
# 1. Backup existing database
pg_dump -U postgres ar_rahnu > ar_rahnu_backup.sql

# 2. Generate new migrations
cd packages/db
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"
npm run db:generate

# 3. Review generated migration files in packages/db/migrations/

# 4. Apply migrations
npm run db:push

# 5. Create new seed script
# Copy server/seed.ts to packages/db/src/seed.ts and update imports

# 6. Seed new schema
npm run seed
```

### Step 3: Update Root Environment Variables

Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu

# JWT
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API Ports
RAHNU_API_PORT=5001
BSE_API_PORT=5002
CLIENT_PORT=5000

# Service Scope (for single-service mode)
SERVICE_SCOPE=admin  # rahnu|bse|admin

# URLs
CLIENT_URL=http://localhost:5000
RAHNU_API_URL=http://localhost:5001
BSE_API_URL=http://localhost:5002
```

### Step 4: Install Workspace Dependencies

```powershell
# Install all workspace dependencies
npm install

# This will install dependencies for:
# - Root package.json
# - packages/auth
# - packages/db
# - packages/types
# - packages/ui
# - apps/rahnu-api
# - apps/bse-api
```

### Step 5: Test the APIs

```powershell
# Terminal 1: Start Rahnu API
npm run dev:rahnu

# Terminal 2: Start BSE API
npm run dev:bse

# Terminal 3: Start Client
npm run dev:client

# Test health endpoints
curl http://localhost:5001/health
curl http://localhost:5002/health
```

---

## 📋 Phase 2: UX Polish & Alerts - TODO

### Requirements

1. **Role-Aware Navigation**
   - Add top-level tabs: "Ar-Rahnu" and "BSE"
   - Dynamic sidebar based on user scope
   - Quick Actions bar on dashboard

2. **Theme Toggle**
   - Implement dark/light theme
   - Persist in localStorage
   - Use next-themes package

3. **Notification System**
   - Install BullMQ: `npm install bullmq ioredis`
   - Create queue workers
   - Integrate Twilio (SMS) and AWS SES (Email)
   - Schedule maturity reminders (30, 15, 7 days)

### Implementation Files Needed

```
client/src/
├── components/
│   ├── ModuleNav.tsx        # Ar-Rahnu/BSE tabs
│   ├── ThemeToggle.tsx      # Dark/light switcher
│   └── QuickActions.tsx     # Dashboard quick actions
├── contexts/
│   └── ThemeContext.tsx     # Theme management
└── lib/
    └── notifications.ts     # Notification helpers

apps/notification-worker/    # New package
├── src/
│   ├── index.ts
│   ├── queues/
│   │   └── reminder.ts
│   └── workers/
│       ├── sms.ts
│       └── email.ts
```

---

## 📋 Phase 3: Contracts & Vault - TODO

### Requirements

1. **Digital Contract Signing**
   - Install: `npm install signature_pad pdfkit`
   - Create signature component
   - Generate PDF contracts
   - Store in AWS S3 or local storage

2. **Vault Workflows**
   - Dual-approval system
   - Barcode/RFID scanning
   - Signature capture
   - Audit logging

### Implementation Files Needed

```
packages/contracts/          # New package
├── src/
│   ├── templates/
│   │   ├── loan-contract.ts
│   │   └── renewal-contract.ts
│   └── generator.ts

client/src/
├── components/
│   ├── SignaturePad.tsx
│   └── VaultApproval.tsx
└── pages/
    ├── vault-in.tsx
    └── vault-out.tsx
```

---

## 📋 Phase 4: Analytics Dashboard - TODO

### Requirements

1. **Executive Dashboard**
   - Branch P&L charts
   - Ujrah revenue tracking
   - Default loan analytics
   - Loan maturity heatmaps

2. **Export Functionality**
   - CSV export (client-side)
   - PDF reports (backend service)

### Implementation Files Needed

```
apps/reports-api/            # New package
└── src/
    ├── index.ts
    └── generators/
        ├── p-and-l.ts
        ├── maturity-report.ts
        └── ujrah-report.ts

client/src/
└── pages/
    ├── admin-dashboard.tsx
    ├── branch-dashboard.tsx
    └── reports.tsx
```

---

## 🔄 Migration Strategy

### For Existing Data

If you have existing data in the old schema:

1. **Create migration script:**
```typescript
// scripts/migrate-data.ts
import { db as oldDb } from './server/db';
import { db as newDb } from '@ar-rahnu/db';

async function migrateData() {
  // 1. Migrate users (add scope field)
  const users = await oldDb.select().from(oldUsers);
  for (const user of users) {
    await newDb.insert(newUsers).values({
      ...user,
      scope: user.role === 'admin' ? 'admin' : 'bse', // Default scope
    });
  }
  
  // 2. Migrate gold accounts to bse_accounts
  // 3. Migrate gold transactions to bse_transactions
  // ... etc
}

migrateData();
```

2. **Run migration:**
```powershell
npx tsx scripts/migrate-data.ts
```

### For Fresh Start

If starting fresh (recommended for development):

```powershell
# 1. Drop and recreate database
dropdb -U postgres ar_rahnu
createdb -U postgres ar_rahnu

# 2. Push new schema
cd packages/db
npm run db:push

# 3. Seed with demo data
npm run seed
```

---

## 🧪 Testing Checklist

### Phase 1
- [ ] All packages install without errors
- [ ] Database schema migrates successfully
- [ ] Rahnu API starts on port 5001
- [ ] BSE API starts on port 5002
- [ ] JWT authentication works across both APIs
- [ ] RBAC middleware correctly blocks unauthorized access
- [ ] Branch-scoped access enforced

### Phase 2
- [ ] Theme toggle persists across sessions
- [ ] Module navigation shows correct tabs based on scope
- [ ] Notifications queue processes jobs
- [ ] SMS sent via Twilio
- [ ] Emails sent via AWS SES
- [ ] Reminders scheduled correctly

### Phase 3
- [ ] Contract PDF generated correctly
- [ ] Signature captured and stored
- [ ] Vault dual-approval enforced
- [ ] Barcode scanning works
- [ ] Audit logs created for all vault operations

### Phase 4
- [ ] Charts render with real data
- [ ] CSV export downloads correctly
- [ ] PDF reports generated
- [ ] Branch filtering works
- [ ] Date range selection works

---

## 📚 Additional Resources

### Documentation to Create
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Component storybook
- [ ] Database ERD diagram
- [ ] Deployment guide
- [ ] Security audit checklist

### Tools to Set Up
- [ ] CI/CD pipeline
- [ ] Docker containers
- [ ] Kubernetes configs (if needed)
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Performance tracking

---

## 🎯 Success Criteria

The transformation is complete when:

1. ✅ Monorepo structure in place
2. ✅ Database schema split and migrated
3. ✅ RBAC with module scopes working
4. ⏳ Both APIs running independently
5. ⏳ Frontend adapted for modular navigation
6. ⏳ Notification system operational
7. ⏳ Contract signing implemented
8. ⏳ Vault workflows with dual approval
9. ⏳ Analytics dashboards functional
10. ⏳ Export features working

---

## 🆘 Troubleshooting

### Common Issues

**Workspace dependency errors:**
```powershell
# Clear all node_modules and reinstall
rm -r node_modules, apps/*/node_modules, packages/*/node_modules
npm install
```

**TypeScript path resolution:**
- Update `tsconfig.json` paths to use workspace aliases
- Ensure `moduleResolution` is set to `"bundler"` or `"node16"`

**Database connection issues:**
- Verify DATABASE_URL is set in all terminals
- Check PostgreSQL service is running
- Ensure firewall allows connections

---

## 📝 Notes

- Phase 1 foundational work is **COMPLETE**
- Packages are ready for use
- Next: Implement API route handlers
- Frontend changes minimal until Phase 2

**Estimated Time Remaining:**
- Phase 1 completion: 2-3 days
- Phase 2: 3-4 days
- Phase 3: 2-3 days
- Phase 4: 2-3 days
- **Total: ~10-13 days for full implementation**

---

**Last Updated:** October 24, 2025
**Status:** Phase 1 - 80% Complete

