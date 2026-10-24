import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { roles } from "@/modules/auth/database/models/role.js";
import { users } from "@/modules/auth/database/models/user.js";
import {
  categories,
  colors,
  fabricTypes,
  productTypes,
  sizeGroups,
  sizes,
  subCategories,
  units
} from "@/modules/catalog/database/models/catalog.js";
import { companys } from "@/modules/company/database/models/company.js";
import { settings } from "@/modules/settings/database/models/settings.js";

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
      compCount,
      userCount
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(categories),
      db.select({ count: sql<number>`count(*)::int` }).from(subCategories),
      db.select({ count: sql<number>`count(*)::int` }).from(productTypes),
      db.select({ count: sql<number>`count(*)::int` }).from(sizes),
      db.select({ count: sql<number>`count(*)::int` }).from(colors),
      db.select({ count: sql<number>`count(*)::int` }).from(units),
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
 */
export const downloadBackup: Handler = async (c: any) => {
  try {
    const [
      allSettings,
      allCompanys,
      allCategories,
      allSubCategories,
      allProductTypes,
      allSizeGroups,
      allSizes,
      allColors,
      allFabricTypes,
      allUnits,
      allRoles,
      allUsers
    ] = await Promise.all([
      db.select().from(settings),
      db.select().from(companys),
      db.select().from(categories),
      db.select().from(subCategories),
      db.select().from(productTypes),
      db.select().from(sizeGroups),
      db.select().from(sizes),
      db.select().from(colors),
      db.select().from(fabricTypes),
      db.select().from(units),
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
        categories: allCategories,
        subCategories: allSubCategories,
        productTypes: allProductTypes,
        sizeGroups: allSizeGroups,
        sizes: allSizes,
        colors: allColors,
        fabricTypes: allFabricTypes,
        units: allUnits,
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
    const superAdminRoleIds = new Set(superAdminRoles.map((r) => r.id));

    // Also identify any super_admin role from uploaded backup JSON
    if (Array.isArray(data.roles)) {
      data.roles.forEach((r: any) => {
        if (r && (r.name === "super_admin" || r.slug === "super_admin")) {
          if (r.id) superAdminRoleIds.add(r.id);
        }
      });
    }

    const currentSuperAdmins = superAdminRoleIds.size > 0
      ? await db.select().from(users).where(inArray(users.roleId, Array.from(superAdminRoleIds)))
      : [];

    const protectedUserIds = new Set(currentSuperAdmins.map((u) => u.id));
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
      // A. Clean catalog child tables then parent tables
      await tx.delete(productTypes);
      await tx.delete(sizes);
      await tx.delete(fabricTypes);
      await tx.delete(colors);
      await tx.delete(subCategories);
      await tx.delete(sizeGroups);
      await tx.delete(categories);
      await tx.delete(units);

      // B. Clean settings and companys
      await tx.delete(settings);
      await tx.delete(companys);

      // C. Clean users (STRICT: EXCLUDING existing superadmin users)
      if (protectedUserIds.size > 0) {
        const idsArray = Array.from(protectedUserIds);
        await tx.delete(users).where(notInArray(users.id, idsArray));
      }

      // D. Re-insert parent catalog tables
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        await tx.insert(categories).values(data.categories);
      }
      if (Array.isArray(data.subCategories) && data.subCategories.length > 0) {
        await tx.insert(subCategories).values(data.subCategories);
      }
      if (Array.isArray(data.sizeGroups) && data.sizeGroups.length > 0) {
        await tx.insert(sizeGroups).values(data.sizeGroups);
      }
      if (Array.isArray(data.sizes) && data.sizes.length > 0) {
        await tx.insert(sizes).values(data.sizes);
      }
      if (Array.isArray(data.productTypes) && data.productTypes.length > 0) {
        await tx.insert(productTypes).values(data.productTypes);
      }
      if (Array.isArray(data.colors) && data.colors.length > 0) {
        await tx.insert(colors).values(data.colors);
      }
      if (Array.isArray(data.fabricTypes) && data.fabricTypes.length > 0) {
        await tx.insert(fabricTypes).values(data.fabricTypes);
      }
      if (Array.isArray(data.units) && data.units.length > 0) {
        await tx.insert(units).values(data.units);
      }

      // E. Re-insert settings and companys
      if (Array.isArray(data.settings) && data.settings.length > 0) {
        await tx.insert(settings).values(data.settings);
      }
      if (Array.isArray(data.companys) && data.companys.length > 0) {
        await tx.insert(companys).values(data.companys);
      }

      // F. Re-insert users (Strict rule: exclude any super_admin user from the backup file)
      if (Array.isArray(data.users) && data.users.length > 0) {
        const nonSuperAdminUsers = data.users.filter((u: any) => {
          const isSuperAdminRole = u.roleId && superAdminRoleIds.has(u.roleId);
          const matchesProtectedEmail = u.email && protectedEmails.has(u.email.toLowerCase());
          const matchesProtectedId = protectedUserIds.has(u.id);
          return !isSuperAdminRole && !matchesProtectedEmail && !matchesProtectedId;
        });

        if (nonSuperAdminUsers.length > 0) {
          await tx.insert(users).values(nonSuperAdminUsers);
        }
      }

      // G. Resync all PostgreSQL sequence generators
      const serialTables = [
        "categories",
        "sub_categories",
        "product_types",
        "size_groups",
        "sizes",
        "colors",
        "fabric_types",
        "units",
        "companys",
        "settings",
        "users"
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
  } catch (error) {
    console.error("Restore backup error:", error);
    return c.json({ message: "ব্যাকআপ রিস্টোর করতে ব্যর্থ হয়েছে। ফাইলের গঠন যাচাই করুন।" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
