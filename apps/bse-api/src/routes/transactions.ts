import { Router } from "express";
import { db, bseTransactions, bseAccounts, goldPrices, auditLogs } from "@ar-rahnu/db";
import { authenticateToken, requireScope, type AuthenticatedRequest } from "@ar-rahnu/auth";
import { BuyGoldRequest, SellGoldRequest } from "@ar-rahnu/types";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// Get transactions
router.get("/",
  authenticateToken,
  requireScope("bse", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.query.userId || req.user?.userId;
      
      let transactions;
      if (req.user?.role === "admin" && !req.query.userId) {
        transactions = await db.select()
          .from(bseTransactions)
          .orderBy(desc(bseTransactions.createdAt))
          .limit(100);
      } else {
        transactions = await db.select()
          .from(bseTransactions)
          .where(eq(bseTransactions.userId, userId as string))
          .orderBy(desc(bseTransactions.createdAt));
      }
      
      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ success: false, message: "Failed to fetch transactions" });
    }
  }
);

// Buy gold
router.post("/buy",
  authenticateToken,
  requireScope("bse", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const data: BuyGoldRequest = req.body;
      
      // Get current gold price
      const [priceData] = await db.select()
        .from(goldPrices)
        .where(and(
          eq(goldPrices.karat, data.karat),
          eq(goldPrices.isActive, true)
        ))
        .orderBy(desc(goldPrices.effectiveDate))
        .limit(1);
      
      if (!priceData) {
        return res.status(404).json({ 
          success: false, 
          message: `No active price found for ${data.karat} karat gold` 
        });
      }
      
      const pricePerGram = parseFloat(priceData.buyPricePerGramMyr);
      const totalAmount = data.weightGrams * pricePerGram;
      
      // Generate transaction number
      const transactionNumber = `BSE-BUY-${Date.now()}`;
      
      // Create transaction
      const [transaction] = await db.insert(bseTransactions).values({
        accountId: data.accountId,
        userId: req.user?.userId!,
        branchId: req.user?.branchId,
        transactionNumber,
        type: "buy",
        weightGrams: data.weightGrams.toString(),
        pricePerGramMyr: pricePerGram.toString(),
        totalAmountMyr: totalAmount.toString(),
        karat: data.karat,
        description: `Bought ${data.weightGrams}g of ${data.karat} karat gold`,
        status: "completed",
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        processedBy: req.user?.userId,
        processedAt: new Date(),
      }).returning();
      
      // Update account balance
      const [account] = await db.select()
        .from(bseAccounts)
        .where(eq(bseAccounts.id, data.accountId))
        .limit(1);
      
      if (account) {
        const newBalanceGrams = parseFloat(account.balanceGrams) + data.weightGrams;
        const newBalanceMyr = newBalanceGrams * pricePerGram;
        const newTotalBought = parseFloat(account.totalBoughtGrams) + data.weightGrams;
        
        await db.update(bseAccounts)
          .set({
            balanceGrams: newBalanceGrams.toString(),
            balanceMyr: newBalanceMyr.toString(),
            totalBoughtGrams: newTotalBought.toString(),
            updatedAt: new Date(),
          })
          .where(eq(bseAccounts.id, data.accountId));
      }
      
      // Audit log
      await db.insert(auditLogs).values({
        userId: req.user?.userId,
        branchId: req.user?.branchId,
        module: "bse",
        action: "buy_gold",
        entityType: "transaction",
        entityId: transaction.id,
        changes: {
          weightGrams: data.weightGrams,
          totalAmount: totalAmount,
          paymentMethod: data.paymentMethod,
        },
      });
      
      res.status(201).json({ 
        success: true, 
        data: transaction,
        message: "Gold purchased successfully" 
      });
    } catch (error) {
      console.error("Error buying gold:", error);
      res.status(500).json({ success: false, message: "Failed to process purchase" });
    }
  }
);

// Sell gold
router.post("/sell",
  authenticateToken,
  requireScope("bse", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const data: SellGoldRequest = req.body;
      
      // Check account balance
      const [account] = await db.select()
        .from(bseAccounts)
        .where(eq(bseAccounts.id, data.accountId))
        .limit(1);
      
      if (!account) {
        return res.status(404).json({ 
          success: false, 
          message: "Account not found" 
        });
      }
      
      if (parseFloat(account.balanceGrams) < data.weightGrams) {
        return res.status(400).json({ 
          success: false, 
          message: "Insufficient gold balance" 
        });
      }
      
      // Get current gold price
      const [priceData] = await db.select()
        .from(goldPrices)
        .where(and(
          eq(goldPrices.karat, data.karat),
          eq(goldPrices.isActive, true)
        ))
        .orderBy(desc(goldPrices.effectiveDate))
        .limit(1);
      
      if (!priceData) {
        return res.status(404).json({ 
          success: false, 
          message: `No active price found for ${data.karat} karat gold` 
        });
      }
      
      const pricePerGram = parseFloat(priceData.sellPricePerGramMyr);
      const totalAmount = data.weightGrams * pricePerGram;
      
      // Generate transaction number
      const transactionNumber = `BSE-SELL-${Date.now()}`;
      
      // Create transaction
      const [transaction] = await db.insert(bseTransactions).values({
        accountId: data.accountId,
        userId: req.user?.userId!,
        branchId: req.user?.branchId,
        transactionNumber,
        type: "sell",
        weightGrams: data.weightGrams.toString(),
        pricePerGramMyr: pricePerGram.toString(),
        totalAmountMyr: totalAmount.toString(),
        karat: data.karat,
        description: `Sold ${data.weightGrams}g of ${data.karat} karat gold`,
        status: "completed",
        processedBy: req.user?.userId,
        processedAt: new Date(),
      }).returning();
      
      // Update account balance
      const newBalanceGrams = parseFloat(account.balanceGrams) - data.weightGrams;
      const newBalanceMyr = newBalanceGrams * pricePerGram;
      const newTotalSold = parseFloat(account.totalSoldGrams) + data.weightGrams;
      
      await db.update(bseAccounts)
        .set({
          balanceGrams: newBalanceGrams.toString(),
          balanceMyr: newBalanceMyr.toString(),
          totalSoldGrams: newTotalSold.toString(),
          updatedAt: new Date(),
        })
        .where(eq(bseAccounts.id, data.accountId));
      
      // Audit log
      await db.insert(auditLogs).values({
        userId: req.user?.userId,
        branchId: req.user?.branchId,
        module: "bse",
        action: "sell_gold",
        entityType: "transaction",
        entityId: transaction.id,
        changes: {
          weightGrams: data.weightGrams,
          totalAmount: totalAmount,
        },
      });
      
      res.status(201).json({ 
        success: true, 
        data: transaction,
        message: "Gold sold successfully" 
      });
    } catch (error) {
      console.error("Error selling gold:", error);
      res.status(500).json({ success: false, message: "Failed to process sale" });
    }
  }
);

export { router as transactionsRouter };

