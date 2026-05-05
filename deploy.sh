#!/bin/bash
# Deploy script - Hostinger Node.js (LiteSpeed) — standalone mode
# Usage: ./deploy.sh "message de commit"

set -e

SERVER="u799662826@82.29.186.206"
PORT="65002"
REMOTE_PATH="~/domains/floralwhite-fish-697630.hostingersite.com/nodejs"

MSG="${1:-update}"

echo "🚀 Déploiement en cours..."

# 1. Push git
echo "📦 Push git..."
git add .
git commit -m "$MSG" 2>/dev/null || echo "(rien à committer)"
git push origin main

# 2. Build local
echo "🔨 Build local..."
npm run build

# 3. Déploiement standalone (bundle autonome avec son node_modules)
# .next/standalone/ contient : server.js + node_modules + .next/
# .next/static/ et public/ ne sont PAS inclus dans standalone — on les sync séparément
echo "📤 Rsync standalone (app + node_modules)..."
rsync -az --delete \
  --exclude='.next/cache' \
  -e "ssh -p $PORT" \
  .next/standalone/ \
  $SERVER:$REMOTE_PATH/

echo "📤 Rsync public/..."
rsync -az --delete \
  -e "ssh -p $PORT" \
  public/ \
  $SERVER:$REMOTE_PATH/public/

echo "📤 Rsync .next/static/..."
rsync -az --delete \
  -e "ssh -p $PORT" \
  .next/static/ \
  $SERVER:$REMOTE_PATH/.next/static/

# 4. Copier notre server.js custom (support LSNODE_SOCKET LiteSpeed)
#    Remplace le server.js auto-généré par standalone qui ne gère pas les Unix sockets
echo "📋 Copie server.js custom (LiteSpeed socket support)..."
scp -P $PORT server.js $SERVER:$REMOTE_PATH/server.js

# 5. Tuer les anciens processus — LiteSpeed en relancera automatiquement de nouveaux
echo "♻️  Restart Node.js (kill + LiteSpeed auto-restart)..."
ssh -p $PORT $SERVER "pkill -f 'next-server' 2>/dev/null; echo 'Anciens processus arrêtés'" || true

echo "✅ Déploiement terminé ! (LiteSpeed démarrera le nouveau server.js au prochain hit)"
