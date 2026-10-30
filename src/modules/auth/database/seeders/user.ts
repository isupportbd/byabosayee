import { eq } from "drizzle-orm";
import { db, password } from "@/framework/facade.js";
import { roles } from "@/modules/auth/database/models/role.js";
import { users } from "@/modules/auth/database/models/user.js";

export const table = users;

export default async function UserSeeder() {
  const superAdminRole =
    (await db.query.roles.findFirst({ where: eq(roles.name, "super_admin") })) ||
    (await db.query.roles.findFirst({ where: eq(roles.name, "admin") }));
  const adminRole = await db.query.roles.findFirst({ where: eq(roles.name, "admin") });
  const userRole = await db.query.roles.findFirst({ where: eq(roles.name, "user") });

  const superAdminEmail = process.env.SUPERADMIN_EMAIL || "isupportbd.info@gmail.com";
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || "Expw.17@";

  const rows = [
    {
      name: "Super Admin",
      email: superAdminEmail,
      password: await password.hashPassword(superAdminPassword),
      roleId: superAdminRole?.id ?? null,
      emailVerifiedAt: new Date()
    }
  ];

  for (const row of rows) {
    const existing = await db.query.users.findFirst({ where: eq(users.email, row.email) });
    if (!existing) {
      await db.insert(users).values(row);
    } else if (row.email === superAdminEmail) {
      await db.update(users).set({
        password: row.password,
        roleId: row.roleId,
        emailVerifiedAt: row.emailVerifiedAt
      }).where(eq(users.id, existing.id));
    }
  }

  console.log("User seeder completed");
}
