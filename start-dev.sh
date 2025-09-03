#!/bin/bash

# Development Startup Script
# Starts both frontend and backend servers for local development

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Greenify Development Servers${NC}"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if both package.json files exist
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Missing package.json files. Please run from project root.${NC}"
    exit 1
fi

# Function to check if dependencies are installed
check_dependencies() {
    if [ ! -d "$1/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing $1 dependencies...${NC}"
        cd $1
        npm install
        cd ..
    fi
}

# Install dependencies if needed
echo -e "${BLUE}🔍 Checking dependencies...${NC}"
check_dependencies "backend"
check_dependencies "frontend"

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found. Copying from .env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}📝 Please edit backend/.env with your configuration.${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env file not found. Copying from .env.example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${YELLOW}📝 Please edit frontend/.env with your configuration.${NC}"
fi

echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""

# Start backend server
echo -e "${BLUE}🖥️  Starting Backend Server (Port 5000)...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server  
echo -e "${BLUE}🌐 Starting Frontend Server (Port 5173)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}🎉 Servers started successfully!${NC}"
echo "==========================================="
echo -e "${BLUE}📍 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}📍 Backend:${NC}  http://localhost:5000"
echo -e "${BLUE}📍 API Docs:${NC} http://localhost:5000/api"
echo ""
echo -e "${YELLOW}🛑 Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped.${NC}"
    exit 0
}

# Handle Ctrl+C
trap cleanup INT

# Wait for both processes
wait
