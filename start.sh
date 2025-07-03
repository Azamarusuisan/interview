#!/bin/bash

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if Next.js is installed
if [ ! -f "node_modules/next/package.json" ]; then
    echo "Next.js not found. Installing..."
    npm install next react react-dom
fi

# Start development server
echo "Starting development server..."
npx next dev