import { z } from "zod";

// Rahnu Loan Status
export const RahnuLoanStatus = z.enum([
  "active",
  "redeemed",
  "renewed",
  "defaulted",
  "auctioned",
]);

export type RahnuLoanStatus = z.infer<typeof RahnuLoanStatus>;

// Rahnu Payment Types
export const RahnuPaymentType = z.enum([
  "ujrah",
  "partial_redemption",
  "full_redemption",
  "renewal_fee",
]);

export type RahnuPaymentType = z.infer<typeof RahnuPaymentType>;

// Vault Status
export const VaultStatus = z.enum([
  "in_vault",
  "released",
  "missing",
  "damaged",
]);

export type VaultStatus = z.infer<typeof VaultStatus>;

// Auction Status
export const AuctionStatus = z.enum([
  "scheduled",
  "ongoing",
  "sold",
  "unsold",
  "cancelled",
]);

export type AuctionStatus = z.infer<typeof AuctionStatus>;

// API Request/Response Types
export interface CreateLoanRequest {
  customerId: string;
  itemDescription: string;
  itemType: "jewelry" | "gold_bar" | "gold_coin" | "other";
  karat: string;
  weightGrams: number;
  loanAmountMyr: number;
  loanPeriodMonths?: number;
}

export interface CreatePaymentRequest {
  loanId: string;
  type: RahnuPaymentType;
  amountMyr: number;
  paymentMethod: "cash" | "bank_transfer" | "card" | "ewallet";
  paymentReference?: string;
}

export interface VaultInRequest {
  loanId: string;
  barcode: string;
  location: string;
  approver1Id: string;
  approver2Id: string;
  signature1: string;
  signature2: string;
}

export interface VaultOutRequest {
  loanId: string;
  approver1Id: string;
  approver2Id: string;
  signature1: string;
  signature2: string;
}

export interface RenewalRequest {
  loanId: string;
  extensionMonths: number;
}

export interface CreateAuctionRequest {
  loanId: string;
  auctionDate: Date;
  startingPriceMyr: number;
  reservePriceMyr?: number;
}

