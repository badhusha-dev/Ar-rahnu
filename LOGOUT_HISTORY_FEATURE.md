# 📝 Logout History Tracking - Complete Implementation

## ✅ Overview

The system now tracks **all user logouts** with full audit trail capabilities, including:
- Logout timestamp
- User information
- IP address
- Device/User-Agent details
- Session duration (optional)

---

## 🗄️ Database Schema

### `logout_history` Table

```sql
CREATE TABLE logout_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  logout_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(100),
  user_agent VARCHAR(500),
  device VARCHAR(255),
  session_duration INTEGER -- Duration in seconds
);
```

**Fields:**
- `id` - Unique identifier (UUID)
- `user_id` - Foreign key to users table
- `logout_at` - Timestamp when user logged out
- `ip_address` - Client IP address
- `user_agent` - Browser user agent string
- `device` - Device type (Desktop/Mobile)
- `session_duration` - Optional session duration in seconds

---

## 🔧 Backend Implementation

### 1. Schema Definition

**File:** `shared/schema.ts`

```typescript
export const logoutHistory = pgTable("logout_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  logoutAt: timestamp("logout_at").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: varchar("user_agent", { length: 500 }),
  device: varchar("device", { length: 255 }),
  sessionDuration: integer("session_duration"),
});
```

### 2. Storage Layer

**File:** `server/storage.ts`

**Methods Added:**

```typescript
// Create logout history entry
async createLogoutHistory(history: InsertLogoutHistory): Promise<LogoutHistory> {
  const [created] = await db.insert(logoutHistory).values(history).returning();
  return created;
}

// Get user's logout history
async getUserLogoutHistory(userId: string, limit: number = 20): Promise<LogoutHistory[]> {
  return await db
    .select()
    .from(logoutHistory)
    .where(eq(logoutHistory.userId, userId))
    .orderBy(desc(logoutHistory.logoutAt))
    .limit(limit);
}
```

### 3. Auth Service

**File:** `server/authService.ts`

**Updated Methods:**

```typescript
async logout(userId: string, refreshToken?: string, req?: any): Promise<{ message: string }> {
  // Record logout history
  try {
    await storage.createLogoutHistory({
      userId,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get?.('user-agent'),
      device: req?.get?.('user-agent')?.includes('Mobile') ? 'Mobile' : 'Desktop',
    });
  } catch (error) {
    console.error('Failed to record logout history:', error);
  }

  if (refreshToken) {
    await storage.deleteRefreshToken(refreshToken);
  }
  return { message: 'Logged out successfully' };
}
```

### 4. API Routes

**File:** `server/routes.ts`

**Endpoints:**

```typescript
// Single session logout
POST /api/auth/logout
Headers: Authorization: Bearer <token>

// All sessions logout
POST /api/auth/logout-all
Headers: Authorization: Bearer <token>
```

Both endpoints now automatically record logout events in the database.

---

## 🎯 How It Works

### Logout Flow

```
User Clicks "Sign Out"
        ↓
Frontend calls POST /api/auth/logout
        ↓
Backend receives request with:
  - User ID (from JWT token)
  - IP Address (from request)
  - User-Agent (from headers)
        ↓
authService.logout() is called
        ↓
Logout history recorded in database:
  - logout_at: current timestamp
  - user_id: authenticated user
  - ip_address: client IP
  - device: Desktop/Mobile
  - user_agent: browser info
        ↓
Refresh token deleted (if provided)
        ↓
Response sent: { "message": "Logged out successfully" }
        ↓
Frontend clears local storage
        ↓
User redirected to login page
```

---

## 🧪 Testing

### 1. Manual Testing

**Step 1: Login**
1. Open http://localhost:5000/login
2. Click "Admin User" demo button
3. Login successfully

**Step 2: Logout**
1. Click "Sign Out" button in the UI
2. Redirected to login page
3. Logout recorded in database

**Step 3: Verify Database**
```sql
SELECT * FROM logout_history ORDER BY logout_at DESC LIMIT 5;
```

Expected result:
```
id                  | user_id             | logout_at           | ip_address | device
--------------------|---------------------|---------------------|------------|----------
xxx-xxx-xxx         | d13434db-79b8...    | 2025-10-25 00:55:30 | ::1        | Desktop
```

### 2. API Testing

**Using curl:**

```bash
# First, login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bse.my","password":"Admin@123"}'

# Then logout with the token
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "message": "Logged out successfully"
}
```

---

## 📊 Querying Logout History

### Get Recent Logouts

```typescript
// In your code
const recentLogouts = await storage.getUserLogoutHistory(userId, 10);
```

### Database Queries

**All logouts by user:**
```sql
SELECT 
  lh.logout_at,
  lh.ip_address,
  lh.device,
  u.email
FROM logout_history lh
JOIN users u ON lh.user_id = u.id
WHERE u.id = 'USER_ID_HERE'
ORDER BY lh.logout_at DESC;
```

**Logouts today:**
```sql
SELECT COUNT(*) 
FROM logout_history 
WHERE logout_at >= CURRENT_DATE;
```

**Most active logout times:**
```sql
SELECT 
  EXTRACT(HOUR FROM logout_at) as hour,
  COUNT(*) as logout_count
FROM logout_history
GROUP BY hour
ORDER BY logout_count DESC;
```

---

## 🎨 Frontend Integration (Optional)

### Display Logout History

You can show recent logout history in the user's profile:

```typescript
import { useQuery } from '@tanstack/react-query';

function UserProfile() {
  const { data: logoutHistory } = useQuery({
    queryKey: ['logout-history'],
    queryFn: async () => {
      const res = await fetch('/api/user/logout-history');
      return res.json();
    }
  });

  return (
    <div>
      <h3>Recent Logouts</h3>
      <ul>
        {logoutHistory?.map((entry) => (
          <li key={entry.id}>
            {new Date(entry.logoutAt).toLocaleString()} 
            - {entry.device} 
            - {entry.ipAddress}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Add API Endpoint

**File:** `server/routes.ts`

```typescript
app.get('/api/user/logout-history', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const history = await storage.getUserLogoutHistory(req.user!.userId, 10);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
```

---

## 📈 Analytics & Reporting

### Session Duration Tracking

To track session duration, update the login history to include `loginAt` and calculate duration on logout:

```typescript
async logout(userId: string, refreshToken?: string, req?: any): Promise<{ message: string }> {
  // Get last login time
  const loginHistory = await storage.getUserLoginHistory(userId, 1);
  const lastLogin = loginHistory[0];
  
  const sessionDuration = lastLogin 
    ? Math.floor((Date.now() - new Date(lastLogin.loginAt).getTime()) / 1000)
    : null;

  // Record logout with session duration
  await storage.createLogoutHistory({
    userId,
    ipAddress: req?.ip,
    userAgent: req?.get?.('user-agent'),
    device: req?.get?.('user-agent')?.includes('Mobile') ? 'Mobile' : 'Desktop',
    sessionDuration,
  });

  // ... rest of logout logic
}
```

### Report Examples

**Average session duration:**
```sql
SELECT 
  AVG(session_duration) / 60 as avg_minutes,
  COUNT(*) as total_logouts
FROM logout_history
WHERE session_duration IS NOT NULL;
```

**Logout patterns by hour:**
```sql
SELECT 
  EXTRACT(HOUR FROM logout_at) as hour,
  COUNT(*) as count
FROM logout_history
GROUP BY hour
ORDER BY hour;
```

---

## 🔐 Security Benefits

### Audit Trail
- **Complete visibility** into user sessions
- **Detect suspicious activity** (unusual logout times/locations)
- **Compliance tracking** for security audits

### Anomaly Detection
- Multiple logouts from different IPs
- Logouts at unusual hours
- Frequent logout/login cycles

### Example Security Query

```sql
-- Find users with multiple logouts from different IPs in short time
SELECT 
  user_id,
  COUNT(DISTINCT ip_address) as ip_count,
  COUNT(*) as logout_count,
  MIN(logout_at) as first_logout,
  MAX(logout_at) as last_logout
FROM logout_history
WHERE logout_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(DISTINCT ip_address) > 1;
```

---

## ✅ Summary

| Component | Status | Details |
|-----------|--------|---------|
| **Database Table** | ✅ Created | `logout_history` with all fields |
| **Schema Definition** | ✅ Added | In `shared/schema.ts` |
| **Storage Methods** | ✅ Implemented | `createLogoutHistory`, `getUserLogoutHistory` |
| **Auth Service** | ✅ Updated | Records logout on both single & all sessions |
| **API Routes** | ✅ Updated | `/api/auth/logout`, `/api/auth/logout-all` |
| **Error Handling** | ✅ Implemented | Graceful fallback if recording fails |
| **Testing** | ✅ Ready | Manual and API testing available |

---

## 🎉 Benefits

✅ **Complete Audit Trail** - Track all user logouts  
✅ **Security Monitoring** - Detect suspicious activity  
✅ **Session Analytics** - Understand user behavior  
✅ **Compliance Ready** - Meet audit requirements  
✅ **Non-Blocking** - Logout works even if tracking fails  
✅ **Easy Querying** - Simple SQL to analyze patterns  
✅ **Automatic** - No manual tracking needed  

---

## 📝 Next Steps (Optional Enhancements)

1. **Frontend UI** - Display logout history in user profile
2. **Session Duration** - Calculate and store session lengths
3. **Alerts** - Notify on suspicious logout patterns
4. **Reports** - Dashboard with logout analytics
5. **Cleanup** - Archive old logout records
6. **Geo-Location** - Add country/city from IP address

---

**Implementation Complete!** 🚀

The logout history tracking is now fully operational and recording all user logout events automatically.

**Test it now:** 
1. Login at http://localhost:5000/login
2. Click "Sign Out"
3. Check database: `SELECT * FROM logout_history;`

---

**Created:** October 25, 2025  
**Version:** 1.0.0

