# AI Interview Bot - Server Status Check Script
Write-Host "AI Interview Bot - Checking server status..." -ForegroundColor Cyan

# Default port
$port = 3000
if ($args[0]) {
    $port = $args[0]
}

Write-Host "`nChecking port $port..." -ForegroundColor Yellow

# Check if port is in use
$tcpConnection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($tcpConnection) {
    $process = Get-Process -Id $tcpConnection[0].OwningProcess -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "`nServer is running!" -ForegroundColor Green
        Write-Host "Process: $($process.ProcessName)" -ForegroundColor White
        Write-Host "PID: $($process.Id)" -ForegroundColor White
        Write-Host "CPU: $([math]::Round($process.CPU, 2))s" -ForegroundColor White
        Write-Host "Memory: $([math]::Round($process.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor White
        
        # Try to access the server
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
            Write-Host "`nServer is responding at: http://localhost:$port" -ForegroundColor Green
            Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
        } catch {
            Write-Host "`nServer process is running but not responding to HTTP requests." -ForegroundColor Yellow
            Write-Host "It might still be starting up." -ForegroundColor Yellow
        }
        
        # Check log file if exists
        $logFile = Join-Path (Get-Location) "server.log"
        if (Test-Path $logFile) {
            Write-Host "`nLast 5 lines from server.log:" -ForegroundColor Cyan
            Get-Content $logFile -Tail 5 | ForEach-Object {
                Write-Host $_ -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "`nNo server found on port $port" -ForegroundColor Red
    Write-Host "Run ./start-server.ps1 to start the server" -ForegroundColor Yellow
}

# Show all Node.js processes
Write-Host "`n--- All Node.js processes ---" -ForegroundColor Cyan
$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -match "node" }
if ($nodeProcesses) {
    $nodeProcesses | Format-Table Id, ProcessName, CPU, @{Label="Memory(MB)";Expression={[math]::Round($_.WorkingSet64 / 1MB, 2)}} -AutoSize
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Gray
}