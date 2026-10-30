import fs from "node:fs/promises";
import path from "node:path";
import { and, desc, eq, or, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { settings } from "@/modules/settings/database/models/settings.js";
import {
  brands,
  customers,
  items,
  itemPricings,
  manufacturers,
  purchases,
  purchaseItems,
  sales,
  saleItems,
  suppliers
} from "@/modules/inventory/database/models/inventory.js";
import { companySettings } from "@/modules/company/database/models/company.js";
import { challanTypes } from "@/modules/catalog/database/models/catalog.js";
import { executeRawSql } from "@/framework/database/auto-init.js";

let inventoryTablesEnsured = false;
export async function ensureInventoryTables() {
  if (inventoryTablesEnsured) return;
  try {
    await executeRawSql(`
      CREATE TABLE IF NOT EXISTS "brands" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "category_id" integer REFERENCES "categories"("id") ON DELETE SET NULL,
        "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE SET NULL,
        "name" varchar(255) NOT NULL,
        "origin" varchar(100),
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "categories"("id") ON DELETE SET NULL;
      ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE SET NULL;
      ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;

      CREATE TABLE IF NOT EXISTS "suppliers" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "contact_person" varchar(150),
        "mobile" varchar(50),
        "email" varchar(255),
        "address" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "manufacturers" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "country" varchar(100),
        "mobile" varchar(50),
        "factory_address" text,
        "notes" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "address" text;
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "mobile" varchar(50);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "contact_person" varchar(150);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "contacts" jsonb;
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "owner_name" varchar(150);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "owner_mobile" varchar(50);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "manager_name" varchar(150);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "manager_mobile" varchar(50);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "vendor_type" varchar(100);

      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "contacts" jsonb;
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "owner_name" varchar(150);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "owner_mobile" varchar(50);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "manager_name" varchar(150);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "manager_mobile" varchar(50);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "vendor_type" varchar(100);

      CREATE TABLE IF NOT EXISTS "customers" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "mobile" varchar(50),
        "alt_mobile" varchar(50),
        "email" varchar(255),
        "address" text,
        "customer_type" varchar(50) DEFAULT 'retail',
        "notes" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "alt_mobile" varchar(50);

      CREATE TABLE IF NOT EXISTS "items" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "code" varchar(100),
        "category_id" integer REFERENCES "categories"("id") ON DELETE SET NULL,
        "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE SET NULL,
        "product_type_id" integer REFERENCES "product_types"("id") ON DELETE SET NULL,
        "brand_id" integer REFERENCES "brands"("id") ON DELETE SET NULL,
        "supplier_id" integer REFERENCES "suppliers"("id") ON DELETE SET NULL,
        "manufacturer_id" integer REFERENCES "manufacturers"("id") ON DELETE SET NULL,
        "color_id" integer REFERENCES "colors"("id") ON DELETE SET NULL,
        "size_id" integer REFERENCES "sizes"("id") ON DELETE SET NULL,
        "unit_id" integer REFERENCES "units"("id") ON DELETE SET NULL,
        "purchase_price" numeric(12, 2) DEFAULT '0' NOT NULL,
        "selling_price" numeric(12, 2) DEFAULT '0' NOT NULL,
        "stock_quantity" integer DEFAULT 0 NOT NULL,
        "alert_quantity" integer DEFAULT 5 NOT NULL,
        "image_url" text,
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "purchases" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "supplier_id" integer REFERENCES "suppliers"("id") ON DELETE SET NULL,
        "invoice_number" varchar(100),
        "total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
        "paid_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
        "due_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
        "status" varchar(50) DEFAULT 'completed' NOT NULL,
        "notes" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "manufacturer_id" integer REFERENCES "manufacturers"("id") ON DELETE SET NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "challan_type_id" integer REFERENCES "challan_types"("id") ON DELETE SET NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "challan_number" varchar(100);
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "challan_date" varchar(50);
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "vat_mode" varchar(20) DEFAULT 'excl' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "items_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "total_vat_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "other_expenses" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "payment_method" varchar(50) DEFAULT 'cash' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "document_url" text;

      CREATE TABLE IF NOT EXISTS "purchase_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "purchase_id" integer NOT NULL REFERENCES "purchases"("id") ON DELETE CASCADE,
        "item_id" integer REFERENCES "items"("id") ON DELETE SET NULL,
        "name" varchar(255) NOT NULL,
        "category_id" integer REFERENCES "categories"("id") ON DELETE SET NULL,
        "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE SET NULL,
        "brand_id" integer REFERENCES "brands"("id") ON DELETE SET NULL,
        "size_id" integer REFERENCES "sizes"("id") ON DELETE SET NULL,
        "color_id" integer REFERENCES "colors"("id") ON DELETE SET NULL,
        "unit_id" integer REFERENCES "units"("id") ON DELETE SET NULL,
        "quantity" integer DEFAULT 1 NOT NULL,
        "total_price" numeric(12, 2) DEFAULT '0' NOT NULL,
        "unit_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
        "code" varchar(50),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "unit_price_excl_vat" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "vat_rate" numeric(5, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "vat_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "unit_price_with_vat" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "allocated_expense" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "selling_price" numeric(12, 2) DEFAULT '0' NOT NULL;

      CREATE TABLE IF NOT EXISTS "sales" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "customer_name" varchar(255),
        "customer_mobile" varchar(50),
        "invoice_number" varchar(100) NOT NULL,
        "total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
        "paid_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
        "due_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
        "status" varchar(50) DEFAULT 'completed' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "customer_id" integer REFERENCES "customers"("id") ON DELETE SET NULL;
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "cashier_name" varchar(255);
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "sale_date" varchar(50);
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "subtotal" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "vat_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "change_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "payment_method" varchar(50) DEFAULT 'cash' NOT NULL;
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "transaction_id" varchar(100);
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "vat_mode" varchar(20) DEFAULT 'inclusive' NOT NULL;
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "document_url" text;
      ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "notes" text;

      CREATE TABLE IF NOT EXISTS "sale_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "sale_id" integer NOT NULL REFERENCES "sales"("id") ON DELETE CASCADE,
        "item_id" integer REFERENCES "items"("id") ON DELETE SET NULL,
        "barcode" varchar(50),
        "name" varchar(255) NOT NULL,
        "category_name" varchar(100),
        "brand_name" varchar(100),
        "size_name" varchar(50),
        "color_name" varchar(50),
        "quantity" integer DEFAULT 1 NOT NULL,
        "unit_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
        "unit_price" numeric(12, 2) DEFAULT '0' NOT NULL,
        "vat_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
        "vat_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
        "discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
        "total_price" numeric(12, 2) DEFAULT '0' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "size_name" varchar(50);
      ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "color_name" varchar(50);
      ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "vat_rate" numeric(5, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "vat_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL;

      ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "price_effective_date" varchar(50);

      CREATE TABLE IF NOT EXISTS "item_pricings" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "item_id" integer NOT NULL REFERENCES "items"("id") ON DELETE CASCADE,
        "purchase_price" numeric(12, 2) DEFAULT '0' NOT NULL,
        "selling_price" numeric(12, 2) NOT NULL,
        "effective_date" varchar(50) NOT NULL,
        "challan_date" varchar(50),
        "vat_rate" numeric(5, 2) DEFAULT '0',
        "vat_type" varchar(20) DEFAULT 'inclusive',
        "notes" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "item_pricings" ADD COLUMN IF NOT EXISTS "vat_rate" numeric(5, 2) DEFAULT '0';
      ALTER TABLE "item_pricings" ADD COLUMN IF NOT EXISTS "vat_type" varchar(20) DEFAULT 'inclusive';
      ALTER TABLE "item_pricings" ADD COLUMN IF NOT EXISTS "discount" numeric(12, 2) DEFAULT '0';
      ALTER TABLE "item_pricings" ADD COLUMN IF NOT EXISTS "discount_type" varchar(20) DEFAULT 'percent';
      ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "discount" numeric(12, 2) DEFAULT '0';
      ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "discount_type" varchar(20) DEFAULT 'percent';
    `);

    inventoryTablesEnsured = true;
  } catch (e) {
    console.error("Failed to ensure inventory tables:", e);
  }
}

function getUserId(c: any): number | null {
  const auth = c.get("auth") || c.get("user");
  return auth?.id ? Number(auth.id) : null;
}

/**
 * 1. Dashboard Statistics
 */
export const getStats: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const [
      itemCountRes,
      brandCountRes,
      supplierCountRes,
      manufacturerCountRes,
      customerCountRes,
      purchaseAggRes,
      salesAggRes
    ] = await Promise.all([
      db.execute(sql`SELECT count(*)::int as count, coalesce(sum(stock_quantity), 0)::int as total_stock, coalesce(sum(stock_quantity * purchase_price), 0)::numeric as stock_value FROM "items" WHERE "user_id" = ${userId}`),
      db.execute(sql`SELECT count(*)::int as count FROM "brands" WHERE "user_id" = ${userId}`),
      db.execute(sql`SELECT count(*)::int as count FROM "suppliers" WHERE "user_id" = ${userId}`),
      db.execute(sql`SELECT count(*)::int as count FROM "manufacturers" WHERE "user_id" = ${userId}`),
      db.execute(sql`SELECT count(*)::int as count FROM "customers" WHERE "user_id" = ${userId}`),
      db.execute(sql`SELECT count(*)::int as count, coalesce(sum(total_amount), 0)::numeric as total_amount FROM "purchases" WHERE "user_id" = ${userId}`),
      db.execute(sql`SELECT count(*)::int as count, coalesce(sum(total_amount), 0)::numeric as total_amount FROM "sales" WHERE "user_id" = ${userId}`)
    ]);

    const itemRow = (itemCountRes.rows || itemCountRes)[0] as any || {};
    const brandRow = (brandCountRes.rows || brandCountRes)[0] as any || {};
    const supplierRow = (supplierCountRes.rows || supplierCountRes)[0] as any || {};
    const manufacturerRow = (manufacturerCountRes.rows || manufacturerCountRes)[0] as any || {};
    const customerRow = (customerCountRes.rows || customerCountRes)[0] as any || {};
    const purchaseRow = (purchaseAggRes.rows || purchaseAggRes)[0] as any || {};
    const salesRow = (salesAggRes.rows || salesAggRes)[0] as any || {};

    return c.json(
      {
        message: "Success",
        data: {
          items: {
            count: Number(itemRow.count || 0),
            totalStock: Number(itemRow.total_stock || 0),
            stockValue: Number(itemRow.stock_value || 0)
          },
          brands: { count: Number(brandRow.count || 0) },
          suppliers: { count: Number(supplierRow.count || 0) },
          manufacturers: { count: Number(manufacturerRow.count || 0) },
          customers: { count: Number(customerRow.count || 0) },
          purchases: {
            count: Number(purchaseRow.count || 0),
            totalAmount: Number(purchaseRow.total_amount || 0)
          },
          sales: {
            count: Number(salesRow.count || 0),
            totalAmount: Number(salesRow.total_amount || 0)
          }
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Inventory stats error:", error);
    return c.json({ message: "পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 2. Brands CRUD
 */

export const listBrands: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const list = await db.query.brands.findMany({
    where: eq(brands.userId, userId),
    with: {
      category: true,
      subCategory: true
    },
    orderBy: [desc(brands.id)]
  });

  return c.json({ message: "Success", data: list }, HttpStatusCodes.OK);
};

export const createBrand: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  if (!body.name || !body.name.trim()) {
    return c.json({ message: "ব্রান্ডের নাম আবশ্যক" }, HttpStatusCodes.BAD_REQUEST);
  }

  const [created] = await db
    .insert(brands)
    .values({
      userId,
      name: body.name.trim(),
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      subCategoryId: body.subCategoryId ? Number(body.subCategoryId) : null,
      origin: body.origin?.trim() || null,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
    })
    .returning();

  return c.json({ message: "ব্রান্ড সফলভাবে যোগ করা হয়েছে", data: created }, HttpStatusCodes.CREATED);
};

export const updateBrand: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  const existing = await db.query.brands.findFirst({
    where: and(eq(brands.id, id), eq(brands.userId, userId))
  });
  if (!existing) {
    return c.json({ message: "ব্রান্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const updateData: any = {
    updatedAt: new Date()
  };

  if (body.name !== undefined && body.name.trim()) {
    updateData.name = body.name.trim();
  }
  if (body.categoryId !== undefined) {
    updateData.categoryId = body.categoryId ? Number(body.categoryId) : null;
  }
  if (body.subCategoryId !== undefined) {
    updateData.subCategoryId = body.subCategoryId ? Number(body.subCategoryId) : null;
  }
  if (body.origin !== undefined) {
    updateData.origin = body.origin?.trim() || null;
  }
  if (body.isActive !== undefined) {
    updateData.isActive = Boolean(body.isActive);
  }

  const [updated] = await db
    .update(brands)
    .set(updateData)
    .where(and(eq(brands.id, id), eq(brands.userId, userId)))
    .returning();

  return c.json({ message: "ব্রান্ড সফলভাবে আপডেট করা হয়েছে", data: updated }, HttpStatusCodes.OK);
};

export const deleteBrand: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  await db.delete(brands).where(and(eq(brands.id, id), eq(brands.userId, userId)));
  return c.json({ message: "ব্রান্ড সফলভাবে মুছে ফেলা হয়েছে" }, HttpStatusCodes.OK);
};

/**
 * 3. Suppliers CRUD
 */
export const listSuppliers: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const list = await db.query.suppliers.findMany({
    where: eq(suppliers.userId, userId),
    orderBy: [desc(suppliers.id)]
  });

  return c.json({ message: "Success", data: list }, HttpStatusCodes.OK);
};

export const createSupplier: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  if (!body.name || !body.name.trim()) {
    return c.json({ message: "সাপ্লায়ারের নাম আবশ্যক" }, HttpStatusCodes.BAD_REQUEST);
  }

  const contacts = Array.isArray(body.contacts) && body.contacts.length > 0
    ? body.contacts
    : [
        ...(body.ownerName || body.ownerMobile ? [{ name: (body.ownerName || "").trim(), designation: "মালিক", mobile: (body.ownerMobile || "").trim() }] : []),
        ...(body.managerName || body.managerMobile ? [{ name: (body.managerName || "").trim(), designation: "ম্যানেজার/কর্মচারী", mobile: (body.managerMobile || "").trim() }] : [])
      ];
  const firstContact = contacts[0] || {};
  const [created] = await db
    .insert(suppliers)
    .values({
      userId,
      name: body.name.trim(),
      ownerName: (body.ownerName || "").trim() || null,
      ownerMobile: (body.ownerMobile || "").trim() || null,
      managerName: (body.managerName || "").trim() || null,
      managerMobile: (body.managerMobile || "").trim() || null,
      contactPerson: (body.ownerName || body.contactPerson || firstContact.name || "").trim() || null,
      mobile: (body.mobile || body.ownerMobile || firstContact.mobile || "").trim() || null,
      email: body.email?.trim() || null,
      address: body.address?.trim() || null,
      vendorType: body.vendorType?.trim() || null,
      contacts: contacts.length > 0 ? contacts : null
    })
    .returning();

  return c.json({ message: "সাপ্লায়ার সফলভাবে যোগ করা হয়েছে", data: created }, HttpStatusCodes.CREATED);
};

export const deleteSupplier: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  await db.delete(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)));
  return c.json({ message: "সাপ্লায়ার সফলভাবে মুছে ফেলা হয়েছে" }, HttpStatusCodes.OK);
};

export const updateSupplier: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  const existing = await db.query.suppliers.findFirst({
    where: and(eq(suppliers.id, id), eq(suppliers.userId, userId))
  });
  if (!existing) {
    return c.json({ message: "সাপ্লায়ার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const updateData: any = {
    updatedAt: new Date()
  };

  if (body.isActive !== undefined) {
    updateData.isActive = Boolean(body.isActive);
  }

  if (body.name !== undefined && body.name.trim()) {
    updateData.name = body.name.trim();
  }
  if (body.mobile !== undefined) updateData.mobile = (body.mobile || "").trim() || null;
  if (body.address !== undefined) updateData.address = (body.address || "").trim() || null;
  if (body.ownerName !== undefined) updateData.ownerName = (body.ownerName || "").trim() || null;
  if (body.ownerMobile !== undefined) updateData.ownerMobile = (body.ownerMobile || "").trim() || null;
  if (body.managerName !== undefined) updateData.managerName = (body.managerName || "").trim() || null;
  if (body.managerMobile !== undefined) updateData.managerMobile = (body.managerMobile || "").trim() || null;
  if (body.contacts !== undefined) updateData.contacts = body.contacts;
  if (body.vendorType !== undefined) updateData.vendorType = body.vendorType?.trim() || null;
  if (body.ownerName || body.managerName || body.contactPerson) {
    updateData.contactPerson = (body.ownerName || body.managerName || body.contactPerson || "").trim() || null;
  }

  const [updated] = await db
    .update(suppliers)
    .set(updateData)
    .where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)))
    .returning();

  return c.json({ message: "সাপ্লায়ারের তথ্য সফলভাবে আপডেট করা হয়েছে", data: updated }, HttpStatusCodes.OK);
};

/**
 * 4. Manufacturers CRUD
 */
export const listManufacturers: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const list = await db.query.manufacturers.findMany({
    where: eq(manufacturers.userId, userId),
    orderBy: [desc(manufacturers.id)]
  });

  return c.json({ message: "Success", data: list }, HttpStatusCodes.OK);
};

export const createManufacturer: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  if (!body.name || !body.name.trim()) {
    return c.json({ message: "প্রস্তুতকারকের নাম আবশ্যক" }, HttpStatusCodes.BAD_REQUEST);
  }

  const contacts = Array.isArray(body.contacts) && body.contacts.length > 0
    ? body.contacts
    : [
        ...(body.ownerName || body.ownerMobile ? [{ name: (body.ownerName || "").trim(), designation: "মালিক", mobile: (body.ownerMobile || "").trim() }] : []),
        ...(body.managerName || body.managerMobile ? [{ name: (body.managerName || "").trim(), designation: "ম্যানেজার/কর্মচারী", mobile: (body.managerMobile || "").trim() }] : [])
      ];
  const firstContact = contacts[0] || {};
  const [created] = await db
    .insert(manufacturers)
    .values({
      userId,
      name: body.name.trim(),
      ownerName: (body.ownerName || "").trim() || null,
      ownerMobile: (body.ownerMobile || "").trim() || null,
      managerName: (body.managerName || "").trim() || null,
      managerMobile: (body.managerMobile || "").trim() || null,
      contactPerson: (body.ownerName || body.contactPerson || firstContact.name || "").trim() || null,
      country: body.country?.trim() || "বাংলাদেশ",
      mobile: (body.mobile || body.ownerMobile || firstContact.mobile || "").trim() || null,
      factoryAddress: (body.factoryAddress || body.address || "").trim() || null,
      address: (body.address || body.factoryAddress || "").trim() || null,
      vendorType: body.vendorType?.trim() || null,
      contacts: contacts.length > 0 ? contacts : null,
      notes: body.notes?.trim() || null
    })
    .returning();

  return c.json({ message: "প্রস্তুতকারক সফলভাবে যোগ করা হয়েছে", data: created }, HttpStatusCodes.CREATED);
};

export const deleteManufacturer: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  await db.delete(manufacturers).where(and(eq(manufacturers.id, id), eq(manufacturers.userId, userId)));
  return c.json({ message: "প্রস্তুতকারক সফলভাবে মুছে ফেলা হয়েছে" }, HttpStatusCodes.OK);
};

export const updateManufacturer: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  const existing = await db.query.manufacturers.findFirst({
    where: and(eq(manufacturers.id, id), eq(manufacturers.userId, userId))
  });
  if (!existing) {
    return c.json({ message: "প্রস্তুতকারক পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const updateData: any = {
    updatedAt: new Date()
  };

  if (body.isActive !== undefined) {
    updateData.isActive = Boolean(body.isActive);
  }

  if (body.name !== undefined && body.name.trim()) {
    updateData.name = body.name.trim();
  }
  if (body.mobile !== undefined) updateData.mobile = (body.mobile || "").trim() || null;
  if (body.address !== undefined || body.factoryAddress !== undefined) {
    const cleanAddr = (body.address || body.factoryAddress || "").trim() || null;
    updateData.factoryAddress = cleanAddr;
    updateData.address = cleanAddr;
  }
  if (body.ownerName !== undefined) updateData.ownerName = (body.ownerName || "").trim() || null;
  if (body.ownerMobile !== undefined) updateData.ownerMobile = (body.ownerMobile || "").trim() || null;
  if (body.managerName !== undefined) updateData.managerName = (body.managerName || "").trim() || null;
  if (body.managerMobile !== undefined) updateData.managerMobile = (body.managerMobile || "").trim() || null;
  if (body.contacts !== undefined) updateData.contacts = body.contacts;
  if (body.vendorType !== undefined) updateData.vendorType = body.vendorType?.trim() || null;
  if (body.ownerName || body.managerName || body.contactPerson) {
    updateData.contactPerson = (body.ownerName || body.managerName || body.contactPerson || "").trim() || null;
  }

  const [updated] = await db
    .update(manufacturers)
    .set(updateData)
    .where(and(eq(manufacturers.id, id), eq(manufacturers.userId, userId)))
    .returning();

  return c.json({ message: "প্রস্তুতকারকের তথ্য সফলভাবে আপডেট করা হয়েছে", data: updated }, HttpStatusCodes.OK);
};

/**
 * 5. Items CRUD
 */
export const listItems: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const list = await db.query.items.findMany({
    where: eq(items.userId, userId),
    orderBy: [desc(items.id)],
    with: {
      category: { columns: { id: true, name: true } },
      subCategory: { columns: { id: true, name: true } },
      productType: { columns: { id: true, name: true } },
      brand: { columns: { id: true, name: true } },
      supplier: { columns: { id: true, name: true } },
      manufacturer: { columns: { id: true, name: true } },
      color: { columns: { id: true, name: true, code: true } },
      size: { columns: { id: true, name: true } },
      unit: { columns: { id: true, name: true, shortName: true } }
    }
  });

    // Query latest pricing info from item_pricings (for accurate selling price & VAT rate per user request)
    let enriched = list;
    try {
      const [latestPurchases, latestPricings] = await Promise.all([
        db.execute(sql`
          SELECT DISTINCT ON (pi.item_id) 
            pi.item_id as "itemId",
            p.challan_date as "challanDate",
            p.challan_number as "challanNumber",
            pi.unit_cost as "unitCost",
            pi.code as "barcode",
            pi.vat_rate as "vatRate"
          FROM "purchase_items" pi
          JOIN "purchases" p ON p.id = pi.purchase_id
          WHERE p.user_id = ${userId} AND pi.item_id IS NOT NULL
          ORDER BY pi.item_id, p.id DESC, pi.id DESC
        `),
        db.execute(sql`
          SELECT DISTINCT ON (ip.item_id)
            ip.item_id as "itemId",
            ip.selling_price as "sellingPrice",
            ip.vat_rate as "vatRate",
            ip.vat_type as "vatType",
            ip.discount as "discount",
            ip.discount_type as "discountType"
          FROM "item_pricings" ip
          WHERE ip.user_id = ${userId} AND ip.item_id IS NOT NULL
          ORDER BY ip.item_id, ip.id DESC
        `)
      ]);

      const lpMap = new Map<number, any>();
      const rows: any[] = (latestPurchases.rows || latestPurchases) as any[];
      for (const r of rows) {
        const id = Number(r.itemId ?? r.itemid ?? r.item_id);
        if (id) lpMap.set(id, r);
      }

      const priceMap = new Map<number, any>();
      const pRows: any[] = (latestPricings.rows || latestPricings) as any[];
      for (const pr of pRows) {
        const id = Number(pr.itemId ?? pr.itemid ?? pr.item_id);
        if (id) priceMap.set(id, pr);
      }

      enriched = list.map((it: any) => {
        const lp = lpMap.get(Number(it.id));
        const pr = priceMap.get(Number(it.id));
        const unitCostVal = lp?.unitCost ?? lp?.unitcost ?? lp?.unit_cost;

        // User instruction: "ভ্যাট হিসাব হবে আইটেমের মূল্য নির্ধারণ পেইজে থেকে। সবসময় লাস্ট রেট অনুযায়ী হিসাব হবে।"
        const pricingVatRate = pr?.vatRate ?? pr?.vatrate ?? pr?.vat_rate;
        const purchaseVatRate = lp?.vatRate ?? lp?.vatrate ?? lp?.vat_rate;
        const finalVatRate = pricingVatRate !== undefined && pricingVatRate !== null
          ? Number(pricingVatRate)
          : (purchaseVatRate !== undefined && purchaseVatRate !== null ? Number(purchaseVatRate) : 0);

        const pricingSellingPrice = pr?.sellingPrice ?? pr?.sellingprice ?? pr?.selling_price;
        const finalSellingPrice = pricingSellingPrice !== undefined && pricingSellingPrice !== null && Number(pricingSellingPrice) > 0
          ? String(Number(pricingSellingPrice).toFixed(2))
          : String(Number(it.sellingPrice || 0).toFixed(2));

        const purchaseBarcode = lp?.barcode || lp?.code || null;
        return {
          ...it,
          code: it.code,
          barcode: purchaseBarcode,
          latestChallanDate: lp?.challanDate || lp?.challandate || lp?.challan_date || null,
          latestChallanNumber: lp?.challanNumber || lp?.challannumber || lp?.challan_number || null,
          latestUnitCost: unitCostVal !== undefined && unitCostVal !== null ? Number(unitCostVal) : Number(it.purchasePrice || 0),
          latestBarcode: purchaseBarcode,
          sellingPrice: finalSellingPrice,
          latestVatRate: finalVatRate,
          latestVatType: pr?.vatType || "inclusive",
          latestDiscount: pr?.discount !== undefined && pr?.discount !== null ? Number(pr.discount) : Number(it.discount || 0),
          latestDiscountType: pr?.discountType || pr?.discount_type || it.discountType || "percent"
        };
      });
    } catch (err) {
      console.error("Enrich items with latest purchase and pricing error:", err);
    }

  return c.json({ message: "Success", data: enriched }, HttpStatusCodes.OK);
};

export const createItem: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  if (!body.name || !body.name.trim()) {
    return c.json({ message: "আইটেমের নাম আবশ্যক" }, HttpStatusCodes.BAD_REQUEST);
  }

  // Generate code if not provided - company prefix + sequential 1, 2, 3...
  let code = body.code?.trim();
  if (!code) {
    const compSettings = await db.query.companySettings.findFirst({
      where: eq(companySettings.userId, userId)
    });
    const prefix = compSettings?.productPrefix || "PRD-";
    const existingCountRes = await db.execute(sql`
      SELECT count(*)::int as count FROM "items" WHERE "user_id" = ${userId}
    `);
    const count = Number((existingCountRes.rows || existingCountRes)[0]?.count || 0);
    code = `${prefix}${count + 1}`;
  }

  const [created] = await db
    .insert(items)
    .values({
      userId,
      name: body.name.trim(),
      code,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      subCategoryId: body.subCategoryId ? Number(body.subCategoryId) : null,
      productTypeId: body.productTypeId ? Number(body.productTypeId) : null,
      brandId: body.brandId ? Number(body.brandId) : null,
      supplierId: body.supplierId ? Number(body.supplierId) : null,
      manufacturerId: body.manufacturerId ? Number(body.manufacturerId) : null,
      colorId: body.colorId ? Number(body.colorId) : null,
      sizeId: body.sizeId ? Number(body.sizeId) : null,
      unitId: body.unitId ? Number(body.unitId) : null,
      purchasePrice: String(body.purchasePrice || 0),
      sellingPrice: String(body.sellingPrice || 0),
      stockQuantity: Number(body.stockQuantity || 0),
      alertQuantity: Number(body.alertQuantity || 5),
      imageUrl: body.imageUrl?.trim() || null,
      description: body.description?.trim() || null
    })
    .returning();

  return c.json({ message: "আইটেম সফলভাবে তৈরি করা হয়েছে", data: created }, HttpStatusCodes.CREATED);
};

export const deleteItem: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  await db.delete(items).where(and(eq(items.id, id), eq(items.userId, userId)));
  return c.json({ message: "আইটেম সফলভাবে মুছে ফেলা হয়েছে" }, HttpStatusCodes.OK);
};

export const updateItem: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  const [updated] = await db
    .update(items)
    .set({
      name: body.name !== undefined ? body.name.trim() : undefined,
      code: body.code !== undefined ? body.code?.trim() || null : undefined,
      categoryId: body.categoryId !== undefined ? (body.categoryId ? Number(body.categoryId) : null) : undefined,
      subCategoryId: body.subCategoryId !== undefined ? (body.subCategoryId ? Number(body.subCategoryId) : null) : undefined,
      productTypeId: body.productTypeId !== undefined ? (body.productTypeId ? Number(body.productTypeId) : null) : undefined,
      brandId: body.brandId !== undefined ? (body.brandId ? Number(body.brandId) : null) : undefined,
      supplierId: body.supplierId !== undefined ? (body.supplierId ? Number(body.supplierId) : null) : undefined,
      manufacturerId: body.manufacturerId !== undefined ? (body.manufacturerId ? Number(body.manufacturerId) : null) : undefined,
      colorId: body.colorId !== undefined ? (body.colorId ? Number(body.colorId) : null) : undefined,
      sizeId: body.sizeId !== undefined ? (body.sizeId ? Number(body.sizeId) : null) : undefined,
      unitId: body.unitId !== undefined ? (body.unitId ? Number(body.unitId) : null) : undefined,
      purchasePrice: body.purchasePrice !== undefined ? String(body.purchasePrice) : undefined,
      sellingPrice: body.sellingPrice !== undefined ? String(body.sellingPrice) : undefined,
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : undefined,
      alertQuantity: body.alertQuantity !== undefined ? Number(body.alertQuantity) : undefined,
      imageUrl: body.imageUrl !== undefined ? (body.imageUrl?.trim() || null) : undefined,
      description: body.description !== undefined ? (body.description?.trim() || null) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      updatedAt: new Date()
    })
    .where(and(eq(items.id, id), eq(items.userId, userId)))
    .returning();

  return c.json({ message: "আইটেম সফলভাবে আপডেট করা হয়েছে", data: updated }, HttpStatusCodes.OK);
};

/**
 * 6. Customers CRUD
 */
export const listCustomers: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  // Ensure default Walk-in customer exists for this user
  try {
    const walkInExists = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.userId, userId), or(eq(customers.customerType, "walk_in"), eq(customers.name, "ওয়াক-ইন কাস্টমার"))))
      .limit(1);

    if (!walkInExists || walkInExists.length === 0) {
      await db.insert(customers).values({
        userId,
        name: "ওয়াক-ইন কাস্টমার",
        customerType: "walk_in",
        mobile: null,
        address: "কাউন্টার সেল",
        notes: "সিস্টেম ডিফল্ট ওয়াক-ইন গ্রাহক",
        isActive: true
      });
    }
  } catch {}

  const list = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.id));

  return c.json({ message: "Success", data: list }, HttpStatusCodes.OK);
};

export const createCustomer: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  if (!body.name || !body.name.trim()) {
    return c.json({ message: "কাস্টমারের নাম আবশ্যক" }, HttpStatusCodes.BAD_REQUEST);
  }

  const [created] = await db
    .insert(customers)
    .values({
      userId,
      name: body.name.trim(),
      mobile: body.mobile?.trim() || null,
      altMobile: body.altMobile?.trim() || null,
      email: body.email?.trim() || null,
      address: body.address?.trim() || null,
      customerType: body.customerType || "retail",
      notes: body.notes?.trim() || null,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
    })
    .returning();

  return c.json({ message: "কাস্টমার সফলভাবে তৈরি করা হয়েছে", data: created }, HttpStatusCodes.CREATED);
};

export const updateCustomer: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  const existing = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .limit(1);

  if (!existing || existing.length === 0) {
    return c.json({ message: "কাস্টমার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const updateData: any = {
    updatedAt: new Date()
  };

  if (body.isActive !== undefined) {
    updateData.isActive = Boolean(body.isActive);
  }
  if (body.mobile !== undefined) {
    updateData.mobile = body.mobile ? body.mobile.trim() : null;
  }
  if (body.altMobile !== undefined) {
    updateData.altMobile = body.altMobile ? body.altMobile.trim() : null;
  }
  if (body.email !== undefined) {
    updateData.email = body.email ? body.email.trim() : null;
  }
  if (body.address !== undefined) {
    updateData.address = body.address ? body.address.trim() : null;
  }
  if (body.customerType !== undefined) {
    updateData.customerType = body.customerType || "retail";
  }
  if (body.notes !== undefined) {
    updateData.notes = body.notes ? body.notes.trim() : null;
  }
  if (body.name !== undefined && body.name.trim()) {
    updateData.name = body.name.trim();
  }

  const [updated] = await db
    .update(customers)
    .set(updateData)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();

  return c.json({ message: "কাস্টমারের তথ্য সফলভাবে আপডেট করা হয়েছে", data: updated }, HttpStatusCodes.OK);
};

export const deleteCustomer: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  const id = Number(c.req.param("id"));
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  await db.delete(customers).where(and(eq(customers.id, id), eq(customers.userId, userId)));
  return c.json({ message: "কাস্টমার সফলভাবে মুছে ফেলা হয়েছে" }, HttpStatusCodes.OK);
};

/* -------------------------------------------------------------
 * 6. Purchases (ক্রয়) Controllers
 * ----------------------------------------------------------- */
export const listPurchases: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  try {
    const list = await db.query.purchases.findMany({
      where: eq(purchases.userId, userId),
      orderBy: desc(purchases.id),
      with: {
        supplier: true,
        manufacturer: true,
        challanType: true,
        items: {
          with: {
            item: true,
            category: true,
            subCategory: true,
            brand: true,
            size: true,
            color: true,
            unit: true
          }
        }
      }
    });

    return c.json(
      {
        message: "ক্রয় তালিকা সফলভাবে পাওয়া গেছে",
        data: list
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List purchases error:", error);
    return c.json({ message: "ক্রয় তালিকা লোড করা যায়নি" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createPurchase: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  try {
    const body = await c.req.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (rawItems.length === 0) {
      return c.json({ message: "চালানে অন্তত একটি পণ্য যোগ করুন" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const challanTypeId = body.challanTypeId ? Number(body.challanTypeId) : null;
    const supplierId = body.supplierId ? Number(body.supplierId) : null;
    const manufacturerId = body.manufacturerId ? Number(body.manufacturerId) : null;
    const challanNumber = (body.challanNumber || "").trim();
    const challanDate = (body.challanDate || new Date().toISOString().split("T")[0]).trim();
    const otherExpenses = Math.max(0, Number(body.otherExpenses) || 0);
    const discountAmount = Math.max(0, Number(body.discountAmount) || 0);
    const paidAmount = Math.max(0, Number(body.paidAmount) || 0);

    const paymentMethod = paidAmount > 0 && body.paymentMethod ? String(body.paymentMethod).trim() : null;
    const notes = body.notes ? body.notes.trim() : null;

    const vatMode = (body.vatMode || "excl").trim().toLowerCase() === "incl" ? "incl" : "excl";

    // 1. Calculate items pricing, subtotal, and total vat
    let itemsAmount = 0;
    let totalVatAmount = 0;

    for (const item of rawItems) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unit = Number(item.unitPrice) || 0;
      const vatRate = Math.max(0, Number(item.vatRate) || 0);

      let unitWithVat = 0;
      let totalWithVat = 0;
      let unitExclVat = 0;
      let totalExclVat = 0;
      let vatAmount = 0;

      if (vatMode === "incl") {
        unitWithVat = unit;
        totalWithVat = Number((qty * unitWithVat).toFixed(2));
        unitExclVat = vatRate > 0 ? Number((unit / (1 + vatRate / 100)).toFixed(2)) : unit;
        totalExclVat = Number((qty * unitExclVat).toFixed(2));
        vatAmount = Number((totalWithVat - totalExclVat).toFixed(2));
      } else {
        unitExclVat = unit;
        totalExclVat = Number((qty * unitExclVat).toFixed(2));
        unitWithVat = Number((unit * (1 + vatRate / 100)).toFixed(2));
        totalWithVat = Number((qty * unitWithVat).toFixed(2));
        vatAmount = Number((totalWithVat - totalExclVat).toFixed(2));
      }

      if (item.unitPriceExclVat !== undefined && Number(item.unitPriceExclVat) > 0) {
        unitExclVat = Number(item.unitPriceExclVat);
      }
      if (item.unitPriceWithVat !== undefined && Number(item.unitPriceWithVat) > 0) {
        unitWithVat = Number(item.unitPriceWithVat);
      }

      item._computed = {
        unitExclVat,
        totalExclVat,
        unitWithVat,
        totalWithVat,
        vatRate,
        vatAmount
      };

      itemsAmount += totalWithVat;
      totalVatAmount += vatAmount;
    }

    const totalAmount = Math.max(0, itemsAmount + otherExpenses - discountAmount);
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    // 2. Insert purchase header (entry date is auto-managed by database created_at)
    const [purchase] = await db
      .insert(purchases)
      .values({
        userId,
        supplierId,
        manufacturerId,
        challanTypeId,
        challanNumber,
        challanDate,
        vatMode,
        itemsAmount: String(itemsAmount.toFixed(2)),
        totalVatAmount: String(totalVatAmount.toFixed(2)),
        otherExpenses: String(otherExpenses.toFixed(2)),
        discountAmount: String(discountAmount.toFixed(2)),
        totalAmount: String(totalAmount.toFixed(2)),
        paidAmount: String(paidAmount.toFixed(2)),
        dueAmount: String(dueAmount.toFixed(2)),
        paymentMethod,
        status: dueAmount > 0 ? "partial" : "completed",
        notes
      })
      .returning();

    // 3. Process line items with Landed Unit Cost & 14-digit pure numeric code
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yymm = `${yy}${mm}`;

    const createdItems = [];

    for (const item of rawItems) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const comp = item._computed || {};
      const lineTotal = comp.totalWithVat || Math.max(0, Number(item.totalPrice) || 0);

      // Landed cost proportional distribution:
      const netExtra = otherExpenses - discountAmount;
      const itemExtra = itemsAmount > 0 ? (lineTotal / itemsAmount) * netExtra : 0;
      const finalLineCost = Math.max(0, lineTotal + itemExtra);
      const unitCost = Number((finalLineCost / qty).toFixed(2));

      const itemName = (item.name || "").trim();
      const categoryId = item.categoryId ? Number(item.categoryId) : null;
      const subCategoryId = item.subCategoryId ? Number(item.subCategoryId) : null;
      const brandId = item.brandId ? Number(item.brandId) : null;
      if (!brandId) {
        return c.json({ message: `"${itemName || 'পণ্য'}" এর জন্য ব্র্যান্ড নির্বাচন করা বাধ্যতামূলক` }, HttpStatusCodes.BAD_REQUEST);
      }
      const sizeId = item.sizeId ? Number(item.sizeId) : null;
      const colorId = item.colorId ? Number(item.colorId) : null;
      const unitId = item.unitId ? Number(item.unitId) : null;

      // Barcode: If user provided/customized a code from frontend, use it. Otherwise auto-generate 14-digit
      let code = (item.code || "").trim();
      if (!code) {
        // 14-digit code: Category(2) + SubCategory(2) + Brand(2) + Size(2) + YYMM(4) + Batch(2)
        const catStr = String(categoryId || 0).padStart(2, "0").slice(-2);
        const subStr = String(subCategoryId || 0).padStart(2, "0").slice(-2);
        const brandStr = String(brandId || 0).padStart(2, "0").slice(-2);
        const sizeStr = String(sizeId || 0).padStart(2, "0").slice(-2);

        const existingCountRes = await db.execute(sql`
          SELECT count(*)::int as count 
          FROM "purchase_items" 
          WHERE "category_id" = ${categoryId}
            AND "sub_category_id" = ${subCategoryId}
            AND "brand_id" IS NOT DISTINCT FROM ${brandId}
            AND "size_id" = ${sizeId}
            AND "code" LIKE ${`%${yymm}%`}
        `);
        const existingCount = Number((existingCountRes.rows || existingCountRes)[0]?.count || 0);
        const batchSerial = String(existingCount + 1).padStart(2, "0").slice(-2);
        code = `${catStr}${subStr}${brandStr}${sizeStr}${yymm}${batchSerial}`;
      }

      // Create or update item in items table to increment stock and set purchase price
      let itemId = item.itemId ? Number(item.itemId) : null;
      const sellingPriceNum = item.sellingPrice !== undefined && item.sellingPrice !== null && !isNaN(Number(item.sellingPrice))
        ? Math.max(0, Number(item.sellingPrice))
        : 0;
      const sellingPriceVal = String(sellingPriceNum.toFixed(2));

      if (itemId) {
        const [existingItem] = await db.select().from(items).where(and(eq(items.id, itemId), eq(items.userId, userId)));
        if (existingItem) {
          await db
            .update(items)
            .set({
              stockQuantity: existingItem.stockQuantity + qty,
              purchasePrice: String(unitCost),
              sellingPrice: sellingPriceVal,
              updatedAt: new Date()
            })
            .where(eq(items.id, itemId));
        }
      } else {
        // Create new inventory item
        const [newItem] = await db
          .insert(items)
          .values({
            userId,
            name: itemName,
            code,
            categoryId,
            subCategoryId,
            brandId,
            sizeId,
            colorId,
            unitId,
            supplierId,
            manufacturerId,
            purchasePrice: String(unitCost),
            sellingPrice: sellingPriceVal,
            stockQuantity: qty,
            isActive: true
          })
          .returning();
        itemId = newItem.id;
      }

      // Insert purchase item record with all 21 audit/accounting fields
      const [pItem] = await db
        .insert(purchaseItems)
        .values({
          purchaseId: purchase.id,
          itemId,
          name: itemName,
          categoryId,
          subCategoryId,
          brandId,
          sizeId,
          colorId,
          unitId,
          quantity: qty,
          unitPriceExclVat: String((comp.unitExclVat ?? 0).toFixed(2)),
          vatRate: String((comp.vatRate ?? 0).toFixed(2)),
          vatAmount: String((comp.vatAmount ?? 0).toFixed(2)),
          unitPriceWithVat: String((comp.unitWithVat ?? 0).toFixed(2)),
          totalPrice: String(lineTotal.toFixed(2)),
          allocatedExpense: String(itemExtra.toFixed(2)),
          unitCost: String(unitCost.toFixed(2)),
          sellingPrice: sellingPriceVal,
          code
        })
        .returning();

      createdItems.push(pItem);
    }

    return c.json(
      {
        message: "নতুন ক্রয় চালান সফলভাবে সংরক্ষিত হয়েছে এবং স্টক আপডেট হয়েছে",
        data: {
          ...purchase,
          items: createdItems
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create purchase error:", error);
    return c.json({ message: "ক্রয় চালান সংরক্ষণ করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updatePurchase: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const purchaseId = Number(c.req.param("id"));
  if (isNaN(purchaseId)) return c.json({ message: "অবৈধ চালান আইডি" }, HttpStatusCodes.BAD_REQUEST);

  try {
    const [existingPurchase] = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.id, purchaseId), eq(purchases.userId, userId)));

    if (!existingPurchase) {
      return c.json({ message: "ক্রয় চালান পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const body = await c.req.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (rawItems.length === 0) {
      return c.json({ message: "চালানে অন্তত একটি পণ্য যোগ করুন" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const challanTypeId = body.challanTypeId ? Number(body.challanTypeId) : null;
    const supplierId = body.supplierId ? Number(body.supplierId) : null;
    const manufacturerId = body.manufacturerId ? Number(body.manufacturerId) : null;
    const challanNumber = (body.challanNumber || "").trim();
    const challanDate = (body.challanDate || new Date().toISOString().split("T")[0]).trim();
    const otherExpenses = Math.max(0, Number(body.otherExpenses) || 0);
    const discountAmount = Math.max(0, Number(body.discountAmount) || 0);
    const paidAmount = Math.max(0, Number(body.paidAmount) || 0);

    const paymentMethod = paidAmount > 0 && body.paymentMethod ? String(body.paymentMethod).trim() : null;
    const notes = body.notes ? body.notes.trim() : null;

    const vatMode = (body.vatMode || "excl").trim().toLowerCase() === "incl" ? "incl" : "excl";

    // Revert stock for existing purchase items
    const oldPItems = await db
      .select()
      .from(purchaseItems)
      .where(eq(purchaseItems.purchaseId, purchaseId));

    for (const oldIt of oldPItems) {
      if (oldIt.itemId) {
        const [existingItem] = await db
          .select()
          .from(items)
          .where(and(eq(items.id, oldIt.itemId), eq(items.userId, userId)));
        if (existingItem) {
          const newQty = Math.max(0, existingItem.stockQuantity - oldIt.quantity);
          await db
            .update(items)
            .set({ stockQuantity: newQty, updatedAt: new Date() })
            .where(eq(items.id, oldIt.itemId));
        }
      }
    }

    // Delete old purchase items
    await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId));

    // Calculate items pricing, subtotal, and total vat
    let itemsAmount = 0;
    let totalVatAmount = 0;

    for (const item of rawItems) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unit = Number(item.unitPrice) || 0;
      const vatRate = Math.max(0, Number(item.vatRate) || 0);

      let unitWithVat = 0;
      let totalWithVat = 0;
      let unitExclVat = 0;
      let totalExclVat = 0;
      let vatAmount = 0;

      if (vatMode === "incl") {
        unitWithVat = unit;
        totalWithVat = Number((qty * unitWithVat).toFixed(2));
        unitExclVat = vatRate > 0 ? Number((unit / (1 + vatRate / 100)).toFixed(2)) : unit;
        totalExclVat = Number((qty * unitExclVat).toFixed(2));
        vatAmount = Number((totalWithVat - totalExclVat).toFixed(2));
      } else {
        unitExclVat = unit;
        totalExclVat = Number((qty * unitExclVat).toFixed(2));
        unitWithVat = Number((unit * (1 + vatRate / 100)).toFixed(2));
        totalWithVat = Number((qty * unitWithVat).toFixed(2));
        vatAmount = Number((totalWithVat - totalExclVat).toFixed(2));
      }

      if (item.unitPriceExclVat !== undefined && Number(item.unitPriceExclVat) > 0) {
        unitExclVat = Number(item.unitPriceExclVat);
      }
      if (item.unitPriceWithVat !== undefined && Number(item.unitPriceWithVat) > 0) {
        unitWithVat = Number(item.unitPriceWithVat);
      }

      item._computed = {
        unitExclVat,
        totalExclVat,
        unitWithVat,
        totalWithVat,
        vatRate,
        vatAmount
      };

      itemsAmount += totalWithVat;
      totalVatAmount += vatAmount;
    }

    const totalAmount = Math.max(0, itemsAmount + otherExpenses - discountAmount);
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    // Update purchase header
    const [updatedPurchase] = await db
      .update(purchases)
      .set({
        supplierId,
        manufacturerId,
        challanTypeId,
        challanNumber,
        challanDate,
        vatMode,
        itemsAmount: String(itemsAmount.toFixed(2)),
        totalVatAmount: String(totalVatAmount.toFixed(2)),
        otherExpenses: String(otherExpenses.toFixed(2)),
        discountAmount: String(discountAmount.toFixed(2)),
        totalAmount: String(totalAmount.toFixed(2)),
        paidAmount: String(paidAmount.toFixed(2)),
        dueAmount: String(dueAmount.toFixed(2)),
        paymentMethod,
        status: dueAmount > 0 ? "partial" : "completed",
        notes,
        updatedAt: new Date()
      })
      .where(and(eq(purchases.id, purchaseId), eq(purchases.userId, userId)))
      .returning();

    // Process line items with Landed Unit Cost
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yymm = `${yy}${mm}`;

    const createdItems = [];

    for (const item of rawItems) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const comp = item._computed || {};
      const lineTotal = comp.totalWithVat || Math.max(0, Number(item.totalPrice) || 0);

      const netExtra = otherExpenses - discountAmount;
      const itemExtra = itemsAmount > 0 ? (lineTotal / itemsAmount) * netExtra : 0;
      const finalLineCost = Math.max(0, lineTotal + itemExtra);
      const unitCost = Number((finalLineCost / qty).toFixed(2));

      const itemName = (item.name || "").trim();
      const categoryId = item.categoryId ? Number(item.categoryId) : null;
      const subCategoryId = item.subCategoryId ? Number(item.subCategoryId) : null;
      const brandId = item.brandId ? Number(item.brandId) : null;
      if (!brandId) {
        return c.json(
          { message: `"${itemName || 'পণ্য'}" এর জন্য ব্র্যান্ড নির্বাচন করা বাধ্যতামূলক` },
          HttpStatusCodes.BAD_REQUEST
        );
      }
      const sizeId = item.sizeId ? Number(item.sizeId) : null;
      const colorId = item.colorId ? Number(item.colorId) : null;
      const unitId = item.unitId ? Number(item.unitId) : null;

      let code = (item.code || "").trim();
      if (!code) {
        const catStr = String(categoryId || 0).padStart(2, "0").slice(-2);
        const subStr = String(subCategoryId || 0).padStart(2, "0").slice(-2);
        const brandStr = String(brandId || 0).padStart(2, "0").slice(-2);
        const sizeStr = String(sizeId || 0).padStart(2, "0").slice(-2);

        const existingCountRes = await db.execute(sql`
          SELECT count(*)::int as count 
          FROM "purchase_items" 
          WHERE "category_id" = ${categoryId}
            AND "sub_category_id" = ${subCategoryId}
            AND "brand_id" IS NOT DISTINCT FROM ${brandId}
            AND "size_id" = ${sizeId}
            AND "code" LIKE ${`%${yymm}%`}
        `);
        const existingCount = Number((existingCountRes.rows || existingCountRes)[0]?.count || 0);
        const batchSerial = String(existingCount + 1).padStart(2, "0").slice(-2);
        code = `${catStr}${subStr}${brandStr}${sizeStr}${yymm}${batchSerial}`;
      }

      let itemId = item.itemId ? Number(item.itemId) : null;
      const sellingPriceNum = item.sellingPrice !== undefined && item.sellingPrice !== null && !isNaN(Number(item.sellingPrice))
        ? Math.max(0, Number(item.sellingPrice))
        : 0;
      const sellingPriceVal = String(sellingPriceNum.toFixed(2));

      if (itemId) {
        const [existingItem] = await db.select().from(items).where(and(eq(items.id, itemId), eq(items.userId, userId)));
        if (existingItem) {
          await db
            .update(items)
            .set({
              stockQuantity: existingItem.stockQuantity + qty,
              purchasePrice: String(unitCost),
              sellingPrice: sellingPriceVal,
              updatedAt: new Date()
            })
            .where(eq(items.id, itemId));
        }
      } else {
        const [newItem] = await db
          .insert(items)
          .values({
            userId,
            name: itemName,
            code,
            categoryId,
            subCategoryId,
            brandId,
            sizeId,
            colorId,
            unitId,
            supplierId,
            manufacturerId,
            purchasePrice: String(unitCost),
            sellingPrice: sellingPriceVal,
            stockQuantity: qty,
            isActive: true
          })
          .returning();
        itemId = newItem.id;
      }

      const [pItem] = await db
        .insert(purchaseItems)
        .values({
          purchaseId,
          itemId,
          name: itemName,
          categoryId,
          subCategoryId,
          brandId,
          sizeId,
          colorId,
          unitId,
          quantity: qty,
          unitPriceExclVat: String((comp.unitExclVat ?? 0).toFixed(2)),
          vatRate: String((comp.vatRate ?? 0).toFixed(2)),
          vatAmount: String((comp.vatAmount ?? 0).toFixed(2)),
          unitPriceWithVat: String((comp.unitWithVat ?? 0).toFixed(2)),
          totalPrice: String(lineTotal.toFixed(2)),
          allocatedExpense: String(itemExtra.toFixed(2)),
          unitCost: String(unitCost.toFixed(2)),
          sellingPrice: sellingPriceVal,
          code
        })
        .returning();

      createdItems.push(pItem);
    }

    return c.json(
      {
        message: "ক্রয় চালান সফলভাবে আপডেট করা হয়েছে এবং স্টক সমন্বয় করা হয়েছে",
        data: {
          ...updatedPurchase,
          items: createdItems
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Update purchase error:", error);
    return c.json({ message: "ক্রয় চালান আপডেট করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deletePurchase: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const purchaseId = Number(c.req.param("id"));
  if (isNaN(purchaseId)) return c.json({ message: "অবৈধ চালান আইডি" }, HttpStatusCodes.BAD_REQUEST);

  try {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.id, purchaseId), eq(purchases.userId, userId)));

    if (!purchase) {
      return c.json({ message: "ক্রয় চালান পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    // Revert stock for all purchase items
    const pItems = await db
      .select()
      .from(purchaseItems)
      .where(eq(purchaseItems.purchaseId, purchaseId));

    for (const pItem of pItems) {
      if (pItem.itemId) {
        const [existingItem] = await db
          .select()
          .from(items)
          .where(and(eq(items.id, pItem.itemId), eq(items.userId, userId)));

        if (existingItem) {
          const newQty = Math.max(0, existingItem.stockQuantity - pItem.quantity);
          await db
            .update(items)
            .set({ stockQuantity: newQty, updatedAt: new Date() })
            .where(eq(items.id, pItem.itemId));
        }
      }
    }

    // Delete purchase items & purchase
    await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId));
    await db.delete(purchases).where(eq(purchases.id, purchaseId));

    return c.json({ message: "ক্রয় চালান সফলভাবে মুছে ফেলা হয়েছে এবং স্টক সমন্বয় করা হয়েছে" }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Delete purchase error:", error);
    return c.json({ message: "ক্রয় চালান মুছতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get Media Configuration (Current Superadmin settings)
 */
export const getMediaConfig: Handler = async (c: any) => {
  try {
    const rows = await db.select().from(settings).where(eq(settings.group, "media"));
    const config: Record<string, any> = {};
    for (const r of rows) {
      if (r.key) config[r.key] = r.value;
    }
    return c.json({
      data: {
        uploadMode: config.media_upload_mode || "both",
        maxSizeMb: Number(config.media_max_size_mb) || 2,
        allowedFormats: config.media_allowed_formats || "jpg,jpeg,png,webp"
      }
    }, HttpStatusCodes.OK);
  } catch (err) {
    return c.json({
      data: {
        uploadMode: "both",
        maxSizeMb: 2,
        allowedFormats: "jpg,jpeg,png,webp"
      }
    }, HttpStatusCodes.OK);
  }
};

/**
 * Upload Image (Direct file upload)
 * Checks Superadmin media settings before proceeding
 */
export const uploadMediaImage: Handler = async (c: any) => {
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  // Check superadmin media settings
  const mediaSettingsRows = await db.select().from(settings).where(eq(settings.group, "media"));
  const mediaConfig: Record<string, string> = {};
  for (const row of mediaSettingsRows) {
    if (row.key && row.value) mediaConfig[row.key] = row.value;
  }

  const uploadMode = mediaConfig.media_upload_mode || "both";
  if (uploadMode === "google_drive") {
    return c.json(
      { message: "সুপারএডমিন সরাসরি ফাইল আপলোড বন্ধ রেখেছেন। শুধুমাত্র গুগল ড্রাইভ বা ওয়েব লিংক ব্যবহার করুন।" },
      HttpStatusCodes.FORBIDDEN
    );
  }

  const maxMb = Number(mediaConfig.media_max_size_mb || 2);
  const allowedFormats = (mediaConfig.media_allowed_formats || "jpg,jpeg,png,webp").split(",").map((s) => s.trim().toLowerCase());

  try {
    const body = await c.req.parseBody();
    const file = body["file"] as File | undefined;
    if (!file || typeof file === "string") {
      return c.json({ message: "কোনো ফাইল সিলেক্ট করা হয়নি" }, HttpStatusCodes.BAD_REQUEST);
    }

    if (file.size > maxMb * 1024 * 1024) {
      return c.json({ message: `ফাইলের সাইজ সর্বোচ্চ ${maxMb}MB হতে পারবে` }, HttpStatusCodes.BAD_REQUEST);
    }

    const origName = file.name || "image.jpg";
    const ext = path.extname(origName).replace(".", "").toLowerCase() || "jpg";
    if (!allowedFormats.includes(ext)) {
      return c.json({ message: `অনুমোদিত ফরম্যাট: ${allowedFormats.join(", ")}` }, HttpStatusCodes.BAD_REQUEST);
    }

    const uniqueName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadDir = path.resolve(process.cwd(), "src/storage/app/public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(path.join(uploadDir, uniqueName), buffer);

    const publicUrl = `/storage/uploads/${uniqueName}`;
    return c.json({
      message: "ছবি সফলভাবে আপলোড হয়েছে",
      data: { url: publicUrl, filename: uniqueName }
    }, HttpStatusCodes.OK);
  } catch (err: any) {
    console.error("Upload image error:", err);
    return c.json({ message: "ছবি আপলোড করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update Purchase Attachments (Document URL & Product Image URLs)
 */
export const updatePurchaseAttachments: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const purchaseId = Number(c.req.param("id"));
  if (isNaN(purchaseId)) return c.json({ message: "ভুল চালান আইডি" }, HttpStatusCodes.BAD_REQUEST);

  try {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.id, purchaseId), eq(purchases.userId, userId)));

    if (!purchase) {
      return c.json({ message: "ক্রয় চালান পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const body = await c.req.json();
    const documentUrl = body.documentUrl !== undefined ? (body.documentUrl ? String(body.documentUrl).trim() : null) : undefined;
    const itemImages = Array.isArray(body.itemImages) ? body.itemImages : [];

    // 1. Update purchase document_url if provided
    if (documentUrl !== undefined) {
      await db
        .update(purchases)
        .set({ documentUrl, updatedAt: new Date() })
        .where(eq(purchases.id, purchaseId));
    }

    // 2. Update each item's image_url
    for (const it of itemImages) {
      if (it.itemId) {
        const img = it.imageUrl ? String(it.imageUrl).trim() : null;
        await db
          .update(items)
          .set({ imageUrl: img, updatedAt: new Date() })
          .where(and(eq(items.id, Number(it.itemId)), eq(items.userId, userId)));
      }
    }

    return c.json({ message: "ছবি ও ডকুমেন্টস সফলভাবে সংরক্ষিত হয়েছে" }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Update purchase attachments error:", error);
    return c.json({ message: "সংযুক্তি সংরক্ষণ করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 7. Item Pricing Controllers (মূল্য নির্ধারণ ব্যবস্থাপনা)
 * ----------------------------------------------------------- */
export const listItemPricings: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  try {
    const list = await db.query.itemPricings.findMany({
      where: eq(itemPricings.userId, userId),
      orderBy: desc(itemPricings.id),
      with: {
        item: {
          with: {
            category: true,
            subCategory: true,
            brand: true,
            size: true,
            color: true,
            unit: true
          }
        }
      }
    });

    return c.json({ message: "Success", data: list }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("List item pricings error:", error);
    return c.json({ message: "মূল্য নির্ধারণ তালিকা লোড করা যায়নি" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const saveItemPricing: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  try {
    const body = await c.req.json();
    const itemId = Number(body.itemId);
    const sellingPrice = Number(body.sellingPrice);
    const effectiveDate = (body.effectiveDate || "").trim();
    const notes = (body.notes || "").trim();
    const pricingId = body.id ? Number(body.id) : null;

    if (!itemId || isNaN(itemId)) {
      return c.json({ message: "অনুগ্রহ করে পণ্য নির্বাচন করুন" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      return c.json({ message: "সঠিক বিক্রয়মূল্য লিখুন (০ এর বেশি হতে হবে)" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }
    if (!effectiveDate) {
      return c.json({ message: "কার্যকর করার তারিখ উল্লেখ করুন" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    // Verify item belongs to user
    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId)));

    if (!item) {
      return c.json({ message: "পণ্যটি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    // Find latest purchase information (challan date & landed unit cost)
    const [latestPurchase] = await db
      .select({
        challanDate: purchases.challanDate,
        unitCost: purchaseItems.unitCost
      })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
      .where(and(eq(purchaseItems.itemId, itemId), eq(purchases.userId, userId)))
      .orderBy(desc(purchases.id), desc(purchaseItems.id))
      .limit(1);

    const challanDate = body.challanDate || latestPurchase?.challanDate || null;
    const purchasePrice = latestPurchase?.unitCost ? String(Number(latestPurchase.unitCost).toFixed(2)) : (item.purchasePrice || "0");

    // VALIDATION: কার্যকর তারিখ ক্রয়ের চালানের তারিখের আগের হতে পারবে না
    if (challanDate) {
      const effD = new Date(effectiveDate).getTime();
      const challanD = new Date(challanDate).getTime();
      if (!isNaN(effD) && !isNaN(challanD) && effD < challanD) {
        return c.json(
          {
            message: `রেট কার্যকর করার তারিখ (${effectiveDate}) ক্রয়ের চালানের তারিখ (${challanDate}) এর আগের হতে পারবে না।`
          },
          HttpStatusCodes.UNPROCESSABLE_ENTITY
        );
      }
    }

    const vatRate = body.vatRate !== undefined && body.vatRate !== null ? String(Number(body.vatRate).toFixed(2)) : "0";
    const vatType = body.vatType || "inclusive";
    const discount = body.discount !== undefined && body.discount !== null ? String(Number(body.discount).toFixed(2)) : "0";
    const discountType = body.discountType === "fixed" ? "fixed" : "percent";

    let record: any = null;
    if (pricingId) {
      const [updated] = await db
        .update(itemPricings)
        .set({
          itemId,
          purchasePrice,
          sellingPrice: String(sellingPrice.toFixed(2)),
          effectiveDate,
          challanDate,
          vatRate,
          vatType,
          discount,
          discountType,
          notes,
          updatedAt: new Date()
        })
        .where(and(eq(itemPricings.id, pricingId), eq(itemPricings.userId, userId)))
        .returning();
      record = updated;
    } else {
      const [existing] = await db
        .select()
        .from(itemPricings)
        .where(and(eq(itemPricings.itemId, itemId), eq(itemPricings.userId, userId)))
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(itemPricings)
          .set({
            purchasePrice,
            sellingPrice: String(sellingPrice.toFixed(2)),
            effectiveDate,
            challanDate,
            vatRate,
            vatType,
            discount,
            discountType,
            notes,
            updatedAt: new Date()
          })
          .where(eq(itemPricings.id, existing.id))
          .returning();
        record = updated;
      } else {
        const [created] = await db
          .insert(itemPricings)
          .values({
            userId,
            itemId,
            purchasePrice,
            sellingPrice: String(sellingPrice.toFixed(2)),
            effectiveDate,
            challanDate,
            vatRate,
            vatType,
            discount,
            discountType,
            notes
          })
          .returning();
        record = created;
      }
    }

    // Sync items table
    await db
      .update(items)
      .set({
        sellingPrice: String(sellingPrice.toFixed(2)),
        purchasePrice,
        priceEffectiveDate: effectiveDate,
        discount,
        discountType,
        updatedAt: new Date()
      })
      .where(eq(items.id, itemId));

    return c.json(
      {
        message: "পণ্যের মূল্য নির্ধারণ সফলভাবে সংরক্ষিত হয়েছে",
        data: record
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Save item pricing error:", error);
    return c.json({ message: "মূল্য নির্ধারণ সংরক্ষণ করা যায়নি" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deleteItemPricing: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const id = Number(c.req.param("id"));
  if (!id) return c.json({ message: "আইডি পাওয়া যায়নি" }, HttpStatusCodes.BAD_REQUEST);

  try {
    const [record] = await db
      .select()
      .from(itemPricings)
      .where(and(eq(itemPricings.id, id), eq(itemPricings.userId, userId)));

    if (!record) {
      return c.json({ message: "রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    // Delete record from item_pricings
    await db.delete(itemPricings).where(eq(itemPricings.id, id));

    // Reset items sellingPrice & priceEffectiveDate
    if (record.itemId) {
      await db
        .update(items)
        .set({
          sellingPrice: "0",
          priceEffectiveDate: null,
          updatedAt: new Date()
        })
        .where(eq(items.id, record.itemId));
    }

    return c.json({ message: "মূল্য নির্ধারণ রেকর্ড সফলভাবে মুছে ফেলা হয়েছে", data: { id } }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Delete item pricing error:", error);
    return c.json({ message: "রেকর্ড মুছতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 8. Sales (পণ্য বিক্রয় ও পিওএস) CRUD
 */

export const listSales: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  try {
    const list = await db.query.sales.findMany({
      where: eq(sales.userId, userId),
      orderBy: [desc(sales.id)],
      with: {
        items: true,
        customer: true
      }
    });

    return c.json({ message: "Success", data: list }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("List sales error:", error);
    return c.json({ message: "বিক্রয় তালিকা লোড করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getSaleById: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const id = Number(c.req.param("id"));
  if (!id) return c.json({ message: "আইডি পাওয়া যায়নি" }, HttpStatusCodes.BAD_REQUEST);

  try {
    const sale = await db.query.sales.findFirst({
      where: and(eq(sales.id, id), eq(sales.userId, userId)),
      with: {
        items: true,
        customer: true
      }
    });

    if (!sale) {
      return c.json({ message: "বিক্রয় রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ message: "Success", data: sale }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Get sale error:", error);
    return c.json({ message: "বিক্রয় বিবরণ লোড করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

function formatInvoiceNumber(pattern: string, prefix: string, count: number): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const yy = yyyy.slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  let result = (pattern || "{PREFIX}-{YYYY}-{0001}").trim();
  result = result
    .replace(/\{PREFIX\}/gi, (prefix || "INV").trim().toUpperCase())
    .replace(/\{YYYY\}/gi, yyyy)
    .replace(/\{YY\}/gi, yy)
    .replace(/\{MM\}/gi, mm)
    .replace(/\{DD\}/gi, dd);

  const seqMatch = result.match(/\{(0+1|1)\}/);
  if (seqMatch) {
    const token = seqMatch[1];
    const width = token.length;
    const seqStr = String(count).padStart(width, "0");
    result = result.replace(seqMatch[0], seqStr);
  } else {
    result += `-${String(count).padStart(4, "0")}`;
  }

  return result;
}

export const createSale: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const body = await c.req.json();
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (rawItems.length === 0) {
    return c.json({ message: "কমপক্ষে একটি পণ্য যোগ করুন" }, HttpStatusCodes.BAD_REQUEST);
  }

  try {
    // 1. Get Logged-in User's name for Cashier / Salesperson
    // Requirement: "বিক্রেতা/ক্যাশিয়ার (Salesperson / Cashier): যে ডাটা এন্ট্রি করছে তার নাম বসবে।"
    const uRes = await db.execute(sql`SELECT name FROM "users" WHERE id = ${userId}`);
    const uRows: any[] = (uRes.rows || uRes) as any[];
    const cashierName = uRows[0]?.name || body.cashierName || "ক্যাশিয়ার";

    // 2. Generate Invoice Number according to company settings (invoicePattern, invoicePrefix, invoiceResetCycle)
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const settingsRow = await db.query.companySettings.findFirst({
      where: eq(companySettings.userId, userId)
    });
    const prefix = (settingsRow?.invoicePrefix || "INV").trim().toUpperCase();
    const pattern = (settingsRow?.invoicePattern || "{PREFIX}-{YYYY}-{0001}").trim();
    const resetCycle = settingsRow?.invoiceResetCycle || "yearly";

    let countQuery;
    if (resetCycle === "yearly") {
      const currentYear = now.getFullYear();
      countQuery = await db.execute(sql`
        SELECT count(*)::int as count 
        FROM "sales" 
        WHERE "user_id" = ${userId} 
          AND (
            "sale_date" LIKE ${`${currentYear}-%`} 
            OR EXTRACT(YEAR FROM "created_at") = ${currentYear}
          )
      `);
    } else {
      countQuery = await db.execute(sql`
        SELECT count(*)::int as count 
        FROM "sales" 
        WHERE "user_id" = ${userId}
      `);
    }
    const currentSeq = Number((countQuery.rows || countQuery)[0]?.count || 0) + 1;
    const autoInvoiceNumber = formatInvoiceNumber(pattern, prefix, currentSeq);

    let invoiceNumber = (body.invoiceNumber || "").trim();
    if (!invoiceNumber || invoiceNumber.startsWith("INV-261025-")) {
      invoiceNumber = autoInvoiceNumber;
    }

    const customerId = body.customerId ? Number(body.customerId) : null;
    const customerName = (body.customerName || "ওয়াকিং কাস্টমার").trim();
    const customerMobile = (body.customerMobile || "").trim();
    const saleDate = body.saleDate || `${now.getFullYear()}-${mm}-${dd}`;
    const subtotal = Math.max(0, Number(body.subtotal) || 0);
    const discountAmount = Math.max(0, Number(body.discountAmount) || 0);
    const vatAmount = Math.max(0, Number(body.vatAmount) || 0);
    const totalAmount = Math.max(0, Number(body.totalAmount) || Math.max(0, subtotal - discountAmount + vatAmount));
    const paidAmount = Math.max(0, Number(body.paidAmount) || 0);
    const changeAmount = Math.max(0, Number(body.changeAmount) || (paidAmount > totalAmount ? paidAmount - totalAmount : 0));
    const dueAmount = Math.max(0, Number(body.dueAmount) || (totalAmount > paidAmount ? totalAmount - paidAmount : 0));
    const paymentMethod = body.paymentMethod || "cash";
    const transactionId = (body.transactionId || "").trim();
    const vatMode = (body.vatMode === "exclusive" ? "exclusive" : "inclusive");
    const isDraft = body.isDraft === true || body.status === "draft";
    const status = isDraft ? "draft" : (dueAmount > 0 ? (paidAmount > 0 ? "partial" : "due") : "completed");
    const notes = body.notes || "";

    // 3. Insert Sale Header
    const [createdSale] = await db
      .insert(sales)
      .values({
        userId,
        customerId,
        customerName,
        customerMobile,
        cashierName,
        invoiceNumber,
        saleDate,
        subtotal: String(subtotal.toFixed(2)),
        discountAmount: String(discountAmount.toFixed(2)),
        vatAmount: String(vatAmount.toFixed(2)),
        totalAmount: String(totalAmount.toFixed(2)),
        paidAmount: String(paidAmount.toFixed(2)),
        changeAmount: String(changeAmount.toFixed(2)),
        dueAmount: String(dueAmount.toFixed(2)),
        paymentMethod,
        transactionId: transactionId || null,
        vatMode,
        status,
        notes
      })
      .returning();

    // 4. Insert Sale Items and Deduct Stock Quantity
    const createdSaleItems = [];
    for (const item of rawItems) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const unitCost = Math.max(0, Number(item.unitCost) || 0);
      const lineDiscount = Math.max(0, Number(item.discountAmount) || 0);

      // Fetch latest vatRate from item_pricings if not supplied
      let vatRate = Number(item.vatRate || 0);
      if (item.itemId && (item.vatRate === undefined || item.vatRate === null)) {
        const [latestPricing] = await db
          .select({ vatRate: itemPricings.vatRate })
          .from(itemPricings)
          .where(and(eq(itemPricings.userId, userId), eq(itemPricings.itemId, Number(item.itemId))))
          .orderBy(desc(itemPricings.id))
          .limit(1);
        if (latestPricing && latestPricing.vatRate !== null) {
          vatRate = Number(latestPricing.vatRate);
        }
      }

      // Calculate VAT according to vatMode (inclusive vs exclusive)
      const base = Math.max(0, unitPrice * qty - lineDiscount);
      let lineVatAmount = 0;
      let lineTotalPrice = 0;

      if (vatMode === "inclusive") {
        // Price includes VAT: VAT is already inside base amount
        lineVatAmount = vatRate > 0 ? Number((base - (base / (1 + vatRate / 100))).toFixed(2)) : 0;
        lineTotalPrice = Number(base.toFixed(2));
      } else {
        // Price excludes VAT: VAT is added on top of base amount
        lineVatAmount = vatRate > 0 ? Number((base * (vatRate / 100)).toFixed(2)) : 0;
        lineTotalPrice = Number((base + lineVatAmount).toFixed(2));
      }

      const [sItem] = await db
        .insert(saleItems)
        .values({
          saleId: createdSale.id,
          itemId: item.itemId ? Number(item.itemId) : null,
          barcode: item.barcode || null,
          name: item.name || "নামহীন পণ্য",
          categoryName: item.categoryName || item.category?.name || null,
          brandName: item.brandName || item.brand?.name || null,
          sizeName: item.sizeName || item.size?.name || null,
          colorName: item.colorName || item.color?.name || null,
          quantity: qty,
          unitCost: String(unitCost.toFixed(2)),
          unitPrice: String(unitPrice.toFixed(2)),
          vatRate: String(vatRate),
          vatAmount: String(lineVatAmount.toFixed(2)),
          discountAmount: String(lineDiscount.toFixed(2)),
          totalPrice: String(lineTotalPrice.toFixed(2))
        })
        .returning();

      createdSaleItems.push(sItem);

      // Deduct stock quantity in items table only if not draft
      if (!isDraft && item.itemId) {
        await db.execute(sql`
          UPDATE "items"
          SET "stock_quantity" = GREATEST(0, "stock_quantity" - ${qty}),
              "updated_at" = now()
          WHERE "id" = ${Number(item.itemId)} AND "user_id" = ${userId}
        `);
      }
    }

    return c.json(
      {
        message: isDraft ? "বিক্রয় চালান ড্রাফট হিসেবে সংরক্ষিত হয়েছে" : "পণ্য বিক্রয় সফলভাবে সম্পন্ন হয়েছে",
        data: {
          ...createdSale,
          items: createdSaleItems
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create sale error:", error);
    return c.json({ message: "বিক্রয় সম্পন্ন করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deleteSale: Handler = async (c: any) => {
  await ensureInventoryTables();
  const userId = getUserId(c);
  if (!userId) return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);

  const id = Number(c.req.param("id"));
  if (!id) return c.json({ message: "আইডি পাওয়া যায়নি" }, HttpStatusCodes.BAD_REQUEST);

  try {
    const sale = await db.query.sales.findFirst({
      where: and(eq(sales.id, id), eq(sales.userId, userId)),
      with: { items: true }
    });

    if (!sale) {
      return c.json({ message: "বিক্রয় রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    // Restore stock quantities only if not draft
    if (sale.status !== "draft" && Array.isArray(sale.items)) {
      for (const item of sale.items) {
        if (item.itemId) {
          await db.execute(sql`
            UPDATE "items"
            SET "stock_quantity" = "stock_quantity" + ${item.quantity},
                "updated_at" = now()
            WHERE "id" = ${item.itemId} AND "user_id" = ${userId}
          `);
        }
      }
    }

    await db.delete(sales).where(eq(sales.id, id));

    return c.json({ message: "বিক্রয় চালান সফলভাবে মুছে ফেলা হয়েছে", data: { id } }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Delete sale error:", error);
    return c.json({ message: "বিক্রয় রেকর্ড মুছতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};


