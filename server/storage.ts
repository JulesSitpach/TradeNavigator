import { 
  users, products, shipments, analysisResults, tariffData,
  type User, type InsertUser, 
  type Product, type InsertProduct,
  type Shipment, type InsertShipment,
  type AnalysisResult, type InsertAnalysisResult,
  type TariffData
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByUser(userId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Shipment methods
  getShipment(id: number): Promise<Shipment | undefined>;
  getShipmentsByUser(userId: number): Promise<Shipment[]>;
  getShipmentsByProduct(productId: number): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: number, shipment: Partial<Shipment>): Promise<Shipment | undefined>;
  deleteShipment(id: number): Promise<boolean>;
  
  // Analysis methods
  getAnalysisResult(id: number): Promise<AnalysisResult | undefined>;
  getAnalysisResultsByShipment(shipmentId: number): Promise<AnalysisResult[]>;
  getAnalysisResultsByUser(userId: number): Promise<AnalysisResult[]>;
  createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  
  // Tariff methods
  getTariffData(hsCode: string, countryCode: string): Promise<TariffData | undefined>;
  saveTariffData(tariffInfo: Partial<TariffData>): Promise<TariffData>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: stripeInfo.customerId,
        stripeSubscriptionId: stripeInfo.subscriptionId
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByUser(userId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.userId, userId));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    return !!deletedProduct;
  }

  // Shipment methods
  async getShipment(id: number): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async getShipmentsByUser(userId: number): Promise<Shipment[]> {
    return await db.select().from(shipments).where(eq(shipments.userId, userId));
  }

  async getShipmentsByProduct(productId: number): Promise<Shipment[]> {
    return await db.select().from(shipments).where(eq(shipments.productId, productId));
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const [newShipment] = await db
      .insert(shipments)
      .values(shipment)
      .returning();
    return newShipment;
  }

  async updateShipment(id: number, shipment: Partial<Shipment>): Promise<Shipment | undefined> {
    const [updatedShipment] = await db
      .update(shipments)
      .set(shipment)
      .where(eq(shipments.id, id))
      .returning();
    return updatedShipment || undefined;
  }

  async deleteShipment(id: number): Promise<boolean> {
    const [deletedShipment] = await db
      .delete(shipments)
      .where(eq(shipments.id, id))
      .returning();
    return !!deletedShipment;
  }

  // Analysis methods
  async getAnalysisResult(id: number): Promise<AnalysisResult | undefined> {
    const [analysis] = await db.select().from(analysisResults).where(eq(analysisResults.id, id));
    return analysis || undefined;
  }

  async getAnalysisResultsByShipment(shipmentId: number): Promise<AnalysisResult[]> {
    return await db.select().from(analysisResults).where(eq(analysisResults.shipmentId, shipmentId));
  }

  async getAnalysisResultsByUser(userId: number): Promise<AnalysisResult[]> {
    return await db.select().from(analysisResults).where(eq(analysisResults.userId, userId));
  }

  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const [newAnalysis] = await db
      .insert(analysisResults)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  // Tariff methods
  async getTariffData(hsCode: string, countryCode: string): Promise<TariffData | undefined> {
    const [data] = await db
      .select()
      .from(tariffData)
      .where(
        and(
          eq(tariffData.hsCode, hsCode),
          eq(tariffData.countryCode, countryCode)
        )
      );
    return data || undefined;
  }

  async saveTariffData(tariffInfo: Partial<TariffData>): Promise<TariffData> {
    // Check if record exists
    const existingData = await this.getTariffData(
      tariffInfo.hsCode as string, 
      tariffInfo.countryCode as string
    );

    if (existingData) {
      // Update existing record
      const [updatedData] = await db
        .update(tariffData)
        .set({ ...tariffInfo, lastUpdated: new Date() })
        .where(
          and(
            eq(tariffData.hsCode, tariffInfo.hsCode as string),
            eq(tariffData.countryCode, tariffInfo.countryCode as string)
          )
        )
        .returning();
      return updatedData;
    } else {
      // Insert new record
      const [newData] = await db
        .insert(tariffData)
        .values({ ...tariffInfo, lastUpdated: new Date() })
        .returning();
      return newData;
    }
  }
}

export const storage = new DatabaseStorage();
