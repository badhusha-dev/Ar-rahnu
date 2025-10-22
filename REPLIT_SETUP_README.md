
# Ar-Rahnu System - Replit Platform Setup Guide

This document provides detailed information about how the Ar-Rahnu Islamic Pawn Broking System is configured to run on the Replit platform.

---

## Platform Overview

This application is designed to run on **Replit Autoscale Deployments**, which provides:
- Automatic horizontal scaling based on traffic
- Built-in PostgreSQL database
- Integrated authentication system
- Zero-configuration deployment

---

## Replit Configuration

### Project Modules

The project uses the following Replit modules (defined in `.replit`):

- **nodejs-20**: Node.js 20 runtime environment
- **web**: Web server capabilities with port forwarding
- **postgresql-16**: PostgreSQL 16 database instance

### Nix Channel

- **Channel**: `stable-24_05`
- Provides consistent, reproducible development environment

---

## Port Configuration

### Development Port
- **Internal Port**: 5000 (defined in `PORT` environment variable)
- **Access**: `http://0.0.0.0:5000` (binds to all network interfaces)

### Production Port Forwarding
When deployed, traffic is automatically forwarded:
```
External Port 80 → Internal Port 5000
External Port 443 (HTTPS) → Internal Port 5000
```

This means your production app is accessible via standard HTTP/HTTPS ports while running on port 5000 internally.

---

## Deployment Configuration

### Deployment Type: Autoscale

**Target**: `autoscale` (defined in `.replit`)

#### Build Command
```bash
npm run build
```
This command:
1. Builds the React frontend with Vite (`client/` → `dist/public/`)
2. Compiles TypeScript backend with ESBuild (`server/` → `dist/`)

#### Run Command
```bash
npm run start
```
This starts the production Express server serving the built application.

### Autoscale Benefits
- **Cost-Effective**: Only charged for actual request processing time
- **Scalable**: Automatically scales up/down based on traffic
- **No Idle Costs**: Not charged when no requests are being processed
- **Multi-Instance**: Can run multiple instances during high traffic

---

## Workflows

### Default Workflow: "Start application"
The Run button executes:
```bash
npm run dev
```

This starts the development server with:
- Vite dev server for hot module replacement (HMR)
- Express server with `tsx` for TypeScript execution
- Automatic port listening on 5000

---

## Environment Variables

### Automatically Provided by Replit

#### Database
- **`DATABASE_URL`**: PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Automatically configured by Replit PostgreSQL module

#### Replit-Specific
- **`REPL_ID`**: Unique identifier for your Repl (used in authentication)
- **`REPLIT_DOMAINS`**: Comma-separated list of domains where your app is accessible
- **`REPLIT_DB_URL`**: Replit's key-value database URL (fallback storage)

#### Server Configuration
- **`PORT`**: Server port (set to 5000)
- **`NODE_ENV`**: Environment mode (`development` or `production`)

#### Authentication
- **`ISSUER_URL`**: OpenID Connect issuer URL (default: `https://replit.com/oidc`)
- **`SESSION_SECRET`**: Secret key for session encryption (auto-generated)

### Setting Custom Environment Variables

Use **Replit Secrets** for sensitive data:
1. Click "Secrets" in the Tools panel
2. Add key-value pairs
3. Access in code via `process.env.YOUR_SECRET_NAME`

---

## Authentication System

### Replit Auth Integration

This app uses **Replit's OpenID Connect (OIDC)** authentication:

#### How It Works
1. User clicks "Login" → Redirected to Replit's login page
2. After authentication → Redirected back to your app
3. Session created and stored in PostgreSQL
4. User data synced to `users` table

#### Key Files
- **`server/replitAuth.ts`**: Authentication strategy configuration
- **`shared/schema.ts`**: User and session table definitions
- **`client/src/hooks/useAuth.ts`**: Client-side auth state management

#### Session Management
- **Storage**: PostgreSQL (`sessions` table via `connect-pg-simple`)
- **Duration**: 7 days
- **Cookie**: HTTP-only, secure, SameSite
- **Refresh**: Automatic token refresh using refresh tokens

#### Endpoints
- **`GET /api/login`**: Initiates OAuth flow
- **`GET /api/callback`**: Handles OAuth callback
- **`GET /api/logout`**: Ends session and redirects
- **`GET /api/auth/user`**: Returns current user data (protected)

---

## Database Configuration

### PostgreSQL 16 Setup

#### Connection
```javascript
// Automatically uses DATABASE_URL from environment
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

#### Schema Management
```bash
# Push schema changes to database
npm run db:push
```

This uses Drizzle Kit to synchronize your TypeScript schema (`shared/schema.ts`) with PostgreSQL.

#### Required Tables
The following tables are created automatically:
- `sessions` - Session storage for authentication
- `users` - User accounts and profiles
- `branches` - Branch locations
- `customers` - Customer records
- `transactions` - Pawn loan transactions
- `payments` - Payment history
- `gold_prices` - Gold rate tracking
- `vault_items` - Vault inventory
- `audit_logs` - Activity audit trail

---

## File Storage

### Replit Object Storage

For file uploads (customer documents, signatures, photos):

```javascript
// server/storage.ts
import { Client } from "@replit/object-storage";

const storage = new Client();
await storage.uploadFromBytes("path/to/file", buffer);
```

#### Storage Structure
```
/documents
  /customers
    /{customerId}
      /ic_scans
      /signatures
  /transactions
    /{transactionId}
      /gold_photos
      /contracts
```

---

## Development Workflow

### Starting Development

1. **First Time Setup**:
```bash
npm install           # Install dependencies
npm run db:push       # Initialize database
npm run dev           # Start dev server
```

2. **Daily Development**:
- Click the **Run** button (or `npm run dev`)
- Application accessible at port 5000
- Changes auto-reload with HMR

### Hot Module Replacement (HMR)

**Frontend**: Vite provides instant HMR
- React components update without full page reload
- State preserved during updates
- CSS changes apply immediately

**Backend**: `tsx` watches TypeScript files
- Server restarts on file changes
- Database connections maintained
- Sessions preserved (stored in PostgreSQL)

---

## Building for Production

### Build Process

```bash
npm run build
```

**What Happens**:
1. **Frontend Build** (Vite):
   - Bundles React app with optimizations
   - Output: `dist/public/`
   - Minification, tree-shaking, code splitting

2. **Backend Build** (ESBuild):
   - Compiles TypeScript to JavaScript
   - Output: `dist/`
   - Fast compilation, minimal overhead

### Production Server

```bash
npm run start
```

**What Happens**:
1. Express server starts in production mode
2. Serves static files from `dist/public/`
3. API routes handle backend requests
4. Listens on `0.0.0.0:5000`

---

## Autoscale Deployment Best Practices

### Requirements Met by This App

✅ **Stateless Design**: All state stored in PostgreSQL, not in-memory  
✅ **External Storage**: Files stored in Replit Object Storage  
✅ **HTTP-Based**: All interactions via HTTP/WebSocket  
✅ **Fast Startup**: Minimal dependencies, lazy loading  
✅ **Error Handling**: Graceful error recovery, no crashes  

### Performance Optimizations

1. **Database Connection Pooling**:
   ```javascript
   const pool = new pg.Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20  // Connection pool size
   });
   ```

2. **Lazy Loading**:
   - React components lazy-loaded
   - Large libraries loaded on-demand

3. **Caching**:
   - TanStack Query caches API responses
   - Browser cache for static assets
   - OIDC config memoized for 1 hour

4. **Session Storage**:
   - PostgreSQL (not in-memory)
   - Shared across all instances

---

## Monitoring & Debugging

### Development Logs

**Console Output**:
```bash
# Server logs
NODE_ENV=development tsx server/index.ts

# Database queries (if enabled)
# Drizzle ORM query logs
```

**Browser Console**:
- React component errors
- Network requests
- Vite HMR updates

### Production Logs

Access logs via Replit Deployments dashboard:
- Request logs
- Error logs
- Performance metrics

---

## Troubleshooting

### Common Issues

#### Port Already in Use
**Solution**: Port 5000 is configured and should be available. If issues persist:
```bash
# Kill process on port 5000
npx kill-port 5000
```

#### Database Connection Fails
**Check**:
1. `DATABASE_URL` is set (automatic in Replit)
2. PostgreSQL module is active
3. Database schema is pushed: `npm run db:push`

#### Authentication Not Working
**Check**:
1. `REPL_ID` environment variable is set
2. `REPLIT_DOMAINS` contains your Repl's domain
3. Session table exists: `npm run db:push`

#### Build Fails
**Solutions**:
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

#### Vite Server Connection Lost
**Cause**: Server restart or crash  
**Solution**: Automatic reconnection, or refresh browser

---

## Security Considerations

### Automatic Security Features

1. **HTTPS**: Automatic in production via Replit
2. **Session Security**:
   - HTTP-only cookies
   - Secure flag in production
   - CSRF protection ready

3. **Database**:
   - Connection string not exposed
   - Parameterized queries (SQL injection prevention)

4. **Authentication**:
   - OAuth 2.0 / OIDC standard
   - Token refresh mechanism
   - Session expiration (7 days)

---

## Scaling Configuration

### Current Autoscale Settings

Configure in Replit Deployments UI:

- **Machine Power**: Adjustable (0.25 vCPU to 4 vCPU)
- **Max Instances**: Set based on expected traffic
- **Min Instances**: 0 (scales to zero during no traffic)

### Billing Considerations

**Charged For**:
- CPU/RAM during request processing
- Number of requests
- Outbound data transfer

**Not Charged For**:
- Idle time (no active requests)
- Background warming
- Database storage (separate pricing)

---

## Migration from Development to Production

### Checklist

1. **Test Locally**:
   ```bash
   npm run dev     # Verify development works
   npm run check   # TypeScript type checking
   npm run build   # Test production build
   ```

2. **Configure Secrets**:
   - Add any custom environment variables in Replit Secrets
   - API keys, external service credentials

3. **Deploy**:
   - Click "Deploy" in Deployments tab
   - Select "Autoscale" deployment type
   - Configure machine power and max instances
   - Click "Deploy"

4. **Verify**:
   - Check deployment URL works
   - Test authentication flow
   - Verify database connectivity
   - Test critical user flows

---

## Additional Resources

### Replit Documentation
- [Autoscale Deployments](https://docs.replit.com/cloud-services/deployments/autoscale-deployments)
- [PostgreSQL on Replit](https://docs.replit.com/storage-and-databases/postgresql-on-replit)
- [Replit Auth](https://docs.replit.com/hosting/replit-auth)
- [Object Storage](https://docs.replit.com/storage-and-databases/object-storage)

### Project Documentation
- `README.md` - Main project documentation
- `BUSINESS_README.md` - Business features and workflows
- `TECH_STACK_README.md` - Technology stack details
- `design_guidelines.md` - UI/UX design specifications

---

## Support

For Replit-specific issues:
- Check [Replit Community](https://ask.replit.com)
- Review [Replit Docs](https://docs.replit.com)

For project-specific issues:
- Review error logs in console
- Check database schema with `npm run db:push`
- Verify environment variables are set

---

**Platform**: Replit Autoscale  
**Last Updated**: January 2025  
**Maintained By**: Development Team
