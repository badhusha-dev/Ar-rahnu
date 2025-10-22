import {
  users,
  customers,
  goldItems,
  pawnTransactions,
  payments,
  renewals,
  vaultItems,
  vaultMovements,
  branches,
  refreshTokens,
  loginHistory,
  type User,
  type UpsertUser,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type GoldItem,
  type InsertGoldItem,
  type PawnTransaction,
  type InsertPawnTransaction,
  type Payment,
  type InsertPayment,
  type Renewal,
  type InsertRenewal,
  type VaultItem,
  type InsertVaultItem,
  type VaultMovement,
  type InsertVaultMovement,
  type Branch,
  type InsertBranch,
  type RefreshToken,
  type InsertRefreshToken,
  type LoginHistory,
  type InsertLoginHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Refresh token operations
  createRefreshToken(token: InsertRefreshToken): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;
  
  // Login history operations
  createLoginHistory(history: InsertLoginHistory): Promise<LoginHistory>;
  getUserLoginHistory(userId: string, limit?: number): Promise<LoginHistory[]>;
  
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  
  // Branch operations
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  
  // Gold item operations
  createGoldItem(item: InsertGoldItem): Promise<GoldItem>;
  getGoldItem(id: string): Promise<GoldItem | undefined>;
  
  // Pawn transaction operations
  getPawnTransactions(): Promise<PawnTransaction[]>;
  getPawnTransaction(id: string): Promise<PawnTransaction | undefined>;
  createPawnTransaction(transaction: InsertPawnTransaction): Promise<PawnTransaction>;
  updatePawnTransaction(id: string, transaction: Partial<InsertPawnTransaction>): Promise<PawnTransaction>;
  
  // Payment operations
  getPayments(pawnTransactionId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Renewal operations
  getRenewals(): Promise<Renewal[]>;
  createRenewal(renewal: InsertRenewal): Promise<Renewal>;
  
  // Vault operations
  getVaultItems(): Promise<VaultItem[]>;
  getVaultItem(id: string): Promise<VaultItem | undefined>;
  createVaultItem(item: InsertVaultItem): Promise<VaultItem>;
  updateVaultItem(id: string, item: Partial<InsertVaultItem>): Promise<VaultItem>;
  createVaultMovement(movement: InsertVaultMovement): Promise<VaultMovement>;
  
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

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  // Branch operations
  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches).orderBy(branches.name);
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [created] = await db.insert(branches).values(branch).returning();
    return created;
  }

  // Gold item operations
  async createGoldItem(item: InsertGoldItem): Promise<GoldItem> {
    const [created] = await db.insert(goldItems).values(item).returning();
    return created;
  }

  async getGoldItem(id: string): Promise<GoldItem | undefined> {
    const [item] = await db.select().from(goldItems).where(eq(goldItems.id, id));
    return item;
  }

  // Pawn transaction operations
  async getPawnTransactions(): Promise<PawnTransaction[]> {
    return await db.select().from(pawnTransactions).orderBy(desc(pawnTransactions.pledgeDate));
  }

  async getPawnTransaction(id: string): Promise<PawnTransaction | undefined> {
    const [transaction] = await db.select().from(pawnTransactions).where(eq(pawnTransactions.id, id));
    return transaction;
  }

  async createPawnTransaction(transaction: InsertPawnTransaction): Promise<PawnTransaction> {
    const [created] = await db.insert(pawnTransactions).values(transaction).returning();
    return created;
  }

  async updatePawnTransaction(id: string, transaction: Partial<InsertPawnTransaction>): Promise<PawnTransaction> {
    const [updated] = await db
      .update(pawnTransactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(pawnTransactions.id, id))
      .returning();
    return updated;
  }

  // Payment operations
  async getPayments(pawnTransactionId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.pawnTransactionId, pawnTransactionId))
      .orderBy(desc(payments.paymentDate));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  // Renewal operations
  async getRenewals(): Promise<Renewal[]> {
    return await db.select().from(renewals).orderBy(desc(renewals.renewalDate));
  }

  async createRenewal(renewal: InsertRenewal): Promise<Renewal> {
    const [created] = await db.insert(renewals).values(renewal).returning();
    return created;
  }

  // Vault operations
  async getVaultItems(): Promise<VaultItem[]> {
    return await db.select().from(vaultItems).orderBy(desc(vaultItems.storedDate));
  }

  async getVaultItem(id: string): Promise<VaultItem | undefined> {
    const [item] = await db.select().from(vaultItems).where(eq(vaultItems.id, id));
    return item;
  }

  async createVaultItem(item: InsertVaultItem): Promise<VaultItem> {
    const [created] = await db.insert(vaultItems).values(item).returning();
    return created;
  }

  async updateVaultItem(id: string, item: Partial<InsertVaultItem>): Promise<VaultItem> {
    const [updated] = await db
      .update(vaultItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(vaultItems.id, id))
      .returning();
    return updated;
  }

  async createVaultMovement(movement: InsertVaultMovement): Promise<VaultMovement> {
    const [created] = await db.insert(vaultMovements).values(movement).returning();
    return created;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const activeTransactions = await db
      .select({ count: sql<number>`count(*)` })
      .from(pawnTransactions)
      .where(eq(pawnTransactions.status, "active"));

    const outstandingAmount = await db
      .select({ total: sql<number>`sum(${pawnTransactions.loanAmountMyr})` })
      .from(pawnTransactions)
      .where(eq(pawnTransactions.status, "active"));

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const maturingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(pawnTransactions)
      .where(
        and(
          eq(pawnTransactions.status, "active"),
          gte(pawnTransactions.maturityDate, now),
          sql`${pawnTransactions.maturityDate} <= ${weekFromNow}`
        )
      );

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = await db
      .select({ total: sql<number>`sum(${pawnTransactions.totalFeesAccruedMyr})` })
      .from(pawnTransactions)
      .where(gte(pawnTransactions.pledgeDate, monthStart));

    return {
      totalActivePawns: Number(activeTransactions[0]?.count || 0),
      outstandingAmountMyr: Number(outstandingAmount[0]?.total || 0),
      itemsMaturingThisWeek: Number(maturingCount[0]?.count || 0),
      monthlyRevenueMyr: Number(monthlyRevenue[0]?.total || 0),
    };
  }
}

export const storage = new DatabaseStorage();
