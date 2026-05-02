#!/bin/bash

# Script de test du module marketing SD Cosmetique
# Alternative à fetch_webpage pour tester le serveur local

echo "🧪 Tests du Module Marketing - SD Cosmetique"
echo "================================================"

# Configuration
BASE_URL="http://localhost:3000"
TEST_RESULTS="tests-results.txt"

# Nettoyer les résultats précédents
> $TEST_RESULTS

echo "📍 Test 1: Serveur disponible"
if curl -s -o /dev/null -w '%{http_code}' $BASE_URL | grep -q "200"; then
    echo "✅ Serveur actif sur $BASE_URL" | tee -a $TEST_RESULTS
else
    echo "❌ Serveur non disponible" | tee -a $TEST_RESULTS
    exit 1
fi

echo "\n📍 Test 2: Page d'accueil - PromoBanner"
if curl -s $BASE_URL | grep -q "Livraison.*25.*000"; then
    echo "✅ PromoBanner affiché avec message livraison" | tee -a $TEST_RESULTS
else
    echo "❌ PromoBanner non trouvé" | tee -a $TEST_RESULTS
fi

echo "\n📍 Test 3: TrackingScripts intégré"
if grep -q "TrackingScripts" src/app/layout.tsx; then
    echo "✅ TrackingScripts intégré dans layout.tsx" | tee -a $TEST_RESULTS
else
    echo "❌ TrackingScripts manquant dans layout" | tee -a $TEST_RESULTS
fi

echo "\n📍 Test 4: Admin Dashboard accessible"
if curl -s -o /dev/null -w '%{http_code}' $BASE_URL/admin | grep -q "200"; then
    echo "✅ Page admin accessible" | tee -a $TEST_RESULTS
else
    echo "❌ Page admin non accessible" | tee -a $TEST_RESULTS
fi

echo "\n📍 Test 5: Contenu Marketing Admin"
ADMIN_CONTENT=$(curl -s $BASE_URL/admin)
if echo "$ADMIN_CONTENT" | grep -q "Marketing" && echo "$ADMIN_CONTENT" | grep -q "tracking"; then
    echo "✅ Module marketing détecté dans l'admin" | tee -a $TEST_RESULTS
    
    # Test des sous-onglets
    if echo "$ADMIN_CONTENT" | grep -q "banners" && echo "$ADMIN_CONTENT" | grep -q "popup"; then
        echo "✅ Sous-onglets marketing présents (banners, popup, tracking)" | tee -a $TEST_RESULTS
    else
        echo "⚠️  Certains sous-onglets marketing manquants" | tee -a $TEST_RESULTS
    fi
else
    echo "❌ Module marketing non trouvé dans l'admin" | tee -a $TEST_RESULTS
fi

echo "\n📍 Test 6: Configuration Marketing (Types TypeScript)"
if grep -q "facebookPixelId" src/lib/site-config.ts && grep -q "googleAdsId" src/lib/site-config.ts; then
    echo "✅ Types tracking Facebook & Google Ads configurés" | tee -a $TEST_RESULTS
else
    echo "❌ Configuration tracking incomplète" | tee -a $TEST_RESULTS
fi

echo "\n📍 Test 7: Composant TrackingScripts"
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

echo "\n📊 RÉSUMÉ DES TESTS"
echo "=================="
SUCCESS_COUNT=$(grep -c "✅" $TEST_RESULTS)
WARNING_COUNT=$(grep -c "⚠️" $TEST_RESULTS)
ERROR_COUNT=$(grep -c "❌" $TEST_RESULTS)

echo "✅ Succès: $SUCCESS_COUNT"
echo "⚠️  Avertissements: $WARNING_COUNT"
echo "❌ Erreurs: $ERROR_COUNT"

echo "\n📋 DÉTAILS:"
cat $TEST_RESULTS

if [ $ERROR_COUNT -eq 0 ]; then
    echo "\n🎉 TOUS LES TESTS RÉUSSIS - Module marketing opérationnel !"
    exit 0
else
    echo "\n🔧 Des corrections sont nécessaires"
    exit 1
fi