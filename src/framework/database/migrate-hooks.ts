import { sql } from "drizzle-orm";
import { closeDatabase, database, databasePool, detectDialect, initDatabase } from "@/framework/database/connection.js";
import { discoverModuleFiles, importFile } from "@/framework/modules/discover.js";

type HookMap = {
  __migrationSql: true;
  postgresql?: string[];
  mysql?: string[];
  sqlite?: string[];
};

function isHookMap(value: unknown): value is HookMap {
  if (!value || typeof value !== "object") return false;
  return (value as HookMap).__migrationSql === true;
}

function collectStatements(exportsObj: Record<string, unknown>, dialect: "postgresql" | "mysql" | "sqlite") {
  const statements: string[] = [];
  for (const value of Object.values(exportsObj)) {
    if (!isHookMap(value)) continue;
    const sqlList = value[dialect] || [];
    for (const statement of sqlList) {
      if (typeof statement === "string" && statement.trim()) statements.push(statement);
    }
  }
  return statements;
}

async function executeWithPoolFallback(statement: string, dialect: "postgresql" | "mysql" | "sqlite") {
  const pool = databasePool();
  if (dialect === "sqlite") {
    await pool.executeMultiple(statement);
    return;
  }
  if (dialect === "postgresql") {
    await pool.unsafe(statement);
    return;
  }
  await pool.query(statement);
}

async function executeStatement(statement: string, dialect: "postgresql" | "mysql" | "sqlite") {
  const drizzle = database();
  try {
    if (dialect === "sqlite") {
      await drizzle.run(sql.raw(statement));
    } else {
      await drizzle.execute(sql.raw(statement));
    }
  } catch {
    await executeWithPoolFallback(statement, dialect);
  }
}

async function ensureSuperAdmin() {
  try {
    const { eq } = await import("drizzle-orm");
    const bcrypt = (await import("bcryptjs")).default;
    const { roles } = await import("@/modules/auth/database/models/role.js");
    const { users } = await import("@/modules/auth/database/models/user.js");

    const db = database();
    const superAdminEmail = process.env.SUPERADMIN_EMAIL || "isupportbd.info@gmail.com";
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "Expw.17@";

    let superAdminRole =
      (await db.query.roles.findFirst({ where: eq(roles.name, "super_admin") })) ||
      (await db.query.roles.findFirst({ where: eq(roles.name, "admin") }));

    if (!superAdminRole) {
      await db.insert(roles).values({ name: "super_admin" });
      superAdminRole = await db.query.roles.findFirst({ where: eq(roles.name, "super_admin") });
    }

    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    const existing = await db.query.users.findFirst({ where: eq(users.email, superAdminEmail) });

    if (!existing) {
      await db.insert(users).values({
        name: "Super Admin",
        email: superAdminEmail,
        password: hashedPassword,
        roleId: superAdminRole?.id ?? null,
        emailVerifiedAt: new Date()
      });
      console.log(`[Auto-Deploy] Super Admin created: ${superAdminEmail}`);
    } else {
      await db.update(users).set({
        password: hashedPassword,
        roleId: superAdminRole?.id ?? existing.roleId,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date()
      }).where(eq(users.id, existing.id));
      console.log(`[Auto-Deploy] Super Admin verified: ${superAdminEmail}`);
    }
  } catch (error) {
    console.warn("[Auto-Deploy] Note: Super Admin auto-sync skipped:", error instanceof Error ? error.message : error);
  }
}

export async function runModelMigrationHooks() {
  const dialect = detectDialect();
  const files = await discoverModuleFiles("**/database/models/*.{ts,js}");

  await initDatabase();
  try {
    let applied = 0;
    for (const file of files) {
      const mod = await importFile(file);
      const statements = collectStatements(mod, dialect);
      if (!statements.length) continue;

      for (const statement of statements) {
        await executeStatement(statement, dialect);
      }

      applied += statements.length;
    }

    if (applied > 0) {
      console.log(`Applied ${applied} model migration SQL statement(s) for ${dialect}.`);
    }

    // Auto-create / verify superadmin user after migrations and deployments
    await ensureSuperAdmin();
  } finally {
    await closeDatabase();
  }
}

if (process.argv[1]?.endsWith("migrate-hooks.ts")) {
  runModelMigrationHooks().catch((error) => {
    console.error("Failed to run model migration hooks:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
