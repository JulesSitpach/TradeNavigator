#!/bin/bash

# TradeNavigator Translation Integration Script
# This script helps apply translations to all pages in the application

echo "TradeNavigator Translation Integration Helper"
echo "============================================"

# Function to add translation hook to a file
add_translation_hook() {
    local file=$1
    echo "Processing: $file"
    
    # Check if the file already imports useMasterTranslation
    if grep -q "useMasterTranslation" "$file"; then
        echo "✓ Already has translation hook"
    else
        echo "→ Adding translation hook import..."
        # Add the import after the last import line
        sed -i '/^import.*from/!b;:a;n;/^import.*from/ba;i\import { useMasterTranslation } from "@/utils/masterTranslation";' "$file"
        
        # Add the hook usage after the function declaration
        sed -i '/^export default function/ {n; s/^/  const { t } = useMasterTranslation();\n/}' "$file"
        echo "✓ Translation hook added"
    fi
}

# Pages that need translation
pages=(
    "client/src/pages/overview.tsx"
    "client/src/pages/dashboard.tsx"
    "client/src/pages/cost-breakdown.tsx"
    "client/src/pages/route-analysis.tsx"
    "client/src/pages/tariff-analysis.tsx"
    "client/src/pages/regulations.tsx"
    "client/src/pages/compliance-requirements.tsx"
    "client/src/pages/trade-regulations.tsx"
    "client/src/pages/legal-frameworks.tsx"
    "client/src/pages/special-programs.tsx"
    "client/src/pages/pricing-data.tsx"
    "client/src/pages/regional-trade.tsx"
    "client/src/pages/ai-guidance.tsx"
    "client/src/pages/ai-predictions.tsx"
    "client/src/pages/visualizations.tsx"
    "client/src/pages/trade-zones.tsx"
    "client/src/pages/features.tsx"
    "client/src/pages/pricing.tsx"
    "client/src/pages/documents.tsx"
    "client/src/pages/templates.tsx"
    "client/src/pages/calculation-history.tsx"
    "client/src/pages/subscribe.tsx"
)

echo ""
echo "Pages to update with translations:"
echo ""

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        add_translation_hook "$page"
    else
        echo "✗ File not found: $page"
    fi
done

echo ""
echo "============================================"
echo "Translation Keys Reference:"
echo ""
echo "Common translations:"
echo "  t('common.loading')"
echo "  t('common.error')"
echo "  t('common.success')"
echo "  t('common.save')"
echo "  t('common.cancel')"
echo "  t('common.submit')"
echo ""
echo "Navigation:"
echo "  t('navigation.dashboard')"
echo "  t('navigation.tools')"
echo "  t('navigation.markets')"
echo "  t('navigation.regulations')"
echo ""
echo "Tools:"
echo "  t('tools.costBreakdown')"
echo "  t('tools.routeAnalysis')"
echo "  t('tools.tariffAnalysis')"
echo ""
echo "To manually update a page:"
echo "1. Import: import { useMasterTranslation } from '@/utils/masterTranslation';"
echo "2. Use hook: const { t } = useMasterTranslation();"
echo "3. Replace text: 'Dashboard' → {t('navigation.dashboard')}"
echo ""
echo "============================================"
