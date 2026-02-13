#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# fresh-clone.sh — Full "fresh developer" verification pipeline
#
# Simulates a developer who just cloned the repo from GitHub.
# Runs: install → build → typecheck → unit tests → E2E tests
#
# Usage:
#   bash scripts/verify/fresh-clone.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

phase() {
  echo ""
  echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}  Phase $1: $2${NC}"
  echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
  echo ""
}

success() {
  echo -e "${GREEN}  ✓ $1${NC}"
}

fail() {
  echo -e "${RED}  ✗ $1${NC}"
  exit 1
}

# Ensure we're in the repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

echo -e "${YELLOW}PartyLayer Wallet SDK — Fresh Clone Verification${NC}"
echo "Repository: $REPO_ROOT"
echo ""

# ─── Phase 0: Install ────────────────────────────────────────────────────────
phase 0 "Install Dependencies"

if pnpm install --frozen-lockfile; then
  success "pnpm install completed"
else
  fail "pnpm install failed"
fi

# ─── Phase 1: Build ──────────────────────────────────────────────────────────
phase 1 "Build All Packages"

if pnpm build; then
  success "pnpm build completed"
else
  fail "pnpm build failed"
fi

# ─── Phase 2: Type Check ─────────────────────────────────────────────────────
phase 2 "TypeScript Type Checking"

if pnpm typecheck; then
  success "pnpm typecheck completed"
else
  fail "pnpm typecheck failed"
fi

# ─── Phase 3: Unit Tests ─────────────────────────────────────────────────────
phase 3 "Unit Tests (Vitest)"

if pnpm test; then
  success "pnpm test completed"
else
  fail "pnpm test failed"
fi

# ─── Phase 4: E2E Tests ──────────────────────────────────────────────────────
phase 4 "E2E Tests (Playwright)"

cd apps/demo

# Install Playwright browsers if needed
npx playwright install --with-deps chromium 2>/dev/null || true

if pnpm test:e2e; then
  success "E2E tests completed"
else
  fail "E2E tests failed"
fi

cd "$REPO_ROOT"

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ALL PHASES PASSED${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Install ............. ✓"
echo "  Build ............... ✓"
echo "  Type Check .......... ✓"
echo "  Unit Tests .......... ✓"
echo "  E2E Tests ........... ✓"
echo ""
echo -e "${GREEN}  The SDK is ready for production use.${NC}"
echo ""
