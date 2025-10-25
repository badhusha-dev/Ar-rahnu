import { db } from "./client";
import { 
  users, 
  branches, 
  rahnuCustomers, 
  rahnuLoans, 
  rahnuVaultItems,
  rahnuPayments,
  bseAccounts, 
  bseTransactions, 
  bseInventory,
  bseSuppliers,
  goldPrices 
} from "./index";
import { hashPassword } from "@ar-rahnu/auth";

async function seed() {
  console.log("🌱 Seeding Ar-Rahnu & BSE Financial System...\n");

  try {
    // ==========================================
    // 1. CREATE BRANCHES
    // ==========================================
    console.log("📍 Creating branches...");
    const [branchHQ, branchA, branchB] = await db.insert(branches).values([
      {
        name: "HQ - Kuala Lumpur",
        code: "HQ001",
        address: "Menara KLCC, Jalan Ampang, 50088 Kuala Lumpur",
        phone: "+603-2234-5678",
        email: "hq@arrahnu.com.my",
        managerName: "Admin User",
        isActive: true,
      },
      {
        name: "Branch A - Shah Alam",
        code: "SHA001",
        address: "No. 45, Jalan Meru, Shah Alam, 40000 Selangor",
        phone: "+603-5544-3322",
        email: "shahalam@arrahnu.com.my",
        managerName: "Manager A",
        isActive: true,
      },
      {
        name: "Branch B - Gombak",
        code: "GMB001",
        address: "No. 88, Jalan Gombak, 53100 Kuala Lumpur",
        phone: "+603-4567-8901",
        email: "gombak@arrahnu.com.my",
        managerName: "Manager B",
        isActive: true,
      },
    ]).returning();
    console.log("✅ Branches created!\n");

    // ==========================================
    // 2. CREATE USERS & ROLES
    // ==========================================
    console.log("👥 Creating users with roles and scopes...");
    const [admin, managerRahnu, managerBse, staffAli, staffSara, customerRahim, customerAisha] = await db.insert(users).values([
      {
        email: "admin@demo.com",
        password: await hashPassword("demo123"),
        firstName: "Admin",
        lastName: "User",
        phone: "+60123456789",
        role: "admin",
        scope: "admin",
        branchId: branchHQ.id,
        emailVerified: true,
        isActive: true,
      },
      {
        email: "manager.rahnu@demo.com",
        password: await hashPassword("demo123"),
        firstName: "Manager",
        lastName: "A",
        phone: "+60123456790",
        role: "manager",
        scope: "rahnu",
        branchId: branchA.id,
        emailVerified: true,
        isActive: true,
      },
      {
        email: "manager.bse@demo.com",
        password: await hashPassword("demo123"),
        firstName: "Manager",
        lastName: "B",
        phone: "+60123456791",
        role: "manager",
        scope: "bse",
        branchId: branchB.id,
        emailVerified: true,
        isActive: true,
      },
      {
        email: "ali@demo.com",
        password: await hashPassword("demo123"),
        firstName: "Ali",
        lastName: "Staff",
        phone: "+60123456792",
        role: "teller",
        scope: "rahnu",
        branchId: branchA.id,
        emailVerified: true,
        isActive: true,
      },
      {
        email: "sara@demo.com",
        password: await hashPassword("demo123"),
        firstName: "Sara",
        lastName: "Staff",
        phone: "+60123456793",
        role: "teller",
        scope: "bse",
        branchId: branchB.id,
        emailVerified: true,
        isActive: true,
      },
      {
        email: "rahim@demo.com",
        password: await hashPassword("demo123"),
        firstName: "Rahim",
        lastName: "Customer",
        phone: "+60123456794",
        role: "customer",
        scope: "rahnu",
        branchId: branchA.id,
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
        branchId: branchB.id,
        emailVerified: true,
        isActive: true,
      },
    ]).returning();
    console.log("✅ Users created!\n");

    // ==========================================
    // 3. CREATE GOLD PRICES
    // ==========================================
    console.log("💰 Setting up gold prices...");
    await db.insert(goldPrices).values([
      {
        karat: "999",
        buyPricePerGramMyr: "345.00",
        sellPricePerGramMyr: "350.00",
        marginPercentage: "1.45",
        effectiveDate: new Date("2025-10-24"),
        isActive: true,
      },
      {
        karat: "916",
        buyPricePerGramMyr: "316.00",
        sellPricePerGramMyr: "321.00",
        marginPercentage: "1.58",
        effectiveDate: new Date("2025-10-24"),
        isActive: true,
      },
      {
        karat: "999",
        buyPricePerGramMyr: "340.00",
        sellPricePerGramMyr: "345.00",
        marginPercentage: "1.47",
        effectiveDate: new Date("2025-10-23"),
        isActive: false,
      },
    ]);
    console.log("✅ Gold prices set!\n");

    // ==========================================
    // 4. AR-RAHNU MODULE - CUSTOMERS
    // ==========================================
    console.log("🏦 Setting up Ar-Rahnu customers...");
    const [rahimCustomer] = await db.insert(rahnuCustomers).values([
      {
        userId: customerRahim.id,
        customerNumber: "RC001",
        fullName: "Rahim bin Abdullah",
        icNumber: "850123-10-5678",
        phone: "+60123456794",
        email: "rahim@demo.com",
        address: "123, Jalan Merdeka, Shah Alam, Selangor",
        occupation: "Business Owner",
        monthlyIncome: "5000.00",
        emergencyContact: "Fatimah (Wife)",
        emergencyPhone: "+60123456799",
        branchId: branchA.id,
        isBlacklisted: false,
      },
    ]).returning();
    console.log("✅ Rahnu customers created!\n");

    // ==========================================
    // 5. AR-RAHNU MODULE - LOANS
    // ==========================================
    console.log("💎 Creating Ar-Rahnu loans...");
    
    // Loan #1: Active - Gold Chain
    const maturityDate1 = new Date();
    maturityDate1.setDate(maturityDate1.getDate() + 30);
    
    const [loan1] = await db.insert(rahnuLoans).values({
      loanNumber: "RL2025001",
      customerId: rahimCustomer.id,
      branchId: branchA.id,
      itemDescription: "Gold chain necklace, 916 purity",
      itemType: "jewelry",
      karat: "916",
      weightGrams: "10.000",
      goldPricePerGramMyr: "340.00",
      marketValueMyr: "3400.00",
      loanAmountMyr: "3400.00",
      loanToValueRatio: "100.00",
      ujrahPercentageMonthly: "2.50",
      ujrahAmountMyr: "85.00",
      loanPeriodMonths: 1,
      startDate: new Date(),
      maturityDate: maturityDate1,
      status: "active",
      vaultLocation: "Vault A-1",
      vaultBarcode: "AR1001",
      approvedBy: managerRahnu.id,
      processedBy: staffAli.id,
      contractSigned: true,
      contractSignedAt: new Date(),
    }).returning();

    // Loan #2: Redeemed - Gold Bangle
    const [loan2] = await db.insert(rahnuLoans).values({
      loanNumber: "RL2025002",
      customerId: rahimCustomer.id,
      branchId: branchA.id,
      itemDescription: "Gold bangle, 916 purity",
      itemType: "jewelry",
      karat: "916",
      weightGrams: "15.000",
      goldPricePerGramMyr: "340.00",
      marketValueMyr: "5100.00",
      loanAmountMyr: "5100.00",
      loanToValueRatio: "100.00",
      ujrahPercentageMonthly: "2.00",
      ujrahAmountMyr: "102.00",
      loanPeriodMonths: 1,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      maturityDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // matured 15 days ago
      status: "redeemed",
      vaultLocation: "Vault A-2",
      vaultBarcode: "AR1002",
      approvedBy: managerRahnu.id,
      processedBy: staffAli.id,
      contractSigned: true,
      contractSignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    }).returning();
    
    console.log("✅ Loans created!\n");

    // ==========================================
    // 6. AR-RAHNU MODULE - VAULT ITEMS
    // ==========================================
    console.log("🔒 Setting up vault items...");
    await db.insert(rahnuVaultItems).values([
      {
        loanId: loan1.id,
        branchId: branchA.id,
        barcode: "AR1001",
        rfidTag: "RFID001",
        location: "Vault A-1",
        itemDescription: "Gold chain necklace, 916 purity",
        karat: "916",
        weightGrams: "10.000",
        status: "in_vault",
        vaultInApprover1: managerRahnu.id,
        vaultInApprover2: staffAli.id,
        vaultInTimestamp: new Date(),
        vaultInSignature1: "data:image/png;base64,signature1",
        vaultInSignature2: "data:image/png;base64,signature2",
      },
      {
        loanId: loan2.id,
        branchId: branchA.id,
        barcode: "AR1002",
        location: "Vault A-2",
        itemDescription: "Gold bangle, 916 purity",
        karat: "916",
        weightGrams: "15.000",
        status: "released",
        vaultInApprover1: managerRahnu.id,
        vaultInApprover2: staffAli.id,
        vaultInTimestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        vaultInSignature1: "data:image/png;base64,signature1",
        vaultInSignature2: "data:image/png;base64,signature2",
        vaultOutApprover1: managerRahnu.id,
        vaultOutApprover2: staffAli.id,
        vaultOutTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        vaultOutSignature1: "data:image/png;base64,signature1",
        vaultOutSignature2: "data:image/png;base64,signature2",
      },
    ]);
    console.log("✅ Vault items secured!\n");

    // ==========================================
    // 7. AR-RAHNU MODULE - PAYMENTS
    // ==========================================
    console.log("💳 Recording payments...");
    await db.insert(rahnuPayments).values([
      {
        loanId: loan2.id,
        paymentNumber: "PAY2025001",
        customerId: rahimCustomer.id,
        branchId: branchA.id,
        type: "full_redemption",
        amountMyr: "5202.00", // Principal + Ujrah
        paymentMethod: "cash",
        processedBy: staffAli.id,
        receiptNumber: "RCP2025001",
      },
    ]);
    console.log("✅ Payments recorded!\n");

    // ==========================================
    // 8. BSE MODULE - ACCOUNTS
    // ==========================================
    console.log("💰 Creating BSE gold savings accounts...");
    const [aishaAccount] = await db.insert(bseAccounts).values([
      {
        userId: customerAisha.id,
        accountNumber: "BSE2025001",
        balanceGrams: "5.000",
        balanceMyr: "1750.00", // 5g @ RM 350/g
        totalBoughtGrams: "6.000",
        totalSoldGrams: "1.000",
        averageBuyPriceMyr: "345.00",
        isActive: true,
      },
    ]).returning();
    console.log("✅ BSE accounts created!\n");

    // ==========================================
    // 9. BSE MODULE - TRANSACTIONS
    // ==========================================
    console.log("📊 Creating BSE transactions...");
    await db.insert(bseTransactions).values([
      {
        accountId: aishaAccount.id,
        userId: customerAisha.id,
        branchId: branchB.id,
        transactionNumber: "BSE-BUY-001",
        type: "buy",
        weightGrams: "3.000",
        pricePerGramMyr: "345.00",
        totalAmountMyr: "1035.00",
        karat: "999",
        description: "Buy 3g gold",
        status: "completed",
        paymentMethod: "bank_transfer",
        paymentReference: "FPX123456",
        processedBy: staffSara.id,
        processedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        accountId: aishaAccount.id,
        userId: customerAisha.id,
        branchId: branchB.id,
        transactionNumber: "BSE-BUY-002",
        type: "buy",
        weightGrams: "2.000",
        pricePerGramMyr: "345.00",
        totalAmountMyr: "690.00",
        karat: "999",
        description: "Buy 2g gold",
        status: "completed",
        paymentMethod: "bank_transfer",
        processedBy: staffSara.id,
        processedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        accountId: aishaAccount.id,
        userId: customerAisha.id,
        branchId: branchB.id,
        transactionNumber: "BSE-SELL-001",
        type: "sell",
        weightGrams: "1.000",
        pricePerGramMyr: "350.00",
        totalAmountMyr: "350.00",
        karat: "999",
        description: "Sell 1g gold",
        status: "completed",
        processedBy: staffSara.id,
        processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log("✅ Transactions created!\n");

    // ==========================================
    // 10. BSE MODULE - SUPPLIERS
    // ==========================================
    console.log("🏭 Setting up suppliers...");
    const [supplier1] = await db.insert(bseSuppliers).values([
      {
        name: "Public Gold Marketing Sdn Bhd",
        companyRegistrationNumber: "123456-A",
        contactPerson: "Ahmad bin Hassan",
        phone: "+603-1234-5678",
        email: "sales@publicgold.com.my",
        address: "Lot 123, Jalan Sultan, Kuala Lumpur",
        bankName: "Maybank",
        bankAccountNumber: "1234567890",
        bankAccountName: "Public Gold Marketing",
        rating: 5,
        isActive: true,
      },
    ]).returning();
    console.log("✅ Suppliers added!\n");

    // ==========================================
    // 11. BSE MODULE - INVENTORY
    // ==========================================
    console.log("📦 Stocking inventory...");
    await db.insert(bseInventory).values([
      {
        branchId: branchB.id,
        supplierId: supplier1.id,
        serialNumber: "PG-999-001",
        productType: "bar",
        karat: "999",
        weightGrams: "100.000",
        description: "100g Gold Bar - 999 purity",
        costPriceMyr: "34000.00",
        currentMarketValueMyr: "34500.00",
        barcode: "GB999001",
        location: "Display Case A",
        status: "available",
        purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        branchId: branchB.id,
        supplierId: supplier1.id,
        serialNumber: "PG-999-002",
        productType: "bar",
        karat: "999",
        weightGrams: "50.000",
        description: "50g Gold Bar - 999 purity",
        costPriceMyr: "17000.00",
        currentMarketValueMyr: "17250.00",
        barcode: "GB999002",
        location: "Display Case A",
        status: "available",
        purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        branchId: branchB.id,
        supplierId: supplier1.id,
        serialNumber: "PG-999-003",
        productType: "wafer",
        karat: "999",
        weightGrams: "50.000",
        description: "50g Gold Wafer - 999 purity",
        costPriceMyr: "17000.00",
        currentMarketValueMyr: "17250.00",
        barcode: "GW999003",
        location: "Vault B-1",
        status: "available",
        purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log("✅ Inventory stocked! (200g total available)\n");

    // ==========================================
    // 🎉 SEEDING COMPLETE
    // ==========================================
    console.log("\n🎉 Seeding complete!");
    console.log("\n📝 Demo Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin (Full Access)   → admin@demo.com / demo123");
    console.log("Manager Rahnu         → manager.rahnu@demo.com / demo123");
    console.log("Manager BSE           → manager.bse@demo.com / demo123");
    console.log("Staff Ali (Rahnu)     → ali@demo.com / demo123");
    console.log("Staff Sara (BSE)      → sara@demo.com / demo123");
    console.log("Customer Rahim        → rahim@demo.com / demo123");
    console.log("Customer Aisha        → aisha@demo.com / demo123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("📊 Demo Data Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Branches: 3 (HQ, Branch A, Branch B)");
    console.log("Users: 7 (1 admin, 2 managers, 2 staff, 2 customers)");
    console.log("\nAr-Rahnu Module:");
    console.log("  • Active Loans: 1 (RM 3,400)");
    console.log("  • Redeemed Loans: 1 (RM 5,100)");
    console.log("  • Vault Items: 1 active, 1 released");
    console.log("  • Next Maturity: 30 days");
    console.log("\nBSE Module:");
    console.log("  • Customer Accounts: 1");
    console.log("  • Aisha's Wallet: 5g gold (RM 1,750)");
    console.log("  • Transactions: 3 (2 buys, 1 sell)");
    console.log("  • Branch B Inventory: 200g available");
    console.log("\nAnalytics:");
    console.log("  • Branch A Ujrah Revenue: RM 255");
    console.log("  • Branch B Gold Sales: RM 7,500");
    console.log("  • Default Rate: 0%");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
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

