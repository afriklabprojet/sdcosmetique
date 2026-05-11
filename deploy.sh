#!/bin/bash
# Deploy script - Hostinger Node.js (LiteSpeed) — standalone mode
# Usage: ./deploy.sh "message de commit"

set -e

SERVER="u799662826@82.29.186.206"
PORT="65002"
REMOTE_PATH="~/domains/sdcosmetique.ci/nodejs"

MSG="${1:-update}"

echo "🚀 Déploiement en cours..."

# 1. Build local EN PREMIER (avant le push git pour éviter que le CI Hostinger
#    ne déploie ses fichiers PENDANT notre rsync)
echo "🔨 Build local..."
npm run build

# 2. Push git
echo "📦 Push git..."
git add .
git commit -m "$MSG" 2>/dev/null || echo "(rien à committer)"
git push origin main

# 3. Attendre que le CI Hostinger termine son build (~60s)
#    Le CI tire depuis git, build en ~60s et déploie dans nodejs/
#    SANS redémarrer les processus — on doit attendre qu'il finisse
#    avant de faire notre rsync+pkill pour éviter le mismatch manifestes/fichiers
echo "⏳ Attente fin du CI Hostinger (~90s)..."
sleep 90

# 4. Déploiement standalone (bundle autonome avec son node_modules)
# .next/standalone/ contient : server.js + node_modules + .next/
# .next/static/ et public/ ne sont PAS inclus dans standalone — on les sync séparément
echo "📤 Rsync standalone (app + node_modules)..."
rsync -az --checksum --delete \
  --exclude='.next/cache' \
  --exclude='.next/static' \
  -e "ssh -p $PORT" \
  .next/standalone/ \
  $SERVER:$REMOTE_PATH/

echo "📤 Rsync public/..."
rsync -az --delete \
  -e "ssh -p $PORT" \
  public/ \
  $SERVER:$REMOTE_PATH/public/

echo "📤 Rsync .next/static/..."
dirs=$(find .next/static -type d | sed "s|^|$REMOTE_PATH/|" | tr '\n' ' ')
ssh -p $PORT $SERVER "mkdir -p $dirs" 2>/dev/null || true
rsync -az --checksum --delete \
  -e "ssh -p $PORT" \
  .next/static/ \
  $SERVER:$REMOTE_PATH/.next/static/

# 5. Copier notre server.js custom (support LSNODE_SOCKET LiteSpeed)
#    Remplace le server.js auto-généré par standalone qui ne gère pas les Unix sockets
echo "📋 Copie server.js custom (LiteSpeed socket support)..."
scp -P $PORT server.js $SERVER:$REMOTE_PATH/server.js

# 5b. Copier .env.production (clé encryption Server Actions, etc.)
echo "📋 Copie .env.production..."
scp -P $PORT .env.production $SERVER:$REMOTE_PATH/.env.production

# 6. Tuer les anciens processus — LiteSpeed en relancera automatiquement de nouveaux
echo "♻️  Restart Node.js (kill + LiteSpeed auto-restart)..."
ssh -p $PORT $SERVER "pkill -9 -f 'next-server' 2>/dev/null; pkill -9 -f 'server\.js' 2>/dev/null; pkill -f 'lsnode' 2>/dev/null; true" 2>/dev/null || true

# 7. Vérifier que le site répond
echo "🔍 Vérification du site (attente démarrage ~15s)..."
sleep 15
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sdcosmetique.ci/ 2>/dev/null)
if [ "$STATUS" = "200" ]; then
  echo "✅ Déploiement réussi ! Site opérationnel (HTTP $STATUS)"
else
  echo "⚠️  Site répond HTTP $STATUS — vérifiez https://sdcosmetique.ci/"
  echo "   Si 500 persiste : ssh -p $PORT $SERVER 'pkill -9 -f next-server; pkill -9 -f server\\.js'"
fi
