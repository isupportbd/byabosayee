import { and, desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { executeRawSql } from "@/framework/database/auto-init.js";
import { capitalInvestments, capitalWithdrawals } from "@/modules/accounts/database/models/accounts.js";
import { companySettings } from "@/modules/company/database/models/company.js";
import { users } from "@/modules/auth/database/models/user.js";

let accountsTablesEnsured = false;
export async function ensureAccountsTables() {
  if (accountsTablesEnsured) return;
  try {
    await executeRawSql(`
      CREATE TABLE IF NOT EXISTS "capital_investments" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "shareholder_id" varchar(100),
        "shareholder_name" varchar(255) NOT NULL,
        "ownership_type" varchar(100) DEFAULT 'মালিক',
        "amount" numeric(15, 2) NOT NULL,
        "date" varchar(50) NOT NULL,
        "payment_method" varchar(100) DEFAULT 'নগদ' NOT NULL,
        "account_details" varchar(255),
        "receipt_no" varchar(100),
        "notes" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "capital_withdrawals" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "shareholder_id" varchar(100),
        "shareholder_name" varchar(255) NOT NULL,
        "ownership_type" varchar(100) DEFAULT 'মালিক',
        "amount" numeric(15, 2) NOT NULL,
        "date" varchar(50) NOT NULL,
        "payment_method" varchar(100) DEFAULT 'নগদ' NOT NULL,
        "account_details" varchar(255),
        "voucher_no" varchar(100),
        "notes" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS "capital_investments_user_id_idx" ON "capital_investments" ("user_id");
      CREATE INDEX IF NOT EXISTS "capital_withdrawals_user_id_idx" ON "capital_withdrawals" ("user_id");
    `);
    accountsTablesEnsured = true;
  } catch (err) {
    console.warn("[Auto-Init Accounts Tables Warning]:", err);
  }
}

function getUserId(c: any): number | null {
  const auth = c.get("auth") || c.get("user");
  return auth?.id ? Number(auth.id) : null;
}

/**
 * Get active shareholders for the current company
 */
export const getShareholders: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const [settingsRow, userRow] = await Promise.all([
      db.query.companySettings.findFirst({ where: eq(companySettings.userId, userId) }),
      db.query.users.findFirst({ where: eq(users.id, userId) })
    ]);

    const rawList = Array.isArray((settingsRow as any)?.shareholders) ? (settingsRow as any).shareholders : [];
    const shareholders: any[] = [];

    if (rawList.length > 0) {
      rawList.forEach((s: any, idx: number) => {
        if (s && s.name) {
          shareholders.push({
            id: s.id || `sh_${idx + 1}`,
            name: s.name.trim(),
            ownershipType: s.ownershipType || "শেয়ারহোল্ডার",
            mobile: s.mobile || "",
            address: s.address || ""
          });
        }
      });
    }

    // If no custom shareholders in settings, add default company owner
    if (shareholders.length === 0) {
      shareholders.push({
        id: "owner",
        name: userRow?.name || "প্রধান মালিক",
        ownershipType: "মালিক",
        mobile: userRow?.mobile || "",
        address: (settingsRow as any)?.address || ""
      });
    }

    return c.json({ data: shareholders }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Error fetching shareholders:", error);
    return c.json({ message: "শেয়ারহোল্ডার তথ্য পেতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * ── CAPITAL INVESTMENTS (মূলধন / পুঁজি বিনিয়োগ) ──
 */
export const getCapitals: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const query = c.req.query();
    const search = (query.search || "").toLowerCase().trim();
    const shareholder = (query.shareholder || "").trim();
    const paymentMethod = (query.paymentMethod || "").trim();
    const startDate = (query.startDate || "").trim();
    const endDate = (query.endDate || "").trim();

    let list = await db
      .select()
      .from(capitalInvestments)
      .where(eq(capitalInvestments.userId, userId))
      .orderBy(desc(capitalInvestments.date), desc(capitalInvestments.id));

    if (shareholder) {
      list = list.filter((item: any) => item.shareholderName === shareholder || item.shareholderId === shareholder);
    }

    if (paymentMethod) {
      list = list.filter((item: any) => item.paymentMethod === paymentMethod);
    }

    if (startDate) {
      list = list.filter((item: any) => item.date >= startDate);
    }

    if (endDate) {
      list = list.filter((item: any) => item.date <= endDate);
    }

    if (search) {
      list = list.filter(
        (item: any) =>
          item.shareholderName.toLowerCase().includes(search) ||
          (item.receiptNo && item.receiptNo.toLowerCase().includes(search)) ||
          (item.notes && item.notes.toLowerCase().includes(search)) ||
          (item.paymentMethod && item.paymentMethod.toLowerCase().includes(search))
      );
    }

    // Compute stats
    let totalAmount = 0;
    const shareholderMap: Record<string, { name: string; ownershipType: string; total: number; count: number }> = {};

    list.forEach((item: any) => {
      const amt = Number(item.amount) || 0;
      totalAmount += amt;

      const key = item.shareholderName || "অজ্ঞাত";
      if (!shareholderMap[key]) {
        shareholderMap[key] = {
          name: key,
          ownershipType: item.ownershipType || "মালিক",
          total: 0,
          count: 0
        };
      }
      shareholderMap[key].total += amt;
      shareholderMap[key].count += 1;
    });

    const summary = {
      totalAmount,
      count: list.length,
      shareholdersCount: Object.keys(shareholderMap).length,
      shareholderBreakdown: Object.values(shareholderMap)
    };

    return c.json({ data: list, summary }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Error fetching capitals:", error);
    return c.json({ message: "পুঁজি বিবরণী পেতে সমস্যা হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getCapitalById: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ message: "সঠিক আইডি প্রদান করুন" }, HttpStatusCodes.BAD_REQUEST);
  }

  try {
    const [record] = await db
      .select()
      .from(capitalInvestments)
      .where(and(eq(capitalInvestments.id, id), eq(capitalInvestments.userId, userId)));

    if (!record) {
      return c.json({ message: "রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ data: record }, HttpStatusCodes.OK);
  } catch (error: any) {
    return c.json({ message: error.message }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createCapital: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const body = await c.req.json();
    const amountNum = Number(body.amount);
    if (!amountNum || amountNum <= 0) {
      return c.json({ message: "সঠিক টাকার পরিমাণ দিন" }, HttpStatusCodes.BAD_REQUEST);
    }

    if (!body.shareholderName || !body.shareholderName.trim()) {
      return c.json({ message: "শেয়ারহোল্ডার বা বিনিয়োগকারীর নাম দিন" }, HttpStatusCodes.BAD_REQUEST);
    }

    const [created] = await db
      .insert(capitalInvestments)
      .values({
        userId,
        shareholderId: body.shareholderId || null,
        shareholderName: body.shareholderName.trim(),
        ownershipType: body.ownershipType || "মালিক",
        amount: String(amountNum.toFixed(2)),
        date: body.date || new Date().toISOString().split("T")[0],
        paymentMethod: body.paymentMethod || "নগদ",
        accountDetails: body.accountDetails ? body.accountDetails.trim() : null,
        receiptNo: body.receiptNo ? body.receiptNo.trim() : null,
        notes: body.notes ? body.notes.trim() : null
      })
      .returning();

    return c.json({ message: "মূলধন / পুঁজি সফলভাবে যোগ করা হয়েছে", data: created }, HttpStatusCodes.CREATED);
  } catch (error: any) {
    console.error("Error creating capital:", error);
    return c.json({ message: error.message || "পুঁজি যোগ করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateCapital: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ message: "সঠিক আইডি প্রদান করুন" }, HttpStatusCodes.BAD_REQUEST);
  }

  try {
    const body = await c.req.json();
    const updateData: any = { updatedAt: new Date() };

    if (body.shareholderId !== undefined) updateData.shareholderId = body.shareholderId;
    if (body.shareholderName !== undefined) updateData.shareholderName = body.shareholderName.trim();
    if (body.ownershipType !== undefined) updateData.ownershipType = body.ownershipType;
    if (body.amount !== undefined) updateData.amount = String(Number(body.amount).toFixed(2));
    if (body.date !== undefined) updateData.date = body.date;
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.accountDetails !== undefined) updateData.accountDetails = body.accountDetails?.trim() || null;
    if (body.receiptNo !== undefined) updateData.receiptNo = body.receiptNo?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    const [updated] = await db
      .update(capitalInvestments)
      .set(updateData)
      .where(and(eq(capitalInvestments.id, id), eq(capitalInvestments.userId, userId)))
      .returning();

    if (!updated) {
      return c.json({ message: "রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ message: "পুঁজি তথ্য সফলভাবে আপডেট হয়েছে", data: updated }, HttpStatusCodes.OK);
  } catch (error: any) {
    return c.json({ message: error.message || "আপডেট ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deleteCapital: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ message: "সঠিক আইডি প্রদান করুন" }, HttpStatusCodes.BAD_REQUEST);
  }

  try {
    const [deleted] = await db
      .delete(capitalInvestments)
      .where(and(eq(capitalInvestments.id, id), eq(capitalInvestments.userId, userId)))
      .returning();

    if (!deleted) {
      return c.json({ message: "রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ message: "পুঁজি রেকর্ড সফলভাবে মুছে ফেলা হয়েছে" }, HttpStatusCodes.OK);
  } catch (error: any) {
    return c.json({ message: error.message || "মুছে ফেলতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * ── CAPITAL WITHDRAWALS (মূলধন / লাভ উত্তোলন) ──
 */
export const getWithdrawals: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const query = c.req.query();
    const search = (query.search || "").toLowerCase().trim();
    const shareholder = (query.shareholder || "").trim();
    const paymentMethod = (query.paymentMethod || "").trim();
    const startDate = (query.startDate || "").trim();
    const endDate = (query.endDate || "").trim();

    let list = await db
      .select()
      .from(capitalWithdrawals)
      .where(eq(capitalWithdrawals.userId, userId))
      .orderBy(desc(capitalWithdrawals.date), desc(capitalWithdrawals.id));

    if (shareholder) {
      list = list.filter((item: any) => item.shareholderName === shareholder || item.shareholderId === shareholder);
    }

    if (paymentMethod) {
      list = list.filter((item: any) => item.paymentMethod === paymentMethod);
    }

    if (startDate) {
      list = list.filter((item: any) => item.date >= startDate);
    }

    if (endDate) {
      list = list.filter((item: any) => item.date <= endDate);
    }

    if (search) {
      list = list.filter(
        (item: any) =>
          item.shareholderName.toLowerCase().includes(search) ||
          (item.voucherNo && item.voucherNo.toLowerCase().includes(search)) ||
          (item.notes && item.notes.toLowerCase().includes(search)) ||
          (item.paymentMethod && item.paymentMethod.toLowerCase().includes(search))
      );
    }

    let totalAmount = 0;
    const shareholderMap: Record<string, { name: string; ownershipType: string; total: number; count: number }> = {};

    list.forEach((item: any) => {
      const amt = Number(item.amount) || 0;
      totalAmount += amt;

      const key = item.shareholderName || "অজ্ঞাত";
      if (!shareholderMap[key]) {
        shareholderMap[key] = {
          name: key,
          ownershipType: item.ownershipType || "মালিক",
          total: 0,
          count: 0
        };
      }
      shareholderMap[key].total += amt;
      shareholderMap[key].count += 1;
    });

    const summary = {
      totalAmount,
      count: list.length,
      shareholdersCount: Object.keys(shareholderMap).length,
      shareholderBreakdown: Object.values(shareholderMap)
    };

    return c.json({ data: list, summary }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Error fetching withdrawals:", error);
    return c.json({ message: "উত্তোলন বিবরণী পেতে সমস্যা হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getWithdrawalById: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ message: "সঠিক আইডি প্রদান করুন" }, HttpStatusCodes.BAD_REQUEST);
  }

  try {
    const [record] = await db
      .select()
      .from(capitalWithdrawals)
      .where(and(eq(capitalWithdrawals.id, id), eq(capitalWithdrawals.userId, userId)));

    if (!record) {
      return c.json({ message: "রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ data: record }, HttpStatusCodes.OK);
  } catch (error: any) {
    return c.json({ message: error.message }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const createWithdrawal: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const body = await c.req.json();
    const amountNum = Number(body.amount);
    if (!amountNum || amountNum <= 0) {
      return c.json({ message: "সঠিক টাকার পরিমাণ দিন" }, HttpStatusCodes.BAD_REQUEST);
    }

    if (!body.shareholderName || !body.shareholderName.trim()) {
      return c.json({ message: "উত্তোলনকারীর নাম দিন" }, HttpStatusCodes.BAD_REQUEST);
    }

    const [created] = await db
      .insert(capitalWithdrawals)
      .values({
        userId,
        shareholderId: body.shareholderId || null,
        shareholderName: body.shareholderName.trim(),
        ownershipType: body.ownershipType || "মালিক",
        amount: String(amountNum.toFixed(2)),
        date: body.date || new Date().toISOString().split("T")[0],
        paymentMethod: body.paymentMethod || "নগদ",
        accountDetails: body.accountDetails ? body.accountDetails.trim() : null,
        voucherNo: body.voucherNo ? body.voucherNo.trim() : null,
        notes: body.notes ? body.notes.trim() : null
      })
      .returning();

    return c.json({ message: "উত্তোলন সফলভাবে রেকর্ড করা হয়েছে", data: created }, HttpStatusCodes.CREATED);
  } catch (error: any) {
    console.error("Error creating withdrawal:", error);
    return c.json({ message: error.message || "উত্তোলন রেকর্ড করতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const updateWithdrawal: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ message: "সঠিক আইডি প্রদান করুন" }, HttpStatusCodes.BAD_REQUEST);
  }

  try {
    const body = await c.req.json();
    const updateData: any = { updatedAt: new Date() };

    if (body.shareholderId !== undefined) updateData.shareholderId = body.shareholderId;
    if (body.shareholderName !== undefined) updateData.shareholderName = body.shareholderName.trim();
    if (body.ownershipType !== undefined) updateData.ownershipType = body.ownershipType;
    if (body.amount !== undefined) updateData.amount = String(Number(body.amount).toFixed(2));
    if (body.date !== undefined) updateData.date = body.date;
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.accountDetails !== undefined) updateData.accountDetails = body.accountDetails?.trim() || null;
    if (body.voucherNo !== undefined) updateData.voucherNo = body.voucherNo?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    const [updated] = await db
      .update(capitalWithdrawals)
      .set(updateData)
      .where(and(eq(capitalWithdrawals.id, id), eq(capitalWithdrawals.userId, userId)))
      .returning();

    if (!updated) {
      return c.json({ message: "রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ message: "উত্তোলন তথ্য সফলভাবে আপডেট হয়েছে", data: updated }, HttpStatusCodes.OK);
  } catch (error: any) {
    return c.json({ message: error.message || "আপডেট ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deleteWithdrawal: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ message: "সঠিক আইডি প্রদান করুন" }, HttpStatusCodes.BAD_REQUEST);
  }

  try {
    const [deleted] = await db
      .delete(capitalWithdrawals)
      .where(and(eq(capitalWithdrawals.id, id), eq(capitalWithdrawals.userId, userId)))
      .returning();

    if (!deleted) {
      return c.json({ message: "রেকর্ড পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ message: "উত্তোলন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে" }, HttpStatusCodes.OK);
  } catch (error: any) {
    return c.json({ message: error.message || "মুছে ফেলতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * ── OVERALL ACCOUNTS SUMMARY (সার্বিক হিসাব খাতা সামারি) ──
 */
export const getAccountsSummary: Handler = async (c: any) => {
  await ensureAccountsTables();
  const userId = getUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const [capitalRes, withdrawalRes] = await Promise.all([
      db.execute(
        sql`SELECT coalesce(sum(amount), 0)::numeric as total_amount, count(*)::int as count FROM "capital_investments" WHERE "user_id" = ${userId}`
      ),
      db.execute(
        sql`SELECT coalesce(sum(amount), 0)::numeric as total_amount, count(*)::int as count FROM "capital_withdrawals" WHERE "user_id" = ${userId}`
      )
    ]);

    const capRow = (capitalRes.rows || capitalRes)[0] as any || {};
    const withRow = (withdrawalRes.rows || withdrawalRes)[0] as any || {};

    const totalCapital = Number(capRow.total_amount) || 0;
    const totalWithdrawn = Number(withRow.total_amount) || 0;
    const netCapital = totalCapital - totalWithdrawn;

    return c.json(
      {
        data: {
          totalCapital,
          totalWithdrawn,
          netCapital,
          capitalCount: Number(capRow.count) || 0,
          withdrawalCount: Number(withRow.count) || 0
        }
      },
      HttpStatusCodes.OK
    );
  } catch (error: any) {
    console.error("Error fetching accounts summary:", error);
    return c.json({ message: "হিসাব সারাংশ পেতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
