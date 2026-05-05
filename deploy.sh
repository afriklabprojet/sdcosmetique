#!/bin/bash
# Deploy script - Hostinger Node.js (Passenger)
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

# 2. Git pull sur le serveur
echo "🔄 Git pull serveur..."
ssh -p $PORT $SERVER "cd $REMOTE_PATH && git pull origin main"

# 3. Build local
echo "🔨 Build local..."
npm run build

# 4. Rsync .next/
echo "📤 Rsync .next/..."
rsync -avz --delete \
  --exclude='.next/cache' \
  -e "ssh -p $PORT" \
  .next/ \
  $SERVER:$REMOTE_PATH/.next/

# 5. Restart Passenger
echo "♻️  Restart Passenger..."
ssh -p $PORT $SERVER "touch $REMOTE_PATH/tmp/restart.txt"

echo "✅ Déploiement terminé !"
