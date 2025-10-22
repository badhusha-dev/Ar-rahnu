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

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["teller", "manager", "auditor", "admin"] }).notNull().default("teller"),
  branchId: varchar("branch_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRelations = relations(users, ({ one }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
}));

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
  customers: many(customers),
  pawnTransactions: many(pawnTransactions),
  vaultItems: many(vaultItems),
}));

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branches.$inferSelect;

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  icNumber: varchar("ic_number", { length: 50 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  photoUrl: varchar("photo_url", { length: 500 }),
  icPhotoUrl: varchar("ic_photo_url", { length: 500 }),
  branchId: varchar("branch_id").notNull(),
  status: varchar("status", { enum: ["active", "inactive", "blacklisted"] }).notNull().default("active"),
  kycVerified: boolean("kyc_verified").notNull().default(false),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerRelations = relations(customers, ({ one, many }) => ({
  branch: one(branches, {
    fields: [customers.branchId],
    references: [branches.id],
  }),
  pawnTransactions: many(pawnTransactions),
}));

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Gold Items table
export const goldItems = pgTable("gold_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  karat: varchar("karat", { enum: ["999", "916", "900", "875", "750", "585"] }).notNull(),
  weightGrams: decimal("weight_grams", { precision: 10, scale: 3 }).notNull(),
  goldPricePerGramMyr: decimal("gold_price_per_gram_myr", { precision: 10, scale: 2 }).notNull(),
  marketValueMyr: decimal("market_value_myr", { precision: 12, scale: 2 }).notNull(),
  photoUrls: text("photo_urls").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goldItemRelations = relations(goldItems, ({ one }) => ({
  pawnTransaction: one(pawnTransactions, {
    fields: [goldItems.id],
    references: [pawnTransactions.goldItemId],
  }),
}));

export const insertGoldItemSchema = createInsertSchema(goldItems).omit({
  id: true,
  createdAt: true,
});

export type InsertGoldItem = z.infer<typeof insertGoldItemSchema>;
export type GoldItem = typeof goldItems.$inferSelect;

// Pawn Transactions table
export const pawnTransactions = pgTable("pawn_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: varchar("contract_number", { length: 100 }).notNull().unique(),
  customerId: varchar("customer_id").notNull(),
  branchId: varchar("branch_id").notNull(),
  goldItemId: varchar("gold_item_id").notNull(),
  
  // Loan details
  loanAmountMyr: decimal("loan_amount_myr", { precision: 12, scale: 2 }).notNull(),
  marginPercentage: decimal("margin_percentage", { precision: 5, scale: 2 }).notNull(),
  
  // Dates
  pledgeDate: timestamp("pledge_date").notNull().defaultNow(),
  maturityDate: timestamp("maturity_date").notNull(),
  tenureMonths: integer("tenure_months").notNull(),
  
  // Fees (Ujrah - safekeeping fee)
  monthlyFeeMyr: decimal("monthly_fee_myr", { precision: 10, scale: 2 }).notNull(),
  totalFeesAccruedMyr: decimal("total_fees_accrued_myr", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Status
  status: varchar("status", { 
    enum: ["active", "renewed", "redeemed", "defaulted", "auctioned"] 
  }).notNull().default("active"),
  
  // Vault
  vaultLocation: varchar("vault_location", { length: 100 }),
  
  // Contract document
  contractPdfUrl: varchar("contract_pdf_url", { length: 500 }),
  
  // Signature
  customerSignatureUrl: varchar("customer_signature_url", { length: 500 }),
  tellerSignatureUrl: varchar("teller_signature_url", { length: 500 }),
  
  // Audit
  processedBy: varchar("processed_by"),
  approvedBy: varchar("approved_by"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pawnTransactionRelations = relations(pawnTransactions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [pawnTransactions.customerId],
    references: [customers.id],
  }),
  branch: one(branches, {
    fields: [pawnTransactions.branchId],
    references: [branches.id],
  }),
  goldItem: one(goldItems, {
    fields: [pawnTransactions.goldItemId],
    references: [goldItems.id],
  }),
  processedByUser: one(users, {
    fields: [pawnTransactions.processedBy],
    references: [users.id],
  }),
  payments: many(payments),
  renewals: many(renewals),
}));

export const insertPawnTransactionSchema = createInsertSchema(pawnTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPawnTransaction = z.infer<typeof insertPawnTransactionSchema>;
export type PawnTransaction = typeof pawnTransactions.$inferSelect;

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pawnTransactionId: varchar("pawn_transaction_id").notNull(),
  amountMyr: decimal("amount_myr", { precision: 12, scale: 2 }).notNull(),
  paymentType: varchar("payment_type", { 
    enum: ["loan_repayment", "fee_payment", "partial_repayment", "full_settlement"] 
  }).notNull(),
  paymentMethod: varchar("payment_method", { 
    enum: ["cash", "bank_transfer", "card", "online"] 
  }).notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  processedBy: varchar("processed_by"),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentRelations = relations(payments, ({ one }) => ({
  pawnTransaction: one(pawnTransactions, {
    fields: [payments.pawnTransactionId],
    references: [pawnTransactions.id],
  }),
  processedByUser: one(users, {
    fields: [payments.processedBy],
    references: [users.id],
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Renewals table
export const renewals = pgTable("renewals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pawnTransactionId: varchar("pawn_transaction_id").notNull(),
  previousMaturityDate: timestamp("previous_maturity_date").notNull(),
  newMaturityDate: timestamp("new_maturity_date").notNull(),
  extensionMonths: integer("extension_months").notNull(),
  renewalFeeMyr: decimal("renewal_fee_myr", { precision: 10, scale: 2 }).notNull(),
  newMonthlyFeeMyr: decimal("new_monthly_fee_myr", { precision: 10, scale: 2 }).notNull(),
  processedBy: varchar("processed_by"),
  renewalDate: timestamp("renewal_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const renewalRelations = relations(renewals, ({ one }) => ({
  pawnTransaction: one(pawnTransactions, {
    fields: [renewals.pawnTransactionId],
    references: [pawnTransactions.id],
  }),
  processedByUser: one(users, {
    fields: [renewals.processedBy],
    references: [users.id],
  }),
}));

export const insertRenewalSchema = createInsertSchema(renewals).omit({
  id: true,
  createdAt: true,
});

export type InsertRenewal = z.infer<typeof insertRenewalSchema>;
export type Renewal = typeof renewals.$inferSelect;

// Vault Items table (inventory tracking)
export const vaultItems = pgTable("vault_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pawnTransactionId: varchar("pawn_transaction_id").notNull(),
  branchId: varchar("branch_id").notNull(),
  vaultSection: varchar("vault_section", { length: 50 }).notNull(),
  vaultPosition: varchar("vault_position", { length: 50 }).notNull(),
  barcode: varchar("barcode", { length: 100 }).unique(),
  rfidTag: varchar("rfid_tag", { length: 100 }).unique(),
  status: varchar("status", { enum: ["stored", "released", "transferred"] }).notNull().default("stored"),
  storedDate: timestamp("stored_date").notNull().defaultNow(),
  releasedDate: timestamp("released_date"),
  lastAuditDate: timestamp("last_audit_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vaultItemRelations = relations(vaultItems, ({ one, many }) => ({
  pawnTransaction: one(pawnTransactions, {
    fields: [vaultItems.pawnTransactionId],
    references: [pawnTransactions.id],
  }),
  branch: one(branches, {
    fields: [vaultItems.branchId],
    references: [branches.id],
  }),
  movements: many(vaultMovements),
}));

export const insertVaultItemSchema = createInsertSchema(vaultItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVaultItem = z.infer<typeof insertVaultItemSchema>;
export type VaultItem = typeof vaultItems.$inferSelect;

// Vault Movements table (audit trail)
export const vaultMovements = pgTable("vault_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vaultItemId: varchar("vault_item_id").notNull(),
  movementType: varchar("movement_type", { 
    enum: ["storage", "retrieval", "transfer", "audit", "inspection"] 
  }).notNull(),
  fromLocation: varchar("from_location", { length: 100 }),
  toLocation: varchar("to_location", { length: 100 }),
  performedBy: varchar("performed_by"),
  reason: text("reason"),
  movementDate: timestamp("movement_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vaultMovementRelations = relations(vaultMovements, ({ one }) => ({
  vaultItem: one(vaultItems, {
    fields: [vaultMovements.vaultItemId],
    references: [vaultItems.id],
  }),
  performedByUser: one(users, {
    fields: [vaultMovements.performedBy],
    references: [users.id],
  }),
}));

export const insertVaultMovementSchema = createInsertSchema(vaultMovements).omit({
  id: true,
  createdAt: true,
});

export type InsertVaultMovement = z.infer<typeof insertVaultMovementSchema>;
export type VaultMovement = typeof vaultMovements.$inferSelect;
