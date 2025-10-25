import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService } from "./authService";
import { authenticateToken, type AuthenticatedRequest } from "./middleware/auth";
import { requireRole, requireAdmin, requireManagerOrAbove } from "./middleware/roleGuard";
import { loginRateLimiter, registerRateLimiter, passwordResetRateLimiter } from "./middleware/rateLimiter";
import { 
  insertUserSchema, 
  loginSchema,
  insertGoldAccountSchema,
  insertGoldTransactionSchema,
  insertInventorySchema,
  insertSupplierSchema,
  insertGoldPriceSchema,
  insertBranchSchema
} from "@shared/schema";
import axios from "axios";
import { z } from "zod";
import masterRoutes from "./routes/master";

// Helper to generate transaction number
function generateTransactionNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BSE${year}${month}${random}`;
}

// Helper to fetch gold prices with margin
async function fetchGoldPricesWithMargin() {
  const apiKey = process.env.GOLD_API_KEY;
  const marginPercentage = 5; // 5% margin for buy/sell spread
  
  if (!apiKey) {
    // Return simulated prices for development
    const basePrices = [
      { karat: "999", basePriceMyr: 320.50 },
      { karat: "916", basePriceMyr: 293.58 },
      { karat: "900", basePriceMyr: 288.45 },
      { karat: "875", basePriceMyr: 280.44 },
      { karat: "750", basePriceMyr: 240.38 },
      { karat: "585", basePriceMyr: 187.49 },
    ];
    
    return {
      prices: basePrices.map(({ karat, basePriceMyr }) => ({
        karat,
        buyPricePerGramMyr: +(basePriceMyr * (1 + marginPercentage / 100)).toFixed(2),
        sellPricePerGramMyr: +(basePriceMyr * (1 - marginPercentage / 100)).toFixed(2),
        marginPercentage,
      })),
      timestamp: new Date().toISOString(),
      source: "Simulated (Development)",
    };
  }

  try {
    const response = await axios.get(`https://metals-api.com/api/latest`, {
      params: {
        access_key: apiKey,
        base: "MYR",
        symbols: "XAU"
      }
    });

    if (!response.data || !response.data.rates) {
      throw new Error("Invalid API response");
    }

    const xauPricePerOunce = 1 / response.data.rates.XAU;
    const gramsPerOunce = 31.1035;
    const price24k = xauPricePerOunce / gramsPerOunce;

    const karatPurities: Record<string, number> = {
      "999": 0.999,
      "916": 0.916,
      "900": 0.900,
      "875": 0.875,
      "750": 0.750,
      "585": 0.585,
    };

    const prices = Object.entries(karatPurities).map(([karat, purity]) => {
      const basePrice = price24k * purity;
      return {
        karat,
        buyPricePerGramMyr: +(basePrice * (1 + marginPercentage / 100)).toFixed(2),
        sellPricePerGramMyr: +(basePrice * (1 - marginPercentage / 100)).toFixed(2),
        marginPercentage,
      };
    });

    return {
      prices,
      timestamp: new Date().toISOString(),
      source: "Metals-API",
    };
  } catch (error) {
    console.error("Error fetching gold prices:", error);
    const basePrices = [
      { karat: "999", basePriceMyr: 320.50 },
      { karat: "916", basePriceMyr: 293.58 },
      { karat: "900", basePriceMyr: 288.45 },
      { karat: "875", basePriceMyr: 280.44 },
      { karat: "750", basePriceMyr: 240.38 },
      { karat: "585", basePriceMyr: 187.49 },
    ];
    
    return {
      prices: basePrices.map(({ karat, basePriceMyr }) => ({
        karat,
        buyPricePerGramMyr: +(basePriceMyr * (1 + marginPercentage / 100)).toFixed(2),
        sellPricePerGramMyr: +(basePriceMyr * (1 - marginPercentage / 100)).toFixed(2),
        marginPercentage,
      })),
      timestamp: new Date().toISOString(),
      source: "Simulated (Fallback)",
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================
  
  app.post('/api/auth/register', registerRateLimiter, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const result = await authService.register(userData, req);
      
      // Create gold account for customer role
      if (userData.role === 'customer') {
        await storage.createGoldAccount({
          userId: result.user.id,
          balanceGrams: "0",
          balanceMyr: "0",
          totalBoughtGrams: "0",
          totalSoldGrams: "0",
        });
      }
      
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Verification token required' });
      }
      const result = await authService.verifyEmail(token);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get demo users for quick login (development/demo only)
  app.get('/api/auth/demo-users', async (req, res) => {
    try {
      const demoUsers = await storage.getDemoUsers();
      res.json(demoUsers);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch demo users' });
    }
  });

  app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const result = await authService.login(loginData, req);
      
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }
      
      res.json({
        user: result.user,
        accessToken: result.accessToken,
        requiresTwoFactor: result.requiresTwoFactor,
        twoFactorMethod: result.twoFactorMethod,
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }
      
      const result = await authService.refreshAccessToken(refreshToken);
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      res.json({ accessToken: result.accessToken });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  app.post('/api/auth/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await authService.logout(req.user!.userId, refreshToken, req);
      res.clearCookie('refreshToken');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/logout-all', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const result = await authService.logoutAllSessions(req.user!.userId, req);
      res.clearCookie('refreshToken');
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/forgot-password', passwordResetRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email required' });
      }
      const result = await authService.requestPasswordReset(email);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password, newPassword } = req.body;
      const passwordToUse = newPassword || password;
      if (!token || !passwordToUse) {
        return res.status(400).json({ message: 'Token and password required' });
      }
      const result = await authService.resetPassword(token, passwordToUse);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password required' });
      }
      
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { verifyPassword, hashPassword, validatePasswordStrength } = await import('./utils/password');
      
      const isValidPassword = await verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const passwordCheck = validatePasswordStrength(newPassword);
      if (!passwordCheck.valid) {
        return res.status(400).json({ message: passwordCheck.message || 'Invalid password' });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/2fa/setup', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const result = await authService.setupTwoFactor(req.user!.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/auth/2fa/enable', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: 'Verification token required' });
      }
      const result = await authService.enableTwoFactor(req.user!.userId, token);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/2fa/disable', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: 'Password required' });
      }
      const result = await authService.disableTwoFactor(req.user!.userId, password);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/auth/sessions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const sessions = await authService.getUserSessions(req.user!.userId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/user/sessions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const sessions = await storage.getUserRefreshTokens(req.user!.userId);
      
      const activeSessions = sessions.filter(session => new Date() < session.expiresAt).map(session => {
        const { parseUserAgent } = require('./utils/deviceParser');
        const deviceInfo = parseUserAgent(session.userAgent || '');
        
        return {
          id: session.id,
          device: deviceInfo.device || 'Unknown Device',
          browser: deviceInfo.browser || 'Unknown Browser',
          os: deviceInfo.os || 'Unknown OS',
          ipAddress: session.ipAddress || 'Unknown',
          loginAt: session.createdAt,
          userAgent: session.userAgent || '',
          expiresAt: session.expiresAt,
        };
      });
      
      res.json(activeSessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/user/activity', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const history = await storage.getUserLoginHistory(req.user!.userId, limit);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================
  // GOLD TRADING & SAVINGS ROUTES
  // ============================================
  
  // Get current gold prices
  app.get('/api/gold-prices', async (req, res) => {
    try {
      const priceData = await fetchGoldPricesWithMargin();
      res.json(priceData);
    } catch (error) {
      console.error("Error fetching gold prices:", error);
      res.status(500).json({ message: "Failed to fetch gold prices" });
    }
  });

  // Get gold price history
  app.get('/api/gold-prices/history', authenticateToken, async (req, res) => {
    try {
      const prices = await storage.getLatestGoldPrices();
      res.json(prices);
    } catch (error) {
      console.error("Error fetching gold price history:", error);
      res.status(500).json({ message: "Failed to fetch gold price history" });
    }
  });

  // Update gold prices (admin only)
  app.post('/api/gold-prices', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { karat, buyPricePerGramMyr, sellPricePerGramMyr, marginPercentage } = req.body;
      
      const price = await storage.createGoldPrice({
        karat,
        buyPricePerGramMyr,
        sellPricePerGramMyr,
        marginPercentage,
        effectiveDate: new Date(),
        updatedBy: req.user!.userId,
      });
      
      res.status(201).json(price);
    } catch (error: any) {
      console.error("Error updating gold price:", error);
      res.status(400).json({ message: error.message || "Failed to update gold price" });
    }
  });

  // Get user's gold account
  app.get('/api/gold-account', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      let account = await storage.getGoldAccount(req.user!.userId);
      
      // Create account if it doesn't exist (for existing users)
      if (!account) {
        account = await storage.createGoldAccount({
          userId: req.user!.userId,
          balanceGrams: "0",
          balanceMyr: "0",
          totalBoughtGrams: "0",
          totalSoldGrams: "0",
        });
      }
      
      res.json(account);
    } catch (error) {
      console.error("Error fetching gold account:", error);
      res.status(500).json({ message: "Failed to fetch gold account" });
    }
  });

  // Get user's gold transactions
  app.get('/api/gold-transactions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const transactions = await storage.getUserGoldTransactions(req.user!.userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching gold transactions:", error);
      res.status(500).json({ message: "Failed to fetch gold transactions" });
    }
  });

  // Buy gold (customer portal) - Only customers can buy for themselves
  app.post('/api/gold/buy', authenticateToken, requireRole('customer'), async (req: AuthenticatedRequest, res) => {
    try {
      // Only accept grams and paymentMethod from client - compute everything else server-side
      const { grams, paymentMethod } = req.body;
      
      if (!grams || grams <= 0) {
        return res.status(400).json({ message: "Invalid grams amount" });
      }
      
      if (!paymentMethod || !['cash', 'fpx', 'duitnow', 'card', 'online'].includes(paymentMethod)) {
        return res.status(400).json({ message: "Invalid payment method" });
      }
      
      // Use userId from authenticated token only
      const userId = req.user!.userId;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get current gold price (999 karat as default) - server-side only
      const priceData = await fetchGoldPricesWithMargin();
      const goldPrice = priceData.prices.find(p => p.karat === "999");
      if (!goldPrice) {
        return res.status(500).json({ message: "Gold price not available" });
      }
      
      // Compute total server-side to prevent price manipulation
      const totalMyr = +grams * goldPrice.buyPricePerGramMyr;
      const ratePerGram = goldPrice.buyPricePerGramMyr;
      
      // Create transaction with server-computed values
      const transactionNumber = generateTransactionNumber();
      const transaction = await storage.createGoldTransaction({
        userId: userId, // From token only
        branchId: user.branchId || "default",
        transactionNumber,
        type: "buy",
        grams: grams.toString(),
        ratePerGramMyr: ratePerGram.toString(), // Server-computed
        totalMyr: totalMyr.toFixed(2).toString(), // Server-computed
        paymentMethod,
        paymentStatus: "pending",
        status: "pending",
        processedBy: userId,
        transactionDate: new Date(),
      });
      
      // Update gold account
      const account = await storage.getGoldAccount(userId);
      if (account) {
        await storage.updateGoldAccount(userId, {
          balanceGrams: (+account.balanceGrams + +grams).toString(),
          totalBoughtGrams: (+account.totalBoughtGrams + +grams).toString(),
        });
      }
      
      // Update transaction status to completed (for now, until payment integration)
      await storage.updateGoldTransaction(transaction.id, {
        paymentStatus: "completed",
        status: "completed",
      });
      
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Error buying gold:", error);
      res.status(400).json({ message: error.message || "Failed to buy gold" });
    }
  });

  // Sell gold (customer portal) - Only customers can sell their own gold
  app.post('/api/gold/sell', authenticateToken, requireRole('customer'), async (req: AuthenticatedRequest, res) => {
    try {
      // Only accept grams and paymentMethod from client
      const { grams, paymentMethod } = req.body;
      
      if (!grams || grams <= 0) {
        return res.status(400).json({ message: "Invalid grams amount" });
      }
      
      if (!paymentMethod || !['cash', 'fpx', 'duitnow', 'card', 'online'].includes(paymentMethod)) {
        return res.status(400).json({ message: "Invalid payment method" });
      }
      
      // Use userId from authenticated token only
      const userId = req.user!.userId;
      
      // Check if user has enough balance
      const account = await storage.getGoldAccount(userId);
      if (!account || +account.balanceGrams < +grams) {
        return res.status(400).json({ message: "Insufficient gold balance" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get current gold price - server-side only
      const priceData = await fetchGoldPricesWithMargin();
      const goldPrice = priceData.prices.find(p => p.karat === "999");
      if (!goldPrice) {
        return res.status(500).json({ message: "Gold price not available" });
      }
      
      // Compute total server-side to prevent price manipulation
      const totalMyr = +grams * goldPrice.sellPricePerGramMyr;
      const ratePerGram = goldPrice.sellPricePerGramMyr;
      
      // Create transaction with server-computed values
      const transactionNumber = generateTransactionNumber();
      const transaction = await storage.createGoldTransaction({
        userId: userId, // From token only
        branchId: user.branchId || "default",
        transactionNumber,
        type: "sell",
        grams: grams.toString(),
        ratePerGramMyr: ratePerGram.toString(), // Server-computed
        totalMyr: totalMyr.toFixed(2).toString(), // Server-computed
        paymentMethod,
        paymentStatus: "pending",
        status: "pending",
        processedBy: userId,
        transactionDate: new Date(),
      });
      
      // Update gold account
      await storage.updateGoldAccount(userId, {
        balanceGrams: (+account.balanceGrams - +grams).toString(),
        totalSoldGrams: (+account.totalSoldGrams + +grams).toString(),
      });
      
      // Update transaction status to completed
      await storage.updateGoldTransaction(transaction.id, {
        paymentStatus: "completed",
        status: "completed",
      });
      
      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Error selling gold:", error);
      res.status(400).json({ message: error.message || "Failed to sell gold" });
    }
  });

  // ============================================
  // ADMIN & MANAGER ROUTES
  // ============================================
  
  // Get all users (admin/manager)
  app.get('/api/users', authenticateToken, requireManagerOrAbove, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const sanitized = users.map(({ password, ...user }) => user);
      res.json(sanitized);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all gold transactions (teller and above only)
  app.get('/api/transactions', authenticateToken, requireRole('teller'), async (req, res) => {
    try {
      const transactions = await storage.getGoldTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Approve transaction (manager/admin)
  app.patch('/api/transactions/:id/approve', authenticateToken, requireManagerOrAbove, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.updateGoldTransaction(id, {
        status: "completed",
        approvedBy: req.user!.userId,
      });
      res.json(transaction);
    } catch (error: any) {
      console.error("Error approving transaction:", error);
      res.status(400).json({ message: error.message || "Failed to approve transaction" });
    }
  });

  // Get all branches
  app.get('/api/branches', authenticateToken, async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  // Create branch (admin only)
  app.post('/api/branches', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const branchData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(branchData);
      res.status(201).json(branch);
    } catch (error: any) {
      console.error("Error creating branch:", error);
      res.status(400).json({ message: error.message || "Failed to create branch" });
    }
  });

  // Get inventory (teller and above only)
  app.get('/api/inventory', authenticateToken, requireRole('teller'), async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Add inventory item (admin/manager)
  app.post('/api/inventory', authenticateToken, requireManagerOrAbove, async (req, res) => {
    try {
      const itemData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: error.message || "Failed to create inventory item" });
    }
  });

  // Get suppliers (admin/manager)
  app.get('/api/suppliers', authenticateToken, requireManagerOrAbove, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  // Create supplier (admin only)
  app.post('/api/suppliers', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error: any) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: error.message || "Failed to create supplier" });
    }
  });

  // Get supplier invoices (admin/manager)
  app.get('/api/supplier-invoices', authenticateToken, requireManagerOrAbove, async (req, res) => {
    try {
      const invoices = await storage.getSupplierInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching supplier invoices:", error);
      res.status(500).json({ message: "Failed to fetch supplier invoices" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get audit logs (admin only)
  app.get('/api/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // ============================================
  // MASTER DATA ROUTES
  // ============================================
  app.use('/api/master', masterRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
