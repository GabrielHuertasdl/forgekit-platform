#!/usr/bin/env bash
set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

info()  { echo -e "${BLUE}▶${RESET} $*"; }
ok()    { echo -e "${GREEN}✓${RESET} $*"; }
warn()  { echo -e "${YELLOW}!${RESET} $*"; }
die()   { echo -e "${RED}✗${RESET} $*" >&2; exit 1; }

# ── 1. Move to project root ───────────────────────────────────────────────────
cd "$(dirname "$0")"

# ── 2. Create .env if missing ─────────────────────────────────────────────────
if [[ ! -f .env ]]; then
  info "Creating .env from .env.example …"
  cp .env.example .env

  # Auto-generate AUTH_SECRET
  SECRET=$(openssl rand -base64 32)
  sed -i "s|your-32-char-min-secret-here|${SECRET}|" .env
  ok "AUTH_SECRET generated and written to .env"
else
  ok ".env already exists — skipping generation"
fi

# ── 3. Validate DATABASE_URL ──────────────────────────────────────────────────
DB_URL=$(grep -E '^DATABASE_URL=' .env | cut -d= -f2- | tr -d '"')

if [[ -z "$DB_URL" || "$DB_URL" == "postgresql://user:password@localhost:5432/forgekit" ]]; then
  echo ""
  warn "DATABASE_URL is not set."
  echo ""
  echo "  Options (pick one):"
  echo ""
  echo "  A) Neon (free, no install needed)"
  echo "     1. Go to https://neon.tech → create project"
  echo "     2. Copy the connection string (starts with postgresql://)"
  echo "     3. Paste it below"
  echo ""
  echo "  B) Docker (local)"
  echo "     docker run -d --name forgekit-db -e POSTGRES_PASSWORD=secret \\"
  echo "       -e POSTGRES_DB=forgekit -p 5432:5432 postgres:16"
  echo "     → DATABASE_URL=postgresql://postgres:secret@localhost:5432/forgekit"
  echo ""
  read -rp "Paste your DATABASE_URL: " DB_INPUT
  [[ -z "$DB_INPUT" ]] && die "DATABASE_URL required."

  # Write it to .env (replace existing line or append)
  if grep -qE '^DATABASE_URL=' .env; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DB_INPUT}\"|" .env
  else
    echo "DATABASE_URL=\"${DB_INPUT}\"" >> .env
  fi
  ok "DATABASE_URL saved to .env"
fi

# ── 4. Install dependencies ───────────────────────────────────────────────────
info "Installing dependencies …"
npm install --silent
ok "Dependencies installed"

# ── 5. Push schema to database ───────────────────────────────────────────────
info "Pushing schema to database …"
npm run db:push -- --force 2>&1 || die "db:push failed. Check DATABASE_URL in .env."
ok "Schema pushed"

# ── 6. Seed dev data (optional) ───────────────────────────────────────────────
read -rp "Seed dev data? Creates dev@forgekit.local with 500 credits [y/N]: " SEED_INPUT
if [[ "${SEED_INPUT:-n}" =~ ^[Yy]$ ]]; then
  info "Seeding …"
  npm run db:seed
  ok "Seeded: dev@forgekit.local / 500 credits"
fi

# ── 7. Start dev server ───────────────────────────────────────────────────────
echo ""
ok "All good. Starting dev server at http://localhost:3000"
echo ""
npm run dev
