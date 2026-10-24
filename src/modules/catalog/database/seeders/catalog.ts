import { db } from "@/framework/facade.js";
import {
  categories,
  colors,
  fabricTypes,
  sizeGroups,
  sizes,
  subCategories,
  units
} from "@/modules/catalog/database/models/catalog.js";

export const table = categories;

export default async function CatalogSeeder() {
  // 1. Categories (no slug)
  let allCats = await db.select().from(categories);
  if (allCats.length === 0) {
    allCats = await db
      .insert(categories)
      .values([
        { name: "শার্ট", isActive: true },
        { name: "প্যান্ট", isActive: true },
        { name: "টি-শার্ট", isActive: true },
        { name: "পাঞ্জাবি", isActive: true },
        { name: "শাড়ি", isActive: true },
        { name: "জুতা", isActive: true }
      ])
      .returning();
  }

  const catMap = new Map(allCats.map((c) => [c.name, c.id]));

  // 1.1 Sub Categories
  const existingSubCats = await db.select().from(subCategories).limit(1);
  if (existingSubCats.length === 0) {
    const subCategoriesToSeed = [
      { catName: "শার্ট", name: "ক্যাজুয়াল শার্ট" },
      { catName: "শার্ট", name: "ফরমাল শার্ট" },
      { catName: "শার্ট", name: "ডেনিম শার্ট" },
      { catName: "প্যান্ট", name: "ডেনিম জিন্স" },
      { catName: "প্যান্ট", name: "গ্যাবার্ডিন / চিনোস" },
      { catName: "প্যান্ট", name: "ফরমাল প্যান্ট" },
      { catName: "জুতা", name: "ফরমাল শু" },
      { catName: "জুতা", name: "স্নিকার্স" },
      { catName: "জুতা", name: "লোফার" },
      { catName: "জুতা", name: "স্যান্ডেল" },
      { catName: "শাড়ি", name: "সিল্ক শাড়ি" },
      { catName: "শাড়ি", name: "জামদানি" },
      { catName: "শাড়ি", name: "সুতি শাড়ি" },
      { catName: "টি-শার্ট", name: "রাউন্ড নেক" },
      { catName: "টি-শার্ট", name: "কলার / পোলো" },
      { catName: "পাঞ্জাবি", name: "সেমি-লং পাঞ্জাবি" },
      { catName: "পাঞ্জাবি", name: "কাবলি সেট" }
    ];

    for (const sub of subCategoriesToSeed) {
      const catId = catMap.get(sub.catName);
      if (catId) {
        await db.insert(subCategories).values({
          categoryId: catId,
          name: sub.name,
          isActive: true
        });
      }
    }
  }

  // 2. Size Groups & Sizes
  const existingGroups = await db.select().from(sizeGroups).limit(1);
  if (existingGroups.length === 0) {
    const [apparelGroup] = await db
      .insert(sizeGroups)
      .values({ name: "পোশাক (Apparel)", isActive: true })
      .returning();

    const [footwearGroup] = await db
      .insert(sizeGroups)
      .values({ name: "জুতা (Footwear)", isActive: true })
      .returning();

    const [waistGroup] = await db
      .insert(sizeGroups)
      .values({ name: "কোমর / জিন্স (Waist)", isActive: true })
      .returning();

    const [kidsGroup] = await db
      .insert(sizeGroups)
      .values({ name: "বাচ্চাদের (Kids)", isActive: true })
      .returning();

    if (apparelGroup) {
      await db.insert(sizes).values([
        { sizeGroupId: apparelGroup.id, name: "S", sortOrder: 1, isActive: true },
        { sizeGroupId: apparelGroup.id, name: "M", sortOrder: 2, isActive: true },
        { sizeGroupId: apparelGroup.id, name: "L", sortOrder: 3, isActive: true },
        { sizeGroupId: apparelGroup.id, name: "XL", sortOrder: 4, isActive: true },
        { sizeGroupId: apparelGroup.id, name: "XXL", sortOrder: 5, isActive: true }
      ]);
    }

    if (footwearGroup) {
      await db.insert(sizes).values([
        { sizeGroupId: footwearGroup.id, name: "৩৯", sortOrder: 1, isActive: true },
        { sizeGroupId: footwearGroup.id, name: "৪০", sortOrder: 2, isActive: true },
        { sizeGroupId: footwearGroup.id, name: "৪১", sortOrder: 3, isActive: true },
        { sizeGroupId: footwearGroup.id, name: "৪২", sortOrder: 4, isActive: true },
        { sizeGroupId: footwearGroup.id, name: "৪৩", sortOrder: 5, isActive: true }
      ]);
    }

    if (waistGroup) {
      await db.insert(sizes).values([
        { sizeGroupId: waistGroup.id, name: "২৮", sortOrder: 1, isActive: true },
        { sizeGroupId: waistGroup.id, name: "৩০", sortOrder: 2, isActive: true },
        { sizeGroupId: waistGroup.id, name: "৩২", sortOrder: 3, isActive: true },
        { sizeGroupId: waistGroup.id, name: "৩৪", sortOrder: 4, isActive: true },
        { sizeGroupId: waistGroup.id, name: "৩৬", sortOrder: 5, isActive: true }
      ]);
    }

    if (kidsGroup) {
      await db.insert(sizes).values([
        { sizeGroupId: kidsGroup.id, name: "০-১ বছর", sortOrder: 1, isActive: true },
        { sizeGroupId: kidsGroup.id, name: "২-৩ বছর", sortOrder: 2, isActive: true },
        { sizeGroupId: kidsGroup.id, name: "৪-৫ বছর", sortOrder: 3, isActive: true }
      ]);
    }
  }

  // 3. Colors
  const existingColors = await db.select().from(colors).limit(1);
  if (existingColors.length === 0) {
    await db.insert(colors).values([
      { name: "লাল", code: "#FF0000", isActive: true },
      { name: "নীল", code: "#0000FF", isActive: true },
      { name: "কালো", code: "#000000", isActive: true },
      { name: "সাদা", code: "#FFFFFF", isActive: true },
      { name: "সবুজ", code: "#008000", isActive: true },
      { name: "মেরুন", code: "#800000", isActive: true }
    ]);
  }

  // 4. Materials / Fabric Types (Linked directly to categories!)
  const existingFabrics = await db.select().from(fabricTypes).limit(1);
  if (existingFabrics.length === 0) {
    const materialsToSeed = [
      { catName: "শার্ট", name: "কটন" },
      { catName: "শার্ট", name: "লিনেন" },
      { catName: "শার্ট", name: "সিল্ক" },
      { catName: "প্যান্ট", name: "ডেনিম" },
      { catName: "প্যান্ট", name: "গ্যাবার্ডিন" },
      { catName: "প্যান্ট", name: "টুইল" },
      { catName: "জুতা", name: "লেদার" },
      { catName: "জুতা", name: "সিন্থেটিক লেদার / রেক্সিন" },
      { catName: "জুতা", name: "ক্যানভাস" },
      { catName: "জুতা", name: "রবার" },
      { catName: "শাড়ি", name: "সিল্ক" },
      { catName: "শাড়ি", name: "জর্জেট" },
      { catName: "শাড়ি", name: "জামদানি" },
      { catName: "শাড়ি", name: "কটন" },
      { catName: "টি-শার্ট", name: "১০০% কটন" },
      { catName: "টি-শার্ট", name: "পলিয়েস্টার মিক্স" }
    ];

    for (const m of materialsToSeed) {
      const catId = catMap.get(m.catName);
      if (catId) {
        await db.insert(fabricTypes).values({
          categoryId: catId,
          name: m.name,
          isActive: true
        });
      }
    }
  }

  // 5. Units of Measurement
  const existingUnits = await db.select().from(units).limit(1);
  if (existingUnits.length === 0) {
    await db.insert(units).values([
      { name: "পিস", shortName: "Pcs", isActive: true },
      { name: "গজ", shortName: "Yd", isActive: true },
      { name: "মিটার", shortName: "Mtr", isActive: true },
      { name: "ডজন", shortName: "Dzn", isActive: true }
    ]);
  }

  console.log("Catalog seeder completed successfully!");
}