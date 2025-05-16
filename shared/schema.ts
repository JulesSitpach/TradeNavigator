import { pgTable, text, serial, integer, decimal, varchar, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  companyName: varchar("company_name", { length: 255 }),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default('free'),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  language: varchar("language", { length: 10 }).default('en'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  hsCode: varchar("hs_code", { length: 20 }),
  category: varchar("category", { length: 100 }),
  value: decimal("value", { precision: 12, scale: 2 }),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  length: decimal("length", { precision: 10, scale: 2 }),
  width: decimal("width", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  originCountry: varchar("origin_country", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shipments table
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  userId: integer("user_id").references(() => users.id),
  destinationCountry: varchar("destination_country", { length: 100 }),
  quantity: integer("quantity"),
  transportMode: varchar("transport_mode", { length: 50 }),
  incoterm: varchar("incoterm", { length: 50 }),
  packageDetails: json("package_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analysis results table
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").references(() => shipments.id),
  userId: integer("user_id").references(() => users.id),
  costBreakdown: json("cost_breakdown"),
  alternativeRoutes: json("alternative_routes"),
  totalLandedCost: decimal("total_landed_cost", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default('USD'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tariff data table
export const tariffData = pgTable("tariff_data", {
  id: serial("id").primaryKey(),
  hsCode: varchar("hs_code", { length: 20 }).notNull(),
  countryCode: varchar("country_code", { length: 10 }).notNull(),
  baseRate: decimal("base_rate", { precision: 5, scale: 2 }),
  specialPrograms: json("special_programs"),
  finalRate: decimal("final_rate", { precision: 5, scale: 2 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Create schemas for input validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;

export type TariffData = typeof tariffData.$inferSelect;

// Subscription tiers
export const subscriptionTiers = {
  FREE: 'free',
  STARTER: 'starter',
  GROWTH: 'growth',
  GLOBAL: 'global'
} as const;

export type SubscriptionTier = typeof subscriptionTiers[keyof typeof subscriptionTiers];
