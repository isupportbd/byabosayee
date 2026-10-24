import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import {
  categories,
  colors,
  fabricTypes,
  productTypes,
  sizeGroups,
  sizes,
  subCategories,
  units,
  challanTypes,
  vendorTypes,
  paymentMethods
} from "@/modules/catalog/database/models/catalog.js";

let paymentMethodsTableEnsured = false;
export async function ensurePaymentMethodsTable() {
  if (paymentMethodsTableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "payment_methods" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "code" varchar(50),
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    const existing = await db.select().from(paymentMethods).limit(1);
    if (existing.length === 0) {
      await db.insert(paymentMethods).values([
        { name: "নগদ / ক্যাশ (Cash)", code: "cash", description: "সরাসরি নগদ অর্থ লেনদেন", isActive: true },
        { name: "বিকাশ (bKash)", code: "bkash", description: "বিকাশ মোবাইল ব্যাংকিং লেনদেন", isActive: true },
        { name: "নগদ (Nagad)", code: "nagad", description: "নগদ মোবাইল ব্যাংকিং লেনদেন", isActive: true },
        { name: "রকেট (Rocket)", code: "rocket", description: "রকেট মোবাইল ব্যাংকিং লেনদেন", isActive: true },
        { name: "ব্যাংক ট্রান্সফার (Bank)", code: "bank", description: "ব্যাংক অ্যাকাউন্ট ও অনলাইন ট্রান্সফার", isActive: true }
      ]);
    }
    paymentMethodsTableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure payment_methods table:", e);
  }
}

let productTypesTableEnsured = false;
export async function ensureProductTypesTable() {
  if (productTypesTableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "product_types" (
        "id" serial PRIMARY KEY NOT NULL,
        "category_id" integer NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
        "sub_category_id" integer NOT NULL REFERENCES "sub_categories"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    productTypesTableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure product_types table:", e);
  }
}

let sizesColumnsEnsured = false;
export async function ensureSizesTableColumns() {
  if (sizesColumnsEnsured) return;
  try {
    await db.execute(sql`
      ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE;
      ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE CASCADE;
      ALTER TABLE "sizes" ALTER COLUMN "size_group_id" DROP NOT NULL;
    `);
    sizesColumnsEnsured = true;
  } catch (e) {
    console.error("Failed to alter sizes table columns:", e);
  }
}

let challanTypesTableEnsured = false;
export async function ensureChallanTypesTable() {
  if (challanTypesTableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "challan_types" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "code" varchar(50),
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    const existing = await db.select().from(challanTypes).limit(1);
    if (existing.length === 0) {
      await db.insert(challanTypes).values([
        { name: "ডেলিভারি চালান", code: "DELIVERY", description: "সাধারণ বা পণ্য ডেলিভারি চালান", isActive: true },
        { name: "মূসক ৬.৩", code: "MUSHAK_6_3", description: "জাতীয় রাজস্ব বোর্ডের নির্ধারিত ভ্যাট চালানপত্র (মূসক-৬.৩)", isActive: true },
        { name: "বিল অব এন্ট্রি", code: "BILL_OF_ENTRY", description: "আমদানিকৃত পণ্যের কাস্টমস বিল অব এন্ট্রি চালান", isActive: true }
      ]);
    }
    challanTypesTableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure challan_types table:", e);
  }
}

let vendorTypesTableEnsured = false;
export async function ensureVendorTypesTable() {
  if (vendorTypesTableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vendor_types" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "code" varchar(50),
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    const existing = await db.select().from(vendorTypes).limit(1);
    if (existing.length === 0) {
      await db.insert(vendorTypes).values([
        { name: "সাপ্লায়ার", code: "supplier", description: "পণ্য বা কাঁচামাল সরবরাহকারী প্রতিষ্ঠান", isActive: true },
        { name: "প্রস্তুতকারী", code: "manufacturer", description: "পোশাক বা পণ্য উৎপাদন ও প্রস্তুতকারক প্রতিষ্ঠান", isActive: true },
        { name: "রপ্তানিকারক", code: "exporter", description: "আন্তর্জাতিক বা রফতানি/আমদানি সরবরাহকারী প্রতিষ্ঠান", isActive: true }
      ]);
    } else {
      const exporterExisting = await db
        .select()
        .from(vendorTypes)
        .where(sql`LOWER("name") LIKE '%রপ্তানি%' OR LOWER("code") LIKE '%export%'`)
        .limit(1);
      if (exporterExisting.length === 0) {
        await db.insert(vendorTypes).values([
          { name: "রপ্তানিকারক", code: "exporter", description: "আন্তর্জাতিক বা রফতানি/আমদানি সরবরাহকারী প্রতিষ্ঠান", isActive: true }
        ]);
      }
    }
    vendorTypesTableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure vendor_types table:", e);
  }
}

/**
 * Get all master data lists in one single request.
 * Perfect for initial load and cross-tab reactive state hydration.
 */
export const getMasterCatalog: Handler = async (c: any) => {
  try {
    await ensureProductTypesTable();
    await ensureSizesTableColumns();
    await ensureUnitsTableColumns();
    await ensureChallanTypesTable();
    await ensureVendorTypesTable();
    await ensurePaymentMethodsTable();
    const [allCategories, allSubCategories, allProductTypes, allSizeGroups, allSizes, allColors, allFabricTypes, allUnits, allChallanTypes, allVendorTypes, allPaymentMethods] =
      await Promise.all([
        db.select().from(categories).orderBy(desc(categories.id)),
        db.select().from(subCategories).orderBy(desc(subCategories.id)),
        db.select().from(productTypes).orderBy(desc(productTypes.id)),
        db.select().from(sizeGroups).orderBy(desc(sizeGroups.id)),
        db.select().from(sizes).orderBy(asc(sizes.sortOrder), asc(sizes.id)),
        db.select().from(colors).orderBy(desc(colors.id)),
        db.select().from(fabricTypes).orderBy(desc(fabricTypes.id)),
        db.select().from(units).orderBy(desc(units.id)),
        db.select().from(challanTypes).orderBy(asc(challanTypes.id)),
        db.select().from(vendorTypes).orderBy(asc(vendorTypes.id)),
        db.select().from(paymentMethods).orderBy(asc(paymentMethods.id))
      ]);

    // Group sizes under their parent size group
    const sizeGroupsWithSizes = allSizeGroups.map((group) => ({
      ...group,
      createdAt: group.createdAt ? String(group.createdAt) : null,
      sizes: allSizes
        .filter((s) => s.sizeGroupId === group.id)
        .map((s) => ({
          ...s,
          createdAt: s.createdAt ? String(s.createdAt) : null
        }))
    }));

    // Group sub-categories and materials under their parent category
    const categoriesWithData = allCategories.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt ? String(cat.createdAt) : null,
      subCategories: allSubCategories
        .filter((s) => s.categoryId === cat.id)
        .map((s) => ({
          ...s,
          createdAt: s.createdAt ? String(s.createdAt) : null
        })),
      materials: allFabricTypes
        .filter((f) => f.categoryId === cat.id)
        .map((f) => ({
          ...f,
          createdAt: f.createdAt ? String(f.createdAt) : null
        }))
    }));

    return c.json(
      {
        message: "Master catalog retrieved successfully",
        data: {
          categories: categoriesWithData,
          subCategories: allSubCategories.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          })),
          productTypes: allProductTypes.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          })),
          sizeGroups: sizeGroupsWithSizes,
          sizes: allSizes.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          })),
          colors: allColors.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          })),
          fabricTypes: allFabricTypes.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          })),
          units: allUnits.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          })),
          challanTypes: allChallanTypes.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          })),
          vendorTypes: allVendorTypes.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          })),
          paymentMethods: allPaymentMethods.map((item) => ({
            ...item,
            createdAt: item.createdAt ? String(item.createdAt) : null
          }))
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Get master catalog error:", error);
    return c.json({ message: "মাস্টার ডাটা লোড করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 1. Category Controllers (Slug completely removed)
 * ----------------------------------------------------------- */
export const listCategories: Handler = async (c: any) => {
  try {
    const list = await db.select().from(categories).orderBy(desc(categories.id));
    return c.json(
      {
        message: "ক্যাটাগরি তালিকা",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List categories error:", error);
    return c.json({ message: "ক্যাটাগরি তালিকা লোড ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createCategory: Handler = async (c: any) => {
  try {
    const body = c.req.valid("json");
    const name = body.name.trim();

    const existing = await db.query.categories.findFirst({
      where: sql`LOWER(TRIM(${categories.name})) = LOWER(TRIM(${name}))`
    });

    if (existing) {
      return c.json({ message: "এই নামের ক্যাটাগরি ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [created] = await db
      .insert(categories)
      .values({
        name,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "নতুন ক্যাটাগরি সফলভাবে যুক্ত হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null,
          subCategories: [],
          materials: []
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create category error:", error);
    return c.json({ message: "ক্যাটাগরি যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateCategory: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");
    const name = body.name.trim();

    const item = await db.query.categories.findFirst({
      where: eq(categories.id, id)
    });
    if (!item) {
      return c.json({ message: "ক্যাটাগরি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const duplicate = await db.query.categories.findFirst({
      where: and(ne(categories.id, id), sql`LOWER(TRIM(${categories.name})) = LOWER(TRIM(${name}))`)
    });
    if (duplicate) {
      return c.json({ message: "এই নামের ক্যাটাগরি ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [updated] = await db
      .update(categories)
      .set({ name, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return c.json({
      message: "ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে",
      data: {
        ...updated,
        createdAt: updated.createdAt ? String(updated.createdAt) : null
      }
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Update category error:", error);
    return c.json({ message: "ক্যাটাগরি আপডেট করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 1.1 Sub-Category Controllers
 * ----------------------------------------------------------- */
export const listSubCategories: Handler = async (c: any) => {
  try {
    const list = await db.select().from(subCategories).orderBy(desc(subCategories.id));
    return c.json(
      {
        message: "সাব-ক্যাটাগরি তালিকা",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List sub categories error:", error);
    return c.json({ message: "সাব-ক্যাটাগরি তালিকা লোড ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createSubCategory: Handler = async (c: any) => {
  try {
    const body = c.req.valid("json");
    const name = body.name.trim();
    const categoryId = Number(body.categoryId);

    const cat = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId)
    });

    if (!cat) {
      return c.json({ message: "ক্যাটাগরি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const existing = await db.query.subCategories.findFirst({
      where: and(
        eq(subCategories.categoryId, categoryId),
        sql`LOWER(TRIM(${subCategories.name})) = LOWER(TRIM(${name}))`
      )
    });

    if (existing) {
      return c.json({ message: "এই ক্যাটাগরিতে এই সাব-ক্যাটাগরি ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [created] = await db
      .insert(subCategories)
      .values({
        categoryId,
        name,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "নতুন সাব-ক্যাটাগরি সফলভাবে যুক্ত হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create sub category error:", error);
    return c.json({ message: "সাব-ক্যাটাগরি যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateSubCategory: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");
    const name = body.name.trim();

    const item = await db.query.subCategories.findFirst({
      where: eq(subCategories.id, id)
    });
    if (!item) {
      return c.json({ message: "সাব-ক্যাটাগরি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const categoryId = body.categoryId ? Number(body.categoryId) : item.categoryId;

    const duplicate = await db.query.subCategories.findFirst({
      where: and(
        ne(subCategories.id, id),
        eq(subCategories.categoryId, categoryId),
        sql`LOWER(TRIM(${subCategories.name})) = LOWER(TRIM(${name}))`
      )
    });
    if (duplicate) {
      return c.json({ message: "এই ক্যাটাগরিতে এই সাব-ক্যাটাগরি ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [updated] = await db
      .update(subCategories)
      .set({ categoryId, name, updatedAt: new Date() })
      .where(eq(subCategories.id, id))
      .returning();

    return c.json({
      message: "সাব-ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে",
      data: {
        ...updated,
        createdAt: updated.createdAt ? String(updated.createdAt) : null
      }
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Update sub category error:", error);
    return c.json({ message: "সাব-ক্যাটাগরি আপডেট করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleSubCategoryStatus: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const item = await db.query.subCategories.findFirst({
      where: eq(subCategories.id, id)
    });

    if (!item) {
      return c.json({ message: "সাব-ক্যাটাগরি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(subCategories)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(subCategories.id, id))
      .returning();

    return c.json(
      {
        message: `সাব-ক্যাটাগরির স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle sub category status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleCategoryStatus: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const item = await db.query.categories.findFirst({
      where: eq(categories.id, id)
    });

    if (!item) {
      return c.json({ message: "ক্যাটাগরি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(categories)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return c.json(
      {
        message: `ক্যাটাগরি স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle category status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 2. Size Group Controllers
 * ----------------------------------------------------------- */
export const listSizeGroups: Handler = async (c: any) => {
  try {
    const groups = await db.select().from(sizeGroups).orderBy(desc(sizeGroups.id));
    const allSizes = await db.select().from(sizes).orderBy(asc(sizes.sortOrder), asc(sizes.id));

    const data = groups.map((g) => ({
      ...g,
      createdAt: g.createdAt ? String(g.createdAt) : null,
      sizes: allSizes
        .filter((s) => s.sizeGroupId === g.id)
        .map((s) => ({
          ...s,
          createdAt: s.createdAt ? String(s.createdAt) : null
        }))
    }));

    return c.json({ message: "সাইজ গ্রুপের তালিকা", data }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("List size groups error:", error);
    return c.json({ message: "সাইজ গ্রুপ লোড ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createSizeGroup: Handler = async (c: any) => {
  try {
    const body = c.req.valid("json");
    const name = body.name.trim();

    const existing = await db.query.sizeGroups.findFirst({
      where: eq(sizeGroups.name, name)
    });

    if (existing) {
      return c.json({ message: "এই নামের সাইজ গ্রুপ ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [created] = await db
      .insert(sizeGroups)
      .values({
        name,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "নতুন সাইজ গ্রুপ সফলভাবে যুক্ত হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null,
          sizes: []
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create size group error:", error);
    return c.json({ message: "সাইজ গ্রুপ যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleSizeGroupStatus: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const item = await db.query.sizeGroups.findFirst({
      where: eq(sizeGroups.id, id)
    });

    if (!item) {
      return c.json({ message: "সাইজ গ্রুপ পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(sizeGroups)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(sizeGroups.id, id))
      .returning();

    return c.json(
      {
        message: `সাইজ গ্রুপের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle size group status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 3. Size Controllers (within a Size Group)
 * ----------------------------------------------------------- */
export const createSize: Handler = async (c: any) => {
  try {
    await ensureSizesTableColumns();
    const body = c.req.valid("json");
    const categoryId = body.categoryId ? Number(body.categoryId) : null;
    const subCategoryId = body.subCategoryId ? Number(body.subCategoryId) : null;
    const sizeGroupId = body.sizeGroupId ? Number(body.sizeGroupId) : null;

    // Split by comma, Arabic/Bengali comma, or newlines
    const rawNames = body.name
      .split(/[,،\n]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    if (rawNames.length === 0) {
      return c.json({ message: "সাইজের নাম আবশ্যক" }, HttpStatusCodes.BAD_REQUEST);
    }
    const existingSizes = categoryId
      ? await db
          .select({ name: sizes.name })
          .from(sizes)
          .where(eq(sizes.categoryId, categoryId))
      : [];
    const existingNamesSet = new Set(existingSizes.map((s) => s.name.trim().toLowerCase()));

    const uniqueNewNames = rawNames.filter((n) => !existingNamesSet.has(n.toLowerCase()));

    if (uniqueNewNames.length === 0) {
      return c.json({ message: "প্রদত্ত সাইজ ইতিমধ্যে এই ক্যাটাগরিতে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const toInsert = uniqueNewNames.map((n: string, index: number) => ({
      categoryId,
      subCategoryId,
      sizeGroupId,
      name: n,
      sortOrder: (body.sortOrder ?? 0) + index,
      isActive: true
    }));

    const createdList = await db
      .insert(sizes)
      .values(toInsert)
      .returning();

    const formattedList = createdList.map((item) => ({
      ...item,
      createdAt: item.createdAt ? String(item.createdAt) : null
    }));

    return c.json(
      {
        message:
          formattedList.length > 1
            ? `${formattedList.length}টি সাইজ সফলভাবে যুক্ত হয়েছে`
            : "নতুন সাইজ সফলভাবে যুক্ত হয়েছে",
        data: formattedList[0],
        items: formattedList
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create size error:", error);
    return c.json({ message: "সাইজ যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateSize: Handler = async (c: any) => {
  try {
    await ensureSizesTableColumns();
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");
    const name = body.name.trim();

    const item = await db.query.sizes.findFirst({
      where: eq(sizes.id, id)
    });
    if (!item) {
      return c.json({ message: "সাইজ পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const categoryId = body.categoryId ? Number(body.categoryId) : item.categoryId;

    if (categoryId) {
      const duplicate = await db.query.sizes.findFirst({
        where: and(
          ne(sizes.id, id),
          eq(sizes.categoryId, categoryId),
          sql`LOWER(TRIM(${sizes.name})) = LOWER(TRIM(${name}))`
        )
      });
      if (duplicate) {
        return c.json({ message: "এই ক্যাটাগরিতে এই সাইজ ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
      }
    }

    const [updated] = await db
      .update(sizes)
      .set({ categoryId, name, updatedAt: new Date() })
      .where(eq(sizes.id, id))
      .returning();

    return c.json({
      message: "সাইজ সফলভাবে আপডেট করা হয়েছে",
      data: {
        ...updated,
        createdAt: updated.createdAt ? String(updated.createdAt) : null
      }
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Update size error:", error);
    return c.json({ message: "সাইজ আপডেট করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleSizeStatus: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const item = await db.query.sizes.findFirst({
      where: eq(sizes.id, id)
    });

    if (!item) {
      return c.json({ message: "সাইজ পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(sizes)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(sizes.id, id))
      .returning();

    return c.json(
      {
        message: `সাইজের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle size status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 4. Color Controllers
 * ----------------------------------------------------------- */
export const listColors: Handler = async (c: any) => {
  try {
    const list = await db.select().from(colors).orderBy(desc(colors.id));
    return c.json(
      {
        message: "রঙের তালিকা",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List colors error:", error);
    return c.json({ message: "রঙের তালিকা লোড ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createColor: Handler = async (c: any) => {
  try {
    const body = c.req.valid("json");
    const name = body.name.trim();

    const existing = await db.query.colors.findFirst({
      where: sql`LOWER(TRIM(${colors.name})) = LOWER(TRIM(${name}))`
    });

    if (existing) {
      return c.json({ message: "এই রঙের নাম ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [created] = await db
      .insert(colors)
      .values({
        name,
        code: body.code ? body.code.trim() : null,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "নতুন রং সফলভাবে যুক্ত হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create color error:", error);
    return c.json({ message: "রং যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateColor: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");
    const name = body.name.trim();

    const item = await db.query.colors.findFirst({
      where: eq(colors.id, id)
    });
    if (!item) {
      return c.json({ message: "রং পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const duplicate = await db.query.colors.findFirst({
      where: and(
        ne(colors.id, id),
        sql`LOWER(TRIM(${colors.name})) = LOWER(TRIM(${name}))`
      )
    });
    if (duplicate) {
      return c.json({ message: "এই রঙের নাম ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [updated] = await db
      .update(colors)
      .set({
        name,
        code: body.code ? body.code.trim() : null,
        updatedAt: new Date()
      })
      .where(eq(colors.id, id))
      .returning();

    return c.json({
      message: "রং সফলভাবে আপডেট করা হয়েছে",
      data: {
        ...updated,
        createdAt: updated.createdAt ? String(updated.createdAt) : null
      }
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Update color error:", error);
    return c.json({ message: "রং আপডেট করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleColorStatus: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const item = await db.query.colors.findFirst({
      where: eq(colors.id, id)
    });

    if (!item) {
      return c.json({ message: "রং পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(colors)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(colors.id, id))
      .returning();

    return c.json(
      {
        message: `রঙের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle color status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 5. Fabric Type Controllers
 * ----------------------------------------------------------- */
export const listFabricTypes: Handler = async (c: any) => {
  try {
    const list = await db.select().from(fabricTypes).orderBy(desc(fabricTypes.id));
    return c.json(
      {
        message: "কাপড়ের ধরনের তালিকা",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List fabric types error:", error);
    return c.json({ message: "কাপড়ের ধরন লোড ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createFabricType: Handler = async (c: any) => {
  try {
    const body = c.req.valid("json");
    const name = body.name.trim();
    const categoryId = Number(body.categoryId);

    const cat = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId)
    });

    if (!cat) {
      return c.json({ message: "ক্যাটাগরি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const existing = await db.query.fabricTypes.findFirst({
      where: and(
        eq(fabricTypes.categoryId, categoryId),
        eq(fabricTypes.name, name)
      )
    });

    if (existing) {
      return c.json({ message: "এই ক্যাটাগরিতে এই উপাদান ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [created] = await db
      .insert(fabricTypes)
      .values({
        categoryId,
        name,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "নতুন উপাদান / ম্যাটেরিয়াল সফলভাবে যুক্ত হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create fabric type error:", error);
    return c.json({ message: "উপাদান যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleFabricTypeStatus: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const item = await db.query.fabricTypes.findFirst({
      where: eq(fabricTypes.id, id)
    });

    if (!item) {
      return c.json({ message: "কাপড়ের ধরন পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(fabricTypes)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(fabricTypes.id, id))
      .returning();

    return c.json(
      {
        message: `কাপড়ের ধরনের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle fabric type status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * Product Types ("ধরন" - Category & Sub-Category dependent)
 * ----------------------------------------------------------- */
export const listProductTypes: Handler = async (c: any) => {
  try {
    await ensureProductTypesTable();
    const list = await db.select().from(productTypes).orderBy(desc(productTypes.id));
    return c.json(
      {
        message: "ধরনের তালিকা",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List product types error:", error);
    return c.json({ message: "ধরনের তালিকা লোড ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createProductType: Handler = async (c: any) => {
  try {
    await ensureProductTypesTable();
    const body = c.req.valid("json");
    const name = body.name.trim();
    const categoryId = Number(body.categoryId);
    const subCategoryId = Number(body.subCategoryId);

    const [cat] = await db.select().from(categories).where(eq(categories.id, categoryId));
    if (!cat) {
      return c.json({ message: "ক্যাটাগরি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const [subCat] = await db.select().from(subCategories).where(eq(subCategories.id, subCategoryId));
    if (!subCat) {
      return c.json({ message: "সাব-ক্যাটাগরি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const [existing] = await db.select().from(productTypes).where(
      and(
        eq(productTypes.categoryId, categoryId),
        eq(productTypes.subCategoryId, subCategoryId),
        sql`LOWER(TRIM(${productTypes.name})) = LOWER(TRIM(${name}))`
      )
    );

    if (existing) {
      return c.json({ message: "এই সাব-ক্যাটাগরিতে এই ধরন ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [created] = await db
      .insert(productTypes)
      .values({
        categoryId,
        subCategoryId,
        name,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "নতুন ধরন সফলভাবে যুক্ত হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create product type error:", error);
    return c.json({ message: "ধরন যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateProductType: Handler = async (c: any) => {
  try {
    await ensureProductTypesTable();
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");
    const name = body.name.trim();

    const [item] = await db.select().from(productTypes).where(eq(productTypes.id, id));
    if (!item) {
      return c.json({ message: "ধরনের তথ্য পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const categoryId = body.categoryId ? Number(body.categoryId) : item.categoryId;
    const subCategoryId = body.subCategoryId ? Number(body.subCategoryId) : item.subCategoryId;

    const [duplicate] = await db.select().from(productTypes).where(
      and(
        ne(productTypes.id, id),
        eq(productTypes.categoryId, categoryId),
        eq(productTypes.subCategoryId, subCategoryId),
        sql`LOWER(TRIM(${productTypes.name})) = LOWER(TRIM(${name}))`
      )
    );
    if (duplicate) {
      return c.json({ message: "এই সাব-ক্যাটাগরিতে এই ধরন ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [updated] = await db
      .update(productTypes)
      .set({ categoryId, subCategoryId, name, updatedAt: new Date() })
      .where(eq(productTypes.id, id))
      .returning();

    return c.json({
      message: "ধরন সফলভাবে আপডেট করা হয়েছে",
      data: {
        ...updated,
        createdAt: updated.createdAt ? String(updated.createdAt) : null
      }
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Update product type error:", error);
    return c.json({ message: "ধরন আপডেট করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleProductTypeStatus: Handler = async (c: any) => {
  try {
    await ensureProductTypesTable();
    const id = Number(c.req.param("id"));
    const [item] = await db.select().from(productTypes).where(eq(productTypes.id, id));

    if (!item) {
      return c.json({ message: "ধরন পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(productTypes)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(productTypes.id, id))
      .returning();

    return c.json(
      {
        message: `ধরনের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle product type status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 6. Unit of Measurement Controllers
 * ----------------------------------------------------------- */
let unitsTableColumnsEnsured = false;
export async function ensureUnitsTableColumns() {
  if (unitsTableColumnsEnsured) return;
  try {
    await db.execute(sql`
      ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_name_key";
      ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_name_unique";
      ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE;
      ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE CASCADE;
    `);
    unitsTableColumnsEnsured = true;
  } catch (err) {
    console.error("ensureUnitsTableColumns error:", err);
  }
}

export const listUnits: Handler = async (c: any) => {
  try {
    await ensureUnitsTableColumns();
    const list = await db.select().from(units).orderBy(desc(units.id));
    return c.json(
      {
        message: "পরিমাপের এককের তালিকা",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List units error:", error);
    return c.json({ message: "পরিমাপের একক লোড ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createUnit: Handler = async (c: any) => {
  try {
    await ensureUnitsTableColumns();
    const body = c.req.valid("json");
    const name = body.name.trim();
    const shortName = body.shortName.trim();
    const categoryId = body.categoryId ? Number(body.categoryId) : null;
    const subCategoryId = body.subCategoryId ? Number(body.subCategoryId) : null;

    if (categoryId && subCategoryId) {
      const [existing] = await db.select().from(units).where(
        and(
          eq(units.categoryId, categoryId),
          eq(units.subCategoryId, subCategoryId),
          or(
            sql`LOWER(TRIM(${units.name})) = LOWER(TRIM(${name}))`,
            sql`LOWER(TRIM(${units.shortName})) = LOWER(TRIM(${shortName}))`
          )
        )
      );

      if (existing) {
        return c.json({ message: "এই সাব-ক্যাটাগরিতে এই একক ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
      }
    }

    const [created] = await db
      .insert(units)
      .values({
        categoryId,
        subCategoryId,
        name,
        shortName,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "নতুন পরিমাপের একক সফলভাবে যুক্ত হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create unit error:", error);
    return c.json({ message: "পরিমাপের একক যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateUnit: Handler = async (c: any) => {
  try {
    await ensureUnitsTableColumns();
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");
    const name = body.name.trim();
    const shortName = body.shortName.trim();

    const [item] = await db.select().from(units).where(eq(units.id, id));
    if (!item) {
      return c.json({ message: "পরিমাপের একক পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const categoryId = body.categoryId !== undefined ? (body.categoryId ? Number(body.categoryId) : null) : item.categoryId;
    const subCategoryId = body.subCategoryId !== undefined ? (body.subCategoryId ? Number(body.subCategoryId) : null) : item.subCategoryId;

    if (categoryId && subCategoryId) {
      const [duplicate] = await db.select().from(units).where(
        and(
          ne(units.id, id),
          eq(units.categoryId, categoryId),
          eq(units.subCategoryId, subCategoryId),
          or(
            sql`LOWER(TRIM(${units.name})) = LOWER(TRIM(${name}))`,
            sql`LOWER(TRIM(${units.shortName})) = LOWER(TRIM(${shortName}))`
          )
        )
      );
      if (duplicate) {
        return c.json({ message: "এই সাব-ক্যাটাগরিতে এই একক ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
      }
    }

    const [updated] = await db
      .update(units)
      .set({ categoryId, subCategoryId, name, shortName, updatedAt: new Date() })
      .where(eq(units.id, id))
      .returning();

    return c.json({
      message: "পরিমাপের একক সফলভাবে আপডেট করা হয়েছে",
      data: {
        ...updated,
        createdAt: updated.createdAt ? String(updated.createdAt) : null
      }
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Update unit error:", error);
    return c.json({ message: "পরিমাপের একক আপডেট করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleUnitStatus: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    const item = await db.query.units.findFirst({
      where: eq(units.id, id)
    });

    if (!item) {
      return c.json({ message: "পরিমাপের একক পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(units)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(units.id, id))
      .returning();

    return c.json(
      {
        message: `এককের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle unit status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 7. Challan Type Controllers (চালানের ধরন)
 * ----------------------------------------------------------- */
export const listChallanTypes: Handler = async (c: any) => {
  try {
    await ensureChallanTypesTable();
    const list = await db.select().from(challanTypes).orderBy(asc(challanTypes.id));
    return c.json(
      {
        message: "চালানের ধরনের তালিকা সফলভাবে লোড হয়েছে",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List challan types error:", error);
    return c.json({ message: "চালানের ধরনের তালিকা লোড করা যায়নি" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createChallanType: Handler = async (c: any) => {
  try {
    await ensureChallanTypesTable();
    const body = c.req.valid("json");
    const name = body.name.trim();
    const code = body.code ? body.code.trim().toUpperCase() : null;
    const description = body.description ? body.description.trim() : null;

    const [existing] = await db.select().from(challanTypes).where(
      sql`LOWER(TRIM(${challanTypes.name})) = LOWER(TRIM(${name}))`
    );
    if (existing) {
      return c.json({ message: "এই চালানের ধরন ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [created] = await db
      .insert(challanTypes)
      .values({
        name,
        code,
        description,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "নতুন চালানের ধরন সফলভাবে যুক্ত হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create challan type error:", error);
    return c.json({ message: "চালানের ধরন যুক্ত করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateChallanType: Handler = async (c: any) => {
  try {
    await ensureChallanTypesTable();
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");
    const name = body.name.trim();
    const code = body.code ? body.code.trim().toUpperCase() : null;
    const description = body.description ? body.description.trim() : null;

    const [item] = await db.select().from(challanTypes).where(eq(challanTypes.id, id));
    if (!item) {
      return c.json({ message: "চালানের ধরন পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const [duplicate] = await db.select().from(challanTypes).where(
      and(
        ne(challanTypes.id, id),
        sql`LOWER(TRIM(${challanTypes.name})) = LOWER(TRIM(${name}))`
      )
    );
    if (duplicate) {
      return c.json({ message: "এই নামের চালানের ধরন ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    const [updated] = await db
      .update(challanTypes)
      .set({ name, code, description, updatedAt: new Date() })
      .where(eq(challanTypes.id, id))
      .returning();

    return c.json(
      {
        message: "চালানের ধরন সফলভাবে আপডেট করা হয়েছে",
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Update challan type error:", error);
    return c.json({ message: "চালানের ধরন আপডেট করা ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleChallanTypeStatus: Handler = async (c: any) => {
  try {
    await ensureChallanTypesTable();
    const id = Number(c.req.param("id"));
    const [item] = await db.select().from(challanTypes).where(eq(challanTypes.id, id));
    if (!item) {
      return c.json({ message: "চালানের ধরন পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(challanTypes)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(challanTypes.id, id))
      .returning();

    return c.json(
      {
        message: `চালানের ধরনের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle challan type status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 8. Vendor Types Controllers (সরবরাহকারীর ধরন)
 * ----------------------------------------------------------- */
export const listVendorTypes: Handler = async (c: any) => {
  try {
    await ensureVendorTypesTable();
    const list = await db.select().from(vendorTypes).orderBy(asc(vendorTypes.id));
    return c.json(
      {
        message: "Vendor types retrieved successfully",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List vendor types error:", error);
    return c.json({ message: "সরবরাহকারীর ধরনের তালিকা লোড করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createVendorType: Handler = async (c: any) => {
  try {
    await ensureVendorTypesTable();
    const body = typeof c.req.valid === "function" ? c.req.valid("json") : await c.req.json();
    const name = body.name?.trim();
    const code = body.code?.trim() || null;
    const description = body.description?.trim() || null;

    if (!name) {
      return c.json({ message: "সরবরাহকারীর ধরনের নাম আবশ্যক" }, HttpStatusCodes.BAD_REQUEST);
    }

    const [existing] = await db.select().from(vendorTypes).where(
      sql`LOWER(TRIM(${vendorTypes.name})) = LOWER(TRIM(${name}))`
    );
    if (existing) {
      return c.json({ message: "এই নামের সরবরাহকারীর ধরন ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.CONFLICT);
    }

    const [created] = await db
      .insert(vendorTypes)
      .values({
        name,
        code,
        description,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "সরবরাহকারীর ধরন সফলভাবে তৈরি হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create vendor type error:", error);
    return c.json({ message: "সরবরাহকারীর ধরন তৈরি করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateVendorType: Handler = async (c: any) => {
  try {
    await ensureVendorTypesTable();
    const id = Number(c.req.param("id"));
    const body = typeof c.req.valid === "function" ? c.req.valid("json") : await c.req.json();
    const name = body.name?.trim();
    const code = body.code !== undefined ? (body.code?.trim() || null) : undefined;
    const description = body.description !== undefined ? (body.description?.trim() || null) : undefined;

    const [item] = await db.select().from(vendorTypes).where(eq(vendorTypes.id, id));
    if (!item) {
      return c.json({ message: "সরবরাহকারীর ধরন পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    if (name) {
      const [duplicate] = await db.select().from(vendorTypes).where(
        and(
          ne(vendorTypes.id, id),
          sql`LOWER(TRIM(${vendorTypes.name})) = LOWER(TRIM(${name}))`
        )
      );
      if (duplicate) {
        return c.json({ message: "এই নামের আরেকটি সরবরাহকারীর ধরন ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.CONFLICT);
      }
    }

    const [updated] = await db
      .update(vendorTypes)
      .set({
        ...(name ? { name } : {}),
        ...(code !== undefined ? { code } : {}),
        ...(description !== undefined ? { description } : {}),
        updatedAt: new Date()
      })
      .where(eq(vendorTypes.id, id))
      .returning();

    return c.json(
      {
        message: "সরবরাহকারীর ধরন সফলভাবে আপডেট হয়েছে",
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Update vendor type error:", error);
    return c.json({ message: "সরবরাহকারীর ধরন আপডেট করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const toggleVendorTypeStatus: Handler = async (c: any) => {
  try {
    await ensureVendorTypesTable();
    const id = Number(c.req.param("id"));
    const [item] = await db.select().from(vendorTypes).where(eq(vendorTypes.id, id));
    if (!item) {
      return c.json({ message: "সরবরাহকারীর ধরন পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(vendorTypes)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(vendorTypes.id, id))
      .returning();

    return c.json(
      {
        message: `সরবরাহকারীর ধরনের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle vendor type status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/* -------------------------------------------------------------
 * 9. Payment Methods Controllers (পরিশোধের মাধ্যম / Trx Type)
 * ----------------------------------------------------------- */
export const listPaymentMethods: Handler = async (c: any) => {
  try {
    await ensurePaymentMethodsTable();
    const list = await db.select().from(paymentMethods).orderBy(asc(paymentMethods.id));
    return c.json(
      {
        message: "Payment methods retrieved successfully",
        data: list.map((item) => ({
          ...item,
          createdAt: item.createdAt ? String(item.createdAt) : null
        }))
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("List payment methods error:", error);
    return c.json({ message: "পরিশোধের মাধ্যমের তালিকা লোড করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createPaymentMethod: Handler = async (c: any) => {
  try {
    await ensurePaymentMethodsTable();
    const body = typeof c.req.valid === "function" ? c.req.valid("json") : await c.req.json();
    const name = body.name?.trim();
    const code = body.code?.trim() || null;
    const description = body.description?.trim() || null;

    if (!name) {
      return c.json({ message: "পরিশোধের মাধ্যমের নাম আবশ্যক" }, HttpStatusCodes.BAD_REQUEST);
    }

    const [existing] = await db.select().from(paymentMethods).where(
      sql`LOWER(TRIM(${paymentMethods.name})) = LOWER(TRIM(${name}))`
    );
    if (existing) {
      return c.json({ message: "এই নামের পরিশোধের মাধ্যম ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.CONFLICT);
    }

    const [created] = await db
      .insert(paymentMethods)
      .values({
        name,
        code,
        description,
        isActive: true
      })
      .returning();

    return c.json(
      {
        message: "পরিশোধের মাধ্যম সফলভাবে তৈরি হয়েছে",
        data: {
          ...created,
          createdAt: created.createdAt ? String(created.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create payment method error:", error);
    return c.json({ message: "পরিশোধের মাধ্যম তৈরি করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updatePaymentMethod: Handler = async (c: any) => {
  try {
    await ensurePaymentMethodsTable();
    const id = Number(c.req.param("id"));
    const body = typeof c.req.valid === "function" ? c.req.valid("json") : await c.req.json();
    const name = body.name?.trim();
    const code = body.code !== undefined ? (body.code?.trim() || null) : undefined;
    const description = body.description !== undefined ? (body.description?.trim() || null) : undefined;

    const [item] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    if (!item) {
      return c.json({ message: "পরিশোধের মাধ্যম পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    if (name) {
      const [duplicate] = await db.select().from(paymentMethods).where(
        and(
          ne(paymentMethods.id, id),
          sql`LOWER(TRIM(${paymentMethods.name})) = LOWER(TRIM(${name}))`
        )
      );
      if (duplicate) {
        return c.json({ message: "এই নামের আরেকটি পরিশোধের মাধ্যম ইতিমধ্যে বিদ্যমান রয়েছে" }, HttpStatusCodes.CONFLICT);
      }
    }

    const [updated] = await db
      .update(paymentMethods)
      .set({
        ...(name ? { name } : {}),
        ...(code !== undefined ? { code } : {}),
        ...(description !== undefined ? { description } : {}),
        updatedAt: new Date()
      })
      .where(eq(paymentMethods.id, id))
      .returning();

    return c.json(
      {
        message: "পরিশোধের মাধ্যম সফলভাবে আপডেট হয়েছে",
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Update payment method error:", error);
    return c.json({ message: "পরিশোধের মাধ্যম আপডেট করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const togglePaymentMethodStatus: Handler = async (c: any) => {
  try {
    await ensurePaymentMethodsTable();
    const id = Number(c.req.param("id"));
    const [item] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    if (!item) {
      return c.json({ message: "পরিশোধের মাধ্যম পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus =
      typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
        ? Boolean(c.req.valid("json").isActive)
        : !item.isActive;

    const [updated] = await db
      .update(paymentMethods)
      .set({ isActive: nextStatus, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning();

    return c.json(
      {
        message: `পরিশোধের মাধ্যমের স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          ...updated,
          createdAt: updated.createdAt ? String(updated.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle payment method status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

