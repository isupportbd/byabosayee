import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// 1. Categories (slug completely removed)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// Sub Categories (Belongs to Category)
export const subCategories = pgTable("sub_categories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  subCategories: many(subCategories),
  materials: many(fabricTypes)
}));

export const subCategoriesRelations = relations(subCategories, ({ one }) => ({
  category: one(categories, {
    fields: [subCategories.categoryId],
    references: [categories.id]
  })
}));

// 2. Size Groups
export const sizeGroups = pgTable("size_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 3. Sizes (Category & Sub-Category dependent)
export const sizes = pgTable("sizes", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" }),
  subCategoryId: integer("sub_category_id")
    .references(() => subCategories.id, { onDelete: "cascade" }),
  sizeGroupId: integer("size_group_id")
    .references(() => sizeGroups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const sizeGroupsRelations = relations(sizeGroups, ({ many }) => ({
  sizes: many(sizes)
}));

export const sizesRelations = relations(sizes, ({ one }) => ({
  group: one(sizeGroups, {
    fields: [sizes.sizeGroupId],
    references: [sizeGroups.id]
  }),
  category: one(categories, {
    fields: [sizes.categoryId],
    references: [categories.id]
  }),
  subCategory: one(subCategories, {
    fields: [sizes.subCategoryId],
    references: [subCategories.id]
  })
}));

// 4. Colors
export const colors = pgTable("colors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 5. Materials / Fabric Types (Category-dependent)
export const fabricTypes = pgTable("fabric_types", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 150 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const fabricTypesRelations = relations(fabricTypes, ({ one }) => ({
  category: one(categories, {
    fields: [fabricTypes.categoryId],
    references: [categories.id]
  })
}));

// Product Types ("ধরন" - Category and Sub-Category dependent)
export const productTypes = pgTable("product_types", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  subCategoryId: integer("sub_category_id")
    .references(() => subCategories.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const productTypesRelations = relations(productTypes, ({ one }) => ({
  category: one(categories, {
    fields: [productTypes.categoryId],
    references: [categories.id]
  }),
  subCategory: one(subCategories, {
    fields: [productTypes.subCategoryId],
    references: [subCategories.id]
  })
}));

// 6. Units of Measurement (Category and Sub-Category dependent)
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" }),
  subCategoryId: integer("sub_category_id")
    .references(() => subCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const unitsRelations = relations(units, ({ one }) => ({
  category: one(categories, {
    fields: [units.categoryId],
    references: [categories.id]
  }),
  subCategory: one(subCategories, {
    fields: [units.subCategoryId],
    references: [subCategories.id]
  })
}));

// 7. Challan Types (চালানের ধরন: ডেলিভারি চালান, মূসক ৬.৩, বিল অব এন্ট্রি)
export const challanTypes = pgTable("challan_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 50 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 8. Vendor Types (সরবরাহকারীর ধরন: সাপ্লায়ার, প্রস্তুতকারী, আমদানিকারক, ইত্যাদি)
export const vendorTypes = pgTable("vendor_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 50 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 9. Payment Methods / Trx Types (পরিশোধের মাধ্যম / Trx Type)
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 50 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});



