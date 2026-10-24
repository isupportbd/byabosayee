import { z } from "@/framework/facade.js";

// Common
export const EntityIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const ToggleStatusSchema = z.object({
  isActive: z.boolean().optional()
});

export const GenericMessageResponseSchema = z.object({
  message: z.string()
});

// 1. Category (slug removed completely)
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "ক্যাটাগরির নাম আবশ্যক").max(255)
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, "ক্যাটাগরির নাম আবশ্যক").max(255)
});

// Sub Category Schema
export const CreateSubCategorySchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন"),
  name: z.string().min(1, "সাব-ক্যাটাগরির নাম আবশ্যক").max(255)
});

export const UpdateSubCategorySchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন").optional(),
  name: z.string().min(1, "সাব-ক্যাটাগরির নাম আবশ্যক").max(255)
});

export const SubCategoryItemSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const SubCategoryListResponseSchema = z.object({
  message: z.string(),
  data: z.array(SubCategoryItemSchema)
});

export const SubCategoryResponseSchema = z.object({
  message: z.string(),
  data: SubCategoryItemSchema
});

// Material / Fabric Type (Category-dependent)
export const CreateFabricTypeSchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন"),
  name: z.string().min(1, "উপাদান / ম্যাটেরিয়ালের নাম আবশ্যক").max(150)
});

export const FabricTypeItemSchema = z.object({
  id: z.number(),
  categoryId: z.number().nullable().optional(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const FabricTypeListResponseSchema = z.object({
  message: z.string(),
  data: z.array(FabricTypeItemSchema)
});

export const FabricTypeResponseSchema = z.object({
  message: z.string(),
  data: FabricTypeItemSchema
});

// Product Type ("ধরন" - Category & Sub-Category dependent)
export const CreateProductTypeSchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন"),
  subCategoryId: z.number().int().positive("সাব-ক্যাটাগরি নির্বাচন করুন"),
  name: z.string().min(1, "ধরনের নাম আবশ্যক").max(255)
});

export const UpdateProductTypeSchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন").optional(),
  subCategoryId: z.number().int().positive("সাব-ক্যাটাগরি নির্বাচন করুন").optional(),
  name: z.string().min(1, "ধরনের নাম আবশ্যক").max(255)
});

export const ProductTypeItemSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  subCategoryId: z.number(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const ProductTypeListResponseSchema = z.object({
  message: z.string(),
  data: z.array(ProductTypeItemSchema)
});

export const ProductTypeResponseSchema = z.object({
  message: z.string(),
  data: ProductTypeItemSchema
});

export const CategoryItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional(),
  subCategories: z.array(SubCategoryItemSchema).optional(),
  materials: z.array(FabricTypeItemSchema).optional()
});

export const CategoryListResponseSchema = z.object({
  message: z.string(),
  data: z.array(CategoryItemSchema)
});

export const CategoryResponseSchema = z.object({
  message: z.string(),
  data: CategoryItemSchema
});

// 2. Size Group
export const CreateSizeGroupSchema = z.object({
  name: z.string().min(1, "সাইজ গ্রুপের নাম আবশ্যক").max(255)
});

export const SizeItemSchema = z.object({
  id: z.number(),
  categoryId: z.number().nullable().optional(),
  subCategoryId: z.number().nullable().optional(),
  sizeGroupId: z.number().nullable().optional(),
  name: z.string(),
  sortOrder: z.number().optional().default(0),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const SizeGroupItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional(),
  sizes: z.array(SizeItemSchema).optional()
});

export const SizeGroupListResponseSchema = z.object({
  message: z.string(),
  data: z.array(SizeGroupItemSchema)
});

export const SizeGroupResponseSchema = z.object({
  message: z.string(),
  data: SizeGroupItemSchema
});

// 3. Size (Category dependent)
export const CreateSizeSchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন"),
  subCategoryId: z.number().int().optional().nullable(),
  sizeGroupId: z.number().int().optional().nullable(),
  name: z.string().min(1, "সাইজের নাম আবশ্যক").max(500),
  sortOrder: z.number().int().optional().default(0)
});

export const UpdateSizeSchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন").optional(),
  name: z.string().min(1, "সাইজের নাম আবশ্যক").max(100)
});

export const SizeResponseSchema = z.object({
  message: z.string(),
  data: SizeItemSchema.optional(),
  items: z.array(SizeItemSchema).optional()
});

// 4. Color
export const CreateColorSchema = z.object({
  name: z.string().min(1, "রঙের নাম আবশ্যক").max(100),
  code: z.string().max(50).optional().nullable()
});

export const UpdateColorSchema = z.object({
  name: z.string().min(1, "রঙের নাম আবশ্যক").max(100),
  code: z.string().max(50).optional().nullable()
});

export const ColorItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const ColorListResponseSchema = z.object({
  message: z.string(),
  data: z.array(ColorItemSchema)
});

export const ColorResponseSchema = z.object({
  message: z.string(),
  data: ColorItemSchema
});

// 6. Unit of Measurement
export const CreateUnitSchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন"),
  subCategoryId: z.number().int().positive("সাব-ক্যাটাগরি নির্বাচন করুন"),
  name: z.string().min(1, "এককের নাম আবশ্যক").max(100),
  shortName: z.string().min(1, "সংক্ষিপ্ত রূপ আবশ্যক").max(50)
});

export const UpdateUnitSchema = z.object({
  categoryId: z.number().int().positive("ক্যাটাগরি নির্বাচন করুন").optional().nullable(),
  subCategoryId: z.number().int().positive("সাব-ক্যাটাগরি নির্বাচন করুন").optional().nullable(),
  name: z.string().min(1, "এককের নাম আবশ্যক").max(100),
  shortName: z.string().min(1, "সংক্ষিপ্ত রূপ আবশ্যক").max(50)
});

export const UnitItemSchema = z.object({
  id: z.number(),
  categoryId: z.number().nullable().optional(),
  subCategoryId: z.number().nullable().optional(),
  name: z.string(),
  shortName: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const UnitListResponseSchema = z.object({
  message: z.string(),
  data: z.array(UnitItemSchema)
});

export const UnitResponseSchema = z.object({
  message: z.string(),
  data: UnitItemSchema
});

// 7. Challan Types (চালানের ধরন)
export const CreateChallanTypeSchema = z.object({
  name: z.string().min(1, "চালানের ধরনের নাম আবশ্যক").max(255),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable()
});

export const UpdateChallanTypeSchema = z.object({
  name: z.string().min(1, "চালানের ধরনের নাম আবশ্যক").max(255),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable()
});

export const ChallanTypeItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const ChallanTypeListResponseSchema = z.object({
  message: z.string(),
  data: z.array(ChallanTypeItemSchema)
});

export const ChallanTypeResponseSchema = z.object({
  message: z.string(),
  data: ChallanTypeItemSchema
});

// 8. Vendor Types (সরবরাহকারীর ধরন)
export const CreateVendorTypeSchema = z.object({
  name: z.string().min(1, "সরবরাহকারীর ধরনের নাম আবশ্যক").max(255),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable()
});

export const UpdateVendorTypeSchema = z.object({
  name: z.string().min(1, "সরবরাহকারীর ধরনের নাম আবশ্যক").max(255),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable()
});

export const VendorTypeItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const VendorTypeListResponseSchema = z.object({
  message: z.string(),
  data: z.array(VendorTypeItemSchema)
});

export const VendorTypeResponseSchema = z.object({
  message: z.string(),
  data: VendorTypeItemSchema
});

// 9. Payment Methods (পরিশোধের মাধ্যম / Trx Type)
export const CreatePaymentMethodSchema = z.object({
  name: z.string().min(1, "পরিশোধের মাধ্যমের নাম আবশ্যক").max(255),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable()
});

export const UpdatePaymentMethodSchema = z.object({
  name: z.string().min(1, "পরিশোধের মাধ্যমের নাম আবশ্যক").max(255),
  code: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable()
});

export const PaymentMethodItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional()
});

export const PaymentMethodListResponseSchema = z.object({
  message: z.string(),
  data: z.array(PaymentMethodItemSchema)
});

export const PaymentMethodResponseSchema = z.object({
  message: z.string(),
  data: PaymentMethodItemSchema
});

// Master All Data Schema
export const MasterCatalogResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    categories: z.array(CategoryItemSchema),
    subCategories: z.array(SubCategoryItemSchema),
    productTypes: z.array(ProductTypeItemSchema).optional(),
    sizeGroups: z.array(SizeGroupItemSchema),
    sizes: z.array(SizeItemSchema).optional(),
    colors: z.array(ColorItemSchema),
    fabricTypes: z.array(FabricTypeItemSchema).optional(),
    units: z.array(UnitItemSchema),
    challanTypes: z.array(ChallanTypeItemSchema).optional(),
    vendorTypes: z.array(VendorTypeItemSchema).optional(),
    paymentMethods: z.array(PaymentMethodItemSchema).optional()
  })
});

