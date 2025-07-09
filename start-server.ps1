# AI Interview Bot - PowerShell Start Script
Write-Host "AI Interview Bot - Starting server..." -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed!" -ForegroundColor Red
    exit 1
}

# Get current directory
$currentDir = Get-Location

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found in current directory!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Warning: .env.local not found!" -ForegroundColor Yellow
    Write-Host "Please create .env.local file with your OPENAI_API_KEY" -ForegroundColor Yellow
}

# Check if database exists and run migrations
Write-Host "Checking database..." -ForegroundColor Yellow
if (-not (Test-Path "prisma/dev.db")) {
    Write-Host "Database not found. Creating database and running migrations..." -ForegroundColor Yellow
    npx prisma db push
} else {
    Write-Host "Database found. Checking for pending migrations..." -ForegroundColor Yellow
    npx prisma db push
}

# Kill any existing Next.js processes
Write-Host "Checking for existing processes..." -ForegroundColor Yellow
$nextProcesses = Get-Process | Where-Object { $_.ProcessName -match "node" }
if ($nextProcesses) {
    Write-Host "Stopping existing Node.js processes..." -ForegroundColor Yellow
    $nextProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Set port (default 3001)
$port = 3001
if ($args[0]) {
    $port = $args[0]
}

# Start the server
Write-Host "`nStarting server on port $port..." -ForegroundColor Green
Write-Host "Server will be available at http://localhost:$port" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Yellow

# Set environment variable and start
$env:PORT = $port
npm run dev