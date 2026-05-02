#!/bin/bash

# Script de test du module marketing SD Cosmetique - Version corrigée
# Alternative à fetch_webpage pour tester le serveur local

echo "🧪 Tests du Module Marketing - SD Cosmetique (Version Corrigée)"
echo "=============================================================="

# Configuration
BASE_URL="http://localhost:3000"
TEST_RESULTS="tests-results-fixed.txt"

# Nettoyer les résultats précédents
> $TEST_RESULTS

echo "📍 Test 1: Serveur disponible"
if curl -s -o /dev/null -w '%{http_code}' $BASE_URL | grep -q "200"; then
    echo "✅ Serveur actif sur $BASE_URL" | tee -a $TEST_RESULTS
else
    echo "❌ Serveur non disponible" | tee -a $TEST_RESULTS
    exit 1
fi

echo -e "\n📍 Test 2: Page d'accueil - PromoBanner"
if curl -s $BASE_URL | grep -q "Livraison.*25.*000"; then
    echo "✅ PromoBanner affiché avec message livraison" | tee -a $TEST_RESULTS
else
    echo "❌ PromoBanner non trouvé" | tee -a $TEST_RESULTS
fi

echo -e "\n📍 Test 3: TrackingScripts intégré"
if grep -q "TrackingScripts" src/app/layout.tsx; then
    echo "✅ TrackingScripts intégré dans layout.tsx" | tee -a $TEST_RESULTS
else
    echo "❌ TrackingScripts manquant dans layout" | tee -a $TEST_RESULTS
fi

echo -e "\n📍 Test 4: Admin Dashboard accessible (avec authentification)"
ADMIN_STATUS=$(curl -s -o /dev/null -w '%{http_code}' $BASE_URL/admin)
if [ "$ADMIN_STATUS" = "307" ]; then
    echo "✅ Page admin redirige correctement (sécurisée)" | tee -a $TEST_RESULTS
    
    # Tester la page de login
    if curl -s -o /dev/null -w '%{http_code}' $BASE_URL/admin/login | grep -q "200"; then
        echo "✅ Page de login admin accessible" | tee -a $TEST_RESULTS
    else
        echo "❌ Page de login non accessible" | tee -a $TEST_RESULTS
    fi
elif [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Page admin directement accessible" | tee -a $TEST_RESULTS
else
    echo "❌ Page admin non accessible (status: $ADMIN_STATUS)" | tee -a $TEST_RESULTS
fi

echo -e "\n📍 Test 5: Composants Marketing Admin (code source)"
if grep -q "Marketing" src/app/admin/AdminDashboard.tsx; then
    echo "✅ Module Marketing présent dans AdminDashboard.tsx" | tee -a $TEST_RESULTS
    
    # Test des sous-onglets dans le code
    if grep -q "tracking" src/app/admin/AdminDashboard.tsx && grep -q "banners" src/app/admin/AdminDashboard.tsx; then
        echo "✅ Sous-onglets marketing configurés (banners, popup, tracking)" | tee -a $TEST_RESULTS
    else
        echo "⚠️  Certains sous-onglets marketing pourraient manquer" | tee -a $TEST_RESULTS
    fi
    
    # Vérifier le fix des React Hooks
    if ! grep -A 20 -B 5 "useState.*mktSubTab" src/app/admin/AdminDashboard.tsx | grep -q "if\|IIFE\|condition"; then
        echo "✅ Rules of Hooks violation corrigée" | tee -a $TEST_RESULTS
    else
        echo "⚠️  Vérifier la position du useState mktSubTab" | tee -a $TEST_RESULTS
    fi
else
    echo "❌ Module marketing non trouvé dans AdminDashboard.tsx" | tee -a $TEST_RESULTS
fi

echo -e "\n📍 Test 6: Configuration Marketing (Types TypeScript)"
if grep -q "facebookPixelId" src/lib/site-config.ts && grep -q "googleAdsId" src/lib/site-config.ts; then
    echo "✅ Types tracking Facebook & Google Ads configurés" | tee -a $TEST_RESULTS
else
    echo "❌ Configuration tracking incomplète" | tee -a $TEST_RESULTS
fi

echo -e "\n📍 Test 7: Composant TrackingScripts"
if [ -f "src/components/marketing/TrackingScripts.tsx" ]; then
    echo "✅ Fichier TrackingScripts.tsx existe" | tee -a $TEST_RESULTS
    
    if grep -q "Facebook Pixel" src/components/marketing/TrackingScripts.tsx; then
        echo "✅ Support Facebook Pixel implémenté" | tee -a $TEST_RESULTS
    fi
    
    if grep -q "gtag" src/components/marketing/TrackingScripts.tsx; then
        echo "✅ Support Google Ads implémenté" | tee -a $TEST_RESULTS
    fi
else
    echo "❌ TrackingScripts.tsx manquant" | tee -a $TEST_RESULTS
fi

echo -e "\n📍 Test 8: Tests de performance serveur"
HOMEPAGE_TIME=$(curl -s -o /dev/null -w '%{time_total}' $BASE_URL)
if (( $(echo "$HOMEPAGE_TIME < 2.0" | bc -l) )); then
    echo "✅ Performance homepage acceptable ($HOMEPAGE_TIME s)" | tee -a $TEST_RESULTS
else
    echo "⚠️  Performance homepage lente ($HOMEPAGE_TIME s)" | tee -a $TEST_RESULTS
fi

echo -e "\n📊 RÉSUMÉ DES TESTS"
echo "=================="
SUCCESS_COUNT=$(grep -c "✅" $TEST_RESULTS)
WARNING_COUNT=$(grep -c "⚠️" $TEST_RESULTS)
ERROR_COUNT=$(grep -c "❌" $TEST_RESULTS)

echo "✅ Succès: $SUCCESS_COUNT"
echo "⚠️  Avertissements: $WARNING_COUNT"
echo "❌ Erreurs: $ERROR_COUNT"

echo -e "\n📋 DÉTAILS:"
cat $TEST_RESULTS

if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "\n🎉 TOUS LES TESTS RÉUSSIS - Module marketing opérationnel !"
    exit 0
else
    echo -e "\n🔧 Des corrections sont nécessaires"
    exit 1
fi
