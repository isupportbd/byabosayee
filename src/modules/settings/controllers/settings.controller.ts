import { eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { broadcast, db, HttpStatusCodes } from "@/framework/facade.js";
import { settings } from "../database/models/settings.js";

let tablesEnsured = false;
export async function ensureSettingsTable() {
  if (tablesEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "key" varchar(100) NOT NULL UNIQUE,
        "value" text,
        "group" varchar(50) DEFAULT 'general' NOT NULL,
        "description" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    tablesEnsured = true;
  } catch (e) {
    console.error("Failed to ensure settings table:", e);
  }
}

export const getPublicSettings: Handler = async (c: any) => {
  await ensureSettingsTable();
  const publicList = await db.select().from(settings).where(eq(settings.group, "general"));
  return c.json({ data: publicList });
};

export const listSettings: Handler = async (c: any) => {
  await ensureSettingsTable();
  const allSettings = await db.select().from(settings);
  return c.json({ data: allSettings });
};

export const saveSetting: Handler = async (c: any) => {
  await ensureSettingsTable();
  const body = c.req.valid("json");
  const key = String(body.key).trim();
  const [existing] = await db.select().from(settings).where(eq(settings.key, key));

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set({
        value: body.value,
        group: body.group || existing.group,
        description: body.description ?? existing.description,
        updatedAt: new Date()
      })
      .where(eq(settings.key, key))
      .returning();

    if (key === "system_bangla_font") {
      try {
        broadcast("system.font.updated", { fontId: body.value }, { all: true, rooms: ["global", "settings"] });
      } catch {}
    }

    return c.json({ message: "Setting updated successfully", data: updated });
  }

  const [created] = await db
    .insert(settings)
    .values({
      key,
      value: body.value,
      group: body.group || "general",
      description: body.description
    })
    .returning();

  if (key === "system_bangla_font") {
    try {
      broadcast("system.font.updated", { fontId: body.value }, { all: true, rooms: ["global", "settings"] });
    } catch {}
  }

  return c.json({ message: "Setting created successfully", data: created }, HttpStatusCodes.CREATED);
};
