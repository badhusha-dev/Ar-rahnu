
# Ar-Rahnu Islamic Pawn Broking System

A modern, enterprise-grade web application for managing Islamic pawn broking operations (Ar-Rahnu) built with React, TypeScript, Express, and PostgreSQL.

## Overview

This system provides a complete solution for managing Islamic pawn broking operations, including customer management, gold valuation, loan processing, vault inventory, and financial reporting—all while adhering to Shariah-compliant practices.

## Quick Start (Windows)

```powershell
# 1. Install dependencies
npm install

# 2. Set your PostgreSQL password (replace YOUR_PASSWORD)
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"

# 3. Create database (if using pgAdmin, skip to step 4)
createdb -U postgres ar_rahnu

# 4. Initialize database
npm run db:push
npx tsx server/seed.ts

# 5. Start the app
.\run-app.cmd
```

Open http://localhost:5000 and log in with:
- Email: `admin@bse.my`
- Password: `Admin@123`

## Quick Start (Mac/Linux)

```bash
# 1. Install dependencies
npm install

# 2. Set your PostgreSQL password (replace YOUR_PASSWORD)
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"

# 3. Create database
createdb -U postgres ar_rahnu

# 4. Initialize database
npm run db:push
npx tsx server/seed.ts

# 5. Start the app
npm run dev
```

Open http://localhost:5000 and log in with:
- Email: `admin@bse.my`
- Password: `Admin@123`

## Features

### Core Modules

- **Dashboard** - Real-time metrics, loan volume trends, and maturity alerts
- **Customer Management** - Customer profiles, IC scanning, transaction history
- **Pawn Transactions** - Multi-step loan processing with gold valuation and contract generation
- **Loan Ledger** - Track active loans, payments, redemptions, and defaults
- **Vault Management** - Physical inventory tracking with barcode/RFID support
- **Gold Price Management** - Live market rates by karat with price history
- **Branch Management** - Multi-location support with centralized oversight
- **Renewal Processing** - Interest calculation and contract extensions

### Key Capabilities

- Shariah-compliant interest calculations
- Real-time gold price integration
- Multi-language support (English/Malay/Arabic)
- Role-based access control (Admin, Manager, Staff)
- Automated maturity alerts and reminders
- Digital contract generation and storage
- Comprehensive audit trails

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for server state management
- **Wouter** for routing
- **Tailwind CSS** with shadcn/ui components
- **Recharts** for data visualization

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for type-safe database queries
- **Replit Authentication** for user management
- **Replit Object Storage** for file uploads

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and configurations
│   │   ├── pages/           # Page components
│   │   └── App.tsx          # Main application component
├── server/
│   ├── db.ts               # Database connection
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Object storage utilities
│   └── index.ts            # Express server setup
├── shared/
│   └── schema.ts           # Shared database schema
└── design_guidelines.md    # UI/UX design specifications
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local installation or cloud service like Neon)
- npm or compatible package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up PostgreSQL Database:**

   **Option A: Local PostgreSQL (Windows/Mac/Linux)**
   
   - Install PostgreSQL from https://www.postgresql.org/download/
   - Create a database named `ar_rahnu`:
   ```bash
   # On Windows PowerShell, first add PostgreSQL to PATH:
   $env:Path += ";C:\Program Files\PostgreSQL\15\bin"
   
   # Create database
   createdb -U postgres ar_rahnu
   ```
   
   - Set the DATABASE_URL environment variable:
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"
   
   # Mac/Linux
   export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"
   ```

   **Option B: Cloud Database (Neon/Supabase)**
   
   - Sign up at https://neon.tech or https://supabase.com
   - Create a new PostgreSQL database
   - Copy the connection string and set it as DATABASE_URL

3. **Initialize the database schema:**
```bash
npm run db:push
```

4. **Seed the database with demo data:**
```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"
npx tsx server/seed.ts

# Mac/Linux
npx tsx server/seed.ts
```

5. **Start the development server:**

   **On Windows:**
   ```bash
   # Use the provided startup script
   .\run-app.cmd
   ```
   
   **On Mac/Linux:**
   ```bash
   export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### Demo Accounts

After seeding, you can log in with these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bse.my` | `Admin@123` |
| **Manager** | `manager@bse.my` | `Manager@123` |
| **Teller** | `teller@bse.my` | `Teller@123` |
| **Customer** | `customer@bse.my` | `Customer@123` |

### Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 5000)

Optional environment variables for production:

- `REPLIT_DB_URL` - Replit database URL (Replit deployments only)
- `GOLD_API_KEY` - API key for live gold price data
- `NODE_ENV` - Set to `production` for production builds

## Database Schema

### Main Tables

- **users** - System users and authentication
- **branches** - Physical branch locations
- **customers** - Customer profiles and KYC data
- **transactions** - Pawn loan records
- **payments** - Payment and redemption history
- **gold_prices** - Historical gold rates by karat
- **vault_items** - Physical inventory tracking
- **audit_logs** - System activity audit trail

See `shared/schema.ts` for complete schema definitions.

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer

### Transactions
- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create new pawn transaction
- `PUT /api/transactions/:id/redeem` - Process redemption

### Gold Prices
- `GET /api/gold-prices` - Get current rates
- `POST /api/gold-prices` - Update price

See `server/routes.ts` for complete API documentation.

## Design System

The application follows Material Design principles with Islamic cultural customization. Key design features include:

- **Color Palette**: Deep Islamic green primary (#2d5f3f), muted gold accents
- **Typography**: Inter for UI, Poppins for headings, Amiri for Arabic elements
- **Components**: shadcn/ui component library with custom theming
- **Responsive**: Mobile-first design with breakpoints at 768px and 1024px

Full design specifications are available in `design_guidelines.md`.

## Development

### Running Tests
```bash
npm run check
```

### Building for Production
```bash
npm run build
```

### Database Migrations
```bash
npm run db:push
```

## Troubleshooting

### Windows-Specific Issues

**"NODE_ENV is not recognized" Error:**
- The default `npm run dev` script uses Unix syntax
- Solution: Use the provided `run-app.cmd` script instead
- Or install `cross-env`: `npm install -D cross-env` and update the dev script

**"ENOTSUP: operation not supported on socket" Error:**
- This has been fixed in the codebase to detect Windows automatically
- If you still encounter this, ensure you're running the latest version

**PostgreSQL Not Found:**
```powershell
# Add PostgreSQL to PATH (replace 15 with your version):
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# Or add permanently via System Environment Variables
```

**Database Connection Fails:**
- Verify PostgreSQL service is running:
  ```powershell
  Get-Service -Name postgresql*
  ```
- If stopped, start it:
  ```powershell
  Start-Service -Name postgresql-x64-15
  ```

### General Issues

**Login Fails with 401:**
- Make sure you've run the seed script: `npx tsx server/seed.ts`
- Check that DATABASE_URL is set correctly

**Port 5000 Already in Use:**
- Change the PORT environment variable:
  ```powershell
  $env:PORT="3000"
  ```

**Database Schema Issues:**
- Reset and reinitialize:
  ```bash
  npm run db:push
  npx tsx server/seed.ts
  ```

## Startup Scripts

### Windows
- **`run-app.cmd`** - Starts the development server with environment variables configured
  ```cmd
  .\run-app.cmd
  ```

### Mac/Linux  
- Use the npm scripts directly:
  ```bash
  npm run dev
  ```

### Manual Start
If you prefer to start manually:

```powershell
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"
$env:PORT="5000"
npx tsx server/index.ts
```

```bash
# Mac/Linux
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ar_rahnu"
export PORT=5000
npx tsx server/index.ts
```

## Deployment

This application supports deployment on multiple platforms:

### Replit (Cloud)
- Optimized for Replit with automatic scaling
- Uses Neon serverless PostgreSQL
- Automatic DATABASE_URL configuration

### Local/VPS (Node.js + PostgreSQL)
1. Install PostgreSQL on your server
2. Set environment variables (see `.env` configuration)
3. Build and start:
   ```bash
   npm install
   npm run build
   npm run start
   ```

### Platform Compatibility
- **Windows**: Full support with platform-specific optimizations
- **Linux/Mac**: Full support
- **Docker**: Compatible (Dockerfile not included, but standard Node.js + PostgreSQL setup)

The production server runs on port 5000 by default (configurable via `PORT` environment variable).

## Security

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Authorization**: Role-based access control (RBAC) with 4 roles:
  - Admin: Full system access
  - Manager: Branch management and oversight
  - Teller: Customer service and transactions
  - Customer: Personal account access
- **Password Security**: 
  - Bcrypt hashing with salt
  - Strong password requirements
  - Password reset functionality
- **Session Management**: Secure HTTP-only cookies with JWT tokens
- **Input Validation**: Zod schema validation for all API endpoints
- **Rate Limiting**: Protects against brute force attacks
- **Audit Logging**: Comprehensive logging for all transactions
- **Database Security**: Parameterized queries via Drizzle ORM (SQL injection protection)

## License

MIT License - See LICENSE file for details

## Recent Updates

### Windows Compatibility (Latest)
- ✅ Fixed `ENOTSUP` error on Windows by detecting platform and adjusting server configuration
- ✅ Added support for both Neon (cloud) and local PostgreSQL databases
- ✅ Created Windows-friendly startup script (`run-app.cmd`)
- ✅ Updated documentation with Windows-specific instructions
- ✅ Improved error messages and troubleshooting guides

### Database Support
- ✅ Dual database driver support (Neon serverless + standard PostgreSQL)
- ✅ Automatic detection of database type based on connection string
- ✅ Comprehensive seed script with demo data
- ✅ Full schema migration support via Drizzle Kit

## Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review the demo credentials and ensure database is seeded
3. Verify PostgreSQL is running and DATABASE_URL is set correctly
4. Check the browser console and server logs for error messages

## Contributing

Contributions are welcome! Please:
1. Follow the established code structure and naming conventions
2. Ensure all TypeScript types are properly defined
3. Test changes on both Windows and Mac/Linux if possible
4. Update documentation for any new features or changes
5. Add appropriate error handling and logging

---

**Built with ❤️ for Islamic finance operations**
