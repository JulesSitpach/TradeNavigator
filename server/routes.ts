import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCostCalculationSchema, insertHsCodeSuggestionSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

// Schema for HS code suggestion request
const hsCodeRequestSchema = z.object({
  productName: z.string().min(1),
  productDescription: z.string().min(1),
  productCategory: z.string().optional(),
});

// Schema for cost calculation request
const costCalculationRequestSchema = insertCostCalculationSchema.extend({
  // Allow frontend to send these as strings, we'll convert to numbers
  quantity: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
  unitValue: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
  weight: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
});

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // HS Code AI Suggestions endpoint
  app.post('/api/hs-code-suggestions', async (req, res) => {
    try {
      console.log('🤖 HS Code AI request received:', req.body);
      
      const validation = hsCodeRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validation.error.errors 
        });
      }

      const { productName, productDescription, productCategory } = validation.data;

      // Call OpenRouter API for HS code suggestions
      const openRouterApiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
      
      if (!openRouterApiKey) {
        console.error('No OpenRouter API key found');
        return res.status(500).json({ message: "API configuration error" });
      }

      const prompt = `As an international trade expert, suggest the most appropriate HS (Harmonized System) codes for the following product:

Product Name: ${productName}
Product Description: ${productDescription}
${productCategory ? `Category: ${productCategory}` : ''}

Please provide 3-5 most relevant HS codes with their descriptions and confidence levels. Format your response as a JSON array with objects containing:
- code: the HS code (e.g., "8518.30.20")
- description: detailed description of what this code covers
- confidence: confidence level as percentage (e.g., 95)

Focus on accuracy and provide codes that would be accepted by customs authorities.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000',
          'X-Title': 'TradeNavigator'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in international trade and HS codes. Always respond with valid JSON arrays containing HS code suggestions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', response.status, response.statusText);
        return res.status(500).json({ message: "Failed to get AI suggestions" });
      }

      const aiResponse = await response.json();
      console.log('🤖 OpenRouter API response received');
      
      if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
        console.error('Invalid AI response format:', aiResponse);
        return res.status(500).json({ message: "Invalid AI response format" });
      }

      let suggestions;
      try {
        const content = aiResponse.choices[0].message.content;
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try to parse the entire content
          suggestions = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        // Provide fallback suggestions based on category
        suggestions = getFallbackSuggestions(productCategory, productName);
      }

      // Store suggestions in database for future reference
      for (const suggestion of suggestions) {
        try {
          await storage.createHsCodeSuggestion({
            productName,
            productDescription,
            productCategory,
            hsCode: suggestion.code,
            description: suggestion.description,
            confidence: suggestion.confidence
          });
        } catch (dbError) {
          console.error('Error storing HS code suggestion:', dbError);
          // Continue even if storage fails
        }
      }

      res.json(suggestions);

    } catch (error) {
      console.error('🚨 Error generating HS codes:', error);
      res.status(500).json({ message: "Failed to generate HS code suggestions" });
    }
  });

  // Cost calculation endpoint
  app.post('/api/cost-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validation = costCalculationRequestSchema.safeParse({
        ...req.body,
        userId
      });
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid calculation data",
          errors: validation.error.errors 
        });
      }

      const calculationData = validation.data;
      
      // Calculate costs based on the input data
      const results = calculateImportCosts(calculationData);
      
      // Store the calculation in database
      const calculation = await storage.createCostCalculation({
        ...calculationData,
        ...results
      });

      res.json({
        id: calculation.id,
        ...results
      });

    } catch (error) {
      console.error('Error calculating import costs:', error);
      res.status(500).json({ message: "Failed to calculate import costs" });
    }
  });

  // Get user's recent calculations
  app.get('/api/calculations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const calculations = await storage.getUserCalculations(userId, 10);
      res.json(calculations);
    } catch (error) {
      console.error('Error fetching calculations:', error);
      res.status(500).json({ message: "Failed to fetch calculations" });
    }
  });

  // Input validation for shipping rates
  const validateShippingParams = (req: any, res: any, next: any) => {
    const { originCountry, destinationCountry, weight } = req.body;
    
    if (!originCountry || !destinationCountry || !weight) {
      return res.status(400).json({
        message: "Origin country, destination country, and weight are required",
        example: { originCountry: "US", destinationCountry: "CA", weight: 2.5 },
        error: "MISSING_PARAMETERS"
      });
    }
    
    if (typeof weight !== 'number' || weight <= 0) {
      return res.status(400).json({
        message: "Weight must be a positive number (in pounds)",
        error: "INVALID_WEIGHT_FORMAT"
      });
    }
    
    next();
  };

  // Cache for shipping rates
  const shippingRatesCache = new Map();
  const SHIPPING_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // Enhanced shipping rates API with Shippo
  app.post('/api/shipping-rates', isAuthenticated, validateShippingParams, async (req, res) => {
    const startTime = Date.now();
    const { originCountry, destinationCountry, weight, dimensions } = req.body;
    const cacheKey = `${originCountry}-${destinationCountry}-${weight}-${JSON.stringify(dimensions || {})}`;
    
    console.log(`Shipping Rates API: ${req.method} ${req.path}`, {
      body: req.body,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')
    });

    try {
      // Check cache first
      const cached = shippingRatesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < SHIPPING_CACHE_TTL) {
        console.log(`Cache hit for shipping rates: ${cacheKey}`);
        return res.json({
          ...cached.data,
          source: 'cached',
          responseTime: Date.now() - startTime
        });
      }

      if (!process.env.SHIPPO_API_KEY) {
        return res.status(500).json({ 
          message: "Shippo API credentials required for real-time shipping rates",
          error: "MISSING_API_KEY",
          details: "Please provide SHIPPO_API_KEY to access live shipping data",
          responseTime: Date.now() - startTime
        });
      }

      // Primary: Shippo API call with enhanced error handling
      const shippoResponse = await fetch('https://api.goshippo.com/shipments/', {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address_from: { country: originCountry },
          address_to: { country: destinationCountry },
          parcels: [{
            length: dimensions?.length || "10",
            width: dimensions?.width || "10", 
            height: dimensions?.height || "10",
            distance_unit: "in",
            weight: weight || "1",
            mass_unit: "lb"
          }]
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!shippoResponse.ok) {
        throw new Error(`Shippo API error: ${shippoResponse.status} ${shippoResponse.statusText}`);
      }

      const shippoData = await shippoResponse.json();
      
      const result = {
        rates: shippoData.rates || [],
        source: 'shippo',
        responseTime: Date.now() - startTime,
        lastUpdated: new Date().toISOString()
      };
      
      // Cache successful result
      shippingRatesCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      res.json(result);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('🚨 Shipping Rates API Error:', {
        error: errorMessage,
        body: req.body,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      });
      
      res.status(500).json({ 
        message: "Failed to fetch shipping rates from Shippo",
        error: errorMessage,
        source: 'error',
        responseTime: Date.now() - startTime,
        support: "Please verify Shippo API credentials or contact support"
      });
    }
  });

  // UN Comtrade official tariff data
  app.post('/api/tariff-data', isAuthenticated, async (req, res) => {
    try {
      const { hsCode, originCountry, destinationCountry } = req.body;
      
      if (!process.env.UN_COMTRADE_PRIMARY_KEY) {
        return res.status(500).json({ message: "UN Comtrade API not configured" });
      }

      const comtradeUrl = `https://comtrade.un.org/api/get?r=${destinationCountry}&p=${originCountry}&cc=${hsCode}&fmt=json&type=C&freq=A&px=HS&ps=recent&token=${process.env.UN_COMTRADE_PRIMARY_KEY}`;
      
      const comtradeResponse = await fetch(comtradeUrl);
      const tariffData = await comtradeResponse.json();
      
      res.json(tariffData);
    } catch (error) {
      console.error('Error fetching tariff data:', error);
      res.status(500).json({ message: "Failed to fetch official tariff data" });
    }
  });

  // Input validation middleware for trade programs
  const validateTradeParams = (req: any, res: any, next: any) => {
    const { originCountry, destinationCountry, hsCode } = req.query;
    
    if (!originCountry || !destinationCountry) {
      return res.status(400).json({
        message: "Origin and destination countries are required",
        example: "/api/trade-programs?originCountry=US&destinationCountry=CA&hsCode=8518",
        error: "MISSING_PARAMETERS"
      });
    }
    
    // Validate country codes (ISO 2-letter format)
    if (originCountry.length !== 2 || destinationCountry.length !== 2) {
      return res.status(400).json({
        message: "Country codes must be 2-letter ISO format (e.g., US, CA, CN)",
        error: "INVALID_COUNTRY_FORMAT"
      });
    }
    
    // Validate HS code format if provided
    if (hsCode && !/^\d{4,10}$/.test(hsCode)) {
      return res.status(400).json({
        message: "HS code must be 4-10 digits",
        error: "INVALID_HS_CODE_FORMAT"
      });
    }
    
    next();
  };

  // Simple in-memory cache for trade programs
  const tradeProgramsCache = new Map();
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  const getCachedTradePrograms = (key: string) => {
    const cached = tradeProgramsCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  };

  const setCachedTradePrograms = (key: string, data: any) => {
    tradeProgramsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  };

  // Enhanced trade programs API with layered error handling
  app.get('/api/trade-programs', isAuthenticated, validateTradeParams, async (req, res) => {
    const startTime = Date.now();
    const { originCountry, destinationCountry, hsCode } = req.query;
    const cacheKey = `${originCountry}-${destinationCountry}-${hsCode || 'all'}`;
    
    // Log the request
    console.log(`Trade Programs API: ${req.method} ${req.path}`, {
      query: req.query,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')
    });

    try {
      // Set CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Check cache first
      const cachedData = getCachedTradePrograms(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for trade programs: ${cacheKey}`);
        return res.json({
          ...cachedData,
          source: 'cached',
          responseTime: Date.now() - startTime
        });
      }

      // Primary: Try UN Comtrade API
      if (process.env.UN_COMTRADE_PRIMARY_KEY) {
        try {
          const comtradeUrl = `https://comtrade.un.org/api/get?r=${destinationCountry}&p=${originCountry}&cc=${hsCode || 'all'}&fmt=json&type=C&freq=A&px=HS&ps=recent&token=${process.env.UN_COMTRADE_PRIMARY_KEY}`;
          
          const response = await fetch(comtradeUrl, {
            timeout: 10000 // 10 second timeout
          });
          
          if (!response.ok) {
            throw new Error(`UN Comtrade API error: ${response.status} ${response.statusText}`);
          }
          
          const tradeData = await response.json();
          
          const result = {
            programs: tradeData.dataset || [],
            agreements: [
              { name: "USMCA", status: "active", savings: "15-25%" },
              { name: "KORUS FTA", status: "active", savings: "10-20%" },
              { name: "EU-Canada CETA", status: "available", savings: "5-15%" },
              { name: "CPTPP", status: "active", savings: "5-20%" },
              { name: "RCEP", status: "active", savings: "10-30%" }
            ],
            lastUpdated: new Date().toISOString(),
            source: 'un_comtrade',
            responseTime: Date.now() - startTime
          };
          
          // Cache the successful result
          setCachedTradePrograms(cacheKey, result);
          
          return res.json(result);
          
        } catch (primaryError) {
          console.warn(`Primary UN Comtrade API failed: ${primaryError.message}`);
          
          // Fallback: Try secondary key if available
          if (process.env.UN_COMTRADE_SECONDARY_KEY) {
            try {
              const fallbackUrl = `https://comtrade.un.org/api/get?r=${destinationCountry}&p=${originCountry}&cc=${hsCode || 'all'}&fmt=json&type=C&freq=A&px=HS&ps=recent&token=${process.env.UN_COMTRADE_SECONDARY_KEY}`;
              
              const fallbackResponse = await fetch(fallbackUrl, {
                timeout: 10000
              });
              
              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                
                const result = {
                  programs: fallbackData.dataset || [],
                  agreements: [
                    { name: "USMCA", status: "active", savings: "15-25%" },
                    { name: "KORUS FTA", status: "active", savings: "10-20%" },
                    { name: "EU-Canada CETA", status: "available", savings: "5-15%" }
                  ],
                  lastUpdated: new Date().toISOString(),
                  source: 'un_comtrade_fallback',
                  responseTime: Date.now() - startTime
                };
                
                setCachedTradePrograms(cacheKey, result);
                return res.json(result);
              }
              
            } catch (fallbackError) {
              console.warn(`Fallback UN Comtrade API also failed: ${fallbackError.message}`);
            }
          }
        }
      }
      
      // Final fallback: Return informative response about API configuration
      return res.status(200).json({
        programs: [],
        agreements: [
          { name: "USMCA", status: "active", savings: "15-25%" },
          { name: "KORUS FTA", status: "active", savings: "10-20%" },
          { name: "EU-Canada CETA", status: "available", savings: "5-15%" }
        ],
        message: "Live trade data unavailable. Please configure UN Comtrade API credentials for real-time data.",
        source: 'fallback',
        responseTime: Date.now() - startTime,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('🚨 Trade Programs API Error:', {
        error: errorMessage,
        query: req.query,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      });
      
      res.status(500).json({ 
        message: "Failed to fetch trade programs data",
        error: errorMessage,
        source: 'error',
        responseTime: Date.now() - startTime,
        support: "Contact support if this issue persists"
      });
    }
  });

  // Enhanced trade insights with Perplexity
  app.post('/api/trade-insights', isAuthenticated, async (req, res) => {
    try {
      const { productName, originCountry, destinationCountry, hsCode } = req.body;
      
      // Set CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(500).json({ 
          message: "Trade insights API not configured. Please provide Perplexity API key.",
          error: "MISSING_API_KEY"
        });
      }

      const query = `What are the current trade regulations, restrictions, and market insights for importing ${productName} (HS code: ${hsCode}) from ${originCountry} to ${destinationCountry}? Include any recent trade policy changes or opportunities.`;

      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in international trade regulations and market analysis. Provide accurate, current information about trade policies and market conditions.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 800
        })
      });

      if (!perplexityResponse.ok) {
        throw new Error(`Perplexity API error: ${perplexityResponse.status} ${perplexityResponse.statusText}`);
      }

      const insights = await perplexityResponse.json();
      res.json({
        insights: insights.choices?.[0]?.message?.content || "No insights available",
        citations: insights.citations || []
      });
    } catch (error: any) {
      console.error('Error fetching trade insights:', error);
      res.status(500).json({ 
        message: "Failed to fetch trade insights",
        error: error.message,
        details: "Check API credentials and network connectivity"
      });
    }
  });

  // Stripe subscription management
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.status(400).json({ message: "User email required" });
      }

      // Create or retrieve Stripe customer
      let customer;
      try {
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        customer = customers.data[0] || await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        });
      } catch (error) {
        customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        });
      }

      // Create subscription  
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'TradeNavigator Pro',
            },
            unit_amount: 4900, // $49/month
            recurring: {
              interval: 'month',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate import costs
function calculateImportCosts(data: any) {
  const baseValue = parseFloat(data.unitValue) * parseInt(data.quantity);
  
  // Calculate shipping cost based on method
  let shippingMultiplier = 0.08; // Default ocean freight
  if (data.shippingMethod?.includes('air')) {
    shippingMultiplier = data.urgency === 'express' ? 0.25 : 0.18;
  } else if (data.shippingMethod?.includes('courier')) {
    shippingMultiplier = 0.30;
  } else if (data.urgency === 'express') {
    shippingMultiplier = 0.12;
  }
  
  const shippingCost = baseValue * shippingMultiplier;
  
  // Calculate duties (simplified - in real app would use actual tariff schedules)
  let dutyRate = 0.15; // Default 15%
  if (data.productCategory === 'electronics') dutyRate = 0.10;
  if (data.productCategory === 'textiles') dutyRate = 0.25;
  if (data.productCategory === 'machinery') dutyRate = 0.05;
  
  let duties = baseValue * dutyRate;
  
  // Apply trade agreement savings
  let taxSavings = 0;
  if (data.tradeAgreement) {
    if (data.tradeAgreement === 'USMCA') taxSavings = duties * 0.4;
    if (data.tradeAgreement === 'CPTPP') taxSavings = duties * 0.3;
    if (data.tradeAgreement === 'GSP') taxSavings = duties * 0.5;
  }
  
  duties = duties - taxSavings;
  
  const customsFees = 125; // Fixed customs processing fee
  const insuranceCost = data.insurance ? baseValue * 0.035 : 0;
  const brokerFees = data.customsHandling === 'broker' ? 150 : 0;
  
  const totalCost = baseValue + shippingCost + duties + customsFees + insuranceCost + brokerFees;
  
  const timeline = data.urgency === 'express' ? 
    (data.shippingMethod?.includes('air') ? '3-5 business days' : '7-10 business days') :
    (data.shippingMethod?.includes('air') ? '7-10 business days' : '14-21 business days');

  return {
    productValue: baseValue.toFixed(2),
    shippingCost: shippingCost.toFixed(2),
    duties: duties.toFixed(2),
    customsFees: customsFees.toFixed(2),
    insuranceCost: insuranceCost.toFixed(2),
    brokerFees: brokerFees.toFixed(2),
    taxSavings: taxSavings.toFixed(2),
    totalCost: totalCost.toFixed(2),
    timeline
  };
}

// Fallback HS code suggestions when AI fails
function getFallbackSuggestions(category?: string, productName?: string) {
  const fallbacks: Record<string, any[]> = {
    electronics: [
      { code: "8518.30.20", description: "Headphones and earphones", confidence: 85 },
      { code: "8517.12.00", description: "Mobile phones and devices", confidence: 80 }
    ],
    textiles: [
      { code: "6109.10.00", description: "T-shirts and tank tops", confidence: 85 },
      { code: "6203.42.40", description: "Men's trousers and shorts", confidence: 80 }
    ],
    machinery: [
      { code: "8479.89.94", description: "Industrial machinery", confidence: 75 },
      { code: "8421.23.00", description: "Filtering equipment", confidence: 70 }
    ]
  };

  return fallbacks[category || 'electronics'] || fallbacks.electronics;
}
