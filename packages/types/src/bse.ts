import { z } from "zod";

// BSE Transaction Types
export const BseTransactionType = z.enum([
  "buy",
  "sell",
  "transfer_in",
  "transfer_out",
]);

export type BseTransactionType = z.infer<typeof BseTransactionType>;

// BSE Transaction Status
export const BseTransactionStatus = z.enum([
  "pending",
  "completed",
  "cancelled",
  "failed",
]);

export type BseTransactionStatus = z.infer<typeof BseTransactionStatus>;

// Inventory Product Types
export const ProductType = z.enum([
  "bar",
  "coin",
  "wafer",
  "jewelry",
]);

export type ProductType = z.infer<typeof ProductType>;

// Inventory Status
export const InventoryStatus = z.enum([
  "available",
  "sold",
  "reserved",
  "damaged",
]);

export type InventoryStatus = z.infer<typeof InventoryStatus>;

// API Request/Response Types
export interface CreateBseAccountRequest {
  userId: string;
}

export interface BuyGoldRequest {
  accountId: string;
  weightGrams: number;
  karat: string;
  paymentMethod: "cash" | "bank_transfer" | "card" | "ewallet";
  paymentReference?: string;
}

export interface SellGoldRequest {
  accountId: string;
  weightGrams: number;
  karat: string;
}

export interface AddInventoryRequest {
  branchId: string;
  supplierId?: string;
  serialNumber: string;
  productType: ProductType;
  karat: string;
  weightGrams: number;
  description?: string;
  costPriceMyr: number;
  barcode?: string;
  rfidTag?: string;
  location?: string;
}

export interface CreateSupplierRequest {
  name: string;
  companyRegistrationNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

export interface UpdateGoldPriceRequest {
  karat: string;
  buyPricePerGramMyr: number;
  sellPricePerGramMyr: number;
  marginPercentage: number;
}

