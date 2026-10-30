import { z } from "zod";

export const CreateBrandSchema = z.object({
  name: z.string().min(1, "ব্রান্ডের নাম আবশ্যক").max(255),
  origin: z.string().max(100).optional().nullable()
});

export const CreateSupplierSchema = z.object({
  name: z.string().min(1, "সাপ্লায়ারের নাম আবশ্যক").max(255),
  contactPerson: z.string().max(150).optional().nullable(),
  mobile: z.string().max(50).optional().nullable(),
  email: z.string().email("সঠিক ইমেইল দিন").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  vendorType: z.string().optional().nullable()
});

export const CreateManufacturerSchema = z.object({
  name: z.string().min(1, "প্রস্তুতকারকের নাম আবশ্যক").max(255),
  country: z.string().max(100).optional().nullable(),
  factoryAddress: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  vendorType: z.string().optional().nullable()
});

export const CreateItemSchema = z.object({
  name: z.string().min(1, "আইটেমের নাম আবশ্যক").max(255),
  code: z.string().max(100).optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  subCategoryId: z.number().int().positive().optional().nullable(),
  sizeId: z.number().int().positive().optional().nullable(),
  unitId: z.number().int().positive().optional().nullable(),
  stockQuantity: z.number().int().nonnegative().optional().default(0)
});
