import { db } from "./db";
import { branches, users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Check if branches already exist
  const existingBranches = await db.select().from(branches);
  
  if (existingBranches.length === 0) {
    console.log("Creating initial branches...");
    await db.insert(branches).values([
      {
        name: "Main Branch",
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
    ]);
    console.log("Branches created successfully!");
  } else {
    console.log("Branches already exist, skipping...");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
