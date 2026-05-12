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

# 6. Vider le fetch-cache (unstable_cache) pour éviter les SyntaxError si rsync a tronqué des fichiers
#    Le cache sera re-peuplé à la première requête (60s revalidate)
echo "🗑️  Vidage fetch-cache (prévention corruption JSON)..."
ssh -p $PORT $SERVER "rm -rf ~/domains/sdcosmetique.ci/nodejs/.next/cache/fetch-cache ~/domains/sdcosmetique.ci/nodejs/.next/cache/images 2>/dev/null; true" 2>/dev/null || true

# 6b. Tuer les anciens processus — LiteSpeed en relancera automatiquement de nouveaux
echo "♻️  Restart Node.js (kill + LiteSpeed auto-restart)..."
ssh -p $PORT $SERVER "pkill -9 -f 'next-server' 2>/dev/null; pkill -9 -f 'server\.js' 2>/dev/null; pkill -f 'lsnode' 2>/dev/null; true" 2>/dev/null || true

# 6b. 2ème rsync static APRÈS restart — écrase ce que le CI Hostinger aurait pu déployer
#     Le CI tourne en parallèle et peut overwrite nos fichiers pendant le sleep
#     Cette passe finale garantit que nos fichiers locaux gagnent
echo "🔁 Rsync final .next/static/ (override CI)..."
rsync -az --checksum --delete \
  -e "ssh -p $PORT" \
  .next/static/ \
  $SERVER:$REMOTE_PATH/.next/static/

# 6c. Rsync standalone une 2ème fois pour aligner build-manifest avec les static
echo "🔁 Rsync final standalone (build-manifest)..."
rsync -az --checksum --delete \
  --exclude='.next/cache' \
  --exclude='.next/static' \
  -e "ssh -p $PORT" \
  .next/standalone/ \
  $SERVER:$REMOTE_PATH/

# 6d. Garantir que le preload-timestamp.js garde le bloc de chargement des env JEKO
#     (protection contre tout écrasement accidentel par le CI Hostinger)
echo "🔐 Vérification preload env vars (JEKO)..."
ssh -p $PORT $SERVER 'PRELOAD="/home/u799662826/domains/sdcosmetique.ci/public_html/.builds/config/preload-timestamp.js"; if ! grep -q "JEKO_API_KEY" "$PRELOAD" 2>/dev/null; then cat >> "$PRELOAD" << '"'"'ENVBLOCK'"'"'
// Load missing env vars from .env file
(function() {
  const fs = require("fs");
  const envPath = "/home/u799662826/domains/sdcosmetique.ci/public_html/.builds/config/.env";
  try {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) { process.env[m[1]] = m[2].replace(/^'"'"'|'"'"'$/g, "").replace(/^"|"$/g, ""); }
    }
  } catch(e) {}
})();
ENVBLOCK
echo "✅ Preload env block re-ajouté"; else echo "✅ Preload env block OK (déjà présent)"; fi'

# 6d. Restart final après les overrides
echo "♻️  Restart final..."
ssh -p $PORT $SERVER "pkill -9 -f 'next-server' 2>/dev/null; pkill -9 -f 'server\.js' 2>/dev/null; true" 2>/dev/null || true

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
