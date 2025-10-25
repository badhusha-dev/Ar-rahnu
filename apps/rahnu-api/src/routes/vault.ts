import { Router } from "express";
import { db, rahnuVaultItems, rahnuLoans, auditLogs } from "@ar-rahnu/db";
import { authenticateToken, requireScope, requireStaff, type AuthenticatedRequest } from "@ar-rahnu/auth";
import { VaultInRequest, VaultOutRequest } from "@ar-rahnu/types";
import { eq, and } from "drizzle-orm";

const router = Router();

// Get vault items for a branch
router.get("/",
  authenticateToken,
  requireScope("rahnu", "admin"),
  requireStaff,
  async (req: AuthenticatedRequest, res) => {
    try {
      const branchId = req.user?.branchId;
      
      let items;
      if (req.user?.role === "admin") {
        items = await db.select().from(rahnuVaultItems);
      } else {
        items = await db.select()
          .from(rahnuVaultItems)
          .where(eq(rahnuVaultItems.branchId, branchId!));
      }
      
      res.json({ success: true, data: items });
    } catch (error) {
      console.error("Error fetching vault items:", error);
      res.status(500).json({ success: false, message: "Failed to fetch vault items" });
    }
  }
);

// Vault IN - Requires dual approval
router.post("/vault-in",
  authenticateToken,
  requireScope("rahnu", "admin"),
  requireStaff,
  async (req: AuthenticatedRequest, res) => {
    try {
      const data: VaultInRequest = req.body;
      
      // Verify loan exists
      const [loan] = await db.select()
        .from(rahnuLoans)
        .where(eq(rahnuLoans.id, data.loanId))
        .limit(1);
      
      if (!loan) {
        return res.status(404).json({ 
          success: false, 
          message: "Loan not found" 
        });
      }
      
      // Ensure approvers are different
      if (data.approver1Id === data.approver2Id) {
        return res.status(400).json({ 
          success: false, 
          message: "Two different approvers required" 
        });
      }
      
      // Create vault item with dual approval
      const [vaultItem] = await db.insert(rahnuVaultItems).values({
        loanId: data.loanId,
        branchId: req.user?.branchId!,
        barcode: data.barcode,
        location: data.location,
        itemDescription: loan.itemDescription,
        karat: loan.karat,
        weightGrams: loan.weightGrams,
        status: "in_vault",
        vaultInApprover1: data.approver1Id,
        vaultInApprover2: data.approver2Id,
        vaultInTimestamp: new Date(),
        vaultInSignature1: data.signature1,
        vaultInSignature2: data.signature2,
      }).returning();
      
      // Create audit log
      await db.insert(auditLogs).values({
        userId: req.user?.userId,
        branchId: req.user?.branchId,
        module: "rahnu",
        action: "vault_in",
        entityType: "vault_item",
        entityId: vaultItem.id,
        changes: {
          loanId: data.loanId,
          approver1: data.approver1Id,
          approver2: data.approver2Id,
          location: data.location,
        },
      });
      
      res.status(201).json({ 
        success: true, 
        data: vaultItem,
        message: "Item secured in vault with dual approval" 
      });
    } catch (error) {
      console.error("Error vault-in:", error);
      res.status(500).json({ success: false, message: "Failed to vault item" });
    }
  }
);

// Vault OUT - Requires dual approval
router.post("/vault-out",
  authenticateToken,
  requireScope("rahnu", "admin"),
  requireStaff,
  async (req: AuthenticatedRequest, res) => {
    try {
      const data: VaultOutRequest = req.body;
      
      // Find vault item
      const [vaultItem] = await db.select()
        .from(rahnuVaultItems)
        .where(and(
          eq(rahnuVaultItems.loanId, data.loanId),
          eq(rahnuVaultItems.status, "in_vault")
        ))
        .limit(1);
      
      if (!vaultItem) {
        return res.status(404).json({ 
          success: false, 
          message: "Vault item not found or already released" 
        });
      }
      
      // Ensure approvers are different
      if (data.approver1Id === data.approver2Id) {
        return res.status(400).json({ 
          success: false, 
          message: "Two different approvers required" 
        });
      }
      
      // Update vault item with release approval
      const [updatedItem] = await db.update(rahnuVaultItems)
        .set({
          status: "released",
          vaultOutApprover1: data.approver1Id,
          vaultOutApprover2: data.approver2Id,
          vaultOutTimestamp: new Date(),
          vaultOutSignature1: data.signature1,
          vaultOutSignature2: data.signature2,
          updatedAt: new Date(),
        })
        .where(eq(rahnuVaultItems.id, vaultItem.id))
        .returning();
      
      // Create audit log
      await db.insert(auditLogs).values({
        userId: req.user?.userId,
        branchId: req.user?.branchId,
        module: "rahnu",
        action: "vault_out",
        entityType: "vault_item",
        entityId: vaultItem.id,
        changes: {
          loanId: data.loanId,
          approver1: data.approver1Id,
          approver2: data.approver2Id,
        },
      });
      
      res.json({ 
        success: true, 
        data: updatedItem,
        message: "Item released from vault with dual approval" 
      });
    } catch (error) {
      console.error("Error vault-out:", error);
      res.status(500).json({ success: false, message: "Failed to release item" });
    }
  }
);

export { router as vaultRouter };

