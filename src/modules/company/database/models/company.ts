import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";

export const companys = pgTable("companys", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  companyName: varchar("company_name", { length: 255 }),
  tagline: varchar("tagline", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  tradeLicense: varchar("trade_license", { length: 100 }),
  vatBin: varchar("vat_bin", { length: 100 }),
  invoicePrefix: varchar("invoice_prefix", { length: 20 }).default("INV"),
  productPrefix: varchar("product_prefix", { length: 20 }).default("PRD-"),
  invoicePattern: varchar("invoice_pattern", { length: 80 }).default("{PREFIX}-{YYYY}-{0001}"),
  invoiceResetCycle: varchar("invoice_reset_cycle", { length: 20 }).default("yearly"),
  printFormat: varchar("print_format", { length: 20 }).default("a4"),
  invoiceTerms: text("invoice_terms"),
  paymentInfo: text("payment_info"),
  logo: text("logo"),
  businessType: varchar("business_type", { length: 50 }).default("proprietorship"),
  shareholders: jsonb("shareholders"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const companySettingsRelations = relations(companySettings, ({ one }) => ({
  user: one(users, {
    fields: [companySettings.userId],
    references: [users.id]
  })
}));

