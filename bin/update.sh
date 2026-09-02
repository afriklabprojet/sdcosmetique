#!/usr/bin/env bash
# ==============================================================================
# SD Cosmétique - Unified Update Script
# Updates both the Laravel API (./api) and Next.js Storefront (./web)
# ==============================================================================

set -euo pipefail

# Determine script and root directory paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Configuration flags
SKIP_PULL=false
UPDATE_API=true
UPDATE_WEB=true
BUILD_WEB=true

# Helper logging functions
log_info() {
  echo -e "\033[1;34m==>\033[0m \033[1m$1\033[0m"
}

log_success() {
  echo -e "\033[1;32m✓\033[0m \033[1m$1\033[0m"
}

log_warn() {
  echo -e "\033[1;33m⚠\033[0m $1"
}

log_error() {
  echo -e "\033[1;31m✗\033[0m \033[1m$1\033[0m" >&2
}

show_help() {
  cat << EOF
Usage: $(basename "$0") [options]

Updates the SD Cosmétique monorepo (API and Web applications).

Options:
  --skip-pull, --no-pull   Skip git pull before updating
  --api-only, --skip-web   Update only the Laravel API (./api)
  --web-only, --skip-api   Update only the Next.js Web storefront (./web)
  --skip-build, --no-build Skip running 'pnpm build' in ./web
  -h, --help               Show this help message and exit

Examples:
  ./bin/update.sh                  # Full update (git pull + api + web)
  ./bin/update.sh --skip-pull      # Update dependencies and build without git pull
  ./bin/update.sh --api-only       # Update only the API
  ./bin/update.sh --web-only       # Update only the Web application
EOF
}

# Parse command line options
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-pull|--no-pull)
      SKIP_PULL=true
      shift
      ;;
    --api-only|--skip-web)
      UPDATE_WEB=false
      shift
      ;;
    --web-only|--skip-api)
      UPDATE_API=false
      shift
      ;;
    --skip-build|--no-build)
      BUILD_WEB=false
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

START_TIME=$(date +%s)

echo "=================================================="
echo "   SD Cosmétique — Monorepo Update"
echo "=================================================="
echo "Root directory: ${ROOT_DIR}"
echo ""

# ------------------------------------------------------------------------------
# 1. Git Pull (Optional)
# ------------------------------------------------------------------------------
if [ "${SKIP_PULL}" = false ]; then
  if git -C "${ROOT_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    log_info "Pulling latest git changes..."
    git -C "${ROOT_DIR}" pull
    log_success "Git repository up to date."
    echo ""
  else
    log_warn "Not a git repository or git unavailable. Skipping git pull."
    echo ""
  fi
fi

# ------------------------------------------------------------------------------
# 2. Update Laravel API (./api)
# ------------------------------------------------------------------------------
if [ "${UPDATE_API}" = true ]; then
  API_DIR="${ROOT_DIR}/api"
  if [ -d "${API_DIR}" ]; then
    log_info "Updating API (${API_DIR})..."

    if ! command -v composer >/dev/null 2>&1; then
      log_error "Composer is not installed or not in PATH."
      exit 1
    fi

    if ! command -v php >/dev/null 2>&1; then
      log_error "PHP is not installed or not in PATH."
      exit 1
    fi

    cd "${API_DIR}"

    # Install / update Composer packages
    log_info "Installing PHP dependencies (composer install)..."
    composer install --no-interaction --prefer-dist --optimize-autoloader

    # Ensure storage link is created
    log_info "Ensuring storage symlink..."
    php artisan storage:link --quiet || true

    # Run database migrations
    log_info "Running database migrations..."
    php artisan migrate --force

    # Clear and optimize Laravel caches
    log_info "Optimizing Laravel caches..."
    php artisan optimize:clear

    # If in production, warm up optimized caches
    APP_ENV=$(php -r "echo config('app.env', 'production');" 2>/dev/null || echo "local")
    if [ "${APP_ENV}" = "production" ]; then
      php artisan optimize
    fi

    # Restart background queue workers if any are running
    php artisan queue:restart || true

    log_success "API updated successfully."
    echo ""
  else
    log_warn "Directory ./api not found. Skipping API update."
    echo ""
  fi
fi

# ------------------------------------------------------------------------------
# 3. Update Next.js Web Storefront (./web)
# ------------------------------------------------------------------------------
if [ "${UPDATE_WEB}" = true ]; then
  WEB_DIR="${ROOT_DIR}/web"
  if [ -d "${WEB_DIR}" ]; then
    log_info "Updating Web storefront (${WEB_DIR})..."

    if ! command -v pnpm >/dev/null 2>&1; then
      log_error "pnpm is not installed or not in PATH."
      exit 1
    fi

    cd "${WEB_DIR}"

    # Install Node dependencies
    log_info "Installing Node dependencies (pnpm install)..."
    pnpm install

    # Build Next.js application
    if [ "${BUILD_WEB}" = true ]; then
      log_info "Building Next.js application (pnpm build)..."
      pnpm build
    else
      log_info "Skipping Next.js build (--skip-build requested)."
    fi

    # Reload PM2 application if PM2 is running and manages 'sd-cosmetique'
    if command -v pm2 >/dev/null 2>&1 && pm2 describe sd-cosmetique >/dev/null 2>&1; then
      log_info "Reloading PM2 process 'sd-cosmetique'..."
      pm2 reload sd-cosmetique
    fi

    log_success "Web storefront updated successfully."
    echo ""
  else
    log_warn "Directory ./web not found. Skipping Web update."
    echo ""
  fi
fi

# ------------------------------------------------------------------------------
# Completion
# ------------------------------------------------------------------------------
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "=================================================="
log_success "All updates completed successfully in ${DURATION}s!"
echo "=================================================="
