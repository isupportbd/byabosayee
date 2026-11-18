import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { capitalInvestments, capitalWithdrawals } from "@/modules/accounts/database/models/accounts.js";
import {
  categories,
  colors,
  productTypes,
  sizes,
  subCategories,
  units
} from "@/modules/catalog/database/models/catalog.js";
import {
  brands,
  customers,
  items,
  manufacturers,
  purchaseItems,
  purchases,
  saleItems,
  sales,
  suppliers
} from "@/modules/inventory/database/models/inventory.js";

async function getEffectiveUserId(c: any): Promise<number | null> {
  const auth = c.get("auth") || c.get("user");
  if (!auth?.id) return null;
  const uid = Number(auth.id);

  // If super_admin, check if superadmin has personal items; if not, fallback to primary company user
  if (auth.role === "super_admin") {
    const hasItems = await db.select({ count: sql<number>`count(*)::int` }).from(items).where(eq(items.userId, uid));
    if (hasItems[0]?.count && hasItems[0].count > 0) {
      return uid;
    }
    const compUser = await db
      .select({ userId: items.userId, count: sql<number>`count(*)::int` })
      .from(items)
      .groupBy(items.userId)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    if (compUser[0]?.userId) {
      return compUser[0].userId;
    }
  }

  return uid;
}

/**
 * Calculate date bounds based on period string
 */
function resolveDateRange(period?: string, start?: string, end?: string): { startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (period === "today") {
    return { startDate: todayStr, endDate: todayStr };
  }

  if (period === "week") {
    const weekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    return { startDate: weekAgo.toISOString().slice(0, 10), endDate: todayStr };
  }

  if (period === "month") {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return { startDate: `${year}-${month}-01`, endDate: todayStr };
  }

  if (period === "year") {
    const year = now.getFullYear();
    return { startDate: `${year}-01-01`, endDate: todayStr };
  }

  if (start && end) {
    return { startDate: start, endDate: end };
  }

  if (start) {
    return { startDate: start, endDate: todayStr };
  }

  // Default to this month
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return { startDate: `${year}-${month}-01`, endDate: todayStr };
}

/**
 * 1. DASHBOARD & EXECUTIVE SUMMARY REPORT
 * আজকের / সপ্তাহের / মাসের / বছরের মোট বিক্রয়, ক্রয়, আদায়, বকেয়া ও ইনভেন্টরি স্টক সারাংশ
 */
export const getSummaryReport: Handler = async (c: any) => {
  const userId = await getEffectiveUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const query = c.req.query();
    const { startDate, endDate } = resolveDateRange(query.period, query.startDate, query.endDate);

    // 1. Fetch Sales during range
    const allSales = await db
      .select()
      .from(sales)
      .where(and(eq(sales.userId, userId)));

    const periodSales = allSales.filter((s: any) => {
      const d = s.saleDate || (s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "");
      return d >= startDate && d <= endDate;
    });

    let salesTotalAmount = 0;
    let salesPaidAmount = 0;
    let salesDueAmount = 0;
    let salesDiscount = 0;
    let salesVat = 0;

    periodSales.forEach((s: any) => {
      salesTotalAmount += Number(s.totalAmount) || 0;
      salesPaidAmount += Number(s.paidAmount) || 0;
      salesDueAmount += Number(s.dueAmount) || 0;
      salesDiscount += Number(s.discountAmount) || 0;
      salesVat += Number(s.vatAmount) || 0;
    });

    // 2. Fetch Purchases during range
    const allPurchases = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.userId, userId)));

    const periodPurchases = allPurchases.filter((p: any) => {
      const d = p.challanDate || (p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "");
      return d >= startDate && d <= endDate;
    });

    let purchasesTotalAmount = 0;
    let purchasesPaidAmount = 0;
    let purchasesDueAmount = 0;

    periodPurchases.forEach((p: any) => {
      purchasesTotalAmount += Number(p.totalAmount) || 0;
      purchasesPaidAmount += Number(p.paidAmount) || 0;
      purchasesDueAmount += Number(p.dueAmount) || 0;
    });

    // 3. Current Stock Status (Overall) with Catalog Details
    const allItems = await db
      .select({
        id: items.id,
        name: items.name,
        code: items.code,
        barcode: items.barcode,
        designCode: items.designCode,
        stockQuantity: items.stockQuantity,
        purchasePrice: items.purchasePrice,
        sellingPrice: items.sellingPrice,
        alertQuantity: items.alertQuantity,
        brandId: items.brandId,
        categoryId: items.categoryId,
        brandName: brands.name,
        categoryName: categories.name
      })
      .from(items)
      .leftJoin(brands, eq(items.brandId, brands.id))
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .where(eq(items.userId, userId));

    const itemsMap = new Map<number, any>();
    let totalStockPieces = 0;
    let totalStockPurchaseValue = 0;
    let totalStockSellingValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    allItems.forEach((it: any) => {
      itemsMap.set(it.id, it);
      const qty = Number(it.stockQuantity) || 0;
      const cost = Number(it.purchasePrice) || 0;
      const sell = Number(it.sellingPrice) || 0;
      const alert = 50; // User rule: ৫০ এর নিচে নামলে স্টক লো

      totalStockPieces += qty;
      totalStockPurchaseValue += qty * cost;
      totalStockSellingValue += qty * sell;

      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= alert) {
        lowStockCount++;
      }
    });

    // 4. Sale Items Breakdown (Top Brands, Top Designs, Top Products, Reorder Insights)
    const saleIds = periodSales.map((s: any) => s.id);
    const allSaleIds = allSales.map((s: any) => s.id);
    
    // If period has sales, use period sales; otherwise fallback to all-time sales for top items
    const targetSaleIds = saleIds.length > 0 ? saleIds : allSaleIds;
    const isAllTimeFallback = saleIds.length === 0 && allSaleIds.length > 0;

    let periodSaleItems: any[] = [];
    if (targetSaleIds.length > 0) {
      periodSaleItems = await db
        .select()
        .from(saleItems)
        .where(inArray(saleItems.saleId, targetSaleIds));
    }

    // A. Brand Sales Analytics
    const brandSalesMap: Record<string, { brandName: string; quantitySold: number; totalRevenue: number; currentStock: number }> = {};
    allItems.forEach((it: any) => {
      const bName = it.brandName || "অন্যান্য";
      if (!brandSalesMap[bName]) {
        brandSalesMap[bName] = { brandName: bName, quantitySold: 0, totalRevenue: 0, currentStock: 0 };
      }
      brandSalesMap[bName].currentStock += Number(it.stockQuantity) || 0;
    });

    periodSaleItems.forEach((si: any) => {
      const bName = si.brandName || (si.itemId && itemsMap.get(si.itemId)?.brandName) || "অন্যান্য";
      if (!brandSalesMap[bName]) {
        brandSalesMap[bName] = { brandName: bName, quantitySold: 0, totalRevenue: 0, currentStock: 0 };
      }
      const qty = Number(si.quantity) || 0;
      const price = Number(si.totalPrice) || (qty * (Number(si.unitPrice) || 0));
      brandSalesMap[bName].quantitySold += qty;
      brandSalesMap[bName].totalRevenue += price;
    });

    const topBrands = Object.values(brandSalesMap)
      .filter((b) => b.quantitySold > 0)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // B. Design Sales Analytics (পণ্যের সম্পূর্ণ নামসহ ডিজাইন তথ্য)
    const designSalesMap: Record<string, { designCode: string; productName: string; brandName: string; quantitySold: number; totalRevenue: number; currentStock: number }> = {};
    allItems.forEach((it: any) => {
      const dCode = it.designCode || "সাধারণ";
      if (!designSalesMap[dCode]) {
        const fullProdName = it.name || it.categoryName || dCode;
        designSalesMap[dCode] = {
          designCode: dCode,
          productName: fullProdName,
          brandName: it.brandName || "-",
          quantitySold: 0,
          totalRevenue: 0,
          currentStock: 0
        };
      }
      designSalesMap[dCode].currentStock += Number(it.stockQuantity) || 0;
    });

    periodSaleItems.forEach((si: any) => {
      const item = si.itemId ? itemsMap.get(si.itemId) : null;
      const dCode = item?.designCode || si.designCode || "সাধারণ";
      const fullProdName = item?.name || si.name || dCode;
      if (!designSalesMap[dCode]) {
        designSalesMap[dCode] = {
          designCode: dCode,
          productName: fullProdName,
          brandName: item?.brandName || si.brandName || "-",
          quantitySold: 0,
          totalRevenue: 0,
          currentStock: 0
        };
      }
      const qty = Number(si.quantity) || 0;
      const price = Number(si.totalPrice) || (qty * (Number(si.unitPrice) || 0));
      designSalesMap[dCode].quantitySold += qty;
      designSalesMap[dCode].totalRevenue += price;
      if (fullProdName && (!designSalesMap[dCode].productName || designSalesMap[dCode].productName === dCode)) {
        designSalesMap[dCode].productName = fullProdName;
      }
    });

    const topDesigns = Object.values(designSalesMap)
      .filter((d) => d.quantitySold > 0)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // C. Top Selling Products
    const productSalesMap: Record<string, { itemId: number | null; name: string; code: string; barcode: string; brandName: string; designCode: string; quantitySold: number; totalRevenue: number; currentStock: number; alertQuantity: number }> = {};
    periodSaleItems.forEach((si: any) => {
      const key = si.itemId ? String(si.itemId) : `${si.name}_${si.barcode || ""}`;
      const item = si.itemId ? itemsMap.get(si.itemId) : null;
      if (!productSalesMap[key]) {
        productSalesMap[key] = {
          itemId: si.itemId || null,
          name: si.name,
          code: item?.code || "-",
          barcode: si.barcode || item?.barcode || "-",
          brandName: si.brandName || item?.brandName || "-",
          designCode: item?.designCode || "-",
          quantitySold: 0,
          totalRevenue: 0,
          currentStock: item ? Number(item.stockQuantity) || 0 : 0,
          alertQuantity: item ? Number(item.alertQuantity) || 5 : 5
        };
      }
      const qty = Number(si.quantity) || 0;
      const price = Number(si.totalPrice) || (qty * (Number(si.unitPrice) || 0));
      productSalesMap[key].quantitySold += qty;
      productSalesMap[key].totalRevenue += price;
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    // D. Inventory Reordering Decisions (সর্বোচ্চ ৫টি আইটেম প্রদর্শিত হবে)
    // ১. স্টক বাড়ানো দরকার (বিক্রয় তথ্য বিশ্লেষণ করে সর্বাধিক বিক্রিত পণ্যগুলোর মধ্যে যেগুলোর স্টক সীমিত বা শেষ [<= ৫০ পিস])
    const lowStockThreshold = 50;
    const itemCandidates = allItems
      .filter((it: any) => (Number(it.stockQuantity) || 0) <= lowStockThreshold)
      .map((it: any) => {
        const soldQty = productSalesMap[String(it.id)]?.quantitySold || 0;
        const rev = productSalesMap[String(it.id)]?.totalRevenue || 0;
        return {
          itemId: it.id,
          name: it.name,
          code: it.code || "-",
          barcode: it.barcode || "-",
          brandName: it.brandName || "-",
          designCode: it.designCode || "-",
          quantitySold: soldQty,
          totalRevenue: rev,
          currentStock: Number(it.stockQuantity) || 0,
          alertQuantity: lowStockThreshold
        };
      });

    // Sort: First by quantitySold DESC (সর্বাধিক বিক্রিত পণ্য আগে আসবে), then by currentStock ASC (কম স্টক আগে)
    const restockRecommendations = itemCandidates
      .sort((a, b) => {
        if (a.quantitySold > 0 && b.quantitySold === 0) return -1;
        if (b.quantitySold > 0 && a.quantitySold === 0) return 1;
        if (b.quantitySold !== a.quantitySold) {
          return b.quantitySold - a.quantitySold;
        }
        return a.currentStock - b.currentStock;
      })
      .slice(0, 5);

    // ২. কেনার প্রয়োজন নেই (পর্যাপ্ত মজুদ আছে [> ৫০ পিস] / ওভারস্টক)
    const noRestockNeeded = allItems
      .filter((it: any) => (Number(it.stockQuantity) || 0) > lowStockThreshold)
      .sort((a: any, b: any) => (Number(b.stockQuantity) || 0) - (Number(a.stockQuantity) || 0))
      .slice(0, 5)
      .map((it: any) => {
        const soldQty = productSalesMap[String(it.id)]?.quantitySold || 0;
        return {
          itemId: it.id,
          name: it.name,
          code: it.code || "-",
          barcode: it.barcode || "-",
          brandName: it.brandName || "-",
          designCode: it.designCode || "-",
          currentStock: Number(it.stockQuantity) || 0,
          quantitySold: soldQty,
          alertQuantity: lowStockThreshold,
          stockCostValue: (Number(it.stockQuantity) || 0) * (Number(it.purchasePrice) || 0)
        };
      });

    // 5. Fetch Capital & Withdrawals during range
    const [allCapitals, allWithdrawals] = await Promise.all([
      db.select().from(capitalInvestments).where(eq(capitalInvestments.userId, userId)),
      db.select().from(capitalWithdrawals).where(eq(capitalWithdrawals.userId, userId))
    ]);

    const periodCapitals = allCapitals.filter((c: any) => c.date >= startDate && c.date <= endDate);
    const periodWithdrawals = allWithdrawals.filter((w: any) => w.date >= startDate && w.date <= endDate);

    const capitalInvested = periodCapitals.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const capitalWithdrawn = periodWithdrawals.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return c.json({
      data: {
        dateRange: { startDate, endDate },
        sales: {
          count: periodSales.length,
          totalAmount: salesTotalAmount,
          paidAmount: salesPaidAmount,
          dueAmount: salesDueAmount,
          discountAmount: salesDiscount,
          vatAmount: salesVat
        },
        purchases: {
          count: periodPurchases.length,
          totalAmount: purchasesTotalAmount,
          paidAmount: purchasesPaidAmount,
          dueAmount: purchasesDueAmount
        },
        capital: {
          invested: capitalInvested,
          withdrawn: capitalWithdrawn,
          net: capitalInvested - capitalWithdrawn
        },
        inventory: {
          totalItems: allItems.length,
          totalPieces: totalStockPieces,
          purchaseValue: totalStockPurchaseValue,
          sellingValue: totalStockSellingValue,
          potentialProfit: totalStockSellingValue - totalStockPurchaseValue,
          lowStockCount,
          outOfStockCount
        },
        analytics: {
          topBrands,
          topDesigns,
          topProducts,
          restockRecommendations,
          noRestockNeeded
        }
      }
    }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Summary report error:", error);
    return c.json({ message: "রিপোর্ট সামারি পেতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 2. SPECIFIC PRODUCT-WISE STOCK & INVENTORY REPORT
 * কোন কোন পণ্যের বর্তমান স্টক কত, ক্রয়মূল্য ও বিক্রয়মূল্যের মোট স্টক ভ্যালু
 */
export const getStockReport: Handler = async (c: any) => {
  const userId = await getEffectiveUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const query = c.req.query();
    const search = (query.search || "").toLowerCase().trim();
    const categoryId = query.categoryId ? Number(query.categoryId) : null;
    const brandId = query.brandId ? Number(query.brandId) : null;
    const status = query.status || "all"; // all | in_stock | low_stock | out_of_stock

    // Fetch products with joined catalog details
    const productRows = await db
      .select({
        id: items.id,
        name: items.name,
        code: items.code,
        barcode: items.barcode,
        designCode: items.designCode,
        stockQuantity: items.stockQuantity,
        alertQuantity: items.alertQuantity,
        purchasePrice: items.purchasePrice,
        sellingPrice: items.sellingPrice,
        categoryId: items.categoryId,
        subCategoryId: items.subCategoryId,
        brandId: items.brandId,
        sizeId: items.sizeId,
        colorId: items.colorId,
        unitId: items.unitId,
        categoryName: categories.name,
        subCategoryName: subCategories.name,
        brandName: brands.name,
        sizeName: sizes.name,
        colorName: colors.name,
        unitName: units.name
      })
      .from(items)
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .leftJoin(subCategories, eq(items.subCategoryId, subCategories.id))
      .leftJoin(brands, eq(items.brandId, brands.id))
      .leftJoin(sizes, eq(items.sizeId, sizes.id))
      .leftJoin(colors, eq(items.colorId, colors.id))
      .leftJoin(units, eq(items.unitId, units.id))
      .where(eq(items.userId, userId))
      .orderBy(items.name);

    let filtered = productRows.map((it: any) => {
      const qty = Number(it.stockQuantity) || 0;
      const alert = 50; // User rule: ৫০ এর নিচে নামলে লো-স্টক
      const cost = Number(it.purchasePrice) || 0;
      const sell = Number(it.sellingPrice) || 0;
      const stockCostValue = qty * cost;
      const stockSellingValue = qty * sell;

      let stockStatus = "in_stock";
      if (qty <= 0) stockStatus = "out_of_stock";
      else if (qty <= alert) stockStatus = "low_stock";

      return {
        ...it,
        stockQuantity: qty,
        purchasePrice: cost,
        sellingPrice: sell,
        stockCostValue,
        stockSellingValue,
        stockMargin: stockSellingValue - stockCostValue,
        stockStatus
      };
    });

    if (categoryId) {
      filtered = filtered.filter((it) => it.categoryId === categoryId);
    }

    if (brandId) {
      filtered = filtered.filter((it) => it.brandId === brandId);
    }

    if (status && status !== "all") {
      filtered = filtered.filter((it) => it.stockStatus === status);
    }

    if (search) {
      filtered = filtered.filter(
        (it) =>
          (it.name && it.name.toLowerCase().includes(search)) ||
          (it.code && it.code.toLowerCase().includes(search)) ||
          (it.barcode && it.barcode.toLowerCase().includes(search)) ||
          (it.designCode && it.designCode.toLowerCase().includes(search)) ||
          (it.brandName && it.brandName.toLowerCase().includes(search)) ||
          (it.categoryName && it.categoryName.toLowerCase().includes(search))
      );
    }

    // Totals
    let totalPieces = 0;
    let totalCostVal = 0;
    let totalSellingVal = 0;
    let lowStockItems = 0;
    let outStockItems = 0;

    filtered.forEach((it) => {
      totalPieces += it.stockQuantity;
      totalCostVal += it.stockCostValue;
      totalSellingVal += it.stockSellingValue;
      if (it.stockStatus === "out_of_stock") outStockItems++;
      if (it.stockStatus === "low_stock") lowStockItems++;
    });

    return c.json({
      data: filtered,
      summary: {
        totalProducts: filtered.length,
        totalPieces,
        totalCostValue: totalCostVal,
        totalSellingValue: totalSellingVal,
        totalPotentialProfit: totalSellingVal - totalCostVal,
        lowStockItems,
        outStockItems
      }
    }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Stock report error:", error);
    return c.json({ message: "স্টক রিপোর্ট পেতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 3. COMPREHENSIVE FINANCIAL & CASHFLOW STATEMENT REPORT
 * সমন্বিত আর্থিক বিবরণী, ক্যাশ ফ্লো এবং নেট বিজনেস ব্যালেন্স
 */
export const getStatementReport: Handler = async (c: any) => {
  const userId = await getEffectiveUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const query = c.req.query();
    const { startDate, endDate } = resolveDateRange(query.period, query.startDate, query.endDate);

    const [allSales, allPurchases, allCapitals, allWithdrawals, allItems] = await Promise.all([
      db.select().from(sales).where(eq(sales.userId, userId)),
      db.select().from(purchases).where(eq(purchases.userId, userId)),
      db.select().from(capitalInvestments).where(eq(capitalInvestments.userId, userId)),
      db.select().from(capitalWithdrawals).where(eq(capitalWithdrawals.userId, userId)),
      db.select().from(items).where(eq(items.userId, userId))
    ]);

    // Build timeline of statement entries within date range
    const transactions: any[] = [];

    // Sales Cash Received
    allSales.forEach((s: any) => {
      const date = s.saleDate || (s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "");
      if (date >= startDate && date <= endDate) {
        const paid = Number(s.paidAmount) || 0;
        const total = Number(s.totalAmount) || 0;
        const due = Number(s.dueAmount) || 0;
        transactions.push({
          date,
          type: "sale",
          typeLabel: "পণ্য বিক্রয় (নগদ আদায়)",
          reference: s.invoiceNumber,
          party: s.customerName || "খুচরা ক্রেতা",
          inflow: paid,
          outflow: 0,
          due,
          totalAmount: total,
          notes: s.notes || "-"
        });
      }
    });

    // Purchases Cash Paid
    allPurchases.forEach((p: any) => {
      const date = p.challanDate || (p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "");
      if (date >= startDate && date <= endDate) {
        const paid = Number(p.paidAmount) || 0;
        const total = Number(p.totalAmount) || 0;
        const due = Number(p.dueAmount) || 0;
        transactions.push({
          date,
          type: "purchase",
          typeLabel: "মালামাল ক্রয় (পরিশোধ)",
          reference: p.challanNumber || `CH-${p.id}`,
          party: "সরবরাহকারী",
          inflow: 0,
          outflow: paid,
          due,
          totalAmount: total,
          notes: p.notes || "-"
        });
      }
    });

    // Capital Inflow
    allCapitals.forEach((cap: any) => {
      if (cap.date >= startDate && cap.date <= endDate) {
        const amt = Number(cap.amount) || 0;
        transactions.push({
          date: cap.date,
          type: "capital",
          typeLabel: "মূলধন জমা (ইনভেস্টমেন্ট)",
          reference: cap.receiptNo || `CAP-${cap.id}`,
          party: cap.shareholderName,
          inflow: amt,
          outflow: 0,
          due: 0,
          totalAmount: amt,
          notes: cap.notes || "-"
        });
      }
    });

    // Capital Outflow / Withdrawals
    allWithdrawals.forEach((wth: any) => {
      if (wth.date >= startDate && wth.date <= endDate) {
        const amt = Number(wth.amount) || 0;
        transactions.push({
          date: wth.date,
          type: "withdrawal",
          typeLabel: "মূলধন/লাভ উত্তোলন",
          reference: wth.voucherNo || `WTH-${wth.id}`,
          party: wth.shareholderName,
          inflow: 0,
          outflow: amt,
          due: 0,
          totalAmount: amt,
          notes: wth.notes || "-"
        });
      }
    });

    // Sort transactions chronologically
    transactions.sort((a, b) => b.date.localeCompare(a.date));

    // Calculate Cashflow Totals
    let totalInflow = 0;
    let totalOutflow = 0;
    transactions.forEach((tx) => {
      totalInflow += tx.inflow;
      totalOutflow += tx.outflow;
    });

    // Cumulative Balance Sheet (Position of Business)
    let totalCustomerReceivables = 0;
    allSales.forEach((s: any) => {
      totalCustomerReceivables += Number(s.dueAmount) || 0;
    });

    let totalSupplierPayables = 0;
    allPurchases.forEach((p: any) => {
      totalSupplierPayables += Number(p.dueAmount) || 0;
    });

    let totalStockAssetValue = 0;
    allItems.forEach((it: any) => {
      const qty = Number(it.stockQuantity) || 0;
      const cost = Number(it.purchasePrice) || 0;
      totalStockAssetValue += qty * cost;
    });

    const netCashFlow = totalInflow - totalOutflow;
    const netBusinessAsset = totalStockAssetValue + totalCustomerReceivables - totalSupplierPayables;

    return c.json({
      data: {
        dateRange: { startDate, endDate },
        transactions,
        cashflow: {
          totalInflow,
          totalOutflow,
          netCashFlow
        },
        balanceSheet: {
          stockAssetValue: totalStockAssetValue,
          customerReceivables: totalCustomerReceivables,
          supplierPayables: totalSupplierPayables,
          netBusinessAsset
        }
      }
    }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Statement report error:", error);
    return c.json({ message: "স্টেটমেন্ট রিপোর্ট পেতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 4. PROFIT & LOSS REPORT
 * বিক্রিত পণ্যের মোট বিক্রয়মূল্য থেকে ক্রয় খরচ বাদ দিয়ে প্রকৃত মোট লাভ (Gross Profit) ও মার্জিন
 */
export const getProfitLossReport: Handler = async (c: any) => {
  const userId = await getEffectiveUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const query = c.req.query();
    const { startDate, endDate } = resolveDateRange(query.period, query.startDate, query.endDate);

    // Fetch sales and saleItems in range
    const userSales = await db
      .select()
      .from(sales)
      .where(eq(sales.userId, userId));

    const rangeSales = userSales.filter((s: any) => {
      const d = s.saleDate || (s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "");
      return d >= startDate && d <= endDate;
    });

    const saleIds = rangeSales.map((s) => s.id);

    let soldItems: any[] = [];
    if (saleIds.length > 0) {
      soldItems = await db
        .select()
        .from(saleItems)
        .where(sql`${saleItems.saleId} IN (${sql.join(saleIds.map((id) => sql`${id}`), sql`, `)})`);
    }

    let totalRevenue = 0;
    let totalCostOfGoodsSold = 0;

    const itemProfitMap: Record<string, {
      name: string;
      barcode: string;
      categoryName: string;
      brandName: string;
      quantitySold: number;
      totalRevenue: number;
      totalCost: number;
      grossProfit: number;
    }> = {};

    soldItems.forEach((si: any) => {
      const qty = Number(si.quantity) || 0;
      const price = Number(si.unitPrice) || 0;
      const cost = Number(si.unitCost) || 0;
      const rev = qty * price;
      const cogs = qty * cost;

      totalRevenue += rev;
      totalCostOfGoodsSold += cogs;

      const key = `${si.itemId || si.name}_${si.barcode || ""}`;
      if (!itemProfitMap[key]) {
        itemProfitMap[key] = {
          name: si.name,
          barcode: si.barcode || "-",
          categoryName: si.categoryName || "-",
          brandName: si.brandName || "-",
          quantitySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          grossProfit: 0
        };
      }
      itemProfitMap[key].quantitySold += qty;
      itemProfitMap[key].totalRevenue += rev;
      itemProfitMap[key].totalCost += cogs;
      itemProfitMap[key].grossProfit += (rev - cogs);
    });

    const itemsList = Object.values(itemProfitMap).sort((a, b) => b.grossProfit - a.grossProfit);
    const grossProfit = totalRevenue - totalCostOfGoodsSold;
    const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return c.json({
      data: {
        dateRange: { startDate, endDate },
        items: itemsList,
        summary: {
          totalSalesInvoices: rangeSales.length,
          totalPiecesSold: soldItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0),
          totalRevenue,
          totalCostOfGoodsSold,
          grossProfit,
          profitMarginPercent
        }
      }
    }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Profit loss report error:", error);
    return c.json({ message: "লাভ-ক্ষতি রিপোর্ট পেতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 5. PARTIES DUES & LEDGER REPORT (কাস্টমার ও সরবরাহকারী বকেয়া)
 */
export const getPartiesReport: Handler = async (c: any) => {
  const userId = await getEffectiveUserId(c);
  if (!userId) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  try {
    const [allSuppliers, allManufacturers, allPurchases, allCustomers, allSales] = await Promise.all([
      db.select().from(suppliers).where(eq(suppliers.userId, userId)),
      db.select().from(manufacturers).where(eq(manufacturers.userId, userId)),
      db.select().from(purchases).where(eq(purchases.userId, userId)),
      db.select().from(customers).where(eq(customers.userId, userId)),
      db.select().from(sales).where(eq(sales.userId, userId))
    ]);

    // Suppliers & Manufacturers summary
    const vendorMap: Record<string, {
      name: string;
      mobile: string;
      type: string;
      totalPurchases: number;
      totalPaid: number;
      totalDue: number;
      invoiceCount: number;
    }> = {};

    allSuppliers.forEach((s: any) => {
      vendorMap[`sup_${s.id}`] = {
        name: s.name,
        mobile: s.mobile || "-",
        type: "সাপ্লায়ার",
        totalPurchases: 0,
        totalPaid: 0,
        totalDue: 0,
        invoiceCount: 0
      };
    });

    allManufacturers.forEach((m: any) => {
      vendorMap[`man_${m.id}`] = {
        name: m.name,
        mobile: m.mobile || "-",
        type: "কারখানা",
        totalPurchases: 0,
        totalPaid: 0,
        totalDue: 0,
        invoiceCount: 0
      };
    });

    allPurchases.forEach((p: any) => {
      const key = p.supplierId ? `sup_${p.supplierId}` : p.manufacturerId ? `man_${p.manufacturerId}` : null;
      if (key && vendorMap[key]) {
        vendorMap[key].totalPurchases += Number(p.totalAmount) || 0;
        vendorMap[key].totalPaid += Number(p.paidAmount) || 0;
        vendorMap[key].totalDue += Number(p.dueAmount) || 0;
        vendorMap[key].invoiceCount += 1;
      }
    });

    // Customers summary
    const customerMap: Record<string, {
      name: string;
      mobile: string;
      totalSales: number;
      totalPaid: number;
      totalDue: number;
      invoiceCount: number;
    }> = {};

    allCustomers.forEach((c: any) => {
      customerMap[`cust_${c.id}`] = {
        name: c.name,
        mobile: c.mobile || "-",
        totalSales: 0,
        totalPaid: 0,
        totalDue: 0,
        invoiceCount: 0
      };
    });

    allSales.forEach((s: any) => {
      const key = s.customerId ? `cust_${s.customerId}` : null;
      if (key && customerMap[key]) {
        customerMap[key].totalSales += Number(s.totalAmount) || 0;
        customerMap[key].totalPaid += Number(s.paidAmount) || 0;
        customerMap[key].totalDue += Number(s.dueAmount) || 0;
        customerMap[key].invoiceCount += 1;
      }
    });

    const vendorsList = Object.values(vendorMap).filter((v) => v.invoiceCount > 0 || v.totalDue > 0);
    const customersList = Object.values(customerMap).filter((c) => c.invoiceCount > 0 || c.totalDue > 0);

    return c.json({
      data: {
        vendors: vendorsList,
        customers: customersList,
        totals: {
          totalSupplierDue: vendorsList.reduce((acc, curr) => acc + curr.totalDue, 0),
          totalCustomerDue: customersList.reduce((acc, curr) => acc + curr.totalDue, 0)
        }
      }
    }, HttpStatusCodes.OK);
  } catch (error: any) {
    console.error("Parties report error:", error);
    return c.json({ message: "পার্টি বকেয়া রিপোর্ট পেতে ব্যর্থ হয়েছে" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
