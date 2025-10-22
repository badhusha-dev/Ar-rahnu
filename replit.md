# Ar-Rahnu Islamic Pawn Broking System

## Overview

The Ar-Rahnu Islamic Pawn Broking System is a comprehensive web application for managing Shariah-compliant pawn broking operations. The system enables Islamic financial institutions to provide interest-free loans (Qard Hasan) secured by gold collateral (Rahn), while charging only safekeeping fees (Ujrah) in accordance with Islamic principles.

The application handles the complete lifecycle of pawn broking operations including customer registration, gold valuation, loan processing, vault inventory management, contract renewals, and financial reporting across multiple branch locations.

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
- Teller (basic operations)
- Manager (branch-level oversight)
- Auditor (read-only financial access)
- Admin (full system access)

Middleware guards enforce hierarchical permissions where higher roles inherit lower role permissions.

**Security Features**:
- Rate limiting on authentication endpoints (login, register, password reset)
- Account lockout after 5 failed login attempts
- Email verification for new accounts
- Password reset with expiring tokens (10 minutes)
- Brute force protection with IP-based rate limiting
- Audit logging for all authentication events

**API Design**: RESTful endpoints with consistent error handling. All API routes are prefixed with `/api/`.

**File Structure**:
- `/server` - Backend code (routes, middleware, utilities)
- `/client` - Frontend React application
- `/shared` - Shared TypeScript types and database schema

### Database Architecture

**ORM**: Drizzle ORM provides type-safe database queries with zero runtime overhead. Migrations are stored in `/migrations` directory.

**Core Tables**:
- **users** - User accounts with authentication fields (email, password hash, 2FA settings, email verification)
- **customers** - Customer profiles with IC numbers, contact information
- **branches** - Multi-location support with branch codes, managers
- **pawnTransactions** - Core loan records with contract numbers, amounts, dates
- **goldItems** - Pledged gold details (karat, weight, description)
- **vaultItems** - Physical inventory tracking with barcode/RFID support
- **payments** - Payment history for loan transactions
- **renewals** - Contract extension records
- **refreshTokens** - Persistent refresh token storage
- **loginHistory** - Audit trail of all login attempts
- **sessions** - Session storage for Replit Auth (required by platform)

**Relationships**: The schema uses foreign key constraints with Drizzle relations API for type-safe joins. Primary keys use UUID generation via PostgreSQL's `gen_random_uuid()`.

**Indexes**: Strategic indexes are placed on frequently queried fields (email lookups, contract number searches, customer IC numbers).

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