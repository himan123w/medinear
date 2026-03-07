#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║                MediNear - Complete Project Launcher                        ║
# ║              Connect Frontend, Backend, and Launch Production              ║
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
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║ $1${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Check if .env exists
check_env() {
  if [ ! -f "$1/.env" ]; then
    print_warning "No .env file found in $1"
    print_step "Creating .env from .env.example..."
    cp "$1/.env.example" "$1/.env"
    print_warning "IMPORTANT: Update $1/.env with your actual credentials!"
  fi
}

# Main script
print_header "MediNear Project Setup & Launch"

# Check Node.js and npm
print_step "Checking Node.js and npm..."
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed"
  exit 1
fi
echo "  Node version: $(node --version)"
echo "  npm version: $(npm --version)"
print_step "Node.js and npm are installed"

# Setup Backend
print_header "Setting Up Backend"
cd "$BACKEND_DIR"

check_env "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
  print_step "Installing backend dependencies..."
  npm install
else
  print_step "Backend dependencies already installed"
fi

# Setup Frontend
print_header "Setting Up Frontend"
cd "$FRONTEND_DIR"

if [ ! -f ".env.local" ]; then
  print_warning "Creating .env.local for frontend..."
  cat > .env.local << EOF
VITE_API_URL=http://localhost:5001/api
EOF
  print_step ".env.local created"
fi

if [ ! -d "node_modules" ]; then
  print_step "Installing frontend dependencies..."
  npm install
else
  print_step "Frontend dependencies already installed"
fi

# Summary
print_header "✨ Setup Complete!"
echo -e "${GREEN}Your MediNear platform is ready to launch!${NC}\n"

echo "🚀 To start the project, run in separate terminals:\n"

echo -e "${YELLOW}Terminal 1 - Start Backend:${NC}"
echo "  cd $BACKEND_DIR"
echo "  npm run dev\n"

echo -e "${YELLOW}Terminal 2 - Start Frontend:${NC}"
echo "  cd $FRONTEND_DIR"
echo "  npm start\n"

echo -e "${BLUE}Frontend will open at:${NC} http://localhost:5173/"
echo -e "${BLUE}Backend API running at:${NC} http://localhost:5001/api\n"

echo -e "${YELLOW}⚠  Important:${NC}"
echo "  1. Update MONGO_URI in backend/.env with your MongoDB connection"
echo "  2. Change JWT_SECRET in backend/.env for production"
echo "  3. Test the connection by navigating to http://localhost:5173\n"

print_step "Setup script completed successfully!"
