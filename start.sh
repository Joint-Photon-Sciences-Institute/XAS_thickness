#!/bin/bash
# Start script for XAS Thickness Calculator

echo "🚀 Starting XAS Thickness Calculator..."
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if xraylib is installed
echo "📦 Checking Python dependencies..."
if ! python -c "import xraylib" &> /dev/null; then
    echo "⚠️  xraylib is not installed. Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

echo ""
echo "✅ All dependencies are installed!"
echo ""
echo "🌐 Starting servers..."
echo "   - API server will run on: http://localhost:5001"
echo "   - Web app will run on:    http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run start