const translations = {
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    search: "Rechercher",
    filter: "Filtrer",
    viewAll: "Voir Tout",
    export: "Exporter",
    loading: "Chargement...",
    noData: "Aucune donnée disponible",
    back: "Retour",
    next: "Suivant",
    submit: "Soumettre",
    success: "Succès",
    error: "Erreur",
    warning: "Avertissement",
    info: "Information",
    close: "Fermer",
    confirm: "Confirmer",
    yes: "Oui",
    no: "Non"
  },

  auth: {
    unauthorized: "Non autorisé",
    forbidden: "Interdit",
    sessionExpired: "Votre session a expiré. Veuillez vous reconnecter."
  },

  login: {
    title: "Connexion",
    subtitle: "Plateforme de Commerce International pour PME",
    description: "Connectez-vous à votre compte TradeNavigator",
    username: "Nom d'utilisateur",
    usernamePlaceholder: "Entrez votre nom d'utilisateur",
    password: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié ?",
    loginButton: "Se connecter",
    loggingIn: "Connexion en cours...",
    noAccount: "Vous n'avez pas de compte ?",
    registerNow: "Inscrivez-vous maintenant",
    needHelp: "Besoin d'aide ?"
  },

  register: {
    title: "Créer un Compte",
    subtitle: "Rejoignez des milliers d'entreprises qui optimisent leur commerce international",
    description: "Remplissez les détails ci-dessous pour créer votre compte",
    username: "Nom d'utilisateur",
    usernamePlaceholder: "Choisissez un nom d'utilisateur",
    email: "Adresse Email",
    emailPlaceholder: "Entrez votre adresse email",
    password: "Mot de passe",
    passwordPlaceholder: "Créez un mot de passe fort",
    companyName: "Nom de l'Entreprise (optionnel)",
    companyNamePlaceholder: "Entrez le nom de votre entreprise",
    registerButton: "Créer un Compte",
    registering: "Création du compte...",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    loginHere: "Connectez-vous",
    termsAgreement: "En vous inscrivant, vous acceptez nos",
    terms: "Conditions d'Utilisation",
    and: "et",
    privacy: "Politique de Confidentialité"
  },

  dashboard: {
    title: "Tableau de Bord",
    description: "Aperçu de vos activités de commerce international",
    newAnalysis: "Nouvelle Analyse",
    recentProducts: "Produits Récents",
    recentAnalyses: "Analyses Récentes",
    globalTradeInsights: "Aperçus du Commerce Mondial",
    noProducts: "Vous n'avez pas encore ajouté de produits",
    addProduct: "Ajouter un Produit",
    noAnalyses: "Aucun résultat d'analyse trouvé",
    createAnalysis: "Créer une Analyse",
    analyze: "Analyser",
    view: "Voir",
    globalMarkets: "Explorer les Marchés Mondiaux",
    marketInsightsDesc: "Découvrez de nouveaux marchés et opportunités de croissance pour vos produits dans le monde entier.",
    exploreMarkets: "Explorer les Marchés"
  },

  products: {
    title: "Mes Produits",
    description: "Gérez votre catalogue de produits pour les expéditions internationales",
    addProduct: "Ajouter un Produit",
    editProduct: "Modifier le Produit",
    deleteProduct: "Supprimer le Produit",
    deleteConfirmation: "Êtes-vous sûr de vouloir supprimer ce produit ?",
    productDetails: "Détails du Produit",
    noProducts: "Aucun produit trouvé",
    productName: "Nom du Produit",
    hsCode: "Code SH",
    origin: "Origine",
    value: "Valeur",
    weight: "Poids",
    dimensions: "Dimensions",
    analyze: "Analyser",
    createFirstProduct: "Créez votre premier produit"
  },

  shipments: {
    title: "Expéditions",
    description: "Gérez vos expéditions internationales",
    addShipment: "Ajouter une Expédition",
    editShipment: "Modifier l'Expédition",
    deleteShipment: "Supprimer l'Expédition",
    deleteConfirmation: "Êtes-vous sûr de vouloir supprimer cette expédition ?",
    shipmentDetails: "Détails de l'Expédition",
    noShipments: "Aucune expédition trouvée",
    destination: "Destination",
    quantity: "Quantité",
    transportMode: "Mode de Transport",
    incoterm: "Incoterm",
    analyze: "Analyser",
    createFirstShipment: "Créez votre première expédition"
  },

  analysis: {
    title: "Analyse des Coûts",
    description: "Analysez les coûts d'expédition et les tarifs douaniers pour vos produits",
    newAnalysis: "Nouvelle Analyse",
    costBreakdown: "Répartition des Coûts",
    tariffInformation: "Informations Tarifaires",
    shippingOptions: "Options d'Expédition",
    totalLandedCost: "Coût Total Débarqué",
    perUnitCost: "Coût par Unité",
    productCost: "Coût du Produit",
    shippingFreight: "Expédition et Fret",
    dutiesTariffs: "Droits et Tarifs",
    insuranceOther: "Assurance et Autres",
    recalculate: "Recalculer",
    export: "Exporter",
    noAnalysisData: "Aucune donnée d'analyse de coûts disponible",
    calculateCosts: "Calculer les Coûts",
    hsCodeDetail: "Détail du Code SH",
    baseRate: "Taux de Base",
    specialPrograms: "Programmes Spéciaux",
    finalRate: "Taux Final",
    selectProduct: "Sélectionner un Produit",
    createNewProduct: "Créer un Nouveau Produit",
    noProductsFound: "Aucun produit trouvé",
    sea: "Fret Maritime",
    air: "Fret Aérien",
    road: "Transport Routier",
    rail: "Transport Ferroviaire"
  },

  tariff: {
    title: "Recherche de Tarifs Douaniers",
    description: "Trouvez les taux de droits de douane et les codes SH pour vos produits",
    byHsCode: "Par Code SH",
    byDescription: "Par Description",
    hsCodePlaceholder: "ex. 8518.30.20",
    destinationCountry: "Pays de Destination",
    searchTariffs: "Rechercher Tarifs",
    searching: "Recherche en cours...",
    productDescription: "Description du Produit",
    descriptionPlaceholder: "ex. Écouteurs sans fil avec microphone",
    findHsCodes: "Trouver des Codes SH",
    finding: "Recherche de Codes SH...",
    results: "Résultats",
    hsCodeResults: "Résultats de Code SH",
    tariffRates: "Taux Tarifaires",
    noResults: "Aucun résultat à afficher",
    searchPrompt: "Recherchez un code SH ou décrivez votre produit pour voir les informations tarifaires",
    useThisHsCode: "Utiliser ce Code SH",
    confidence: "Confiance"
  },

  market: {
    title: "Analyse de Marché",
    description: "Analysez les tendances et opportunités du marché mondial",
    productCategory: "Catégorie de Produit",
    targetMarket: "Marché Cible",
    timePeriod: "Période",
    marketGrowth: "Croissance du Marché par Région",
    marketInsights: "Aperçus du Marché",
    globalMarketSize: "Taille du Marché Mondial",
    topImportingMarket: "Principal Marché Importateur",
    fastestGrowingMarket: "Marché à Croissance Rapide",
    detailedAnalysis: "Analyse Détaillée du Marché",
    importExportTrends: "Tendances d'Importation/Exportation",
    competitors: "Principaux Concurrents",
    regulations: "Réglementations et Barrières",
    opportunities: "Opportunités de Marché Mondial",
    emergingMarket: "Marché Émergent en Vedette"
  },

  reports: {
    title: "Rapports et Analytiques",
    description: "Consultez et exportez des rapports détaillés de vos activités commerciales",
    exportReport: "Exporter le Rapport",
    totalTradeVolume: "Volume Total de Commerce",
    totalShipments: "Total des Expéditions",
    estimatedSavings: "Économies Estimées",
    reportData: "Données du Rapport",
    analysisHistory: "Historique des Analyses",
    costBreakdown: "Répartition des Coûts",
    trends: "Tendances",
    dateRange: "Plage de Dates",
    noAnalysisRecords: "Aucun enregistrement d'analyse trouvé",
    createAnalysisPrompt: "Commencez par créer votre première analyse de coûts",
    averageCostDistribution: "Distribution Moyenne des Coûts",
    costAnalysisByCategory: "Analyse des Coûts par Catégorie",
    totalLandedCost: "Coût Total Débarqué",
    costTrendAnalysis: "Analyse des Tendances de Coûts",
    marketComparison: "Comparaison des Marchés",
    keyInsights: "Idées Clés",
    costSavingOpportunities: "Opportunités d'Économie de Coûts",
    marketExpansionInsights: "Perspectives d'Expansion de Marché"
  },

  subscription: {
    title: "Plans d'Abonnement",
    description: "Choisissez le plan adapté à vos besoins de commerce international",
    currentPlan: "Plan Actuel",
    free: "Gratuit",
    starter: "Débutant",
    growth: "Croissance",
    global: "Global",
    monthly: "Mensuel",
    yearly: "Annuel",
    getCurrentPlan: "Plan Actuel",
    getStarted: "Commencer",
    upgrading: "Mise à niveau...",
    billingCycle: "Cycle de Facturation",
    nextBillingDate: "Prochaine date de facturation",
    amount: "Montant",
    paymentMethod: "Méthode de paiement",
    updatePaymentMethod: "Mettre à Jour la Méthode de Paiement",
    cancelSubscription: "Annuler l'Abonnement",
    faq: "Questions Fréquemment Posées"
  },

  profile: {
    title: "Paramètres du Profil",
    description: "Gérez les paramètres de votre compte et vos préférences",
    accountInformation: "Informations du Compte",
    profileSettings: "Paramètres du Profil",
    general: "Général",
    security: "Sécurité",
    emailAddress: "Adresse Email",
    companyName: "Nom de l'Entreprise",
    preferredLanguage: "Langue Préférée",
    saveChanges: "Enregistrer les Modifications",
    updating: "Mise à jour...",
    currentPassword: "Mot de Passe Actuel",
    newPassword: "Nouveau Mot de Passe",
    confirmPassword: "Confirmer le Nouveau Mot de Passe",
    passwordRequirements: "Le mot de passe doit contenir au moins 8 caractères et inclure des majuscules, des minuscules et des chiffres.",
    changePassword: "Changer le Mot de Passe",
    changingPassword: "Changement du Mot de Passe...",
    memberSince: "Membre depuis",
    subscription: "Abonnement"
  }
};

export default translations;
