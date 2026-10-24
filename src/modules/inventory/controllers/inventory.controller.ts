import { and, desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import {
  brands,
  customers,
  items,
  manufacturers,
  purchases,
  purchaseItems,
  sales,
  suppliers
} from "@/modules/inventory/database/models/inventory.js";
import { companySettings } from "@/modules/company/database/models/company.js";
import { challanTypes } from "@/modules/catalog/database/models/catalog.js";

let inventoryTablesEnsured = false;
export async function ensureInventoryTables() {
  if (inventoryTablesEnsured) return;
  try {
    await db.execute(sql`
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
      )
    `);

    await db.execute(sql`
      ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "categories"("id") ON DELETE SET NULL;
      ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE SET NULL;
      ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
    `);

    await db.execute(sql`
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
      )
    `);

    await db.execute(sql`
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
      )
    `);

    await db.execute(sql`
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "mobile" varchar(50);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "contact_person" varchar(150);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "contacts" jsonb;
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "owner_name" varchar(150);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "owner_mobile" varchar(50);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "manager_name" varchar(150);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "manager_mobile" varchar(50);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "contacts" jsonb;
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "owner_name" varchar(150);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "owner_mobile" varchar(50);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "manager_name" varchar(150);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "manager_mobile" varchar(50);
      ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "vendor_type" varchar(100);
      ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "vendor_type" varchar(100);
    `);

    await db.execute(sql`
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
      )
    `);

    await db.execute(sql`
      ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "alt_mobile" varchar(50);
    `);

    await db.execute(sql`
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
      )
    `);

    await db.execute(sql`
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
      )
    `);

    await db.execute(sql`
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "manufacturer_id" integer REFERENCES "manufacturers"("id") ON DELETE SET NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "challan_type_id" integer REFERENCES "challan_types"("id") ON DELETE SET NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "challan_number" varchar(100);
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "challan_date" varchar(50);
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "items_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "other_expenses" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL;
      ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "payment_method" varchar(50) DEFAULT 'cash' NOT NULL;
    `);

    await db.execute(sql`
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
    `);

    await db.execute(sql`
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
      )
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

  // Name is strictly NOT modified on edit
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

  // Name is strictly NOT modified on edit
  if (body.mobile !== undefined) updateData.mobile = (body.mobile || "").trim() || null;
  if (body.address !== undefined || body.factoryAddress !== undefined) {
    updateData.factoryAddress = (body.address || body.factoryAddress || "").trim() || null;
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

  return c.json({ message: "Success", data: list }, HttpStatusCodes.OK);
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
  // Note: Customer name is immutable on edit; intentionally ignored.

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
    const paymentMethod = (body.paymentMethod || "cash").trim();
    const notes = body.notes ? body.notes.trim() : null;

    const otherExpenses = Math.max(0, Number(body.otherExpenses) || 0);
    const discountAmount = Math.max(0, Number(body.discountAmount) || 0);
    const paidAmount = Math.max(0, Number(body.paidAmount) || 0);

    // 1. Calculate items subtotal
    let itemsAmount = 0;
    for (const item of rawItems) {
      const lineTotal = Math.max(0, Number(item.totalPrice) || 0);
      itemsAmount += lineTotal;
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
        itemsAmount: String(itemsAmount.toFixed(2)),
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
      const lineTotal = Math.max(0, Number(item.totalPrice) || 0);

      // Landed cost proportional distribution:
      const netExtra = otherExpenses - discountAmount;
      const itemExtra = itemsAmount > 0 ? (lineTotal / itemsAmount) * netExtra : 0;
      const finalLineCost = Math.max(0, lineTotal + itemExtra);
      const unitCost = Number((finalLineCost / qty).toFixed(2));

      const categoryId = item.categoryId ? Number(item.categoryId) : null;
      const subCategoryId = item.subCategoryId ? Number(item.subCategoryId) : null;
      const brandId = item.brandId ? Number(item.brandId) : null;
      const sizeId = item.sizeId ? Number(item.sizeId) : null;
      const colorId = item.colorId ? Number(item.colorId) : null;
      const unitId = item.unitId ? Number(item.unitId) : null;
      const itemName = (item.name || "").trim();

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
            AND "brand_id" = ${brandId}
            AND "size_id" = ${sizeId}
            AND "code" LIKE ${`%${yymm}%`}
        `);
        const existingCount = Number((existingCountRes.rows || existingCountRes)[0]?.count || 0);
        const batchSerial = String(existingCount + 1).padStart(2, "0").slice(-2);
        code = `${catStr}${subStr}${brandStr}${sizeStr}${yymm}${batchSerial}`;
      }

      // Create or update item in items table to increment stock and set purchase price
      let itemId = item.itemId ? Number(item.itemId) : null;
      if (itemId) {
        const [existingItem] = await db.select().from(items).where(and(eq(items.id, itemId), eq(items.userId, userId)));
        if (existingItem) {
          await db
            .update(items)
            .set({
              stockQuantity: existingItem.stockQuantity + qty,
              purchasePrice: String(unitCost),
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
            stockQuantity: qty,
            isActive: true
          })
          .returning();
        itemId = newItem.id;
      }

      // Insert purchase item record
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
          totalPrice: String(lineTotal.toFixed(2)),
          unitCost: String(unitCost.toFixed(2)),
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


