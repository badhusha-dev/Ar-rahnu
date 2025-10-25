# 🚀 Modular System Setup Guide

## Architecture Overview

This system uses a **microservices architecture** with two separate backend APIs and a unified frontend:

```
┌─────────────────────────────────────────────┐
│         Frontend (React + Vite)             │
│         http://localhost:5173               │
└────────────┬────────────────────────────────┘
             │
       ┌─────┴─────┐
       │           │
   ┌───▼───┐   ┌──▼────┐
   │ Rahnu │   │  BSE  │
   │  API  │   │  API  │
   │ :4001 │   │ :4002 │
   └───┬───┘   └───┬───┘
       │           │
       └─────┬─────┘
             │
      ┌──────▼──────┐
      │  PostgreSQL │
      │   Database  │
      └─────────────┘
```

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend (UI)** | http://localhost:5173 | React web dashboard |
| **Ar-Rahnu API** | http://localhost:4001 | Pawn broking system backend |
| **BSE API** | http://localhost:4002 | Gold savings & trading backend |

## 📦 Folder Structure

```
/apps
  /rahnu-api        # Ar-Rahnu pawn broking service
  /bse-api          # BSE gold savings service
  
/packages
  /auth             # RBAC + JWT authentication logic
  /db               # Drizzle ORM schemas (shared, rahnu, bse)
  /types            # TypeScript shared type definitions
  /ui               # shadcn/ui components
  
/client             # React frontend application
```

## 🚀 Quick Start

### Option 1: Using the Startup Script (Windows)

```bash
.\start-modular-system.cmd
```

This will:
- Set all environment variables
- Start Rahnu API on port 4001
- Start BSE API on port 4002  
- Start Frontend on port 5173

### Option 2: Manual Start

1. **Set Environment Variables:**
```bash
$env:DATABASE_URL="postgresql://postgres:badsha@123@localhost:5432/ar_rahnu"
$env:RAHNU_API_PORT="4001"
$env:BSE_API_PORT="4002"
$env:CLIENT_URL="http://localhost:5173"
```

2. **Start All Services:**
```bash
npm run dev
```

Or start services individually:
```bash
npm run dev:rahnu    # Rahnu API only
npm run dev:bse      # BSE API only
npm run dev:web      # Frontend only
npm run dev:all      # All services
```

## 🗄️ Database Setup

### Initialize Database

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed
```

### Reset Database

```powershell
powershell -ExecutionPolicy Bypass -File .\reset-database.ps1
npm run db:push
npm run db:seed
```

## 🔐 Demo Accounts

After seeding, you can login with:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@demo.com | demo123 | Full system access (both modules) |
| **Manager (Rahnu)** | manager.rahnu@demo.com | demo123 | Ar-Rahnu module only |
| **Manager (BSE)** | manager.bse@demo.com | demo123 | BSE module only |
| **Staff (Ali)** | ali@demo.com | demo123 | Rahnu operations |
| **Staff (Sara)** | sara@demo.com | demo123 | BSE operations |
| **Customer (Rahim)** | rahim@demo.com | demo123 | Rahnu customer view |
| **Customer (Aisha)** | aisha@demo.com | demo123 | BSE customer view |

## 🧪 Testing the APIs

### Health Checks

```bash
# Rahnu API
curl http://localhost:4001/health

# BSE API
curl http://localhost:4002/health
```

### Example API Calls

**Get Rahnu Loans:**
```bash
curl http://localhost:4001/api/rahnu/loans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get BSE Transactions:**
```bash
curl http://localhost:4002/api/bse/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Demo Data Included

After seeding:

**Branches:**
- HQ (Kuala Lumpur)
- Branch A (Petaling Jaya)
- Branch B (Shah Alam)

**Ar-Rahnu Module:**
- 2 customers with loans
- 2 vault items (1 active, 1 released)
- Active loan: RM 3,400
- Redeemed loan: RM 5,100

**BSE Module:**
- 1 customer (Aisha) with 5g gold wallet
- 3 transactions (2 buys, 1 sell)
- 200g gold inventory in Branch B
- Current gold price: RM 350/gram

## 🔄 Development Workflow

1. **Make code changes** - Hot reload enabled on all services
2. **Frontend changes** - Instant HMR (Hot Module Replacement)
3. **Backend changes** - Auto-restart with tsx watch
4. **Schema changes:**
   ```bash
   npm run db:generate  # Generate migration
   npm run db:push      # Apply to database
   ```

## 🎯 Frontend Module Navigation

The frontend dynamically shows tabs based on user role:

- **Admin** → Sees both Ar-Rahnu and BSE tabs
- **Manager/Staff (Rahnu)** → Only Ar-Rahnu tab
- **Manager/Staff (BSE)** → Only BSE tab
- **Customer** → Sees module based on their account type

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using the port
netstat -ano | findstr :4001
netstat -ano | findstr :4002
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F
```

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL is correct
3. Test connection:
   ```bash
   psql postgresql://postgres:badsha@123@localhost:5432/ar_rahnu
   ```

### Module Not Loading

1. Clear browser cache
2. Check browser console for errors
3. Verify API is running (check health endpoints)
4. Check CORS settings in backend

## 📚 Additional Documentation

- [Full Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Demo Scenarios](./DEMO_GUIDE.md)
- [Quick Start](./QUICK_START.md)
- [Main README](./README.md)

## 🎉 Next Steps

1. Start the system using `.\start-modular-system.cmd`
2. Open http://localhost:5173 in your browser
3. Login with admin@demo.com / demo123
4. Explore both Ar-Rahnu and BSE modules
5. Try creating new transactions, loans, and reports

---

**Need Help?** Check the logs in the terminal where services are running.

