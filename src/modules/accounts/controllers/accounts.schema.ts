import { z } from "zod";

export const CreateCapitalSchema = z.object({
  shareholderId: z.string().optional().nullable(),
  shareholderName: z.string().min(1, "শেয়ারহোল্ডার বা বিনিয়োগকারীর নাম দিন").max(255),
  ownershipType: z.string().max(100).optional().default("মালিক"),
  amount: z.coerce.number().positive("বিনিয়োগের টাকার পরিমাণ দিন"),
  date: z.string().min(1, "বিনিয়োগের তারিখ দিন"),
  paymentMethod: z.string().optional().default("নগদ"),
  accountDetails: z.string().max(255).optional().nullable(),
  receiptNo: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable()
});

export const UpdateCapitalSchema = CreateCapitalSchema.partial();

export const CreateWithdrawalSchema = z.object({
  shareholderId: z.string().optional().nullable(),
  shareholderName: z.string().min(1, "উত্তোলনকারীর নাম দিন").max(255),
  ownershipType: z.string().max(100).optional().default("মালিক"),
  amount: z.coerce.number().positive("উত্তোলনের টাকার পরিমাণ দিন"),
  date: z.string().min(1, "উত্তোলনের তারিখ দিন"),
  paymentMethod: z.string().optional().default("নগদ"),
  accountDetails: z.string().max(255).optional().nullable(),
  voucherNo: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable()
});

export const UpdateWithdrawalSchema = CreateWithdrawalSchema.partial();
