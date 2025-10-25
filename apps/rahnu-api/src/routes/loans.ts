import { Router } from "express";
import { db, rahnuLoans, rahnuCustomers } from "@ar-rahnu/db";
import { authenticateToken, requireScope, requireStaff, type AuthenticatedRequest } from "@ar-rahnu/auth";
import { CreateLoanRequest } from "@ar-rahnu/types";
import { eq } from "drizzle-orm";

const router = Router();

// Get all loans for a branch
router.get("/", 
  authenticateToken,
  requireScope("rahnu", "admin"),
  requireStaff,
  async (req: AuthenticatedRequest, res) => {
    try {
      const branchId = req.user?.branchId;
      
      let loans;
      if (req.user?.role === "admin") {
        // Admins can see all loans
        loans = await db.select().from(rahnuLoans);
      } else {
        // Other staff can only see their branch
        loans = await db.select()
          .from(rahnuLoans)
          .where(eq(rahnuLoans.branchId, branchId!));
      }
      
      res.json({ success: true, data: loans });
    } catch (error) {
      console.error("Error fetching loans:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch loans" 
      });
    }
  }
);

// Get a specific loan
router.get("/:id",
  authenticateToken,
  requireScope("rahnu", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      const loan = await db.select()
        .from(rahnuLoans)
        .where(eq(rahnuLoans.id, id))
        .limit(1);
      
      if (!loan.length) {
        return res.status(404).json({ 
          success: false, 
          message: "Loan not found" 
        });
      }
      
      // Check branch access for non-admins
      if (req.user?.role !== "admin" && loan[0].branchId !== req.user?.branchId) {
        return res.status(403).json({ 
          success: false, 
          message: "Access denied to this branch" 
        });
      }
      
      res.json({ success: true, data: loan[0] });
    } catch (error) {
      console.error("Error fetching loan:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch loan" 
      });
    }
  }
);

// Create a new loan
router.post("/",
  authenticateToken,
  requireScope("rahnu", "admin"),
  requireStaff,
  async (req: AuthenticatedRequest, res) => {
    try {
      const loanData: CreateLoanRequest = req.body;
      const branchId = req.user?.branchId!;
      
      // Generate loan number
      const loanNumber = `RL${Date.now()}`;
      
      // Calculate values
      const goldPricePerGramMyr = 336.53; // Get from goldPrices table
      const marketValueMyr = parseFloat(loanData.weightGrams.toString()) * goldPricePerGramMyr;
      const loanToValueRatio = (loanData.loanAmountMyr / marketValueMyr) * 100;
      const ujrahPercentageMonthly = 0.75; // 0.75% per month
      
      const loanPeriodMonths = loanData.loanPeriodMonths || 6;
      const startDate = new Date();
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + loanPeriodMonths);
      
      // Create the loan
      const [newLoan] = await db.insert(rahnuLoans).values({
        loanNumber,
        customerId: loanData.customerId,
        branchId,
        itemDescription: loanData.itemDescription,
        itemType: loanData.itemType,
        karat: loanData.karat,
        weightGrams: loanData.weightGrams.toString(),
        goldPricePerGramMyr: goldPricePerGramMyr.toString(),
        marketValueMyr: marketValueMyr.toString(),
        loanAmountMyr: loanData.loanAmountMyr.toString(),
        loanToValueRatio: loanToValueRatio.toString(),
        ujrahPercentageMonthly: ujrahPercentageMonthly.toString(),
        ujrahAmountMyr: "0",
        loanPeriodMonths,
        startDate,
        maturityDate,
        status: "active",
        processedBy: req.user?.userId,
      }).returning();
      
      res.status(201).json({ 
        success: true, 
        data: newLoan,
        message: "Loan created successfully" 
      });
    } catch (error) {
      console.error("Error creating loan:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create loan" 
      });
    }
  }
);

export { router as loansRouter };

