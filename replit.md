# Buku Simpanan Emas (BSE) - Gold Savings & Trading System

## Overview

The Buku Simpanan Emas (BSE) system is a comprehensive Shariah-compliant web application for managing digital gold savings and trading operations. The system enables Islamic financial institutions to provide customers with a platform to buy, sell, and store gold digitally while maintaining full compliance with Islamic financial principles.

The application handles the complete lifecycle of gold trading operations including customer registration, gold buying and selling, vault inventory management, supplier tracking, and financial reporting across multiple branch locations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**State Management**: TanStack Query (React Query) for server state management, providing caching, background updates, and optimistic UI updates. No global state management library is used; component-level state is managed with React hooks.

**Routing**: Wouter for lightweight client-side routing. The application uses a protected route pattern where authentication status determines available routes.

**Authentication Pages** (October 2025):
- **Login** (`/`) - Email/password authentication with optional 2FA verification
- **Register** (`/register`) - New user registration with email verification
- **Forgot Password** (`/forgot-password`) - Password recovery via email
- **Reset Password** (`/reset-password/:token`) - New password setup with token validation
- **Verify Email** (`/verify-email/:token`) - Email verification confirmation
- **Profile** (`/profile`) - User settings including 2FA setup/disable, password change, account details
- **Sessions** (`/sessions`) - Active device/session management with logout capabilities
- **Activity** (`/activity`) - Login history audit log with success/failure filtering

**BSE Frontend Pages** (To be implemented):
- `/dashboard` - Role-based dashboard (customer wallet view, teller operations, manager reports, admin controls)
- `/wallet` - Customer gold wallet with buy/sell functionality
- `/transactions` - Transaction history
- `/admin/users` - User management
- `/admin/inventory` - Physical gold inventory management
- `/admin/suppliers` - Supplier management
- `/manager/reports` - Branch performance reports
- `/teller/transactions` - Create customer transactions

**UI Component Library**: shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS. The design system follows Material Design principles with Islamic cultural customization (green/gold color palette).

**Forms**: React Hook Form with Zod schema validation for type-safe form handling and validation.

**Styling**: Tailwind CSS with custom design tokens for light/dark mode support. CSS variables are used extensively for theming.

### Backend Architecture

**Runtime**: Node.js 20 with Express.js framework.

**Database ORM**: Drizzle ORM with PostgreSQL 16 database. Schema definitions are shared between frontend and backend via the `shared/schema.ts` file.

**Authentication Strategy**: 
- JWT-based authentication with separate access tokens (15min expiry) and refresh tokens (7 day expiry)
- Dual authentication system: Custom JWT auth for the main application + Replit Auth integration
- Password hashing using bcrypt with 12 salt rounds
- Optional two-factor authentication (2FA) via TOTP (Google Authenticator) or email OTP
- Session tracking with device fingerprinting (User-Agent parsing, IP address logging)

**Authorization**: Role-based access control (RBAC) with four roles:
- **Customer**: Can buy/sell gold, view wallet balance, view transaction history
- **Teller**: All customer permissions + execute customer transactions, view branch inventory
- **Manager**: All teller permissions + approve large transactions, view branch reports, manage tellers
- **Admin**: Full system access including user management, inventory management, supplier management, gold price updates

Middleware guards enforce hierarchical permissions where higher roles inherit lower role permissions.

**Security Features**:
- Server-side price calculation to prevent client-side price manipulation
- Role-based guards on all management endpoints (requireRole, requireManagerOrAbove, requireAdmin)
- Rate limiting on authentication endpoints (login, register, password reset)
- Account lockout after 5 failed login attempts
- Email verification for new accounts
- Password reset with expiring tokens (10 minutes)
- Brute force protection with IP-based rate limiting
- Comprehensive audit logging for all authentication and trading events

**API Design**: RESTful endpoints with consistent error handling. All API routes are prefixed with `/api/`.

**File Structure**:
- `/server` - Backend code (routes, middleware, utilities)
- `/client` - Frontend React application
- `/shared` - Shared TypeScript types and database schema

### Database Architecture

**ORM**: Drizzle ORM provides type-safe database queries with zero runtime overhead. Migrations are stored in `/migrations` directory.

**Core BSE Tables**:
- **users** - User accounts with authentication fields (email, password hash, 2FA settings, email verification, role assignment)
- **branches** - Multi-location support with branch codes, managers
- **goldAccounts** - Customer digital gold wallets with balance tracking
- **goldTransactions** - Buy/sell transaction records with price locking and payment tracking
- **goldPrices** - Historical gold pricing by karat with buy/sell spreads
- **inventory** - Physical gold stock tracking (bars, coins, jewelry, wafers) with serial numbers
- **suppliers** - Gold supplier management with contact and banking details
- **supplierInvoices** - Supplier invoice tracking
- **refreshTokens** - Persistent refresh token storage
- **loginHistory** - Audit trail of all login attempts
- **sessions** - Session storage for Replit Auth (required by platform)
- **auditLogs** - System-wide activity tracking for compliance

**Relationships**: The schema uses foreign key constraints with Drizzle relations API for type-safe joins. Primary keys use UUID generation via PostgreSQL's `gen_random_uuid()`.

**Indexes**: Strategic indexes are placed on frequently queried fields (email lookups, transaction numbers, user IDs).

### BSE API Endpoints

**Gold Trading (Customer)**:
- `GET /api/gold-prices` - Get current gold prices by karat
- `GET /api/gold-account` - Get user's gold wallet balance
- `GET /api/gold-transactions` - Get user's transaction history
- `POST /api/gold/buy` - Buy gold (server-computed pricing)
- `POST /api/gold/sell` - Sell gold (server-computed pricing)

**Management (Admin/Manager)**:
- `GET /api/users` - Get all users (admin only)
- `GET /api/transactions` - Get all transactions (teller+)
- `PATCH /api/transactions/:id/approve` - Approve transaction (manager+)
- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create branch (admin)
- `GET /api/inventory` - Get inventory items (teller+)
- `POST /api/inventory` - Add inventory item (manager+)
- `GET /api/suppliers` - Get suppliers (manager+)
- `POST /api/suppliers` - Create supplier (manager+)
- `POST /api/gold-prices` - Update gold prices (admin)
- `GET /api/audit-logs` - Get audit logs (admin)

**Reports & Analytics**:
- `GET /api/dashboard/stats` - Dashboard statistics

### External Dependencies

**Database**: PostgreSQL 16 provided by Replit's managed database service. Connection string is provided via `DATABASE_URL` environment variable.

**Authentication**: 
- Replit Authentication for OAuth-based login (optional)
- Custom JWT implementation using `jsonwebtoken` library
- Passport.js with OpenID Connect strategy for Replit Auth integration

**Email Service**: Nodemailer for transactional emails (verification, password reset, 2FA codes). Configuration via SMTP environment variables:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- Falls back to console logging in development if SMTP not configured

**Gold Price API**: Optional integration with Metals-API (or similar) for real-time gold pricing by karat. Falls back to simulated prices if `GOLD_API_KEY` is not provided.

**Session Storage**: PostgreSQL-backed session store using `connect-pg-simple` for Replit Auth sessions.

**Two-Factor Authentication**: 
- `speakeasy` library for TOTP secret generation and verification
- `qrcode` library for generating QR codes for authenticator app setup

**Deployment Platform**: Replit Autoscale Deployments with automatic horizontal scaling. The application binds to port 5000 internally but is accessible via standard HTTP/HTTPS ports externally.

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` - JWT signing keys
- `SESSION_SECRET` - Session encryption key
- `SMTP_*` - Email service configuration
- `GOLD_API_KEY` - Gold pricing API key (optional)
- `FRONTEND_URL` - Base URL for email links
- `REPL_ID`, `ISSUER_URL`, `REPLIT_DOMAINS` - Replit platform integration

**Build Tools**:
- Vite for frontend bundling
- esbuild for backend bundling in production
- tsx for TypeScript execution in development
- Tailwind CSS with PostCSS for styling

## Gold Pricing System

The BSE system uses a dual-price model (buy/sell spread) to ensure profitability while maintaining Shariah compliance:

**Supported Karats**: 999 (24K), 916 (22K), 900 (21.6K), 875 (21K), 750 (18K), 585 (14K)

**Current Development Prices**:
- 999: Buy RM336.53/g | Sell RM304.48/g
- 916: Buy RM308.26/g | Sell RM278.90/g
- 900: Buy RM302.87/g | Sell RM274.03/g
- 875: Buy RM294.46/g | Sell RM266.42/g
- 750: Buy RM252.40/g | Sell RM228.36/g
- 585: Buy RM196.86/g | Sell RM178.12/g

**Live Integration**: Configure `GOLD_API_KEY` to use Metals-API for real-time pricing updates.

## Shariah Compliance

The BSE system follows Islamic trading principles:

**Bai' al-Sarf** (Gold Trading):
- Spot transactions only (no futures/options)
- Instant settlement and ownership transfer
- No interest-bearing loans
- Transparent pricing with clear buy/sell spreads
- Fair exchange rates based on market prices

**Wadiah** (Safekeeping):
- Secure storage of physical gold inventory
- Customer retains ownership of their gold holdings
- No mixing of customer assets
- Insurance and vault management

## Current Status (October 2025)

**Backend Transformation: ✅ COMPLETED**
- Database schema migrated from Ar-Rahnu (pawn broking) to BSE (gold trading)
- All REST API endpoints implemented and secured
- Server-side price calculation prevents client manipulation
- Role-based access control enforced on all endpoints
- Seed data populated (branches, gold prices)
- Running successfully on port 5000

**Frontend Status: ⚠️ NEEDS UPDATING**
- Authentication pages still functional
- Old pawn broking pages need replacement with BSE pages
- Need to remove references to `insertCustomerSchema` and other pawn broking schema
- Need to create BSE-specific pages (wallet, trading, inventory, reports)

**Security Enhancements Applied**:
- Fixed temporal dead zone error by moving relations to end of schema file
- Buy/sell endpoints only accept grams from client; all pricing computed server-side
- UserId derived from JWT token only; clients cannot specify userId
- Management endpoints protected with proper role guards (teller+, manager+, admin)
- Payment method validation added

## Next Steps

1. **Update Frontend Pages**:
   - Remove old pawn broking pages
   - Create customer wallet/trading pages
   - Create teller transaction interface
   - Create manager reports dashboard
   - Create admin management pages

2. **Payment Integration**:
   - Integrate FPX payment gateway
   - Add DuitNow QR support
   - Implement credit/debit card processing

3. **Additional Features**:
   - Physical gold delivery requests
   - Zakat auto-calculation
   - Gold accumulation plans (auto-buy)
   - Mobile app (React Native)
   - Multi-language support (EN/BM/AR)

## Recent Changes (October 22, 2025)

- ✅ Transformed database schema from Ar-Rahnu to BSE
- ✅ Created gold trading APIs with server-side security
- ✅ Fixed critical security vulnerabilities
- ✅ Added role-based access control to all endpoints
- ✅ Populated database with initial seed data
- ✅ Created comprehensive system documentation (BSE_SYSTEM_README.md)
