#!/bin/bash
# Deploy script - Hostinger Node.js (pm2)
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

# 2. Git pull sur le serveur (optionnel - le déploiement se fait via rsync)
echo "🔄 Git pull serveur (optionnel)..."
ssh -p $PORT $SERVER "cd $REMOTE_PATH && git pull origin main" 2>/dev/null || echo "(pas de git sur le serveur - OK, déploiement via rsync)"

# 3. Build local
echo "🔨 Build local..."
npm run build

# 4. Rsync .next/ et server.js
echo "📤 Rsync .next/..."
rsync -avz --delete \
  --exclude='.next/cache' \
  -e "ssh -p $PORT" \
  .next/ \
  $SERVER:$REMOTE_PATH/.next/

echo "📤 Rsync server.js..."
rsync -avz -e "ssh -p $PORT" server.js $SERVER:$REMOTE_PATH/server.js

# 5. Restart pm2
echo "♻️  Restart pm2..."
ssh -p $PORT $SERVER "pm2 restart all || pm2 start $REMOTE_PATH/server.js --name sd-cosmetique"

echo "✅ Déploiement terminé !"
