import { relations } from "drizzle-orm";
import { integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";

// 1. Capital Investments (মূলধন / পুঁজি বিনিয়োগ)
export const capitalInvestments = pgTable("capital_investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  shareholderId: varchar("shareholder_id", { length: 100 }),
  shareholderName: varchar("shareholder_name", { length: 255 }).notNull(),
  ownershipType: varchar("ownership_type", { length: 100 }).default("মালিক"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }).default("নগদ").notNull(),
  accountDetails: varchar("account_details", { length: 255 }),
  receiptNo: varchar("receipt_no", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// 2. Capital Withdrawals (মূলধন / লাভ উত্তোলন)
export const capitalWithdrawals = pgTable("capital_withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  shareholderId: varchar("shareholder_id", { length: 100 }),
  shareholderName: varchar("shareholder_name", { length: 255 }).notNull(),
  ownershipType: varchar("ownership_type", { length: 100 }).default("মালিক"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }).default("নগদ").notNull(),
  accountDetails: varchar("account_details", { length: 255 }),
  voucherNo: varchar("voucher_no", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const capitalInvestmentsRelations = relations(capitalInvestments, ({ one }) => ({
  user: one(users, {
    fields: [capitalInvestments.userId],
    references: [users.id]
  })
}));

export const capitalWithdrawalsRelations = relations(capitalWithdrawals, ({ one }) => ({
  user: one(users, {
    fields: [capitalWithdrawals.userId],
    references: [users.id]
  })
}));
