# AI Interview Bot - Background Start Script for PowerShell
Write-Host "AI Interview Bot - Starting server in background..." -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Get current directory
$currentDir = Get-Location

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found!" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Kill any existing Next.js processes on port 3000
Write-Host "Checking for existing processes on port 3000..." -ForegroundColor Yellow
$tcpConnections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($tcpConnections) {
    $tcpConnections | ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Stopping process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force
        }
    }
    Start-Sleep -Seconds 2
}

# Set port
$port = 3000
if ($args[0]) {
    $port = $args[0]
}

# Create log file path
$logFile = Join-Path $currentDir "server.log"

# Start the server in background
Write-Host "`nStarting server in background on port $port..." -ForegroundColor Green

$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = "powershell.exe"
$startInfo.Arguments = "-NoProfile -Command `"Set-Location '$currentDir'; `$env:PORT=$port; npm run dev 2>&1 | Tee-Object -FilePath '$logFile'`""
$startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$startInfo.CreateNoWindow = $true
$startInfo.UseShellExecute = $false

$process = [System.Diagnostics.Process]::Start($startInfo)

Write-Host "Server process started with PID: $($process.Id)" -ForegroundColor Green
Write-Host "Log file: $logFile" -ForegroundColor Cyan

# Wait a moment for server to start
Write-Host "`nWaiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -ErrorAction Stop
    Write-Host "`nServer is running at http://localhost:$port" -ForegroundColor Green
} catch {
    Write-Host "`nServer might still be starting. Check the log file for details." -ForegroundColor Yellow
    Write-Host "Log file: $logFile" -ForegroundColor Cyan
}

Write-Host "`nTo stop the server, use Task Manager or run:" -ForegroundColor Yellow
Write-Host "Get-Process | Where-Object {`$_.Id -eq $($process.Id)} | Stop-Process" -ForegroundColor White