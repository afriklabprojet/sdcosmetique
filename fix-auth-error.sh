#!/bin/bash

# Script de nettoyage pour résoudre l'erreur "Invalid Refresh Token"

echo "🔄 Nettoyage des sessions Supabase corrompues..."

# 1. Arrêter le serveur de dev s'il tourne
echo "📌 Arrêt du serveur Next.js..."
pkill -f "next dev" 2>/dev/null || true

# 2. Nettoyer le cache Next.js
echo "🧹 Nettoyage du cache Next.js..."
rm -rf .next/
rm -rf node_modules/.cache/

# 3. Nettoyer les données de session du navigateur
echo "💾 Instructions pour nettoyer le navigateur:"
echo "   → Ouvrez les DevTools (F12)"
echo "   → Allez dans l'onglet Application/Storage"
echo "   → Supprimez tout dans localStorage et sessionStorage"
echo "   → Ou utilisez: localStorage.clear(); sessionStorage.clear();"

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "🔧 Prochaines étapes:"
echo "   1. Récupérez la vraie clé ANON depuis Supabase Dashboard"
echo "   2. Remplacez NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
echo "   3. Relancez: npm run dev"
echo ""
echo "📍 Dashboard Supabase: https://supabase.com/dashboard"