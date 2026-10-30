import { eq, sql } from "drizzle-orm";
import { db, password } from "@/framework/facade.js";
import { roles } from "@/modules/auth/database/models/role.js";
import { users } from "@/modules/auth/database/models/user.js";
import { ensureInventoryTables } from "@/modules/inventory/controllers/inventory.controller.js";
import RoleSeeder from "@/modules/auth/database/seeders/role.js";

let autoInitDone = false;

/**
 * Automatically initializes all database tables, columns, constraints and default seeders
 * at application boot. Essential for zero-terminal deployment platforms like Coolify,
 * Docker, and cloud PaaS.
 */
export async function ensureAllDatabaseTablesAndSeeds(): Promise<void> {
  if (autoInitDone) return;

  try {
    // 1. Roles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 2. Users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "company_name" varchar(255),
        "name" varchar(255),
        "email" varchar(255) NOT NULL UNIQUE,
        "mobile" varchar(50),
        "password" text NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "role_id" integer REFERENCES "roles"("id") ON UPDATE CASCADE ON DELETE SET NULL,
        "email_verified_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 3. Auth tokens
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
        "id" serial PRIMARY KEY NOT NULL,
        "email" varchar(255) NOT NULL,
        "token" text NOT NULL,
        "expires_at" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" serial PRIMARY KEY NOT NULL,
        "email" varchar(255) NOT NULL,
        "token" text NOT NULL,
        "expires_at" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE SET NULL,
        "jti" varchar(191) NOT NULL UNIQUE,
        "revoked" boolean DEFAULT false,
        "expires_at" timestamp with time zone NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 4. Catalog tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "sub_categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE NOT NULL,
        "name" varchar(255) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "size_groups" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "sizes" (
        "id" serial PRIMARY KEY NOT NULL,
        "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE,
        "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE CASCADE,
        "size_group_id" integer REFERENCES "size_groups"("id") ON DELETE CASCADE,
        "name" varchar(100) NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE;
      ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE CASCADE;
      ALTER TABLE "sizes" ALTER COLUMN "size_group_id" DROP NOT NULL;

      CREATE TABLE IF NOT EXISTS "colors" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(100) NOT NULL UNIQUE,
        "code" varchar(50),
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "units" (
        "id" serial PRIMARY KEY NOT NULL,
        "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE,
        "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE CASCADE,
        "name" varchar(100) NOT NULL,
        "short_name" varchar(50) NOT NULL DEFAULT '',
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_name_key";
      ALTER TABLE "units" DROP CONSTRAINT IF EXISTS "units_name_unique";
      ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE;
      ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE CASCADE;
      ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "short_name" varchar(50) NOT NULL DEFAULT '';
      ALTER TABLE "units" ALTER COLUMN "name" TYPE varchar(100);

      CREATE TABLE IF NOT EXISTS "fabric_types" (
        "id" serial PRIMARY KEY NOT NULL,
        "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE,
        "name" varchar(150) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "fabric_types" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE;
      ALTER TABLE "fabric_types" ALTER COLUMN "name" TYPE varchar(150);

      CREATE TABLE IF NOT EXISTS "product_types" (
        "id" serial PRIMARY KEY NOT NULL,
        "category_id" integer NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
        "sub_category_id" integer NOT NULL REFERENCES "sub_categories"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "product_types" ADD COLUMN IF NOT EXISTS "category_id" integer REFERENCES "categories"("id") ON DELETE CASCADE;
      ALTER TABLE "product_types" ADD COLUMN IF NOT EXISTS "sub_category_id" integer REFERENCES "sub_categories"("id") ON DELETE CASCADE;
      ALTER TABLE "product_types" ALTER COLUMN "name" TYPE varchar(255);

      CREATE TABLE IF NOT EXISTS "challan_types" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "code" varchar(50),
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "vendor_types" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL UNIQUE,
        "code" varchar(50),
        "description" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

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

    // 5. Settings and Company Settings
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "key" varchar(255) NOT NULL UNIQUE,
        "value" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "companys" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "company_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "company_name" varchar(255),
        "tagline" varchar(255),
        "phone" varchar(50),
        "mobile" varchar(50),
        "email" varchar(255),
        "address" text,
        "trade_license" varchar(100),
        "vat_bin" varchar(100),
        "invoice_prefix" varchar(20) DEFAULT 'INV',
        "product_prefix" varchar(20) DEFAULT 'PRD-',
        "invoice_pattern" varchar(80) DEFAULT '{PREFIX}-{YYYY}-{0001}',
        "invoice_reset_cycle" varchar(20) DEFAULT 'yearly',
        "print_format" varchar(20) DEFAULT 'a4',
        "invoice_terms" text,
        "payment_info" text,
        "logo" text,
        "business_type" varchar(50) DEFAULT 'proprietorship',
        "shareholders" jsonb,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );

      ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "email" varchar(255);
      ALTER TABLE "company_settings" ALTER COLUMN "company_name" DROP NOT NULL;
    `);

    // 6. Ensure Inventory Tables
    await ensureInventoryTables();

    // 7. Auto-Seed ONLY Roles & Super Admin (No dummy users or sample catalog data)
    try {
      await RoleSeeder();

      const superAdminRole =
        (await db.query.roles.findFirst({ where: eq(roles.name, "super_admin") })) ||
        (await db.query.roles.findFirst({ where: eq(roles.name, "admin") }));

      const superAdminEmail = (process.env.SUPERADMIN_EMAIL || "isupportbd.info@gmail.com").trim().toLowerCase();
      const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "Expw.17@";

      const existingSuperAdmin = await db.query.users.findFirst({
        where: eq(users.email, superAdminEmail)
      });

      if (!existingSuperAdmin) {
        await db.insert(users).values({
          name: "Super Admin",
          email: superAdminEmail,
          password: await password.hashPassword(superAdminPassword),
          roleId: superAdminRole?.id ?? null,
          emailVerifiedAt: new Date(),
          isActive: true
        });
        console.log(`[Auto-Init] Super admin (${superAdminEmail}) created.`);
      }
    } catch (seedErr) {
      console.warn("[Auto-Init] Super admin check warning (non-fatal):", seedErr);
    }

    autoInitDone = true;
    console.log("[Auto-Init] Database schema, tables, and Super Admin verified successfully.");
  } catch (err) {
    console.error("[Auto-Init] Error ensuring database tables and seeders:", err);
  }
}
