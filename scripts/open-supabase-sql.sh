#!/bin/bash

echo "🗄️  Configuration Base de Données - Action manuelle"
echo "================================================="
echo ""
echo "✅ 1. Ouverture du dashboard Supabase..."

# Ouvrir le dashboard Supabase
open "https://supabase.com/dashboard/project/spcguwuqqwvjfnfctrzs/sql/new"

echo "✅ 2. SQL Editor ouvert dans votre navigateur"
echo ""
echo "📋 ÉTAPES SUIVANTES :"
echo "   3. Copier le contenu ci-dessous :"
echo "   4. Coller dans l'éditeur SQL"
echo "   5. Cliquer sur 'RUN'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SQL À COPIER-COLLER :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat docs/supabase-schema.sql
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏱️  Une fois terminé, tapez : node scripts/test-supabase.js"
echo "   pour vérifier que tout fonctionne !"