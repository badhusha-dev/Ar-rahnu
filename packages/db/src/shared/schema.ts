import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table with module scope support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  
  // RBAC with module scope
  role: varchar("role", { 
    enum: ["customer", "teller", "manager", "admin"] 
  }).notNull().default("customer"),
  scope: varchar("scope", { 
    enum: ["rahnu", "bse", "admin"] 
  }).notNull().default("bse"), // Module scope
  branchId: varchar("branch_id"),
  isActive: boolean("is_active").notNull().default(true),

  // Email verification
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpiry: timestamp("email_verification_expiry"),

  // Password reset
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpiry: timestamp("password_reset_expiry"),

  // Two-Factor Authentication
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),

  // Account security
  loginAttempts: integer("login_attempts").notNull().default(0),
  accountLockedUntil: timestamp("account_locked_until"),

  // Last login tracking
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: varchar("last_login_ip", { length: 100 }),
  lastLoginDevice: varchar("last_login_device", { length: 500 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  emailVerificationToken: true,
  emailVerificationExpiry: true,
  passwordResetToken: true,
  passwordResetExpiry: true,
  twoFactorSecret: true,
  loginAttempts: true,
  accountLockedUntil: true,
  lastLoginAt: true,
  lastLoginIp: true,
  lastLoginDevice: true,
  emailVerified: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
});

// Branches table
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  managerName: varchar("manager_name", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Refresh tokens for JWT authentication
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Login history for security tracking
export const loginHistory = pgTable("login_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: varchar("user_agent", { length: 500 }),
  device: varchar("device", { length: 500 }),
  location: varchar("location", { length: 255 }),
  status: varchar("status", { 
    enum: ["success", "failed", "blocked"] 
  }).notNull(),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logs for compliance
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  branchId: varchar("branch_id"),
  module: varchar("module", { enum: ["rahnu", "bse", "admin"] }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: varchar("entity_id"),
  changes: jsonb("changes"),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  refreshTokens: many(refreshTokens),
  loginHistory: many(loginHistory),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
}));

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type LoginHistory = typeof loginHistory.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

