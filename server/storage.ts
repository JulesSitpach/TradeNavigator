import {
  users,
  costCalculations,
  hsCodeSuggestions,
  type User,
  type UpsertUser,
  type InsertCostCalculation,
  type CostCalculation,
  type InsertHsCodeSuggestion,
  type HsCodeSuggestion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Cost calculation operations
  createCostCalculation(calculation: InsertCostCalculation): Promise<CostCalculation>;
  getUserCalculations(userId: string, limit?: number): Promise<CostCalculation[]>;
  getCostCalculation(id: number): Promise<CostCalculation | undefined>;
  
  // HS code suggestion operations
  createHsCodeSuggestion(suggestion: InsertHsCodeSuggestion): Promise<HsCodeSuggestion>;
  getHsCodeSuggestions(productName: string, productCategory?: string): Promise<HsCodeSuggestion[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Cost calculation operations
  async createCostCalculation(calculation: InsertCostCalculation): Promise<CostCalculation> {
    const [result] = await db
      .insert(costCalculations)
      .values(calculation)
      .returning();
    return result;
  }

  async getUserCalculations(userId: string, limit = 10): Promise<CostCalculation[]> {
    return await db
      .select()
      .from(costCalculations)
      .where(eq(costCalculations.userId, userId))
      .orderBy(desc(costCalculations.createdAt))
      .limit(limit);
  }

  async getCostCalculation(id: number): Promise<CostCalculation | undefined> {
    const [calculation] = await db
      .select()
      .from(costCalculations)
      .where(eq(costCalculations.id, id));
    return calculation;
  }

  // HS code suggestion operations
  async createHsCodeSuggestion(suggestion: InsertHsCodeSuggestion): Promise<HsCodeSuggestion> {
    const [result] = await db
      .insert(hsCodeSuggestions)
      .values(suggestion)
      .returning();
    return result;
  }

  async getHsCodeSuggestions(productName: string, productCategory?: string): Promise<HsCodeSuggestion[]> {
    // For now, return empty array - in real implementation would search by similar products
    return [];
  }
}

export const storage = new DatabaseStorage();
