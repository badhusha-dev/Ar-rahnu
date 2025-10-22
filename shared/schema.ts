import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with comprehensive authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: varchar("role", { enum: ["customer", "teller", "manager", "admin"] }).notNull().default("customer"),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Branches table
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  managerName: varchar("manager_name", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const branchRelations = relations(branches, ({ many }) => ({
  users: many(users),
  goldTransactions: many(goldTransactions),
  inventory: many(inventory),
}));

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branches.$inferSelect;

// Gold Accounts table (customer wallets)
export const goldAccounts = pgTable("gold_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  balanceGrams: decimal("balance_grams", { precision: 12, scale: 4 }).notNull().default("0"),
  balanceMyr: decimal("balance_myr", { precision: 12, scale: 2 }).notNull().default("0"),
  totalBoughtGrams: decimal("total_bought_grams", { precision: 12, scale: 4 }).notNull().default("0"),
  totalSoldGrams: decimal("total_sold_grams", { precision: 12, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goldAccountRelations = relations(goldAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [goldAccounts.userId],
    references: [users.id],
  }),
  transactions: many(goldTransactions),
}));

export const insertGoldAccountSchema = createInsertSchema(goldAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGoldAccount = z.infer<typeof insertGoldAccountSchema>;
export type GoldAccount = typeof goldAccounts.$inferSelect;

// Gold Transactions table (buy/sell transactions)
export const goldTransactions = pgTable("gold_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  branchId: varchar("branch_id").notNull(),
  transactionNumber: varchar("transaction_number", { length: 100 }).notNull().unique(),

  // Transaction details
  type: varchar("type", { enum: ["buy", "sell"] }).notNull(),
  grams: decimal("grams", { precision: 12, scale: 4 }).notNull(),
  ratePerGramMyr: decimal("rate_per_gram_myr", { precision: 10, scale: 2 }).notNull(),
  totalMyr: decimal("total_myr", { precision: 12, scale: 2 }).notNull(),

  // Payment details
  paymentMethod: varchar("payment_method", { 
    enum: ["cash", "fpx", "duitnow", "card", "online"] 
  }).notNull(),
  paymentReferenceNumber: varchar("payment_reference_number", { length: 100 }),
  paymentStatus: varchar("payment_status", { 
    enum: ["pending", "completed", "failed", "refunded"] 
  }).notNull().default("pending"),

  // Status
  status: varchar("status", { 
    enum: ["pending", "completed", "cancelled"] 
  }).notNull().default("pending"),

  // Contract document
  contractPdfUrl: varchar("contract_pdf_url", { length: 500 }),
  receiptPdfUrl: varchar("receipt_pdf_url", { length: 500 }),

  // Audit
  processedBy: varchar("processed_by"),
  approvedBy: varchar("approved_by"),
  notes: text("notes"),

  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goldTransactionRelations = relations(goldTransactions, ({ one }) => ({
  user: one(users, {
    fields: [goldTransactions.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [goldTransactions.branchId],
    references: [branches.id],
  }),
  goldAccount: one(goldAccounts, {
    fields: [goldTransactions.userId],
    references: [goldAccounts.userId],
  }),
  processedByUser: one(users, {
    fields: [goldTransactions.processedBy],
    references: [users.id],
  }),
}));

export const insertGoldTransactionSchema = createInsertSchema(goldTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGoldTransaction = z.infer<typeof insertGoldTransactionSchema>;
export type GoldTransaction = typeof goldTransactions.$inferSelect;

// Inventory table (physical gold stock)
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().unique(),
  productType: varchar("product_type", { 
    enum: ["bar", "coin", "jewelry", "wafer"] 
  }).notNull(),
  branchId: varchar("branch_id").notNull(),

  // Gold details
  karat: varchar("karat", { enum: ["999", "916", "900", "875", "750", "585"] }).notNull(),
  weightGrams: decimal("weight_grams", { precision: 10, scale: 3 }).notNull(),
  description: text("description").notNull(),

  // Pricing
  costPriceMyr: decimal("cost_price_myr", { precision: 12, scale: 2 }).notNull(),
  currentMarketValueMyr: decimal("current_market_value_myr", { precision: 12, scale: 2 }).notNull(),

  // Tracking
  barcode: varchar("barcode", { length: 100 }).unique(),
  rfidTag: varchar("rfid_tag", { length: 100 }).unique(),
  location: varchar("location", { length: 100 }).notNull(),

  // Status
  status: varchar("status", { 
    enum: ["available", "sold", "reserved", "damaged"] 
  }).notNull().default("available"),

  // Supplier info
  supplierId: varchar("supplier_id"),
  purchaseDate: timestamp("purchase_date"),

  // Media
  photoUrls: text("photo_urls").array(),
  certificateUrl: varchar("certificate_url", { length: 500 }),

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventoryRelations = relations(inventory, ({ one }) => ({
  branch: one(branches, {
    fields: [inventory.branchId],
    references: [branches.id],
  }),
  supplier: one(suppliers, {
    fields: [inventory.supplierId],
    references: [suppliers.id],
  }),
}));

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  companyRegistrationNumber: varchar("company_registration_number", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  bankName: varchar("bank_name", { length: 255 }),
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supplierRelations = relations(suppliers, ({ many }) => ({
  inventory: many(inventory),
  invoices: many(supplierInvoices),
}));

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Supplier Invoices table
export const supplierInvoices = pgTable("supplier_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  supplierId: varchar("supplier_id").notNull(),
  totalAmountMyr: decimal("total_amount_myr", { precision: 12, scale: 2 }).notNull(),
  paidAmountMyr: decimal("paid_amount_myr", { precision: 12, scale: 2 }).notNull().default("0"),
  status: varchar("status", { 
    enum: ["pending", "partial", "paid", "cancelled"] 
  }).notNull().default("pending"),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentReferenceNumber: varchar("payment_reference_number", { length: 100 }),
  invoicePdfUrl: varchar("invoice_pdf_url", { length: 500 }),
  notes: text("notes"),
  approvedBy: varchar("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supplierInvoiceRelations = relations(supplierInvoices, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierInvoices.supplierId],
    references: [suppliers.id],
  }),
  approvedByUser: one(users, {
    fields: [supplierInvoices.approvedBy],
    references: [users.id],
  }),
}));

export const insertSupplierInvoiceSchema = createInsertSchema(supplierInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplierInvoice = z.infer<typeof insertSupplierInvoiceSchema>;
export type SupplierInvoice = typeof supplierInvoices.$inferSelect;

// Gold Prices table (historical pricing)
export const goldPrices = pgTable("gold_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  karat: varchar("karat", { enum: ["999", "916", "900", "875", "750", "585"] }).notNull(),
  buyPricePerGramMyr: decimal("buy_price_per_gram_myr", { precision: 10, scale: 2 }).notNull(),
  sellPricePerGramMyr: decimal("sell_price_per_gram_myr", { precision: 10, scale: 2 }).notNull(),
  marginPercentage: decimal("margin_percentage", { precision: 5, scale: 2 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull().defaultNow(),
  updatedBy: varchar("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goldPriceRelations = relations(goldPrices, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [goldPrices.updatedBy],
    references: [users.id],
  }),
}));

export const insertGoldPriceSchema = createInsertSchema(goldPrices).omit({
  id: true,
  createdAt: true,
});

export type InsertGoldPrice = z.infer<typeof insertGoldPriceSchema>;
export type GoldPrice = typeof goldPrices.$inferSelect;

// Refresh Tokens table (for JWT refresh token management)
export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: varchar("user_agent", { length: 500 }),
});

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;

// Login History table (activity tracking and audit)
export const loginHistory = pgTable("login_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  loginAt: timestamp("login_at").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: varchar("user_agent", { length: 500 }),
  device: varchar("device", { length: 255 }),
  browser: varchar("browser", { length: 255 }),
  os: varchar("os", { length: 255 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  success: boolean("success").notNull().default(true),
  failureReason: varchar("failure_reason", { length: 255 }),
  twoFactorUsed: boolean("two_factor_used").notNull().default(false),
});

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id],
  }),
}));

export const insertLoginHistorySchema = createInsertSchema(loginHistory).omit({
  id: true,
  loginAt: true,
});

export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;
export type LoginHistory = typeof loginHistory.$inferSelect;

// Audit Logs table (system-wide activity tracking)
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: varchar("entity_id", { length: 255 }),
  changes: jsonb("changes"),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: varchar("user_agent", { length: 500 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// User relations (declared at the end after all tables are defined)
export const userRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  goldAccount: one(goldAccounts, {
    fields: [users.id],
    references: [goldAccounts.userId],
  }),
  refreshTokens: many(refreshTokens),
  loginHistory: many(loginHistory),
}));

// Add customer schema types
export const insertCustomerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  icNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().default("Malaysia"),
  role: z.enum(["customer", "teller", "manager", "admin"]).default("customer"),
  branchId: z.string().min(1, "Branch is required"),
  status: z.enum(["active", "inactive", "blacklisted"]).default("active"),
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;