import { desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes, password } from "@/framework/facade.js";
import { roles } from "@/modules/auth/database/models/role.js";
import { users } from "@/modules/auth/database/models/user.js";
import { companySettings } from "@/modules/company/database/models/company.js";

let companySettingsTableEnsured = false;
export async function ensureCompanySettingsTable() {
  if (companySettingsTableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "company_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "company_name" varchar(255),
        "tagline" varchar(255),
        "phone" varchar(50),
        "email" varchar(255),
        "address" text,
        "trade_license" varchar(100),
        "vat_bin" varchar(100),
        "invoice_prefix" varchar(20) DEFAULT 'INV',
        "invoice_pattern" varchar(80) DEFAULT '{PREFIX}-{YYYY}-{0001}',
        "print_format" varchar(20) DEFAULT 'a4',
        "invoice_terms" text,
        "payment_info" text,
        "logo" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    await db.execute(sql`
      ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "invoice_pattern" varchar(80) DEFAULT '{PREFIX}-{YYYY}-{0001}';
    `);
    await db.execute(sql`
      ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "invoice_reset_cycle" varchar(20) DEFAULT 'yearly';
    `);
    await db.execute(sql`
      ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "print_format" varchar(20) DEFAULT 'a4';
    `);
    await db.execute(sql`
      ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "product_prefix" varchar(20) DEFAULT 'PRD-';
    `);
    companySettingsTableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure company_settings table:", e);
  }
}

/**
 * List all Company Admins.
 * Accessible by Super Admin.
 */
export const index: Handler = async (c: any) => {
  try {
    const companyAdminRole = await db.query.roles.findFirst({
      where: eq(roles.name, "company_admin")
    });

    if (!companyAdminRole) {
      return c.json({ message: "Success", data: [] }, HttpStatusCodes.OK);
    }

    const list = await db.query.users.findMany({
      where: eq(users.roleId, companyAdminRole.id),
      orderBy: [desc(users.id)],
      columns: {
        id: true,
        companyName: true,
        email: true,
        mobile: true,
        isActive: true,
        createdAt: true
      }
    });

    const data = list.map((item) => ({
      id: item.id,
      companyName: item.companyName,
      email: item.email,
      mobile: item.mobile,
      isActive: item.isActive,
      createdAt: item.createdAt ? String(item.createdAt) : null
    }));

    return c.json({ message: "Company list retrieved successfully", data }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("List company admins error:", error);
    return c.json({ message: "Failed to retrieve company list" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Create a new Company Admin.
 * Fields strictly: companyName, email (unique), mobile, password.
 */
export const store: Handler = async (c: any) => {
  try {
    const body = c.req.valid("json");

    // Check if email is already taken
    const existing = await db.query.users.findFirst({
      where: eq(users.email, body.email.toLowerCase().trim())
    });

    if (existing) {
      return c.json({ message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
    }

    // Find or create company_admin role
    let companyAdminRole = await db.query.roles.findFirst({
      where: eq(roles.name, "company_admin")
    });

    if (!companyAdminRole) {
      const [insertedRole] = await db.insert(roles).values({ name: "company_admin" }).returning();
      companyAdminRole = insertedRole;
    }

    const hashedPassword = await password.hashPassword(body.password);

    const [newUser] = await db
      .insert(users)
      .values({
        companyName: body.companyName.trim(),
        name: body.companyName.trim(),
        email: body.email.toLowerCase().trim(),
        mobile: body.mobile.trim(),
        password: hashedPassword,
        isActive: true,
        roleId: companyAdminRole?.id ?? null,
        emailVerifiedAt: new Date()
      })
      .returning();

    // Auto-initialize company settings row
    await ensureCompanySettingsTable();
    await db.insert(companySettings).values({
      userId: newUser.id,
      companyName: newUser.companyName,
      email: newUser.email,
      phone: newUser.mobile,
      invoicePrefix: "INV",
      invoicePattern: "{PREFIX}-{YYYY}-{0001}",
      printFormat: "a4"
    });

    return c.json(
      {
        message: "কোম্পানী এডমিন সফলভাবে তৈরি হয়েছে",
        data: {
          id: newUser.id,
          companyName: newUser.companyName,
          email: newUser.email,
          mobile: newUser.mobile,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt ? String(newUser.createdAt) : null
        }
      },
      HttpStatusCodes.CREATED
    );
  } catch (error) {
    console.error("Create company admin error:", error);
    return c.json({ message: "কোম্পানী এডমিন তৈরি ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Toggle Active / Inactive status of a Company Admin.
 * Deletion is strictly forbidden.
 */
export const toggleStatus: Handler = async (c: any) => {
  try {
    const id = Number(c.req.param("id"));
    if (!id || Number.isNaN(id)) {
      return c.json({ message: "Invalid ID" }, HttpStatusCodes.BAD_REQUEST);
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });

    if (!user) {
      return c.json({ message: "Company Admin not found" }, HttpStatusCodes.NOT_FOUND);
    }

    const nextStatus = typeof c.req.valid === "function" && c.req.valid("json")?.isActive !== undefined
      ? Boolean(c.req.valid("json").isActive)
      : !user.isActive;

    const [updatedUser] = await db
      .update(users)
      .set({
        isActive: nextStatus,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    return c.json(
      {
        message: `কোম্পানীর স্ট্যাটাস ${nextStatus ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`,
        data: {
          id: updatedUser.id,
          companyName: updatedUser.companyName,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          isActive: updatedUser.isActive,
          createdAt: updatedUser.createdAt ? String(updatedUser.createdAt) : null
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error) {
    console.error("Toggle company status error:", error);
    return c.json({ message: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get profile and settings of currently logged-in Company.
 */
export const getProfile: Handler = async (c: any) => {
  await ensureCompanySettingsTable();
  const auth = c.get("auth") || c.get("user");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(auth.id))
  });

  if (!user) {
    return c.json({ message: "ব্যবহারকারী পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  let settingsRow = await db.query.companySettings.findFirst({
    where: eq(companySettings.userId, user.id)
  });

  if (!settingsRow) {
    const [inserted] = await db.insert(companySettings).values({
      userId: user.id,
      companyName: user.companyName || user.name,
      email: user.email,
      phone: user.mobile,
      invoicePrefix: "INV",
      invoicePattern: "{PREFIX}-{YYYY}-{0001}",
      printFormat: "a4"
    }).returning();
    settingsRow = inserted;
  }

  return c.json({
    message: "Company profile retrieved successfully",
    data: {
      id: settingsRow.id,
      userId: user.id,
      companyName: settingsRow.companyName || user.companyName,
      tagline: settingsRow.tagline || "",
      email: user.email,
      phone: settingsRow.phone || "",
      mobile: user.mobile || "",
      address: settingsRow.address || "",
      tradeLicense: settingsRow.tradeLicense || "",
      vatBin: settingsRow.vatBin || "",
      invoicePrefix: settingsRow.invoicePrefix || "INV",
      productPrefix: settingsRow.productPrefix || "PRD-",
      invoicePattern: settingsRow.invoicePattern || "{PREFIX}-{YYYY}-{0001}",
      invoiceResetCycle: settingsRow.invoiceResetCycle || "yearly",
      printFormat: settingsRow.printFormat || "a4",
      invoiceTerms: settingsRow.invoiceTerms || "",
      paymentInfo: settingsRow.paymentInfo || "",
      logo: settingsRow.logo || "",
      isActive: user.isActive
    }
  }, HttpStatusCodes.OK);
};

/**
 * Update profile and settings of currently logged-in Company.
 */
export const updateProfile: Handler = async (c: any) => {
  await ensureCompanySettingsTable();
  const auth = c.get("auth") || c.get("user");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const userId = Number(auth.id);

  // Sync users table companyName and mobile
  await db.update(users).set({
    companyName: body.companyName.trim(),
    name: body.companyName.trim(),
    mobile: body.mobile?.trim() || body.phone?.trim(),
    updatedAt: new Date()
  }).where(eq(users.id, userId));

  // Upsert company_settings
  const existing = await db.query.companySettings.findFirst({
    where: eq(companySettings.userId, userId)
  });

  const validPrintFormats = ["a4", "a5", "pos", "pos_80", "pos_58"];
  const safePrintFormat = validPrintFormats.includes(body.printFormat) ? body.printFormat : "a4";
  const safeResetCycle = body.invoiceResetCycle === "continuous" ? "continuous" : "yearly";

  let saved;
  if (existing) {
    const [updated] = await db.update(companySettings).set({
      companyName: body.companyName.trim(),
      tagline: body.tagline?.trim() || null,
      phone: body.phone?.trim() || body.mobile?.trim() || null,
      address: body.address?.trim() || null,
      tradeLicense: body.tradeLicense?.trim() || null,
      vatBin: body.vatBin?.trim() || null,
      invoicePrefix: body.invoicePrefix?.trim() || "INV",
      productPrefix: body.productPrefix?.trim() || "PRD-",
      invoicePattern: body.invoicePattern?.trim() || "{PREFIX}-{YYYY}-{0001}",
      invoiceResetCycle: safeResetCycle,
      printFormat: safePrintFormat,
      invoiceTerms: body.invoiceTerms?.trim() || null,
      paymentInfo: body.paymentInfo?.trim() || null,
      logo: body.logo || null,
      updatedAt: new Date()
    }).where(eq(companySettings.userId, userId)).returning();
    saved = updated;
  } else {
    const [inserted] = await db.insert(companySettings).values({
      userId,
      companyName: body.companyName.trim(),
      tagline: body.tagline?.trim() || null,
      phone: body.phone?.trim() || body.mobile?.trim() || null,
      address: body.address?.trim() || null,
      tradeLicense: body.tradeLicense?.trim() || null,
      vatBin: body.vatBin?.trim() || null,
      invoicePrefix: body.invoicePrefix?.trim() || "INV",
      productPrefix: body.productPrefix?.trim() || "PRD-",
      invoicePattern: body.invoicePattern?.trim() || "{PREFIX}-{YYYY}-{0001}",
      invoiceResetCycle: safeResetCycle,
      printFormat: safePrintFormat,
      invoiceTerms: body.invoiceTerms?.trim() || null,
      paymentInfo: body.paymentInfo?.trim() || null,
      logo: body.logo || null
    }).returning();
    saved = inserted;
  }

  return c.json({
    message: "কোম্পানীর তথ্য সফলভাবে আপডেট হয়েছে",
    data: saved
  }, HttpStatusCodes.OK);
};

/**
 * Change Company Admin password securely.
 */
export const changePassword: Handler = async (c: any) => {
  const auth = c.get("auth") || c.get("user");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(auth.id))
  });

  if (!user) {
    return c.json({ message: "ব্যবহারকারী পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const isValid = await password.verifyPassword(body.currentPassword, user.password);
  if (!isValid) {
    return c.json({ message: "বর্তমান পাসওয়ার্ড সঠিক নয়" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
  }

  const hashedPassword = await password.hashPassword(body.newPassword);
  await db.update(users).set({
    password: hashedPassword,
    updatedAt: new Date()
  }).where(eq(users.id, user.id));

  return c.json({
    message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে"
  }, HttpStatusCodes.OK);
};
