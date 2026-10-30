import { z } from "@/framework/facade.js";

export const CompanyAdminItemSchema = z.object({
  id: z.number(),
  companyName: z.string().nullable().optional(),
  email: z.string(),
  mobile: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const CreateCompanyAdminSchema = z.object({
  companyName: z.string().min(2, "কোম্পানীর নাম আবশ্যক").max(255),
  email: z.email("সঠিক ইমেইল দিন"),
  mobile: z.string().min(6, "মোবাইল নম্বর আবশ্যক").max(50),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে").max(100)
});

export const ToggleCompanyStatusSchema = z.object({
  isActive: z.boolean().optional()
});

export const CompanyIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const CompanyListResponseSchema = z.object({
  message: z.string(),
  data: z.array(CompanyAdminItemSchema)
});

export const CompanyResponseSchema = z.object({
  message: z.string(),
  data: CompanyAdminItemSchema
});

export const CompanyMessageSchema = z.object({
  message: z.string()
});

export const UpdateCompanyProfileSchema = z.object({
  companyName: z.string().min(2, "কোম্পানীর নাম আবশ্যক").max(255),
  tagline: z.string().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  mobile: z.string().max(50).optional().nullable(),
  address: z.string().optional().nullable(),
  tradeLicense: z.string().max(100).optional().nullable(),
  vatBin: z.string().max(100).optional().nullable(),
  invoicePrefix: z.string().max(20).optional().nullable(),
  productPrefix: z.string().max(20).optional().nullable(),
  invoicePattern: z.string().max(80).optional().nullable(),
  invoiceResetCycle: z.string().max(20).optional().nullable(),
  printFormat: z.string().max(20).optional().nullable(),
  invoiceTerms: z.string().optional().nullable(),
  paymentInfo: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  businessType: z.string().max(50).optional().nullable(),
  shareholders: z.any().optional().nullable()
});

export const ChangeCompanyPasswordSchema = z.object({
  currentPassword: z.string().min(1, "বর্তমান পাসওয়ার্ড আবশ্যক"),
  newPassword: z.string().min(6, "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে").max(100),
  confirmPassword: z.string().min(6, "পাসওয়ার্ড নিশ্চিতকরণ আবশ্যক")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না",
  path: ["confirmPassword"]
});

export const CompanyProfileItemSchema = z.object({
  id: z.number().optional().nullable(),
  userId: z.number(),
  companyName: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  tradeLicense: z.string().nullable().optional(),
  vatBin: z.string().nullable().optional(),
  invoicePrefix: z.string().nullable().optional(),
  invoicePattern: z.string().nullable().optional(),
  invoiceResetCycle: z.string().nullable().optional(),
  printFormat: z.string().nullable().optional(),
  invoiceTerms: z.string().nullable().optional(),
  paymentInfo: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  businessType: z.string().nullable().optional(),
  shareholders: z.any().optional().nullable(),
  isActive: z.boolean().optional()
});

export const CompanyProfileResponseSchema = z.object({
  message: z.string(),
  data: CompanyProfileItemSchema
});
