import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { capitalInvestments, capitalWithdrawals } from "@/modules/accounts/database/models/accounts.js";
import { roles } from "@/modules/auth/database/models/role.js";
import { users } from "@/modules/auth/database/models/user.js";
import {
  categories,
  challanTypes,
  colors,
  fabricTypes,
  paymentMethods,
  productTypes,
  sizeGroups,
  sizes,
  subCategories,
  units,
  vendorTypes
} from "@/modules/catalog/database/models/catalog.js";
import { companys, companySettings } from "@/modules/company/database/models/company.js";
import {
  brands,
  customers,
  itemPricings,
  items,
  manufacturers,
  purchaseItems,
  purchases,
  saleItems,
  sales,
  suppliers
} from "@/modules/inventory/database/models/inventory.js";
import { settings } from "@/modules/settings/database/models/settings.js";

/**
 * Convert string ISO dates from JSON backup into JavaScript Date objects
 * so Drizzle ORM's timestamp driver can call `.toISOString()` without throwing.
 */
function cleanRowForInsert<T extends Record<string, any>>(row: T): T {
  if (!row || typeof row !== "object") return row;
  const result: any = { ...row };
  for (const [key, val] of Object.entries(result)) {
    if (typeof val === "string") {
      // YYYY-MM-DD string without time (like saleDate "2026-11-18") should stay a string
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        continue;
      }
      // If key ends with 'At', contains 'Date'/'Time', or val is an ISO timestamp string
      if (
        /at$/i.test(key) ||
        /(?:date|time)/i.test(key) ||
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)
      ) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          result[key] = d;
        }
      }
    }
  }
  return result;
}

function cleanRowsForInsert<T extends Record<string, any>>(rows: T[]): T[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => cleanRowForInsert(r));
}

/**
 * 1. Get real-time database stats (Actual PostgreSQL Size & record counts)
 */
export const getDatabaseStats: Handler = async (c: any) => {
  try {
    const sizeResult: any = await db.execute(sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size_pretty,
             pg_database_size(current_database())::text as size_bytes;
    `);

    const row = sizeResult?.rows?.[0] || { size_pretty: "N/A", size_bytes: "0" };

    const [
      catCount,
      subCount,
      prodTypeCount,
      sizeCount,
      colorCount,
      unitCount,
      brandCount,
      itemCount,
      purchaseCount,
      saleCount,
      compCount,
      userCount
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(categories),
      db.select({ count: sql<number>`count(*)::int` }).from(subCategories),
      db.select({ count: sql<number>`count(*)::int` }).from(productTypes),
      db.select({ count: sql<number>`count(*)::int` }).from(sizes),
      db.select({ count: sql<number>`count(*)::int` }).from(colors),
      db.select({ count: sql<number>`count(*)::int` }).from(units),
      db.select({ count: sql<number>`count(*)::int` }).from(brands),
      db.select({ count: sql<number>`count(*)::int` }).from(items),
      db.select({ count: sql<number>`count(*)::int` }).from(purchases),
      db.select({ count: sql<number>`count(*)::int` }).from(sales),
      db.select({ count: sql<number>`count(*)::int` }).from(companys),
      db.select({ count: sql<number>`count(*)::int` }).from(users)
    ]);

    return c.json({
      message: "Database stats retrieved successfully",
      data: {
        sizePretty: row.size_pretty,
        sizeBytes: Number(row.size_bytes),
        counts: {
          categories: catCount[0]?.count || 0,
          subCategories: subCount[0]?.count || 0,
          productTypes: prodTypeCount[0]?.count || 0,
          sizes: sizeCount[0]?.count || 0,
          colors: colorCount[0]?.count || 0,
          units: unitCount[0]?.count || 0,
          brands: brandCount[0]?.count || 0,
          items: itemCount[0]?.count || 0,
          purchases: purchaseCount[0]?.count || 0,
          sales: saleCount[0]?.count || 0,
          companys: compCount[0]?.count || 0,
          users: userCount[0]?.count || 0
        }
      }
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Get database stats error:", error);
    return c.json({ message: "ডাটাবেজ স্ট্যাটিসটিক্স লোড করতে সমস্যা হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 2. Download complete database backup as JSON
 * Includes ALL Master Catalogs, Inventory, Purchases, Sales, Pricing, Accounts, Settings
 */
export const downloadBackup: Handler = async (c: any) => {
  try {
    const [
      allSettings,
      allCompanys,
      allCompanySettings,
      allCategories,
      allSubCategories,
      allProductTypes,
      allSizeGroups,
      allSizes,
      allColors,
      allFabricTypes,
      allUnits,
      allChallanTypes,
      allVendorTypes,
      allPaymentMethods,
      allBrands,
      allSuppliers,
      allManufacturers,
      allCustomers,
      allItems,
      allItemPricings,
      allPurchases,
      allPurchaseItems,
      allSales,
      allSaleItems,
      allCapitalInvestments,
      allCapitalWithdrawals,
      allRoles,
      allUsers
    ] = await Promise.all([
      db.select().from(settings),
      db.select().from(companys),
      db.select().from(companySettings),
      db.select().from(categories),
      db.select().from(subCategories),
      db.select().from(productTypes),
      db.select().from(sizeGroups),
      db.select().from(sizes),
      db.select().from(colors),
      db.select().from(fabricTypes),
      db.select().from(units),
      db.select().from(challanTypes),
      db.select().from(vendorTypes),
      db.select().from(paymentMethods),
      db.select().from(brands),
      db.select().from(suppliers),
      db.select().from(manufacturers),
      db.select().from(customers),
      db.select().from(items),
      db.select().from(itemPricings),
      db.select().from(purchases),
      db.select().from(purchaseItems),
      db.select().from(sales),
      db.select().from(saleItems),
      db.select().from(capitalInvestments),
      db.select().from(capitalWithdrawals),
      db.select().from(roles),
      db.select().from(users)
    ]);

    const superAdminRoles = await db.select().from(roles).where(eq(roles.name, "super_admin"));
    const superAdminRoleIds = new Set(superAdminRoles.map((r) => r.id));
    const exportUsers = allUsers.filter((u) => !superAdminRoleIds.has(u.roleId!));

    const backupPayload = {
      meta: {
        appName: "Fashion",
        version: "1.0",
        database: "PostgreSQL",
        exportedAt: new Date().toISOString(),
        note: "সুপারএডমিন ডাটা সুরক্ষার স্বার্থে ব্যাকআপ ও আপলোড উভয় ক্ষেত্রেই সুপারএডমিন অ্যাকাউন্ট বাদ রাখা হয়েছে।"
      },
      data: {
        settings: allSettings,
        companys: allCompanys,
        companySettings: allCompanySettings,
        categories: allCategories,
        subCategories: allSubCategories,
        productTypes: allProductTypes,
        sizeGroups: allSizeGroups,
        sizes: allSizes,
        colors: allColors,
        fabricTypes: allFabricTypes,
        units: allUnits,
        challanTypes: allChallanTypes,
        vendorTypes: allVendorTypes,
        paymentMethods: allPaymentMethods,
        brands: allBrands,
        suppliers: allSuppliers,
        manufacturers: allManufacturers,
        customers: allCustomers,
        items: allItems,
        itemPricings: allItemPricings,
        purchases: allPurchases,
        purchaseItems: allPurchaseItems,
        sales: allSales,
        saleItems: allSaleItems,
        capitalInvestments: allCapitalInvestments,
        capitalWithdrawals: allCapitalWithdrawals,
        roles: allRoles,
        users: exportUsers
      }
    };

    const fileName = `fashion-backup-${new Date().toISOString().slice(0, 10)}.json`;

    c.header("Content-Disposition", `attachment; filename="${fileName}"`);
    c.header("Content-Type", "application/json; charset=utf-8");

    return c.body(JSON.stringify(backupPayload, null, 2));
  } catch (error) {
    console.error("Download backup error:", error);
    return c.json({ message: "ব্যাকআপ তৈরি ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 3. Restore backup with STRICT SUPERADMIN EXCLUSION & PROTECTION
 * ডাটা আপলোডের সময় অবশ্যই সুপারএডমিন এর ডাটা বাদ দিয়ে আপলোড হবে।
 */
export const restoreBackup: Handler = async (c: any) => {
  try {
    let backupJson: any;

    const contentType = c.req.header("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const body = await c.req.parseBody();
      const file = body["file"];
      if (!file) {
        return c.json({ message: "কোনো ব্যাকআপ ফাইল পাওয়া যায়নি" }, HttpStatusCodes.BAD_REQUEST);
      }
      let content = "";
      if (typeof file === "string") {
        content = file;
      } else if (file instanceof Blob) {
        content = await file.text();
      } else if (file && typeof file.text === "function") {
        content = await file.text();
      }
      backupJson = JSON.parse(content);
    } else {
      backupJson = await c.req.json();
    }

    if (!backupJson || !backupJson.data) {
      return c.json({ message: "অবৈধ ব্যাকআপ ফাইল ফরম্যাট" }, HttpStatusCodes.BAD_REQUEST);
    }

    const data = backupJson.data;

    // 1. Identify and protect current superadmin accounts in database
    const superAdminRoles = await db.select().from(roles).where(eq(roles.name, "super_admin"));
    const superAdminRoleIds = new Set<number>(superAdminRoles.map((r) => r.id));

    // Also identify any super_admin role from uploaded backup JSON
    if (Array.isArray(data.roles)) {
      data.roles.forEach((r: any) => {
        if (r && (r.name === "super_admin" || r.slug === "super_admin")) {
          if (r.id) superAdminRoleIds.add(Number(r.id));
        }
      });
    }

    const currentSuperAdmins = superAdminRoleIds.size > 0
      ? await db.select().from(users).where(inArray(users.roleId, Array.from(superAdminRoleIds)))
      : [];

    const protectedUserIds = new Set<number>(currentSuperAdmins.map((u) => u.id));
    const protectedEmails = new Set(currentSuperAdmins.map((u) => u.email.toLowerCase()));

    // Fallback: If no superadmin was found by role, protect first user as safeguard
    if (protectedUserIds.size === 0) {
      const fallbackAdmins = await db.select().from(users).limit(1);
      fallbackAdmins.forEach((u) => {
        protectedUserIds.add(u.id);
        protectedEmails.add(u.email.toLowerCase());
      });
    }

    // 2. Perform restoration inside a strict Database Transaction (ACID Atomicity)
    // Ensures ALL-OR-NOTHING: Zero data loss, zero partial insertion
    await db.transaction(async (tx) => {
      // A. Clean child tables first, then parents (Order: Children -> Parents)
      if (Array.isArray(data.saleItems)) await tx.delete(saleItems);
      if (Array.isArray(data.sales)) await tx.delete(sales);
      if (Array.isArray(data.purchaseItems)) await tx.delete(purchaseItems);
      if (Array.isArray(data.purchases)) await tx.delete(purchases);
      if (Array.isArray(data.itemPricings)) await tx.delete(itemPricings);
      if (Array.isArray(data.items)) await tx.delete(items);

      if (Array.isArray(data.capitalWithdrawals)) await tx.delete(capitalWithdrawals);
      if (Array.isArray(data.capitalInvestments)) await tx.delete(capitalInvestments);
      if (Array.isArray(data.companySettings)) await tx.delete(companySettings);

      if (Array.isArray(data.customers)) await tx.delete(customers);
      if (Array.isArray(data.manufacturers)) await tx.delete(manufacturers);
      if (Array.isArray(data.suppliers)) await tx.delete(suppliers);
      if (Array.isArray(data.brands)) await tx.delete(brands);

      await tx.delete(productTypes);
      await tx.delete(sizes);
      await tx.delete(fabricTypes);
      await tx.delete(colors);
      await tx.delete(subCategories);
      await tx.delete(sizeGroups);
      await tx.delete(categories);
      await tx.delete(units);

      if (Array.isArray(data.challanTypes)) await tx.delete(challanTypes);
      if (Array.isArray(data.vendorTypes)) await tx.delete(vendorTypes);
      if (Array.isArray(data.paymentMethods)) await tx.delete(paymentMethods);

      // B. Clean settings and companys
      await tx.delete(settings);
      await tx.delete(companys);

      // C. Clean users (STRICT: EXCLUDING existing superadmin users)
      if (protectedUserIds.size > 0) {
        const idsArray: number[] = Array.from(protectedUserIds);
        await tx.delete(users).where(notInArray(users.id, idsArray));
      }

      // D. Re-insert parent catalog tables (all timestamps parsed to Date objects)
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        await tx.insert(categories).values(cleanRowsForInsert(data.categories));
      }
      if (Array.isArray(data.subCategories) && data.subCategories.length > 0) {
        await tx.insert(subCategories).values(cleanRowsForInsert(data.subCategories));
      }
      if (Array.isArray(data.sizeGroups) && data.sizeGroups.length > 0) {
        await tx.insert(sizeGroups).values(cleanRowsForInsert(data.sizeGroups));
      }
      if (Array.isArray(data.sizes) && data.sizes.length > 0) {
        await tx.insert(sizes).values(cleanRowsForInsert(data.sizes));
      }
      if (Array.isArray(data.productTypes) && data.productTypes.length > 0) {
        await tx.insert(productTypes).values(cleanRowsForInsert(data.productTypes));
      }
      if (Array.isArray(data.colors) && data.colors.length > 0) {
        await tx.insert(colors).values(cleanRowsForInsert(data.colors));
      }
      if (Array.isArray(data.fabricTypes) && data.fabricTypes.length > 0) {
        await tx.insert(fabricTypes).values(cleanRowsForInsert(data.fabricTypes));
      }
      if (Array.isArray(data.units) && data.units.length > 0) {
        await tx.insert(units).values(cleanRowsForInsert(data.units));
      }
      if (Array.isArray(data.challanTypes) && data.challanTypes.length > 0) {
        await tx.insert(challanTypes).values(cleanRowsForInsert(data.challanTypes));
      }
      if (Array.isArray(data.vendorTypes) && data.vendorTypes.length > 0) {
        await tx.insert(vendorTypes).values(cleanRowsForInsert(data.vendorTypes));
      }
      if (Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
        await tx.insert(paymentMethods).values(cleanRowsForInsert(data.paymentMethods));
      }

      // E. Re-insert settings and companys
      if (Array.isArray(data.settings) && data.settings.length > 0) {
        await tx.insert(settings).values(cleanRowsForInsert(data.settings));
      }
      if (Array.isArray(data.companys) && data.companys.length > 0) {
        await tx.insert(companys).values(cleanRowsForInsert(data.companys));
      }
      if (Array.isArray(data.companySettings) && data.companySettings.length > 0) {
        await tx.insert(companySettings).values(cleanRowsForInsert(data.companySettings));
      }

      // F. Re-insert users (MUST be BEFORE any user-dependent tables like brands, suppliers, items, etc.)
      if (Array.isArray(data.users) && data.users.length > 0) {
        const nonSuperAdminUsers = data.users.filter((u: any) => {
          const isSuperAdminRole = u.roleId && superAdminRoleIds.has(u.roleId);
          const matchesProtectedEmail = u.email && protectedEmails.has(u.email.toLowerCase());
          const matchesProtectedId = protectedUserIds.has(u.id);
          return !isSuperAdminRole && !matchesProtectedEmail && !matchesProtectedId;
        });

        if (nonSuperAdminUsers.length > 0) {
          await tx.insert(users).values(cleanRowsForInsert(nonSuperAdminUsers));
        }
      }

      // G. Resolve valid user IDs in transaction for user-dependent tables
      const currentUsers = await tx.select({ id: users.id }).from(users);
      const validUserIds = new Set<number>(currentUsers.map((u) => u.id));
      const defaultUserId = Array.from(protectedUserIds)[0] || (currentUsers[0]?.id ?? 1);

      // Helper to ensure userId belongs to an existing user
      const mapSafeUser = (row: any) => {
        const cleaned = cleanRowForInsert(row);
        if (!cleaned.userId || !validUserIds.has(Number(cleaned.userId))) {
          cleaned.userId = defaultUserId;
        }
        return cleaned;
      };

      // H. Re-insert brands
      if (Array.isArray(data.brands) && data.brands.length > 0) {
        await tx.insert(brands).values(data.brands.map(mapSafeUser));
      }

      // I. Re-insert suppliers, manufacturers, customers
      if (Array.isArray(data.suppliers) && data.suppliers.length > 0) {
        await tx.insert(suppliers).values(data.suppliers.map(mapSafeUser));
      }

      if (Array.isArray(data.manufacturers) && data.manufacturers.length > 0) {
        await tx.insert(manufacturers).values(data.manufacturers.map(mapSafeUser));
      }

      if (Array.isArray(data.customers) && data.customers.length > 0) {
        await tx.insert(customers).values(data.customers.map(mapSafeUser));
      }

      // J. Re-insert Items (পণ্য)
      if (Array.isArray(data.items) && data.items.length > 0) {
        await tx.insert(items).values(data.items.map(mapSafeUser));
      }

      // K. Re-insert Item Pricings (মূল্য নির্ধারণ)
      if (Array.isArray(data.itemPricings) && data.itemPricings.length > 0) {
        await tx.insert(itemPricings).values(data.itemPricings.map(mapSafeUser));
      }

      // L. Re-insert Purchases & Purchase Items (ক্রয় ও ক্রয়কৃত পণ্য)
      if (Array.isArray(data.purchases) && data.purchases.length > 0) {
        await tx.insert(purchases).values(data.purchases.map(mapSafeUser));
      }
      if (Array.isArray(data.purchaseItems) && data.purchaseItems.length > 0) {
        await tx.insert(purchaseItems).values(cleanRowsForInsert(data.purchaseItems));
      }

      // M. Re-insert Sales & Sale Items (বিক্রয় ও বিক্রিত পণ্য)
      if (Array.isArray(data.sales) && data.sales.length > 0) {
        await tx.insert(sales).values(data.sales.map(mapSafeUser));
      }
      if (Array.isArray(data.saleItems) && data.saleItems.length > 0) {
        await tx.insert(saleItems).values(cleanRowsForInsert(data.saleItems));
      }

      // N. Re-insert Accounts (পুঁজি বিনিয়োগ ও উত্তোলন)
      if (Array.isArray(data.capitalInvestments) && data.capitalInvestments.length > 0) {
        await tx.insert(capitalInvestments).values(data.capitalInvestments.map(mapSafeUser));
      }
      if (Array.isArray(data.capitalWithdrawals) && data.capitalWithdrawals.length > 0) {
        await tx.insert(capitalWithdrawals).values(data.capitalWithdrawals.map(mapSafeUser));
      }

      // O. Resync all PostgreSQL sequence generators
      const serialTables = [
        "categories",
        "sub_categories",
        "product_types",
        "size_groups",
        "sizes",
        "colors",
        "fabric_types",
        "units",
        "challan_types",
        "vendor_types",
        "payment_methods",
        "brands",
        "suppliers",
        "manufacturers",
        "customers",
        "companys",
        "company_settings",
        "settings",
        "users",
        "items",
        "item_pricings",
        "purchases",
        "purchase_items",
        "sales",
        "sale_items",
        "capital_investments",
        "capital_withdrawals"
      ];

      for (const tbl of serialTables) {
        try {
          await tx.execute(
            sql.raw(`SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), coalesce((SELECT max(id) FROM ${tbl}), 1));`)
          );
        } catch (seqError) {
          // Table might not use default serial sequence, safely continue
        }
      }
    });

    return c.json({
      message: "ডাটাবেজ ব্যাকআপ সফলভাবে রিস্টোর হয়েছে (সুপারএডমিনের তথ্য অক্ষত রাখা হয়েছে)",
      data: {
        restoredAt: new Date().toISOString(),
        preservedSuperAdminsCount: currentSuperAdmins.length
      }
    }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Restore backup error:", error);
    return c.json(
      { message: error?.message || "ব্যাকআপ রিস্টোর করতে ব্যর্থ হয়েছে। ফাইলের গঠন যাচাই করুন।" },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
