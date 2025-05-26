// Master Translation System - Enhanced Version with Complete Structured Keys (Part 1)
export const masterTranslations = {
  en: {
    navigation: {
      overview: "Overview",
      features: "Features",
      pricing: "Pricing", 
      dashboard: "Dashboard",
      tools: "Tools",
      regulations: "Regulations",
      markets: "Markets",
      ai: "AI",
      programs: "Programs",
      documents: "Documents"
    },
    
    tools: {
      costBreakdown: "Cost Breakdown",
      routeAnalysis: "Route Analysis",
      tariffAnalysis: "Tariff Analysis"
    },
    
    regulations: {
      complianceRequirements: "Compliance Requirements",
      tradeRegulations: "Trade Regulations",
      legalFrameworks: "Legal Frameworks",
      specialPrograms: "Special Programs"
    },
    
    markets: {
      marketsAnalysis: "Markets Analysis",
      pricingData: "Pricing Data",
      regionalTrade: "Regional Trade"
    },
    
    ai: {
      aiGuidance: "AI Guidance",
      aiPredictions: "AI Predictions",
      visualizations: "Visualizations"
    },
    
    programs: {
      tradeZones: "Trade Zones",
      subscribe: "Subscribe"
    },
    
    common: {
      getStarted: "Get Started",
      learnMore: "Learn More",
      perMonth: "per month", 
      freeTrialDays: "14-day free trial",
      mostPopular: "Most Popular",
      download: "Download",
      cancel: "Cancel",
      save: "Save",
      submit: "Submit",
      calculate: "Calculate",
      faq: "Frequently Asked Questions"
    },
    
    files: {
      downloadConfirmation: "Download Confirmation",
      confirmDownloadMessage: "Please confirm you want to download this file",
      fileName: "File Name",
      fileSize: "File Size",
      fileType: "File Type", 
      securityStatus: "Security Status",
      secure: "Secure",
      blocked: "Blocked",
      validating: "Validating",
      fileTooLarge: "File exceeds maximum size limit (50MB)",
      fileTypeNotAllowed: "File type not allowed for security reasons",
      downloading: "Downloading...",
      downloadSuccess: "Download completed successfully",
      downloadError: "Download failed. Please try again.",
      confirmDownload: "Confirm Download",
      highSecurity: "High Security",
      standardSecurity: "Standard"
    },
    
    pricing: {
      main: {
        title: "Choose Your TradeNavigator Plan",
        subtitle: "Flexible solutions for international trade businesses of all sizes"
      },
      tiers: {
        free: {
          name: "Free Plan",
          price: "$0",
          description: "Perfect for getting started with basic trade calculations",
          features: {
            calculations: "Up to 10 cost calculations",
            hsCode: "AI-powered HS code suggestions",
            shipping: "Basic shipping rate comparisons",
            support: "Email support"
          },
          cta: "Start Free Trial"
        },
        basic: {
          name: "Basic Plan", 
          price: "$29",
          description: "Essential tools for growing trade operations",
          features: {
            calculations: "100 calculations/month",
            hsCode: "AI HS code suggestions",
            shipping: "Basic shipping rates",
            support: "Email support"
          },
          cta: "Start Basic"
        },
        pro: {
          name: "Pro Plan",
          price: "$99", 
          description: "Advanced features for established traders",
          features: {
            calculations: "Unlimited cost calculations",
            hsCode: "AI-powered HS code suggestions",
            shipping: "Real-time shipping rates (200+ carriers)",
            trade: "Trade agreement optimization",
            market: "Market intelligence & insights",
            compliance: "Compliance & regulatory updates",
            support: "Priority email & chat support",
            reports: "Export calculation reports"
          },
          cta: "Start Pro Plan"
        },
        global: {
          name: "Global Plan",
          price: "$199",
          description: "Enterprise solutions for large-scale operations",
          features: {
            pro: "Everything in Pro",
            api: "API access for integrations",
            reporting: "Custom reporting & analytics",
            account: "Dedicated account manager",
            sla: "SLA guarantee",
            support: "Phone support"
          },
          cta: "Contact Sales"
        }
      },
      roi: {
        title: "Calculate Your Savings",
        subtitle: "See how TradeNavigator pays for itself",
        metrics: {
          hsCodeError: {
            value: "$2,000+",
            label: "Average cost per HS code error",
            description: "Prevent just 1 misclassification and TradeNavigator pays for itself for 3+ years"
          },
          shippingCost: {
            value: "15-25%",
            label: "Average shipping cost reduction",
            description: "On a $10k shipment, save $1,500+ by finding optimal routes"
          },
          timeSaved: {
            value: "40+ hrs",
            label: "Time saved per month",
            description: "Stop manual research and focus on growing your business"
          }
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        questions: {
          trial: {
            question: "How does the 14-day trial work?",
            answer: "Start using TradeNavigator immediately with full access to all Pro features. No credit card required. Cancel anytime during the trial with no charges."
          },
          payment: {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards and ACH bank transfers for annual plans. All payments are processed securely through Stripe."
          },
          plans: {
            question: "Can I upgrade or downgrade anytime?",
            answer: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at your next billing cycle."
          },
          discount: {
            question: "Do you offer annual discounts?",
            answer: "Yes! Save 20% with annual billing. That's just $470 per year for Pro instead of $588 monthly billing."
          },
          security: {
            question: "Is my data secure?",
            answer: "Absolutely. We use bank-level encryption and are SOC 2 Type II compliant. Your business data is never shared with third parties."
          },
          support: {
            question: "What if I need help getting started?",
            answer: "Every Pro customer gets free onboarding support. We'll help you set up your first calculations and optimize your import processes."
          }
        }
      },
      cta: {
        title: "Ready to Save Thousands on Your Next Shipment?",
        subtitle: "Join hundreds of SMBs who've reduced their import costs by 15-25% with TradeNavigator.",
        trial: "Start Free 14-Day Trial",
        demo: "Schedule Demo",
        disclaimer: "No credit card required • Cancel anytime • Money-back guarantee"
      }
    },
    
    features: {
      title: "Powerful Features",
      subtitle: "Everything you need for international trade success"
    },
    
    productCategories: {
      electronics: "Electronics & Technology",
      textiles: "Textiles & Apparel",
      machinery: "Machinery & Equipment",
      food: "Food & Beverages",
      chemicals: "Chemicals & Pharmaceuticals",
      automotive: "Automotive Parts",
      home: "Home & Garden",
      sports: "Sports & Recreation",
      medical: "Medical Devices",
      raw: "Raw Materials",
      other: "Other Products"
    },
    
    regions: {
      northAmerica: "North America",
      europeanUnion: "European Union",
      centralSouthAmerica: "Central & South America",
      asia: "Asia",
      oceania: "Oceania",
      africa: "Africa"
    },
    
    countries: {
      US: "United States",
      CA: "Canada",
      DE: "Germany",
      FR: "France",
      IT: "Italy",
      ES: "Spain",
      NL: "Netherlands",
      BE: "Belgium",
      SE: "Sweden",
      PL: "Poland",
      AT: "Austria",
      DK: "Denmark",
      FI: "Finland",
      IE: "Ireland",
      PT: "Portugal",
      GR: "Greece",
      MX: "Mexico",
      BR: "Brazil",
      AR: "Argentina",
      CL: "Chile",
      CO: "Colombia"
      PE: "Peru",
      EC: "Ecuador",
      VE: "Venezuela",
      PA: "Panama",
      CR: "Costa Rica",
      GT: "Guatemala",
      CN: "China",
      JP: "Japan",
      KR: "South Korea",
      IN: "India",
      SG: "Singapore",
      VN: "Vietnam",
      TH: "Thailand",
      MY: "Malaysia",
      AU: "Australia",
      NZ: "New Zealand",
      ZA: "South Africa",
      EG: "Egypt",
      NG: "Nigeria",
      KE: "Kenya",
      MA: "Morocco",
      TW: "Taiwan"
    },
    
    overview: {
      title: "Trade Navigator Dashboard",
      subtitle: "Your international trade command center",
      recentCalculations: "Recent Calculations",
      savedCalculations: "Saved Calculations",
      quickActions: "Quick Actions",
      insights: "Insights",
      marketUpdates: "Market Updates",
      complianceUpdates: "Compliance Updates",
      tradeNews: "Trade News",
      viewAll: "View All"
    },
    
    documents: {
      title: "Trade Documents",
      subtitle: "Secure access to your international trade documentation for Mexico and Canada markets",
      lastUpdated: "Last Updated",
      categories: {
        customs: "Customs",
        shipping: "Shipping", 
        compliance: "Compliance",
        certificate: "Certificate"
      },
      descriptions: {
        customs: "Official customs documentation for cross-border trade",
        shipping: "Shipping manifests and logistics documentation",
        compliance: "Regulatory compliance documents and guidelines", 
        certificate: "Trade certificates and origin documentation"
      },
      actions: {
        upload: "Upload Document",
        download: "Download",
        share: "Share",
        delete: "Delete",
        rename: "Rename",
        categorize: "Categorize",
        search: "Search Documents"
      },
      filters: {
        all: "All Documents",
        recent: "Recently Updated",
        shared: "Shared with Me",
        starred: "Starred",
        archived: "Archived"
      },
      emptyState: {
        title: "No Documents Found",
        description: "Upload your first document to get started"
      }
    },
    
    form: {
      productInfo: "Product Information",
      shipmentDetails: "Shipment Details",
      shippingTerms: "Shipping & Trade Terms",
      productCategory: "Product Category",
      productName: "Product Name",
      productDescription: "Product Description",
      hsCode: "HS Code",
      quantity: "Quantity",
      unitValue: "Unit Value (USD)",
      weight: "Weight (kg)",
      originCountry: "Origin Country",
      destinationCountry: "Destination Country",
      shippingMethod: "Shipping Method",
      incoterms: "Incoterms",
      insurance: "Insurance Required",
      urgency: "Urgency Level",
      customsHandling: "Customs Handling",
      tradeAgreement: "Trade Agreement",
      placeholders: {
        productName: "e.g., Wireless Bluetooth Headphones",
        productDescription: "Detailed description including materials, features, and specifications...",
        hsCode: "e.g., 8518.30.20",
        quantity: "100",
        unitValue: "25.00",
        weight: "2.5"
      },
      aiSuggestions: {
        button: "Get AI HS Code Suggestions",
        loading: "Getting AI Suggestions...",
        title: "AI-Powered HS Code Suggestions",
        confidence: "% match",
        missingInfo: "Missing information",
        missingInfoDescription: "Please enter product name and description to get AI suggestions",
        ready: "AI suggestions ready",
        readyDescription: "Found {{count}} HS code suggestions",
        failed: "AI suggestions failed",
        failedDescription: "Failed to get AI suggestions. Please try again.",
        selected: "HS code selected",
        selectedDescription: "Selected HS code: {{code}}"
      },
      buttons: {
        calculate: "Calculate Import Costs",
        calculating: "Calculating..."
      },
      shipping: {
        oceanStandard: "🚢 Ocean Freight (Standard)",
        oceanExpress: "🚢 Ocean Freight (Express)",
        airStandard: "✈️ Air Freight (Standard)",
        airExpress: "✈️ Air Freight (Express)",
        courier: "📦 Courier (DHL/FedEx/UPS)",
        road: "🚛 Road Transport",
        rail: "🚂 Rail Transport"
      },
      incoterms: {
        exw: "EXW - Ex Works",
        fob: "FOB - Free on Board",
        cif: "CIF - Cost, Insurance, Freight",
        ddp: "DDP - Delivered Duty Paid",
        dap: "DAP - Delivered at Place",
        fca: "FCA - Free Carrier"
      },
      options: {
        yes: "Yes",
        no: "No",
        standard: "Standard",
        express: "Express",
        broker: "Use Customs Broker",
        self: "Self-Clear",
        none: "No Trade Agreement",
        usmca: "USMCA (US-Mexico-Canada)",
        cptpp: "CPTPP (Trans-Pacific Partnership)",
        euFta: "EU Free Trade Agreement",
        asean: "ASEAN Trade Agreement",
        gsp: "Generalized System of Preferences"
      },
      results: {
        title: "Cost calculation completed",
        description: "Your import cost analysis is ready!",
        failed: "Calculation failed",
        failedDescription: "Failed to calculate import costs. Please try again."
      }
    },
    
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      forgotPassword: "Forgot Password?",
      email: "Email",
      password: "Password",
      remember: "Remember me",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      createAccount: "Create an account",
      signInNow: "Sign in now"
    }
  },
