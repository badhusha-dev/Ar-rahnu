# 🚀 Quick Start Guide

## ✅ All Phases Complete!

Your modular financial system is ready to run. Follow these steps:

---

## Step 1: Install Dependencies (2 minutes)

```powershell
# Install all workspace packages
npm install
```

---

## Step 2: Set Environment Variable (30 seconds)

```powershell
# Set your database connection
$env:DATABASE_URL="postgresql://postgres:badsha@123@localhost:5432/ar_rahnu"
```

---

## Step 3: Initialize Database (2 minutes)

```powershell
# Navigate to database package
cd packages/db

# Generate migrations
npm run db:generate

# Apply to database
npm run db:push

# Return to root
cd ../..
```

---

## Step 4: Run the System (30 seconds)

```powershell
# Option A: Run everything at once
npm run dev

# Option B: Run individually (3 terminals)
npm run dev:rahnu    # Terminal 1: Rahnu API (Port 5001)
npm run dev:bse      # Terminal 2: BSE API (Port 5002)  
npm run dev:client   # Terminal 3: Client (Port 5000)
```

---

## Step 5: Access the Application

Open your browser to: **http://localhost:5000**

### Demo Login Credentials:
| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@bse.my | Admin@123 |
| Manager | manager@bse.my | Manager@123 |
| Teller | teller@bse.my | Teller@123 |
| Customer | customer@bse.my | Customer@123 |

---

## 🎯 What to Try First

### 1. **Test Theme Toggle**
- Click the sun/moon icon (top-right)
- Theme persists across refreshes

### 2. **Explore Module Navigation**
- See "Ar-Rahnu" and "BSE" tabs at top
- Navigate between modules
- Notice role-based access

### 3. **Try Quick Actions**
- Dashboard shows module-specific shortcuts
- "New Loan", "Buy Gold", "Vault", etc.

### 4. **Vault Dual-Approval**
- Navigate to `/vault-approval`
- Experience 4-step workflow
- Test signature capture

### 5. **Analytics Dashboard**
- Navigate to `/analytics`
- View KPI cards
- Explore interactive charts
- Try CSV export

---

## 🔍 Testing API Endpoints

### Health Checks:
```powershell
# Rahnu API
curl http://localhost:5001/health

# BSE API
curl http://localhost:5002/health
```

### Test Authentication:
```powershell
# Login
curl -X POST http://localhost:5001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@bse.my","password":"Admin@123"}'

# Returns JWT token - use in subsequent requests
```

### Test RBAC:
```powershell
# Get loans (requires 'rahnu' scope)
curl http://localhost:5001/api/rahnu/loans `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 Project Structure Overview

```
Ar-rahnu/
├── apps/
│   ├── rahnu-api/        # Pawn broking API (Port 5001)
│   └── bse-api/          # Gold savings API (Port 5002)
├── packages/
│   ├── auth/             # JWT & RBAC middleware
│   ├── db/               # Database schemas & migrations
│   ├── types/            # TypeScript definitions
│   └── ui/               # Shared UI components
├── client/               # React frontend (Port 5000)
└── documentation/
    ├── IMPLEMENTATION_GUIDE.md   # Detailed guide
    ├── COMPLETION_SUMMARY.md     # What's built
    └── QUICK_START.md            # This file
```

---

## ⚠️ Troubleshooting

### "DATABASE_URL not found"
```powershell
# Set it again in your terminal
$env:DATABASE_URL="postgresql://postgres:badsha@123@localhost:5432/ar_rahnu"
```

### "Port already in use"
```powershell
# Find and kill process
Get-NetTCPConnection -LocalPort 5001 | Stop-Process

# Or use different ports
$env:RAHNU_API_PORT="5011"
$env:BSE_API_PORT="5012"
```

### "Workspace dependencies not found"
```powershell
# Reinstall everything
Remove-Item node_modules -Recurse -Force
npm install
```

### "Migration errors"
```powershell
# Clear and restart
dropdb -U postgres ar_rahnu
createdb -U postgres ar_rahnu
cd packages/db
npm run db:push
```

---

## 🎨 What's Been Implemented

### ✅ Phase 1: Architecture
- Monorepo with workspaces
- 22 database tables split into 3 schemas
- Enhanced RBAC with module scopes
- Branch-scoped data access

### ✅ Phase 2: UX Polish
- Dark/light theme with localStorage
- Role-aware module navigation
- Quick actions dashboard
- Notification system structure

### ✅ Phase 3: Workflows
- Digital signature component
- Dual-approval vault in/out
- Audit logging
- Canvas-based signatures

### ✅ Phase 4: Analytics
- Executive dashboard
- KPI cards with trends
- Interactive charts (Bar, Pie, Line)
- CSV export functionality

---

## 📚 Key Features

### Security:
- ✅ JWT authentication with refresh tokens
- ✅ RBAC with roles (customer/teller/manager/admin)
- ✅ Module scopes (rahnu/bse/admin)
- ✅ Branch-scoped data access
- ✅ Comprehensive audit logging

### User Experience:
- ✅ Theme persistence
- ✅ Role-aware navigation
- ✅ Module-specific quick actions
- ✅ Responsive design
- ✅ Touch-friendly signatures

### Business Logic:
- ✅ Pawn loan management
- ✅ Gold savings accounts
- ✅ Buy/sell transactions
- ✅ Vault workflows with dual approval
- ✅ Analytics and reporting

---

## 🎯 Success Indicators

After starting the system, you should see:

### ✅ Terminal Output:
```
🏦 Rahnu API running on port 5001
💰 BSE API running on port 5002
VITE ready in XXX ms
```

### ✅ Browser Console:
- No errors
- Theme applied correctly
- User authenticated

### ✅ API Health Checks:
```json
{"status":"ok","service":"rahnu-api"}
{"status":"ok","service":"bse-api"}
```

---

## 🚀 Ready for Production

The system includes:
- ✅ Type-safe database operations
- ✅ Secure authentication
- ✅ Audit trails
- ✅ Dual-approval workflows
- ✅ Role-based access control
- ✅ Module isolation
- ✅ Export capabilities

---

## 📞 Need Help?

Refer to:
1. **IMPLEMENTATION_GUIDE.md** - Detailed technical guide
2. **COMPLETION_SUMMARY.md** - What's been built
3. **README.md** - General project documentation
4. **STATUS_SUMMARY.md** - Progress tracking

---

## 🎉 You're All Set!

Your modular financial system is production-ready. 

**Happy coding!** 🚀

---

*Last Updated: October 24, 2025*
*All 4 Phases: ✅ COMPLETE*

