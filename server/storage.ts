import {
  users,
  goldAccounts,
  goldTransactions,
  inventory,
  suppliers,
  supplierInvoices,
  goldPrices,
  branches,
  refreshTokens,
  loginHistory,
  auditLogs,
  type User,
  type UpsertUser,
  type InsertUser,
  type GoldAccount,
  type InsertGoldAccount,
  type GoldTransaction,
  type InsertGoldTransaction,
  type Inventory,
  type InsertInventory,
  type Supplier,
  type InsertSupplier,
  type SupplierInvoice,
  type InsertSupplierInvoice,
  type GoldPrice,
  type InsertGoldPrice,
  type Branch,
  type InsertBranch,
  type RefreshToken,
  type InsertRefreshToken,
  type LoginHistory,
  type InsertLoginHistory,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lt, or, like } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Refresh token operations
  createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  getUserRefreshTokens(userId: string): Promise<RefreshToken[]>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;
  
  // Login history operations
  createLoginHistory(history: InsertLoginHistory): Promise<LoginHistory>;
  getUserLoginHistory(userId: string, limit?: number): Promise<LoginHistory[]>;
  
  // Branch operations
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch>;
  
  // Gold account operations
  getGoldAccount(userId: string): Promise<GoldAccount | undefined>;
  createGoldAccount(account: InsertGoldAccount): Promise<GoldAccount>;
  updateGoldAccount(userId: string, account: Partial<InsertGoldAccount>): Promise<GoldAccount>;
  
  // Gold transaction operations
  getGoldTransactions(): Promise<GoldTransaction[]>;
  getGoldTransaction(id: string): Promise<GoldTransaction | undefined>;
  getUserGoldTransactions(userId: string): Promise<GoldTransaction[]>;
  createGoldTransaction(transaction: InsertGoldTransaction): Promise<GoldTransaction>;
  updateGoldTransaction(id: string, transaction: Partial<InsertGoldTransaction>): Promise<GoldTransaction>;
  
  // Inventory operations
  getInventoryItems(): Promise<Inventory[]>;
  getInventoryItem(id: string): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory>;
  
  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  
  // Supplier invoice operations
  getSupplierInvoices(): Promise<SupplierInvoice[]>;
  getSupplierInvoice(id: string): Promise<SupplierInvoice | undefined>;
  createSupplierInvoice(invoice: InsertSupplierInvoice): Promise<SupplierInvoice>;
  updateSupplierInvoice(id: string, invoice: Partial<InsertSupplierInvoice>): Promise<SupplierInvoice>;
  
  // Gold price operations
  getLatestGoldPrices(): Promise<GoldPrice[]>;
  getGoldPriceByKarat(karat: string): Promise<GoldPrice | undefined>;
  createGoldPrice(price: InsertGoldPrice): Promise<GoldPrice>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Refresh token operations
  async createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken> {
    const [created] = await db.insert(refreshTokens).values(token).returning();
    return created;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const [refreshToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));
    return refreshToken;
  }

  async getUserRefreshTokens(userId: string): Promise<RefreshToken[]> {
    return await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId))
      .orderBy(desc(refreshTokens.createdAt));
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now));
  }

  // Login history operations
  async createLoginHistory(history: InsertLoginHistory): Promise<LoginHistory> {
    const [created] = await db.insert(loginHistory).values(history).returning();
    return created;
  }

  async getUserLoginHistory(userId: string, limit: number = 20): Promise<LoginHistory[]> {
    return await db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.loginAt))
      .limit(limit);
  }

  // Branch operations
  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches).orderBy(desc(branches.createdAt));
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [created] = await db.insert(branches).values(branch).returning();
    return created;
  }

  async updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch> {
    const [updated] = await db
      .update(branches)
      .set({ ...branch, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return updated;
  }

  // Gold account operations
  async getGoldAccount(userId: string): Promise<GoldAccount | undefined> {
    const [account] = await db.select().from(goldAccounts).where(eq(goldAccounts.userId, userId));
    return account;
  }

  async createGoldAccount(account: InsertGoldAccount): Promise<GoldAccount> {
    const [created] = await db.insert(goldAccounts).values(account).returning();
    return created;
  }

  async updateGoldAccount(userId: string, account: Partial<InsertGoldAccount>): Promise<GoldAccount> {
    const [updated] = await db
      .update(goldAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(goldAccounts.userId, userId))
      .returning();
    return updated;
  }

  // Gold transaction operations
  async getGoldTransactions(): Promise<GoldTransaction[]> {
    return await db.select().from(goldTransactions).orderBy(desc(goldTransactions.transactionDate));
  }

  async getGoldTransaction(id: string): Promise<GoldTransaction | undefined> {
    const [transaction] = await db.select().from(goldTransactions).where(eq(goldTransactions.id, id));
    return transaction;
  }

  async getUserGoldTransactions(userId: string): Promise<GoldTransaction[]> {
    return await db
      .select()
      .from(goldTransactions)
      .where(eq(goldTransactions.userId, userId))
      .orderBy(desc(goldTransactions.transactionDate));
  }

  async createGoldTransaction(transaction: InsertGoldTransaction): Promise<GoldTransaction> {
    const [created] = await db.insert(goldTransactions).values(transaction).returning();
    return created;
  }

  async updateGoldTransaction(id: string, transaction: Partial<InsertGoldTransaction>): Promise<GoldTransaction> {
    const [updated] = await db
      .update(goldTransactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(goldTransactions.id, id))
      .returning();
    return updated;
  }

  // Inventory operations
  async getInventoryItems(): Promise<Inventory[]> {
    return await db.select().from(inventory).orderBy(desc(inventory.createdAt));
  }

  async getInventoryItem(id: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [created] = await db.insert(inventory).values(item).returning();
    return created;
  }

  async updateInventoryItem(id: string, item: Partial<InsertInventory>): Promise<Inventory> {
    const [updated] = await db
      .update(inventory)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return updated;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updated] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updated;
  }

  // Supplier invoice operations
  async getSupplierInvoices(): Promise<SupplierInvoice[]> {
    return await db.select().from(supplierInvoices).orderBy(desc(supplierInvoices.invoiceDate));
  }

  async getSupplierInvoice(id: string): Promise<SupplierInvoice | undefined> {
    const [invoice] = await db.select().from(supplierInvoices).where(eq(supplierInvoices.id, id));
    return invoice;
  }

  async createSupplierInvoice(invoice: InsertSupplierInvoice): Promise<SupplierInvoice> {
    const [created] = await db.insert(supplierInvoices).values(invoice).returning();
    return created;
  }

  async updateSupplierInvoice(id: string, invoice: Partial<InsertSupplierInvoice>): Promise<SupplierInvoice> {
    const [updated] = await db
      .update(supplierInvoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(supplierInvoices.id, id))
      .returning();
    return updated;
  }

  // Gold price operations
  async getLatestGoldPrices(): Promise<GoldPrice[]> {
    return await db
      .select()
      .from(goldPrices)
      .orderBy(desc(goldPrices.effectiveDate))
      .limit(6);
  }

  async getGoldPriceByKarat(karat: string): Promise<GoldPrice | undefined> {
    const [price] = await db
      .select()
      .from(goldPrices)
      .where(eq(goldPrices.karat, karat as any))
      .orderBy(desc(goldPrices.effectiveDate))
      .limit(1);
    return price;
  }

  async createGoldPrice(price: InsertGoldPrice): Promise<GoldPrice> {
    const [created] = await db.insert(goldPrices).values(price).returning();
    return created;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const [totalTransactionsResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(goldTransactions);

    const [totalBuyResult] = await db
      .select({ 
        count: sql<number>`cast(count(*) as integer)`,
        grams: sql<number>`cast(sum(${goldTransactions.grams}) as decimal(12,4))`,
        amount: sql<number>`cast(sum(${goldTransactions.totalMyr}) as decimal(12,2))`
      })
      .from(goldTransactions)
      .where(eq(goldTransactions.type, 'buy'));

    const [totalSellResult] = await db
      .select({ 
        count: sql<number>`cast(count(*) as integer)`,
        grams: sql<number>`cast(sum(${goldTransactions.grams}) as decimal(12,4))`,
        amount: sql<number>`cast(sum(${goldTransactions.totalMyr}) as decimal(12,2))`
      })
      .from(goldTransactions)
      .where(eq(goldTransactions.type, 'sell'));

    const [totalUsersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users);

    const [totalInventoryResult] = await db
      .select({ 
        count: sql<number>`cast(count(*) as integer)`,
        value: sql<number>`cast(sum(${inventory.currentMarketValueMyr}) as decimal(12,2))`
      })
      .from(inventory)
      .where(eq(inventory.status, 'available'));

    return {
      totalTransactions: totalTransactionsResult?.count || 0,
      totalBuyTransactions: totalBuyResult?.count || 0,
      totalSellTransactions: totalSellResult?.count || 0,
      totalBuyGrams: totalBuyResult?.grams || 0,
      totalSellGrams: totalSellResult?.grams || 0,
      totalBuyAmount: totalBuyResult?.amount || 0,
      totalSellAmount: totalSellResult?.amount || 0,
      totalUsers: totalUsersResult?.count || 0,
      totalInventoryItems: totalInventoryResult?.count || 0,
      totalInventoryValue: totalInventoryResult?.value || 0,
    };
  }
}

export const storage = new DatabaseStorage();
