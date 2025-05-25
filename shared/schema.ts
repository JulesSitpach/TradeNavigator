import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cost calculations table
export const costCalculations = pgTable("cost_calculations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  productName: text("product_name").notNull(),
  productDescription: text("product_description"),
  productCategory: varchar("product_category"),
  hsCode: varchar("hs_code"),
  quantity: integer("quantity").notNull(),
  unitValue: decimal("unit_value", { precision: 10, scale: 2 }).notNull(),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  originCountry: varchar("origin_country", { length: 2 }).notNull(),
  destinationCountry: varchar("destination_country", { length: 2 }).notNull(),
  shippingMethod: varchar("shipping_method"),
  incoterms: varchar("incoterms"),
  insurance: boolean("insurance").default(false),
  urgency: varchar("urgency").default("standard"),
  customsHandling: varchar("customs_handling").default("broker"),
  tradeAgreement: varchar("trade_agreement"),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }),
  productValue: decimal("product_value", { precision: 12, scale: 2 }),
  shippingCost: decimal("shipping_cost", { precision: 12, scale: 2 }),
  duties: decimal("duties", { precision: 12, scale: 2 }),
  customsFees: decimal("customs_fees", { precision: 12, scale: 2 }),
  insuranceCost: decimal("insurance_cost", { precision: 12, scale: 2 }),
  brokerFees: decimal("broker_fees", { precision: 12, scale: 2 }),
  taxSavings: decimal("tax_savings", { precision: 12, scale: 2 }),
  timeline: varchar("timeline"),
  createdAt: timestamp("created_at").defaultNow(),
});

// HS code suggestions table
export const hsCodeSuggestions = pgTable("hs_code_suggestions", {
  id: serial("id").primaryKey(),
  productName: text("product_name").notNull(),
  productDescription: text("product_description"),
  productCategory: varchar("product_category"),
  hsCode: varchar("hs_code").notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence"), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  calculations: many(costCalculations),
}));

export const costCalculationsRelations = relations(costCalculations, ({ one }) => ({
  user: one(users, {
    fields: [costCalculations.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertCostCalculationSchema = createInsertSchema(costCalculations).omit({
  id: true,
  createdAt: true,
});

export const insertHsCodeSuggestionSchema = createInsertSchema(hsCodeSuggestions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCostCalculation = z.infer<typeof insertCostCalculationSchema>;
export type CostCalculation = typeof costCalculations.$inferSelect;
export type InsertHsCodeSuggestion = z.infer<typeof insertHsCodeSuggestionSchema>;
export type HsCodeSuggestion = typeof hsCodeSuggestions.$inferSelect;
