import express from 'express';
import { db } from '../db';
import { branches, users, goldPrices, suppliers, inventory } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware to check admin/manager role
const requireAdminOrManager = (req: any, res: any, next: any) => {
  if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admin or Manager role required.' });
  }
  next();
};

// ============================================
// BRANCHES CRUD
// ============================================

router.get('/branches', authenticateToken, async (req, res) => {
  try {
    const allBranches = await db.select().from(branches).orderBy(desc(branches.createdAt));
    res.json(allBranches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/branches/:id', authenticateToken, async (req, res) => {
  try {
    const [branch] = await db.select().from(branches).where(eq(branches.id, req.params.id));
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/branches', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { name, code, address, phone, managerName, isActive } = req.body;
    const [newBranch] = await db.insert(branches).values({
      name,
      code,
      address,
      phone,
      managerName,
      isActive: isActive ?? true,
    }).returning();
    res.status(201).json(newBranch);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/branches/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { name, code, address, phone, managerName, isActive } = req.body;
    const [updated] = await db.update(branches)
      .set({
        name,
        code,
        address,
        phone,
        managerName,
        isActive,
      })
      .where(eq(branches.id, req.params.id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/branches/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    await db.delete(branches).where(eq(branches.id, req.params.id));
    res.json({ message: 'Branch deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// GOLD PRICES CRUD
// ============================================

router.get('/gold-prices', authenticateToken, async (req, res) => {
  try {
    const prices = await db.select().from(goldPrices).orderBy(desc(goldPrices.updatedAt));
    res.json(prices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/gold-prices/latest', authenticateToken, async (req, res) => {
  try {
    const [latest] = await db.select().from(goldPrices).orderBy(desc(goldPrices.updatedAt)).limit(1);
    res.json(latest || {});
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/gold-prices', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { karat, buyPricePerGramMyr, sellPricePerGramMyr, source } = req.body;
    const [newPrice] = await db.insert(goldPrices).values({
      karat,
      buyPricePerGramMyr,
      sellPricePerGramMyr,
      source,
    }).returning();
    res.status(201).json(newPrice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/gold-prices/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { karat, buyPricePerGramMyr, sellPricePerGramMyr, source } = req.body;
    const [updated] = await db.update(goldPrices)
      .set({
        karat,
        buyPricePerGramMyr,
        sellPricePerGramMyr,
        source,
        updatedAt: new Date(),
      })
      .where(eq(goldPrices.id, req.params.id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ message: 'Gold price record not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/gold-prices/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    await db.delete(goldPrices).where(eq(goldPrices.id, req.params.id));
    res.json({ message: 'Gold price record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// SUPPLIERS CRUD
// ============================================

router.get('/suppliers', authenticateToken, async (req, res) => {
  try {
    const allSuppliers = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
    res.json(allSuppliers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, req.params.id));
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/suppliers', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, bankAccountNumber, isActive } = req.body;
    const [newSupplier] = await db.insert(suppliers).values({
      name,
      contactPerson,
      phone,
      email,
      address,
      bankAccountNumber,
      isActive: isActive ?? true,
    }).returning();
    res.status(201).json(newSupplier);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/suppliers/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, bankAccountNumber, isActive } = req.body;
    const [updated] = await db.update(suppliers)
      .set({
        name,
        contactPerson,
        phone,
        email,
        address,
        bankAccountNumber,
        isActive,
      })
      .where(eq(suppliers.id, req.params.id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/suppliers/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, req.params.id));
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// INVENTORY CRUD
// ============================================

router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const allInventory = await db.select().from(inventory).orderBy(desc(inventory.createdAt));
    res.json(allInventory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, req.params.id));
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/inventory', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { branchId, supplierId, karat, weightGrams, purchasePriceMyr, status } = req.body;
    const [newItem] = await db.insert(inventory).values({
      branchId,
      supplierId,
      karat,
      weightGrams,
      purchasePriceMyr,
      status: status || 'available',
    }).returning();
    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/inventory/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { branchId, supplierId, karat, weightGrams, purchasePriceMyr, status } = req.body;
    const [updated] = await db.update(inventory)
      .set({
        branchId,
        supplierId,
        karat,
        weightGrams,
        purchasePriceMyr,
        status,
      })
      .where(eq(inventory.id, req.params.id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/inventory/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    await db.delete(inventory).where(eq(inventory.id, req.params.id));
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// USERS CRUD (Admin only)
// ============================================

router.get('/users', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      role: users.role,
      scope: users.scope,
      branchId: users.branchId,
      isActive: users.isActive,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/status', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { isActive } = req.body;
    const [updated] = await db.update(users)
      .set({ isActive })
      .where(eq(users.id, req.params.id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
      });
    
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const { role, scope } = req.body;
    const [updated] = await db.update(users)
      .set({ role, scope })
      .where(eq(users.id, req.params.id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        scope: users.scope,
      });
    
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

