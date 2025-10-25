import { db } from "./db";
import { 
  branches, 
  users, 
  goldAccounts, 
  goldTransactions, 
  inventory, 
  suppliers, 
  goldPrices 
} from "@shared/schema";
import { hashPassword } from "./utils/password";

async function seed() {
  console.log("🌱 Seeding BSE database...");

  try {
    // Check if branches already exist
    const existingBranches = await db.select().from(branches);
    
    let branchIds: { id: string; code: string }[] = [];
    
    if (existingBranches.length === 0) {
      console.log("📍 Creating branches...");
      const createdBranches = await db.insert(branches).values([
        {
          name: "Main Branch - Kuala Lumpur",
          code: "MB001",
          address: "No. 123, Jalan Raja, Kuala Lumpur, 50000",
          phone: "+603-2234-5678",
          managerName: "Ahmad bin Abdullah",
          isActive: true,
        },
        {
          name: "Shah Alam Branch",
          code: "SA002",
          address: "No. 45, Jalan Meru, Shah Alam, 40000",
          phone: "+603-5544-3322",
          managerName: "Fatimah binti Hassan",
          isActive: true,
        },
        {
          name: "Penang Branch",
          code: "PG003",
          address: "No. 88, Lebuh Chulia, Georgetown, 10200",
          phone: "+604-2234-5678",
          managerName: "Siti Nurhaliza",
          isActive: true,
        },
      ]).returning();
      
      branchIds = createdBranches.map(b => ({ id: b.id, code: b.code }));
      console.log("✅ Branches created!");
    } else {
      branchIds = existingBranches.map(b => ({ id: b.id, code: b.code }));
      console.log("✅ Branches already exist");
    }

    // Check if users already exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log("👥 Creating users...");
      
      const createdUsers = await db.insert(users).values([
        {
          email: "admin@bse.my",
          password: await hashPassword("Admin@123"),
          firstName: "Admin",
          lastName: "User",
          phone: "+60123456789",
          role: "admin",
          scope: "both",
          branchId: branchIds[0].id,
          emailVerified: true,
          isActive: true,
        },
        {
          email: "manager@bse.my",
          password: await hashPassword("Manager@123"),
          firstName: "Branch",
          lastName: "Manager",
          scope: "bse",
          phone: "+60123456790",
          role: "manager",
          branchId: branchIds[0].id,
          emailVerified: true,
          isActive: true,
        },
        {
          email: "manager.rahnu@demo.com",
          password: await hashPassword("Manager@123"),
          firstName: "Manager",
          lastName: "Cross",
          phone: "+60123456791",
          role: "manager",
          scope: "both",
          branchId: branchIds[0].id,
          emailVerified: true,
          isActive: true,
        },
        // Ar-Rahnu users
        {
          email: "ali@demo.com",
          password: await hashPassword("demo123"),
          firstName: "Ali",
          lastName: "Staff",
          phone: "+60123456792",
          role: "teller",
          scope: "rahnu",
          branchId: branchIds[1].id,
          emailVerified: true,
          isActive: true,
        },
        {
          email: "rahim@demo.com",
          password: await hashPassword("demo123"),
          firstName: "Rahim",
          lastName: "Customer",
          phone: "+60123456793",
          role: "customer",
          scope: "rahnu",
          branchId: branchIds[1].id,
          emailVerified: true,
          isActive: true,
        },
        // BSE users
        {
          email: "sara@demo.com",
          password: await hashPassword("demo123"),
          firstName: "Sara",
          lastName: "Staff",
          phone: "+60123456794",
          role: "teller",
          scope: "bse",
          branchId: branchIds[2].id,
          emailVerified: true,
          isActive: true,
        },
        {
          email: "aisha@demo.com",
          password: await hashPassword("demo123"),
          firstName: "Aisha",
          lastName: "Customer",
          phone: "+60123456795",
          role: "customer",
          scope: "bse",
          branchId: branchIds[2].id,
          emailVerified: true,
          isActive: true,
        },
        // Legacy BSE users (keep for backwards compatibility)
        {
          email: "teller@bse.my",
          password: await hashPassword("Teller@123"),
          firstName: "Gold",
          lastName: "Teller",
          phone: "+60123456796",
          role: "teller",
          scope: "bse",
          branchId: branchIds[0].id,
          emailVerified: true,
          isActive: true,
        },
        {
          email: "customer@bse.my",
          password: await hashPassword("Customer@123"),
          firstName: "Customer",
          lastName: "Ali",
          phone: "+60123456797",
          role: "customer",
          scope: "bse",
          branchId: branchIds[0].id,
          emailVerified: true,
          isActive: true,
        },
      ]).returning();
      
      console.log("✅ Users created!");
      
      // Create gold accounts for customers
      console.log("💰 Creating gold accounts for customers...");
      const customerUsers = createdUsers.filter(u => u.role === 'customer');
      
      for (const customer of customerUsers) {
        await db.insert(goldAccounts).values({
          userId: customer.id,
          balanceGrams: "0",
          balanceMyr: "0",
          totalBoughtGrams: "0",
          totalSoldGrams: "0",
        });
      }
      
      console.log("✅ Gold accounts created!");
    } else {
      console.log("✅ Users already exist");
    }

    // Create gold prices
    const existingPrices = await db.select().from(goldPrices);
    
    if (existingPrices.length === 0) {
      console.log("📊 Creating gold prices...");
      await db.insert(goldPrices).values([
        {
          karat: "999",
          buyPricePerGramMyr: "336.53",
          sellPricePerGramMyr: "304.48",
          marginPercentage: "5.00",
          effectiveDate: new Date(),
        },
        {
          karat: "916",
          buyPricePerGramMyr: "308.26",
          sellPricePerGramMyr: "278.90",
          marginPercentage: "5.00",
          effectiveDate: new Date(),
        },
        {
          karat: "900",
          buyPricePerGramMyr: "302.87",
          sellPricePerGramMyr: "274.03",
          marginPercentage: "5.00",
          effectiveDate: new Date(),
        },
        {
          karat: "875",
          buyPricePerGramMyr: "294.46",
          sellPricePerGramMyr: "266.42",
          marginPercentage: "5.00",
          effectiveDate: new Date(),
        },
        {
          karat: "750",
          buyPricePerGramMyr: "252.40",
          sellPricePerGramMyr: "228.36",
          marginPercentage: "5.00",
          effectiveDate: new Date(),
        },
        {
          karat: "585",
          buyPricePerGramMyr: "196.86",
          sellPricePerGramMyr: "178.12",
          marginPercentage: "5.00",
          effectiveDate: new Date(),
        },
      ]);
      
      console.log("✅ Gold prices created!");
    } else {
      console.log("✅ Gold prices already exist");
    }

    // Create suppliers
    const existingSuppliers = await db.select().from(suppliers);
    
    if (existingSuppliers.length === 0) {
      console.log("🏭 Creating suppliers...");
      await db.insert(suppliers).values([
        {
          name: "Public Gold Marketing Sdn Bhd",
          companyRegistrationNumber: "123456-A",
          contactPerson: "Ahmad bin Hassan",
          phone: "+603-1234-5678",
          email: "sales@publicgold.com.my",
          address: "Lot 123, Jalan Sultan, KL",
          bankName: "Maybank",
          bankAccountNumber: "1234567890",
          isActive: true,
        },
        {
          name: "UOB Kay Hian Gold Trading",
          companyRegistrationNumber: "789012-X",
          contactPerson: "Tan Ah Kow",
          phone: "+603-9876-5432",
          email: "gold@uob.com",
          address: "Tower A, KLCC",
          bankName: "CIMB Bank",
          bankAccountNumber: "9876543210",
          isActive: true,
        },
      ]);
      
      console.log("✅ Suppliers created!");
    } else {
      console.log("✅ Suppliers already exist");
    }

    // Create inventory items
    const existingInventory = await db.select().from(inventory);
    
    if (existingInventory.length === 0) {
      console.log("📦 Creating inventory items...");
      const supplierList = await db.select().from(suppliers);
      
      if (supplierList.length > 0) {
        await db.insert(inventory).values([
          {
            serialNumber: "GB999-001",
            productType: "bar",
            branchId: branchIds[0].id,
            karat: "999",
            weightGrams: "100.000",
            description: "999 Gold Bar - 100g",
            costPriceMyr: "32000.00",
            currentMarketValueMyr: "33653.00",
            barcode: "GB999001",
            location: "Vault A-1",
            status: "available",
            supplierId: supplierList[0].id,
            purchaseDate: new Date(),
          },
          {
            serialNumber: "GB916-002",
            productType: "coin",
            branchId: branchIds[0].id,
            karat: "916",
            weightGrams: "20.000",
            description: "916 Gold Dinar - 20g",
            costPriceMyr: "5856.00",
            currentMarketValueMyr: "6165.20",
            barcode: "GB916002",
            location: "Vault A-2",
            status: "available",
            supplierId: supplierList[0].id,
            purchaseDate: new Date(),
          },
          {
            serialNumber: "GB999-003",
            productType: "wafer",
            branchId: branchIds[1].id,
            karat: "999",
            weightGrams: "50.000",
            description: "999 Gold Wafer - 50g",
            costPriceMyr: "16000.00",
            currentMarketValueMyr: "16826.50",
            barcode: "GB999003",
            location: "Vault B-1",
            status: "available",
            supplierId: supplierList[1].id,
            purchaseDate: new Date(),
          },
        ]);
        
        console.log("✅ Inventory items created!");
      }
    } else {
      console.log("✅ Inventory already exists");
    }

    console.log("\n🎉 Seeding complete!");
    console.log("\n📝 Demo Accounts - Buku Simpanan Emas (BSE):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin    → admin@bse.my / Admin@123");
    console.log("Manager  → manager@bse.my / Manager@123");
    console.log("Teller   → teller@bse.my / Teller@123");
    console.log("Customer → customer@bse.my / Customer@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
