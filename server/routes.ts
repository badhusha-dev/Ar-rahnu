import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCustomerSchema, insertPawnTransactionSchema } from "@shared/schema";
import axios from "axios";

// Helper to generate contract number
function generateContractNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ARN${year}${month}${random}`;
}

// Helper to fetch gold prices
async function fetchGoldPrices() {
  const apiKey = process.env.GOLD_API_KEY;
  
  if (!apiKey) {
    // Return simulated prices for development
    return {
      prices: [
        { karat: "999", pricePerGramMyr: 320.50, pricePerOunceMyr: 9968.35 },
        { karat: "916", pricePerGramMyr: 293.58, pricePerOunceMyr: 9130.12 },
        { karat: "900", pricePerGramMyr: 288.45, pricePerOunceMyr: 8970.23 },
        { karat: "875", pricePerGramMyr: 280.44, pricePerOunceMyr: 8721.05 },
        { karat: "750", pricePerGramMyr: 240.38, pricePerOunceMyr: 7476.14 },
        { karat: "585", pricePerGramMyr: 187.49, pricePerOunceMyr: 5831.98 },
      ],
      timestamp: new Date().toISOString(),
      source: "Simulated (Development)",
    };
  }

  try {
    // Use Metals-API or similar service
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

    // Convert to grams (API returns per troy ounce)
    const xauPricePerOunce = 1 / response.data.rates.XAU;
    const gramsPerOunce = 31.1035;
    const price24k = xauPricePerOunce / gramsPerOunce;

    // Calculate prices for different karats
    const karatPurities: Record<string, number> = {
      "999": 0.999,
      "916": 0.916,
      "900": 0.900,
      "875": 0.875,
      "750": 0.750,
      "585": 0.585,
    };

    const prices = Object.entries(karatPurities).map(([karat, purity]) => ({
      karat,
      pricePerGramMyr: price24k * purity,
      pricePerOunceMyr: xauPricePerOunce * purity,
    }));

    return {
      prices,
      timestamp: new Date().toISOString(),
      source: "Metals-API",
    };
  } catch (error) {
    console.error("Error fetching gold prices:", error);
    // Fallback to simulated prices
    return {
      prices: [
        { karat: "999", pricePerGramMyr: 320.50, pricePerOunceMyr: 9968.35 },
        { karat: "916", pricePerGramMyr: 293.58, pricePerOunceMyr: 9130.12 },
        { karat: "900", pricePerGramMyr: 288.45, pricePerOunceMyr: 8970.23 },
        { karat: "875", pricePerGramMyr: 280.44, pricePerOunceMyr: 8721.05 },
        { karat: "750", pricePerGramMyr: 240.38, pricePerOunceMyr: 7476.14 },
        { karat: "585", pricePerGramMyr: 187.49, pricePerOunceMyr: 5831.98 },
      ],
      timestamp: new Date().toISOString(),
      source: "Simulated (Fallback)",
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.get('/api/customers/:id/loans', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getPawnTransactions();
      const customerLoans = transactions.filter(t => t.customerId === req.params.id);
      res.json(customerLoans);
    } catch (error) {
      console.error("Error fetching customer loans:", error);
      res.status(500).json({ message: "Failed to fetch customer loans" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const validated = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validated);
      res.status(201).json(customer);
    } catch (error: any) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: error.message || "Failed to create customer" });
    }
  });

  // Branch routes
  app.get('/api/branches', isAuthenticated, async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  // Gold price routes
  app.get('/api/gold-prices', isAuthenticated, async (req, res) => {
    try {
      const priceData = await fetchGoldPrices();
      res.json(priceData);
    } catch (error) {
      console.error("Error fetching gold prices:", error);
      res.status(500).json({ message: "Failed to fetch gold prices" });
    }
  });

  // Pawn transaction routes
  app.get('/api/loans', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getPawnTransactions();
      const customers = await storage.getCustomers();
      
      const loansWithCustomer = transactions.map(t => {
        const customer = customers.find(c => c.id === t.customerId);
        return {
          id: t.id,
          contractNumber: t.contractNumber,
          customerName: customer?.fullName || "Unknown",
          customerId: t.customerId,
          loanAmountMyr: t.loanAmountMyr,
          pledgeDate: t.pledgeDate,
          maturityDate: t.maturityDate,
          status: t.status,
          monthlyFeeMyr: t.monthlyFeeMyr,
          totalFeesAccruedMyr: t.totalFeesAccruedMyr,
        };
      });
      
      res.json(loansWithCustomer);
    } catch (error) {
      console.error("Error fetching loans:", error);
      res.status(500).json({ message: "Failed to fetch loans" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = req.body;
      
      // Get gold price
      const goldPrices = await fetchGoldPrices();
      const goldPrice = goldPrices.prices.find(p => p.karat === data.karat);
      if (!goldPrice) {
        return res.status(400).json({ message: "Invalid karat selection" });
      }

      // Create gold item
      const marketValue = goldPrice.pricePerGramMyr * data.weightGrams;
      const goldItem = await storage.createGoldItem({
        description: data.goldDescription,
        karat: data.karat,
        weightGrams: data.weightGrams.toString(),
        goldPricePerGramMyr: goldPrice.pricePerGramMyr.toString(),
        marketValueMyr: marketValue.toString(),
        notes: data.notes,
      });

      // Calculate loan amount
      const loanAmount = marketValue * (data.marginPercentage / 100);
      
      // Calculate maturity date
      const pledgeDate = new Date();
      const maturityDate = new Date(pledgeDate);
      maturityDate.setMonth(maturityDate.getMonth() + data.tenureMonths);

      // Create pawn transaction
      const contractNumber = generateContractNumber();
      const transaction = await storage.createPawnTransaction({
        contractNumber,
        customerId: data.customerId,
        branchId: data.branchId,
        goldItemId: goldItem.id,
        loanAmountMyr: loanAmount.toString(),
        marginPercentage: data.marginPercentage.toString(),
        pledgeDate,
        maturityDate,
        tenureMonths: data.tenureMonths,
        monthlyFeeMyr: data.monthlyFeeMyr.toString(),
        totalFeesAccruedMyr: "0",
        status: "active",
        vaultLocation: `${data.vaultSection}-${data.vaultPosition}`,
        processedBy: userId,
      });

      // Create vault item
      await storage.createVaultItem({
        pawnTransactionId: transaction.id,
        branchId: data.branchId,
        vaultSection: data.vaultSection,
        vaultPosition: data.vaultPosition,
        status: "stored",
        storedDate: new Date(),
      });

      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: error.message || "Failed to create transaction" });
    }
  });

  // Vault routes
  app.get('/api/vault', isAuthenticated, async (req, res) => {
    try {
      const vaultItems = await storage.getVaultItems();
      const transactions = await storage.getPawnTransactions();
      const customers = await storage.getCustomers();
      
      const vaultWithDetails = vaultItems.map(v => {
        const transaction = transactions.find(t => t.id === v.pawnTransactionId);
        const customer = customers.find(c => c.id === transaction?.customerId);
        return {
          id: v.id,
          pawnTransactionId: v.pawnTransactionId,
          contractNumber: transaction?.contractNumber || "Unknown",
          customerName: customer?.fullName || "Unknown",
          vaultSection: v.vaultSection,
          vaultPosition: v.vaultPosition,
          barcode: v.barcode,
          rfidTag: v.rfidTag,
          status: v.status,
          storedDate: v.storedDate,
          lastAuditDate: v.lastAuditDate,
        };
      });
      
      res.json(vaultWithDetails);
    } catch (error) {
      console.error("Error fetching vault items:", error);
      res.status(500).json({ message: "Failed to fetch vault items" });
    }
  });

  // Renewal routes
  app.get('/api/renewals', isAuthenticated, async (req, res) => {
    try {
      const renewals = await storage.getRenewals();
      const transactions = await storage.getPawnTransactions();
      const customers = await storage.getCustomers();
      
      const renewalsWithDetails = renewals.map(r => {
        const transaction = transactions.find(t => t.id === r.pawnTransactionId);
        const customer = customers.find(c => c.id === transaction?.customerId);
        return {
          id: r.id,
          contractNumber: transaction?.contractNumber || "Unknown",
          customerName: customer?.fullName || "Unknown",
          previousMaturityDate: r.previousMaturityDate,
          newMaturityDate: r.newMaturityDate,
          extensionMonths: r.extensionMonths,
          renewalFeeMyr: r.renewalFeeMyr,
          renewalDate: r.renewalDate,
        };
      });
      
      res.json(renewalsWithDetails);
    } catch (error) {
      console.error("Error fetching renewals:", error);
      res.status(500).json({ message: "Failed to fetch renewals" });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/recent-transactions', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getPawnTransactions();
      const customers = await storage.getCustomers();
      
      const recent = transactions.slice(0, 10).map(t => {
        const customer = customers.find(c => c.id === t.customerId);
        return {
          id: t.id,
          contractNumber: t.contractNumber,
          customerName: customer?.fullName || "Unknown",
          loanAmountMyr: t.loanAmountMyr,
          pledgeDate: t.pledgeDate,
          maturityDate: t.maturityDate,
          status: t.status,
        };
      });
      
      res.json(recent);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
