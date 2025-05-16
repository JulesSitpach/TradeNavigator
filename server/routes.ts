import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { comtradeApi } from "./api/comtrade";
import { shippoApi } from "./api/shippo";
import { openaiService } from "./api/openai";
import { exchangeRateApi } from "./api/exchange";
import bcrypt from "bcrypt";
import session from "express-session";
import pgSimple from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertShipmentSchema, 
  insertAnalysisResultSchema,
  subscriptionTiers
} from "@shared/schema";

// Setup session store with PostgreSQL
const PgSession = pgSimple(session);

// Validate user authentication
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

// Check subscription tier access
function checkSubscriptionAccess(allowedTiers: string[]) {
  return async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (allowedTiers.includes(user.subscriptionTier)) {
      return next();
    }

    return res.status(403).json({ message: "Subscription tier does not allow this feature" });
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session", // Use a table named "session" to store session data
      }),
      secret: process.env.SESSION_SECRET || "trade-navigator-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );

  // ===== Authentication routes =====
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userInput = insertUserSchema.safeParse(req.body);
      
      if (!userInput.success) {
        return res.status(400).json({ message: "Invalid user data", errors: userInput.error.errors });
      }

      const { username, password, email, companyName } = userInput.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: passwordHash,
        email,
        companyName,
        subscriptionTier: subscriptionTiers.FREE
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Product routes =====
  
  // Get all products for the current user
  app.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getProductsByUser(req.session.userId);
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get a single product
  app.get("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if the product belongs to the user
      if (product.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create a new product
  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const productInput = insertProductSchema.safeParse({
        ...req.body,
        userId: req.session.userId
      });
      
      if (!productInput.success) {
        return res.status(400).json({ message: "Invalid product data", errors: productInput.error.errors });
      }
      
      const product = await storage.createProduct(productInput.data);
      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update a product
  app.put("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if the product belongs to the user
      if (product.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedProduct = await storage.updateProduct(productId, {
        ...req.body,
        userId: req.session.userId // Ensure userId doesn't change
      });
      
      res.json(updatedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Delete a product
  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if the product belongs to the user
      if (product.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const deleted = await storage.deleteProduct(productId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete product" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Shipment routes =====
  
  // Get all shipments for the current user
  app.get("/api/shipments", isAuthenticated, async (req, res) => {
    try {
      const shipments = await storage.getShipmentsByUser(req.session.userId);
      res.json(shipments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get a single shipment
  app.get("/api/shipments/:id", isAuthenticated, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      if (isNaN(shipmentId)) {
        return res.status(400).json({ message: "Invalid shipment ID" });
      }
      
      const shipment = await storage.getShipment(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      // Check if the shipment belongs to the user
      if (shipment.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(shipment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create a new shipment
  app.post("/api/shipments", isAuthenticated, async (req, res) => {
    try {
      const shipmentInput = insertShipmentSchema.safeParse({
        ...req.body,
        userId: req.session.userId
      });
      
      if (!shipmentInput.success) {
        return res.status(400).json({ message: "Invalid shipment data", errors: shipmentInput.error.errors });
      }
      
      // Check if product exists and belongs to user
      const product = await storage.getProduct(shipmentInput.data.productId);
      if (!product || product.userId !== req.session.userId) {
        return res.status(400).json({ message: "Invalid product" });
      }
      
      const shipment = await storage.createShipment(shipmentInput.data);
      res.status(201).json(shipment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update a shipment
  app.put("/api/shipments/:id", isAuthenticated, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      if (isNaN(shipmentId)) {
        return res.status(400).json({ message: "Invalid shipment ID" });
      }
      
      const shipment = await storage.getShipment(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      // Check if the shipment belongs to the user
      if (shipment.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedShipment = await storage.updateShipment(shipmentId, {
        ...req.body,
        userId: req.session.userId, // Ensure userId doesn't change
        id: shipmentId // Ensure id doesn't change
      });
      
      res.json(updatedShipment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Delete a shipment
  app.delete("/api/shipments/:id", isAuthenticated, async (req, res) => {
    try {
      const shipmentId = parseInt(req.params.id);
      if (isNaN(shipmentId)) {
        return res.status(400).json({ message: "Invalid shipment ID" });
      }
      
      const shipment = await storage.getShipment(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      // Check if the shipment belongs to the user
      if (shipment.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const deleted = await storage.deleteShipment(shipmentId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete shipment" });
      }
      
      res.json({ message: "Shipment deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Analysis routes =====
  
  // Get all analysis results for the current user
  app.get("/api/analysis", isAuthenticated, async (req, res) => {
    try {
      const analysisResults = await storage.getAnalysisResultsByUser(req.session.userId);
      res.json(analysisResults);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get a single analysis result
  app.get("/api/analysis/:id", isAuthenticated, async (req, res) => {
    try {
      const analysisId = parseInt(req.params.id);
      if (isNaN(analysisId)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      
      const analysis = await storage.getAnalysisResult(analysisId);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      // Check if the analysis belongs to the user
      if (analysis.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(analysis);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Calculate and create a new analysis
  app.post("/api/analysis", isAuthenticated, async (req, res) => {
    try {
      const { shipmentId } = req.body;
      
      if (!shipmentId) {
        return res.status(400).json({ message: "Shipment ID is required" });
      }
      
      // Get shipment
      const shipment = await storage.getShipment(parseInt(shipmentId));
      if (!shipment || shipment.userId !== req.session.userId) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      
      // Get product
      const product = await storage.getProduct(shipment.productId);
      if (!product || product.userId !== req.session.userId) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Calculate shipping rates
      let shippingRates = [];
      try {
        shippingRates = await shippoApi.getInternationalRates(
          product.originCountry,
          "Unknown", // Origin city - could be added to product schema
          shipment.destinationCountry,
          "Unknown", // Destination city - could be added to shipment schema
          Number(product.weight),
          Number(product.length),
          Number(product.width),
          Number(product.height)
        );
      } catch (err) {
        console.error("Failed to get shipping rates:", err);
        // Continue with empty shipping rates
      }
      
      // Get tariff data
      let tariff = null;
      try {
        if (product.hsCode) {
          const tariffData = await comtradeApi.getTariffData(
            product.hsCode,
            shipment.destinationCountry
          );
          
          // Save tariff data to database
          tariff = await storage.saveTariffData({
            hsCode: product.hsCode,
            countryCode: shipment.destinationCountry,
            baseRate: tariffData.baseRate || 0,
            specialPrograms: tariffData.specialPrograms || {},
            finalRate: tariffData.finalRate || 0
          });
        }
      } catch (err) {
        console.error("Failed to get tariff data:", err);
        // Continue with null tariff
      }
      
      // Calculate cost breakdown
      const productCost = Number(product.value) * Number(shipment.quantity || 1);
      
      // Shipping cost (use first rate or estimate)
      const shippingRate = shippingRates.length > 0 ? 
        shippingRates[0].amount : 
        (productCost * 0.15); // Estimate 15% of product value
      
      // Duties and tariffs
      const tariffRate = tariff ? 
        Number(tariff.finalRate) / 100 : 
        0.075; // Default to 7.5% if no tariff data
      
      const dutiesAmount = productCost * tariffRate;
      
      // Insurance (typically 1-2% of product value)
      const insuranceAmount = productCost * 0.015;
      
      // Total landed cost
      const totalLandedCost = productCost + shippingRate + dutiesAmount + insuranceAmount;
      
      // Create cost breakdown object
      const costBreakdown = {
        productCost: {
          amount: productCost,
          percentage: (productCost / totalLandedCost) * 100
        },
        shippingFreight: {
          amount: shippingRate,
          percentage: (shippingRate / totalLandedCost) * 100
        },
        dutiesTariffs: {
          amount: dutiesAmount,
          percentage: (dutiesAmount / totalLandedCost) * 100
        },
        insuranceOther: {
          amount: insuranceAmount,
          percentage: (insuranceAmount / totalLandedCost) * 100
        }
      };
      
      // Alternative routes (simplified)
      const alternativeRoutes = [
        {
          name: "Sea Freight",
          cost: shippingRate,
          transitTime: { min: 30, max: 45 },
          provider: "Ocean Carrier",
          route: `${product.originCountry} → ${shipment.destinationCountry}`
        },
        {
          name: "Air Freight",
          cost: shippingRate * 1.5,
          transitTime: { min: 3, max: 7 },
          provider: "Air Cargo",
          route: `${product.originCountry} → ${shipment.destinationCountry}`
        }
      ];
      
      // Create analysis result
      const analysisResult = await storage.createAnalysisResult({
        shipmentId: shipment.id,
        userId: req.session.userId,
        costBreakdown,
        alternativeRoutes,
        totalLandedCost,
        currency: "USD" // Default currency
      });
      
      res.status(201).json(analysisResult);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Tariff routes =====
  
  // Get tariff data by HS code and country
  app.get("/api/tariff", isAuthenticated, async (req, res) => {
    try {
      const { hsCode, countryCode } = req.query;
      
      if (!hsCode || !countryCode) {
        return res.status(400).json({ message: "HS code and country code are required" });
      }
      
      // Check in database first
      let tariffData = await storage.getTariffData(hsCode as string, countryCode as string);
      
      // If not found in database, fetch from API
      if (!tariffData) {
        try {
          const apiData = await comtradeApi.getTariffData(hsCode as string, countryCode as string);
          
          // Save to database
          tariffData = await storage.saveTariffData({
            hsCode: hsCode as string,
            countryCode: countryCode as string,
            baseRate: apiData.baseRate || 0,
            specialPrograms: apiData.specialPrograms || {},
            finalRate: apiData.finalRate || 0
          });
        } catch (err) {
          console.error("Failed to get tariff data from API:", err);
          return res.status(500).json({ message: "Failed to get tariff data" });
        }
      }
      
      res.json(tariffData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get HS code suggestions
  app.post("/api/hs-suggestions", isAuthenticated, 
    checkSubscriptionAccess([
      subscriptionTiers.STARTER, 
      subscriptionTiers.GROWTH, 
      subscriptionTiers.GLOBAL
    ]), 
    async (req, res) => {
      try {
        const { productDescription } = req.body;
        
        if (!productDescription) {
          return res.status(400).json({ message: "Product description is required" });
        }
        
        // Try to get HS code suggestion from OpenAI
        try {
          const suggestion = await openaiService.getHSCodeSuggestion(productDescription);
          return res.json(suggestion);
        } catch (err) {
          // Fallback to Comtrade API
          try {
            const suggestions = await comtradeApi.getHsCodeSuggestions(productDescription);
            return res.json(suggestions);
          } catch (fallbackErr) {
            console.error("Failed to get HS code suggestions:", fallbackErr);
            return res.status(500).json({ message: "Failed to get HS code suggestions" });
          }
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    }
  );
  
  // Get regulatory guidance
  app.post("/api/regulatory-guidance", isAuthenticated,
    checkSubscriptionAccess([
      subscriptionTiers.GROWTH, 
      subscriptionTiers.GLOBAL
    ]),
    async (req, res) => {
      try {
        const { productDescription, hsCode, originCountry, destinationCountry } = req.body;
        
        if (!productDescription || !hsCode || !originCountry || !destinationCountry) {
          return res.status(400).json({ message: "All fields are required" });
        }
        
        const guidance = await openaiService.getRegulatoryGuidance(
          productDescription,
          hsCode,
          originCountry,
          destinationCountry
        );
        
        res.json(guidance);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  // ===== Currency conversion routes =====
  
  // Convert currency
  app.get("/api/currency/convert", isAuthenticated, async (req, res) => {
    try {
      const { amount, from, to } = req.query;
      
      if (!amount || !from || !to) {
        return res.status(400).json({ message: "Amount, from currency, and to currency are required" });
      }
      
      const convertedAmount = await exchangeRateApi.convertCurrency(
        parseFloat(amount as string),
        from as string,
        to as string
      );
      
      res.json({ amount: convertedAmount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get exchange rate
  app.get("/api/currency/rate", isAuthenticated, async (req, res) => {
    try {
      const { from, to } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({ message: "From currency and to currency are required" });
      }
      
      const rate = await exchangeRateApi.getExchangeRate(
        from as string,
        to as string
      );
      
      res.json({ rate });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Shipping routes =====
  
  // Get shipping rates
  app.post("/api/shipping/rates", isAuthenticated, async (req, res) => {
    try {
      const { 
        originCountry, originCity, 
        destinationCountry, destinationCity,
        weight, length, width, height
      } = req.body;
      
      if (!originCountry || !destinationCountry || !weight) {
        return res.status(400).json({ message: "Origin country, destination country, and weight are required" });
      }
      
      const rates = await shippoApi.getInternationalRates(
        originCountry,
        originCity || "Unknown",
        destinationCountry,
        destinationCity || "Unknown",
        parseFloat(weight),
        parseFloat(length || 10),
        parseFloat(width || 10),
        parseFloat(height || 10)
      );
      
      res.json(rates);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get transit time estimates
  app.get("/api/shipping/transit-time", isAuthenticated, async (req, res) => {
    try {
      const { originCountry, destinationCountry, transportMode } = req.query;
      
      if (!originCountry || !destinationCountry || !transportMode) {
        return res.status(400).json({ 
          message: "Origin country, destination country, and transport mode are required" 
        });
      }
      
      const transitTime = await shippoApi.getTransitTimes(
        originCountry as string,
        destinationCountry as string,
        transportMode as string
      );
      
      res.json(transitTime);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== User settings routes =====
  
  // Update user profile
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const { email, companyName, language } = req.body;
      
      // Update user
      const updatedUser = await storage.updateUser(req.session.userId, {
        email,
        companyName,
        language
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Change password
  app.put("/api/user/password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Update user
      await storage.updateUser(req.session.userId, {
        password: passwordHash
      });
      
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Stats and Dashboard routes =====
  
  // Get dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      // Get counts
      const products = await storage.getProductsByUser(req.session.userId);
      const shipments = await storage.getShipmentsByUser(req.session.userId);
      const analyses = await storage.getAnalysisResultsByUser(req.session.userId);
      
      // Calculate savings (simplified example)
      let monthlySavings = 0;
      analyses.forEach(analysis => {
        // For demo purposes, assume savings of 10% of total landed cost
        monthlySavings += Number(analysis.totalLandedCost) * 0.1;
      });
      
      // Count unique destination countries
      const marketsServed = new Set();
      shipments.forEach(shipment => {
        if (shipment.destinationCountry) {
          marketsServed.add(shipment.destinationCountry);
        }
      });
      
      res.json({
        totalProducts: products.length,
        activeShipments: shipments.length,
        monthlySavings,
        marketsServed: marketsServed.size
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
