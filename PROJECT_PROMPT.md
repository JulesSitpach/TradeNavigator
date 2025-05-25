# TradeNavigator - AI-Powered International Trade Analysis Platform

## Project Overview
Build a comprehensive SaaS platform that leverages advanced AI to simplify and optimize global commerce processes. TradeNavigator provides real-time import cost analysis, AI-powered HS code suggestions, and intelligent trade insights for international businesses.

## Core Features & Functionality

### 1. Authentication System
- **Replit Auth Integration** - Seamless user authentication with OpenID Connect
- **User Management** - Profile management with session handling
- **Secure Access** - Protected routes and API endpoints

### 2. AI-Powered HS Code Classification
- **Smart Product Analysis** - AI determines correct HS codes based on product descriptions
- **Confidence Scoring** - Each suggestion includes accuracy percentage
- **Category Intelligence** - Automatic product categorization
- **API Integration** - OpenRouter API for advanced AI processing

### 3. Import Cost Calculator
- **Comprehensive Analysis** - Calculate total import costs including:
  - Product value and shipping costs
  - Duties and customs fees
  - Insurance and broker fees
  - Tax savings from trade agreements
- **Real-time Rates** - Live shipping rates via Shippo API
- **Multiple Shipping Methods** - Ocean, Air, and Courier options
- **Incoterms Support** - EXW, FOB, CIF, DDP, DAP, FCA handling

### 4. Trade Intelligence Features
- **Tariff Analysis** - UN Comtrade API integration for official tariff data
- **Market Insights** - Perplexity AI for real-time market analysis
- **Route Optimization** - Alternative shipping route suggestions
- **Compliance Guidance** - Trade regulation and legal framework information

### 5. Professional Navigation System
- **Hierarchical Dropdowns** - Clean, organized menu structure
- **Responsive Design** - Mobile-friendly navigation
- **Smooth Transitions** - Client-side routing with auto-closing menus
- **Visual Feedback** - Clear hover states and active indicators

### 6. Subscription Monetization
- **Stripe Integration** - Secure payment processing
- **$49/month SaaS Model** - Premium feature access
- **Subscription Management** - Automated billing and renewals

## Technical Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **UI Components**: Shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query for API state
- **Forms**: React Hook Form with Zod validation

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions

### API Integrations
- **OpenRouter** - AI-powered HS code suggestions
- **Shippo** - Real-time shipping rates and labels
- **UN Comtrade** - Official international trade statistics
- **Perplexity** - Market analysis and trade insights
- **Stripe** - Payment processing and subscriptions

### Database Schema
```sql
-- User management
users (id, email, firstName, lastName, profileImageUrl, createdAt, updatedAt)

-- Cost calculations history
cost_calculations (id, userId, productName, productDescription, productCategory, 
                  hsCode, quantity, unitValue, originCountry, destinationCountry,
                  shippingMethod, incoterms, tradeAgreement, productValue, 
                  shippingCost, duties, customsFees, insuranceCost, brokerFees,
                  taxSavings, totalCost, timeline, createdAt)

-- HS code suggestions cache
hs_code_suggestions (id, productName, productCategory, hsCode, description, 
                    confidence, createdAt)

-- Session storage
sessions (sid, sess, expire)
```

## Key User Flows

### 1. Import Cost Analysis
1. User enters product details (name, description, category)
2. AI suggests relevant HS codes with confidence scores
3. User selects origin/destination countries and shipping method
4. System calculates comprehensive cost breakdown
5. Results show duties, fees, and potential trade agreement savings

### 2. Trade Intelligence Research
1. Access market analysis through navigation dropdowns
2. View tariff information for specific products/countries
3. Explore alternative shipping routes and costs
4. Review compliance requirements and regulations

### 3. Subscription Management
1. Free tier with basic cost calculations
2. Premium features require $49/month subscription
3. Stripe-powered checkout and billing management

## Development Guidelines

### Environment Setup
```bash
npm install
npm run db:push  # Initialize database schema
npm run dev      # Start development server
```

### Required Environment Variables
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
SHIPPO_API_KEY=shippo_...
UN_COMTRADE_PRIMARY_KEY=...
UN_COMTRADE_SECONDARY_KEY=...
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
SESSION_SECRET=...
REPL_ID=...
REPLIT_DOMAINS=...
```

### Code Organization
- `client/src/pages/` - React page components
- `client/src/components/` - Reusable UI components
- `server/routes.ts` - API endpoint definitions
- `server/storage.ts` - Database operations
- `shared/schema.ts` - Drizzle database schema

## Design Principles
- **User-Centric** - Intuitive interface for non-technical trade professionals
- **Data Integrity** - Only authentic data from authorized sources
- **Performance** - Fast, responsive interactions with minimal loading
- **Scalability** - Built to handle growing user base and feature set
- **Security** - Proper authentication and API key management

## Deployment Considerations
- **Replit Deployments** - Optimized for Replit hosting platform
- **Database Migration** - Automated schema updates via Drizzle
- **API Rate Limits** - Respectful usage of external services
- **Error Handling** - Graceful degradation and user feedback

## Success Metrics
- **User Engagement** - Cost calculations per user
- **Accuracy** - HS code suggestion confidence scores
- **Conversion** - Free to paid subscription rates
- **Performance** - API response times and uptime

This platform represents a sophisticated solution for international trade professionals, combining AI intelligence with real-world trade data to streamline global commerce operations.