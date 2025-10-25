import { sql, relations } from 'drizzle-orm';
import {
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
import { users, branches } from "../shared/schema";

// Rahnu Customers (extends users table, or separate table for KYC data)
export const rahnuCustomers = pgTable("rahnu_customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").unique(), // Link to users table if customer has account
  customerNumber: varchar("customer_number", { length: 50 }).unique().notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  icNumber: varchar("ic_number", { length: 50 }).unique().notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  occupation: varchar("occupation", { length: 255 }),
  monthlyIncome: decimal("monthly_income", { precision: 12, scale: 2 }),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  emergencyPhone: varchar("emergency_phone", { length: 50 }),
  branchId: varchar("branch_id").notNull(),
  isBlacklisted: boolean("is_blacklisted").notNull().default(false),
  blacklistReason: text("blacklist_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRahnuCustomerSchema = createInsertSchema(rahnuCustomers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Rahnu Loans (Pawn Transactions)
export const rahnuLoans = pgTable("rahnu_loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanNumber: varchar("loan_number", { length: 50 }).unique().notNull(),
  customerId: varchar("customer_id").notNull(),
  branchId: varchar("branch_id").notNull(),
  
  // Gold item details
  itemDescription: text("item_description").notNull(),
  itemType: varchar("item_type", { 
    enum: ["jewelry", "gold_bar", "gold_coin", "other"] 
  }).notNull(),
  karat: varchar("karat", { length: 10 }).notNull(),
  weightGrams: decimal("weight_grams", { precision: 10, scale: 3 }).notNull(),
  
  // Valuation
  goldPricePerGramMyr: decimal("gold_price_per_gram_myr", { precision: 10, scale: 2 }).notNull(),
  marketValueMyr: decimal("market_value_myr", { precision: 12, scale: 2 }).notNull(),
  
  // Loan amount (typically 60-80% of market value)
  loanAmountMyr: decimal("loan_amount_myr", { precision: 12, scale: 2 }).notNull(),
  loanToValueRatio: decimal("loan_to_value_ratio", { precision: 5, scale: 2 }).notNull(),
  
  // Ujrah (Islamic service fee)
  ujrahPercentageMonthly: decimal("ujrah_percentage_monthly", { precision: 5, scale: 2 }).notNull(),
  ujrahAmountMyr: decimal("ujrah_amount_myr", { precision: 12, scale: 2 }).notNull().default("0"),
  
  // Loan terms
  loanPeriodMonths: integer("loan_period_months").notNull().default(6),
  startDate: timestamp("start_date").notNull(),
  maturityDate: timestamp("maturity_date").notNull(),
  
  // Status
  status: varchar("status", { 
    enum: ["active", "redeemed", "renewed", "defaulted", "auctioned"] 
  }).notNull().default("active"),
  
  // Vault tracking
  vaultLocation: varchar("vault_location", { length: 255 }),
  vaultBarcode: varchar("vault_barcode", { length: 100 }),
  
  // Staff tracking
  approvedBy: varchar("approved_by"),
  processedBy: varchar("processed_by"),
  
  // Contract
  contractSigned: boolean("contract_signed").notNull().default(false),
  contractSignedAt: timestamp("contract_signed_at"),
  contractPdfUrl: varchar("contract_pdf_url", { length: 500 }),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRahnuLoanSchema = createInsertSchema(rahnuLoans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Rahnu Payments
export const rahnuPayments = pgTable("rahnu_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").notNull(),
  paymentNumber: varchar("payment_number", { length: 50 }).unique().notNull(),
  customerId: varchar("customer_id").notNull(),
  branchId: varchar("branch_id").notNull(),
  
  type: varchar("type", { 
    enum: ["ujrah", "partial_redemption", "full_redemption", "renewal_fee"] 
  }).notNull(),
  
  amountMyr: decimal("amount_myr", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { 
    enum: ["cash", "bank_transfer", "card", "ewallet"] 
  }).notNull(),
  paymentReference: varchar("payment_reference", { length: 255 }),
  
  processedBy: varchar("processed_by"),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  receiptPdfUrl: varchar("receipt_pdf_url", { length: 500 }),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRahnuPaymentSchema = createInsertSchema(rahnuPayments).omit({
  id: true,
  createdAt: true,
});

// Rahnu Vault Items
export const rahnuVaultItems = pgTable("rahnu_vault_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").unique().notNull(),
  branchId: varchar("branch_id").notNull(),
  
  barcode: varchar("barcode", { length: 100 }).unique().notNull(),
  rfidTag: varchar("rfid_tag", { length: 100 }),
  location: varchar("location", { length: 255 }).notNull(), // e.g., "Vault A-1"
  
  itemDescription: text("item_description").notNull(),
  karat: varchar("karat", { length: 10 }).notNull(),
  weightGrams: decimal("weight_grams", { precision: 10, scale: 3 }).notNull(),
  
  status: varchar("status", { 
    enum: ["in_vault", "released", "missing", "damaged"] 
  }).notNull().default("in_vault"),
  
  // Dual approval system
  vaultInApprover1: varchar("vault_in_approver_1"),
  vaultInApprover2: varchar("vault_in_approver_2"),
  vaultInTimestamp: timestamp("vault_in_timestamp"),
  vaultInSignature1: text("vault_in_signature_1"),
  vaultInSignature2: text("vault_in_signature_2"),
  
  vaultOutApprover1: varchar("vault_out_approver_1"),
  vaultOutApprover2: varchar("vault_out_approver_2"),
  vaultOutTimestamp: timestamp("vault_out_timestamp"),
  vaultOutSignature1: text("vault_out_signature_1"),
  vaultOutSignature2: text("vault_out_signature_2"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRahnuVaultItemSchema = createInsertSchema(rahnuVaultItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Rahnu Renewals
export const rahnuRenewals = pgTable("rahnu_renewals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").notNull(),
  renewalNumber: varchar("renewal_number", { length: 50 }).unique().notNull(),
  customerId: varchar("customer_id").notNull(),
  branchId: varchar("branch_id").notNull(),
  
  previousMaturityDate: timestamp("previous_maturity_date").notNull(),
  newMaturityDate: timestamp("new_maturity_date").notNull(),
  extensionMonths: integer("extension_months").notNull(),
  
  renewalFeeMyr: decimal("renewal_fee_myr", { precision: 12, scale: 2 }).notNull(),
  ujrahPaidMyr: decimal("ujrah_paid_myr", { precision: 12, scale: 2 }).notNull(),
  
  processedBy: varchar("processed_by"),
  contractPdfUrl: varchar("contract_pdf_url", { length: 500 }),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRahnuRenewalSchema = createInsertSchema(rahnuRenewals).omit({
  id: true,
  createdAt: true,
});

// Rahnu Auctions (for defaulted loans)
export const rahnuAuctions = pgTable("rahnu_auctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").notNull(),
  auctionNumber: varchar("auction_number", { length: 50 }).unique().notNull(),
  branchId: varchar("branch_id").notNull(),
  
  itemDescription: text("item_description").notNull(),
  karat: varchar("karat", { length: 10 }).notNull(),
  weightGrams: decimal("weight_grams", { precision: 10, scale: 3 }).notNull(),
  
  startingPriceMyr: decimal("starting_price_myr", { precision: 12, scale: 2 }).notNull(),
  reservePriceMyr: decimal("reserve_price_myr", { precision: 12, scale: 2 }),
  finalPriceMyr: decimal("final_price_myr", { precision: 12, scale: 2 }),
  
  auctionDate: timestamp("auction_date").notNull(),
  status: varchar("status", { 
    enum: ["scheduled", "ongoing", "sold", "unsold", "cancelled"] 
  }).notNull().default("scheduled"),
  
  buyerName: varchar("buyer_name", { length: 255 }),
  buyerIc: varchar("buyer_ic", { length: 50 }),
  buyerPhone: varchar("buyer_phone", { length: 50 }),
  
  processedBy: varchar("processed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRahnuAuctionSchema = createInsertSchema(rahnuAuctions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Relations
export const rahnuCustomersRelations = relations(rahnuCustomers, ({ one, many }) => ({
  user: one(users, {
    fields: [rahnuCustomers.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [rahnuCustomers.branchId],
    references: [branches.id],
  }),
  loans: many(rahnuLoans),
}));

export const rahnuLoansRelations = relations(rahnuLoans, ({ one, many }) => ({
  customer: one(rahnuCustomers, {
    fields: [rahnuLoans.customerId],
    references: [rahnuCustomers.id],
  }),
  branch: one(branches, {
    fields: [rahnuLoans.branchId],
    references: [branches.id],
  }),
  payments: many(rahnuPayments),
  vaultItem: one(rahnuVaultItems, {
    fields: [rahnuLoans.id],
    references: [rahnuVaultItems.loanId],
  }),
  renewals: many(rahnuRenewals),
}));

export const rahnuPaymentsRelations = relations(rahnuPayments, ({ one }) => ({
  loan: one(rahnuLoans, {
    fields: [rahnuPayments.loanId],
    references: [rahnuLoans.id],
  }),
  customer: one(rahnuCustomers, {
    fields: [rahnuPayments.customerId],
    references: [rahnuCustomers.id],
  }),
  branch: one(branches, {
    fields: [rahnuPayments.branchId],
    references: [branches.id],
  }),
}));

// Types
export type RahnuCustomer = typeof rahnuCustomers.$inferSelect;
export type RahnuLoan = typeof rahnuLoans.$inferSelect;
export type RahnuPayment = typeof rahnuPayments.$inferSelect;
export type RahnuVaultItem = typeof rahnuVaultItems.$inferSelect;
export type RahnuRenewal = typeof rahnuRenewals.$inferSelect;
export type RahnuAuction = typeof rahnuAuctions.$inferSelect;

