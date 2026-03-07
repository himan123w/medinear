#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║              MediNear - Production Build & Launch Script                   ║
# ║                   Runs backend and frontend together                        ║
# ╚════════════════════════════════════════════════════════════════════════════╝

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_DIR="$PROJECT_ROOT"
FRONTEND_DIR="$PROJECT_ROOT/medinear-frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
  echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║ $1${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
  echo -e "${GREEN}✓${NC} $1"
}

# Check environment files
check_env_files() {
  if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}✗${NC} Backend .env not found!"
    echo "  Run ./setup.sh first"
    exit 1
  fi
  print_step "Backend .env found"
}

# Main
print_header "🚀 MediNear - Starting Production Build"

check_env_files

print_header "Starting Backend Server"
cd "$BACKEND_DIR"
echo -e "${YELLOW}Backend listening on: http://localhost:5001${NC}"
node server.js &
BACKEND_PID=$!

sleep 2

print_header "Starting Frontend Development Server"
cd "$FRONTEND_DIR"
echo -e "${YELLOW}Frontend will open at: http://localhost:5173${NC}"
npm start &
FRONTEND_PID=$!

sleep 3

print_header "✨ MediNear is Running!"
echo -e "${GREEN}Both servers are now running in the background${NC}\n"
echo "  Frontend: ${BLUE}http://localhost:5173${NC}"
echo "  Backend API: ${BLUE}http://localhost:5001/api${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}\n"

# Cleanup on exit
cleanup() {
  print_step "Stopping servers..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
