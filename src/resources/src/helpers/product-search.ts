/**
 * ইউনিফাইড প্রোডাক্ট সার্চ ও ম্যাচিং হেল্পার (Unified Product Search & Match Helper)
 * প্রতিটি পেজের পণ্য সার্চ ফিল্ডে (ক্রয়, বিক্রয়/POS, পণ্য তালিকা, স্টক, মূল্য নির্ধারণ, বারকোড)
 * একই মাল্টি-টোকেন, যেকোনো অর্ডারে শব্দ খোঁজা, বাংলা/ইংরেজি সংখ্যা রূপান্তর ও নমনীয় ম্যাচিং নিশ্চিত করে।
 */

export function normalizeDigitBn(str: string): string {
  const enToBn: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  return (str || "").replace(/[0-9]/g, (d) => enToBn[d] || d);
}

export function normalizeDigitEn(str: string): string {
  const bnToEn: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  return (str || "").replace(/[০-৯]/g, (d) => bnToEn[d] || d);
}

export interface MatchProductSearchOptions {
  extraParts?: (string | null | undefined)[];
  resolveSize?: (sizeId: any) => string;
  resolveColor?: (colorId: any) => string;
  resolveBrand?: (brandId: any) => string;
  resolveCategory?: (categoryId: any) => string;
  resolveSubCategory?: (subCategoryId: any) => string;
  resolveProductType?: (typeId: any) => string;
}

/**
 * যেকোনো আইটেম অবজেক্টের সাথে ইউজার ইনপুটকৃত সার্চ কুয়েরি মিলিয়ে দেখে।
 * প্রতিটি শব্দ (Token) পণ্যের নাম, কোড, বারকোড, সাইজ, কালার, ক্যাটাগরি, সাব-ক্যাটাগরি, ধরণ,
 * ব্র্যান্ড বা ডিজাইন কোডের যেকোনো অংশে থাকলে সত্য (True) রিটার্ন করে।
 */
export function matchProductSearch(
  item: any,
  searchQuery: string,
  options?: MatchProductSearchOptions | (string | null | undefined)[]
): boolean {
  if (!item) return false;
  if (!searchQuery) return true;
  const rawQ = searchQuery.trim().toLowerCase();
  if (!rawQ) return true;

  const opts: MatchProductSearchOptions = Array.isArray(options)
    ? { extraParts: options }
    : options || {};

  const sizeName =
    item.size?.name ||
    item.sizeName ||
    (opts.resolveSize && item.sizeId ? opts.resolveSize(item.sizeId) : "") ||
    "";

  const colorName =
    item.color?.name ||
    item.colorName ||
    (opts.resolveColor && item.colorId ? opts.resolveColor(item.colorId) : "") ||
    "";

  const brandName =
    item.brand?.name ||
    item.brandName ||
    (opts.resolveBrand && item.brandId ? opts.resolveBrand(item.brandId) : "") ||
    "";

  const categoryName =
    item.category?.name ||
    item.categoryName ||
    (opts.resolveCategory && item.categoryId ? opts.resolveCategory(item.categoryId) : "") ||
    "";

  const subCategoryName =
    item.subCategory?.name ||
    item.subCategoryName ||
    (opts.resolveSubCategory && item.subCategoryId ? opts.resolveSubCategory(item.subCategoryId) : "") ||
    "";

  const productTypeName =
    item.productType?.name ||
    item.productTypeName ||
    (opts.resolveProductType && item.productTypeId ? opts.resolveProductType(item.productTypeId) : "") ||
    "";

  const targetParts: string[] = [
    item.name || "",
    item.displayName || "",
    item.cleanName || "",
    item.code || "",
    item.itemCode || "",
    item.barcode || "",
    item.latestBarcode || "",
    item.smartBarcode || "",
    item.designCode || "",
    categoryName,
    subCategoryName,
    productTypeName,
    brandName,
    sizeName,
    colorName,
    item.unit?.name || item.unitName || "",
    ...(opts.extraParts || []).filter((p): p is string => Boolean(p))
  ];

  if (item.name && typeof item.name === "string") {
    targetParts.push(...item.name.split("_"));
  }

  const combinedTarget = targetParts.join(" ").toLowerCase();
  const targetBn = normalizeDigitBn(combinedTarget);
  const targetEn = normalizeDigitEn(combinedTarget);

  const tokens = rawQ.split(/\s+/).filter(Boolean);

  return tokens.every((token) => {
    const tokenClean = token.replace(/[-_]/g, "");
    const tokenBn = normalizeDigitBn(token);
    const tokenEn = normalizeDigitEn(token);

    return (
      combinedTarget.includes(token) ||
      targetBn.includes(tokenBn) ||
      targetEn.includes(tokenEn) ||
      (tokenClean && combinedTarget.replace(/[-_]/g, "").includes(tokenClean))
    );
  });
}

/**
 * vue-select ড্রপডাউনের `:filter-by` প্রপের জন্য স্ট্যান্ডার্ড ফিল্টার ফাংশন
 */
export function filterProductSelectOption(
  option: any,
  label: string,
  search: string,
  options?: MatchProductSearchOptions
): boolean {
  if (!search) return true;
  return matchProductSearch(option, search, {
    ...(options || {}),
    extraParts: [label || "", ...(options?.extraParts || [])]
  });
}
