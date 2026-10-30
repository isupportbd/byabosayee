import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";
import { categories, colors, productTypes, sizes, subCategories, units, challanTypes } from "@/modules/catalog/database/models/catalog.js";

// 1. Brands (Company specific)
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "set null" }),
  subCategoryId: integer("sub_category_id")
    .references(() => subCategories.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  origin: varchar("origin", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export interface PartnerContact {
  name: string;
  designation?: string;
  mobile?: string;
}

// 2. Suppliers (Company specific)
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerName: varchar("owner_name", { length: 150 }),
  ownerMobile: varchar("owner_mobile", { length: 50 }),
  managerName: varchar("manager_name", { length: 150 }),
  managerMobile: varchar("manager_mobile", { length: 50 }),
  contactPerson: varchar("contact_person", { length: 150 }),
  mobile: varchar("mobile", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  vendorType: varchar("vendor_type", { length: 100 }),
  contacts: jsonb("contacts").$type<PartnerContact[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 3. Manufacturers (Company specific)
export const manufacturers = pgTable("manufacturers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerName: varchar("owner_name", { length: 150 }),
  ownerMobile: varchar("owner_mobile", { length: 50 }),
  managerName: varchar("manager_name", { length: 150 }),
  managerMobile: varchar("manager_mobile", { length: 50 }),
  contactPerson: varchar("contact_person", { length: 150 }),
  country: varchar("country", { length: 100 }),
  mobile: varchar("mobile", { length: 50 }),
  factoryAddress: text("factory_address"),
  address: text("address"),
  vendorType: varchar("vendor_type", { length: 100 }),
  contacts: jsonb("contacts").$type<PartnerContact[]>(),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 3.1 Customers (Company specific)
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 50 }),
  altMobile: varchar("alt_mobile", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  customerType: varchar("customer_type", { length: 50 }).default("retail"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 4. Items / Products (Company specific)
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 100 }),
  
  // Category dependencies
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  subCategoryId: integer("sub_category_id").references(() => subCategories.id, { onDelete: "set null" }),
  productTypeId: integer("product_type_id").references(() => productTypes.id, { onDelete: "set null" }),
  
  // Partners & Brand
  brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  manufacturerId: integer("manufacturer_id").references(() => manufacturers.id, { onDelete: "set null" }),
  
  // Attributes
  colorId: integer("color_id").references(() => colors.id, { onDelete: "set null" }),
  sizeId: integer("size_id").references(() => sizes.id, { onDelete: "set null" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "set null" }),
  
  // Pricing & Stock
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).default("0").notNull(),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).default("0").notNull(),
  priceEffectiveDate: varchar("price_effective_date", { length: 50 }),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  alertQuantity: integer("alert_quantity").default(5).notNull(),
  
  // Media & Info
  imageUrl: text("image_url"),
  description: text("description"),

  discount: numeric("discount", { precision: 12, scale: 2 }).default("0"),
  discountType: varchar("discount_type", { length: 20 }).default("percent"),
  
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 5. Purchases (ক্রয়)
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  manufacturerId: integer("manufacturer_id").references(() => manufacturers.id, { onDelete: "set null" }),
  challanTypeId: integer("challan_type_id").references(() => challanTypes.id, { onDelete: "set null" }),
  challanNumber: varchar("challan_number", { length: 100 }),
  challanDate: varchar("challan_date", { length: 50 }),
  vatMode: varchar("vat_mode", { length: 20 }).default("excl").notNull(),
  itemsAmount: numeric("items_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalVatAmount: numeric("total_vat_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  otherExpenses: numeric("other_expenses", { precision: 12, scale: 2 }).default("0").notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  dueAmount: numeric("due_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("cash").notNull(),
  status: varchar("status", { length: 50 }).default("completed").notNull(),
  documentUrl: text("document_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 5.1 Purchase Items (ক্রয়কৃত চালানের পণ্যসমূহ)
export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id")
    .references(() => purchases.id, { onDelete: "cascade" })
    .notNull(),
  itemId: integer("item_id").references(() => items.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  subCategoryId: integer("sub_category_id").references(() => subCategories.id, { onDelete: "set null" }),
  brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
  sizeId: integer("size_id").references(() => sizes.id, { onDelete: "set null" }),
  colorId: integer("color_id").references(() => colors.id, { onDelete: "set null" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "set null" }),
  quantity: integer("quantity").default(1).notNull(),
  unitPriceExclVat: numeric("unit_price_excl_vat", { precision: 12, scale: 2 }).default("0").notNull(),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  unitPriceWithVat: numeric("unit_price_with_vat", { precision: 12, scale: 2 }).default("0").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).default("0").notNull(),
  allocatedExpense: numeric("allocated_expense", { precision: 12, scale: 2 }).default("0").notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).default("0").notNull(),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).default("0").notNull(),
  code: varchar("code", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});


// 6. Sales (বিক্রয়)
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 255 }),
  customerMobile: varchar("customer_mobile", { length: 50 }),
  cashierName: varchar("cashier_name", { length: 255 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
  saleDate: varchar("sale_date", { length: 50 }),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  changeAmount: numeric("change_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  dueAmount: numeric("due_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("cash").notNull(),
  transactionId: varchar("transaction_id", { length: 100 }),
  vatMode: varchar("vat_mode", { length: 20 }).default("inclusive").notNull(),
  status: varchar("status", { length: 50 }).default("completed").notNull(),
  documentUrl: text("document_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 6.1 Sale Items (বিক্রিত পণ্যের বিবরণ)
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id")
    .references(() => sales.id, { onDelete: "cascade" })
    .notNull(),
  itemId: integer("item_id").references(() => items.id, { onDelete: "set null" }),
  barcode: varchar("barcode", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  categoryName: varchar("category_name", { length: 100 }),
  brandName: varchar("brand_name", { length: 100 }),
  sizeName: varchar("size_name", { length: 50 }),
  colorName: varchar("color_name", { length: 50 }),
  quantity: integer("quantity").default(1).notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).default("0").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).default("0").notNull(),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 7. Item Pricings (মূল্য নির্ধারণ তালিকা ও ইতিহাস)
export const itemPricings = pgTable("item_pricings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  itemId: integer("item_id")
    .references(() => items.id, { onDelete: "cascade" })
    .notNull(),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).default("0").notNull(),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull(),
  effectiveDate: varchar("effective_date", { length: 50 }).notNull(),
  challanDate: varchar("challan_date", { length: 50 }),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("0"),
  vatType: varchar("vat_type", { length: 20 }).default("inclusive"),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0"),
  discountType: varchar("discount_type", { length: 20 }).default("percent"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});


// Relations
export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, { fields: [brands.userId], references: [users.id] }),
  category: one(categories, { fields: [brands.categoryId], references: [categories.id] }),
  subCategory: one(subCategories, { fields: [brands.subCategoryId], references: [subCategories.id] }),
  items: many(items)
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, { fields: [suppliers.userId], references: [users.id] }),
  items: many(items),
  purchases: many(purchases)
}));

export const manufacturersRelations = relations(manufacturers, ({ one, many }) => ({
  user: one(users, { fields: [manufacturers.userId], references: [users.id] }),
  items: many(items)
}));

export const itemsRelations = relations(items, ({ one }) => ({
  user: one(users, { fields: [items.userId], references: [users.id] }),
  category: one(categories, { fields: [items.categoryId], references: [categories.id] }),
  subCategory: one(subCategories, { fields: [items.subCategoryId], references: [subCategories.id] }),
  productType: one(productTypes, { fields: [items.productTypeId], references: [productTypes.id] }),
  brand: one(brands, { fields: [items.brandId], references: [brands.id] }),
  supplier: one(suppliers, { fields: [items.supplierId], references: [suppliers.id] }),
  manufacturer: one(manufacturers, { fields: [items.manufacturerId], references: [manufacturers.id] }),
  color: one(colors, { fields: [items.colorId], references: [colors.id] }),
  size: one(sizes, { fields: [items.sizeId], references: [sizes.id] }),
  unit: one(units, { fields: [items.unitId], references: [units.id] })
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
  supplier: one(suppliers, { fields: [purchases.supplierId], references: [suppliers.id] }),
  manufacturer: one(manufacturers, { fields: [purchases.manufacturerId], references: [manufacturers.id] }),
  challanType: one(challanTypes, { fields: [purchases.challanTypeId], references: [challanTypes.id] }),
  items: many(purchaseItems)
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, { fields: [purchaseItems.purchaseId], references: [purchases.id] }),
  item: one(items, { fields: [purchaseItems.itemId], references: [items.id] }),
  category: one(categories, { fields: [purchaseItems.categoryId], references: [categories.id] }),
  subCategory: one(subCategories, { fields: [purchaseItems.subCategoryId], references: [subCategories.id] }),
  brand: one(brands, { fields: [purchaseItems.brandId], references: [brands.id] }),
  size: one(sizes, { fields: [purchaseItems.sizeId], references: [sizes.id] }),
  color: one(colors, { fields: [purchaseItems.colorId], references: [colors.id] }),
  unit: one(units, { fields: [purchaseItems.unitId], references: [units.id] })
}));

export const itemPricingsRelations = relations(itemPricings, ({ one }) => ({
  user: one(users, { fields: [itemPricings.userId], references: [users.id] }),
  item: one(items, { fields: [itemPricings.itemId], references: [items.id] })
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  user: one(users, { fields: [sales.userId], references: [users.id] }),
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
  items: many(saleItems)
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  item: one(items, { fields: [saleItems.itemId], references: [items.id] })
}));

