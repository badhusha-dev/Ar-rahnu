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

// BSE Gold Accounts (renamed from goldAccounts)
export const bseAccounts = pgTable("bse_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  accountNumber: varchar("account_number", { length: 50 }).unique().notNull(),
  balanceGrams: decimal("balance_grams", { precision: 10, scale: 3 }).notNull().default("0"),
  balanceMyr: decimal("balance_myr", { precision: 12, scale: 2 }).notNull().default("0"),
  totalBoughtGrams: decimal("total_bought_grams", { precision: 10, scale: 3 }).notNull().default("0"),
  totalSoldGrams: decimal("total_sold_grams", { precision: 10, scale: 3 }).notNull().default("0"),
  averageBuyPriceMyr: decimal("average_buy_price_myr", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBseAccountSchema = createInsertSchema(bseAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// BSE Transactions (renamed from goldTransactions)
export const bseTransactions = pgTable("bse_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull(),
  userId: varchar("user_id").notNull(),
  branchId: varchar("branch_id"),
  transactionNumber: varchar("transaction_number", { length: 50 }).unique().notNull(),
  type: varchar("type", { 
    enum: ["buy", "sell", "transfer_in", "transfer_out"] 
  }).notNull(),
  weightGrams: decimal("weight_grams", { precision: 10, scale: 3 }).notNull(),
  pricePerGramMyr: decimal("price_per_gram_myr", { precision: 10, scale: 2 }).notNull(),
  totalAmountMyr: decimal("total_amount_myr", { precision: 12, scale: 2 }).notNull(),
  karat: varchar("karat", { length: 10 }).notNull(),
  description: text("description"),
  status: varchar("status", { 
    enum: ["pending", "completed", "cancelled", "failed"] 
  }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { 
    enum: ["cash", "bank_transfer", "card", "ewallet"] 
  }),
  paymentReference: varchar("payment_reference", { length: 255 }),
  processedBy: varchar("processed_by"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBseTransactionSchema = createInsertSchema(bseTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// BSE Inventory (renamed from inventory)
export const bseInventory = pgTable("bse_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: varchar("branch_id").notNull(),
  supplierId: varchar("supplier_id"),
  serialNumber: varchar("serial_number", { length: 100 }).unique().notNull(),
  productType: varchar("product_type", { 
    enum: ["bar", "coin", "wafer", "jewelry"] 
  }).notNull(),
  karat: varchar("karat", { length: 10 }).notNull(),
  weightGrams: decimal("weight_grams", { precision: 10, scale: 3 }).notNull(),
  description: text("description"),
  costPriceMyr: decimal("cost_price_myr", { precision: 12, scale: 2 }).notNull(),
  currentMarketValueMyr: decimal("current_market_value_myr", { precision: 12, scale: 2 }),
  barcode: varchar("barcode", { length: 100 }),
  rfidTag: varchar("rfid_tag", { length: 100 }),
  location: varchar("location", { length: 255 }),
  status: varchar("status", { 
    enum: ["available", "sold", "reserved", "damaged"] 
  }).notNull().default("available"),
  purchaseDate: timestamp("purchase_date"),
  soldDate: timestamp("sold_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBseInventorySchema = createInsertSchema(bseInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// BSE Suppliers (renamed from suppliers)
export const bseSuppliers = pgTable("bse_suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  companyRegistrationNumber: varchar("company_registration_number", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  bankName: varchar("bank_name", { length: 255 }),
  bankAccountNumber: varchar("bank_account_number", { length: 100 }),
  bankAccountName: varchar("bank_account_name", { length: 255 }),
  rating: integer("rating"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBseSupplierSchema = createInsertSchema(bseSuppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// BSE Gold Prices (shared with Rahnu for gold valuation)
export const goldPrices = pgTable("gold_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  karat: varchar("karat", { length: 10 }).notNull(),
  buyPricePerGramMyr: decimal("buy_price_per_gram_myr", { precision: 10, scale: 2 }).notNull(),
  sellPricePerGramMyr: decimal("sell_price_per_gram_myr", { precision: 10, scale: 2 }).notNull(),
  marginPercentage: decimal("margin_percentage", { precision: 5, scale: 2 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoldPriceSchema = createInsertSchema(goldPrices).omit({
  id: true,
  createdAt: true,
});

// Relations
export const bseAccountsRelations = relations(bseAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [bseAccounts.userId],
    references: [users.id],
  }),
  transactions: many(bseTransactions),
}));

export const bseTransactionsRelations = relations(bseTransactions, ({ one }) => ({
  account: one(bseAccounts, {
    fields: [bseTransactions.accountId],
    references: [bseAccounts.id],
  }),
  user: one(users, {
    fields: [bseTransactions.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [bseTransactions.branchId],
    references: [branches.id],
  }),
}));

export const bseInventoryRelations = relations(bseInventory, ({ one }) => ({
  branch: one(branches, {
    fields: [bseInventory.branchId],
    references: [branches.id],
  }),
  supplier: one(bseSuppliers, {
    fields: [bseInventory.supplierId],
    references: [bseSuppliers.id],
  }),
}));

// Types
export type BseAccount = typeof bseAccounts.$inferSelect;
export type BseTransaction = typeof bseTransactions.$inferSelect;
export type BseInventory = typeof bseInventory.$inferSelect;
export type BseSupplier = typeof bseSuppliers.$inferSelect;
export type GoldPrice = typeof goldPrices.$inferSelect;

