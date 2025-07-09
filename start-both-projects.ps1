# 面接ボットとLPを両方起動するスクリプト

Write-Host "=== 面接ボットとLPを起動します ===" -ForegroundColor Green

# Terminal 1: 面接ボット (ポート3000)
Write-Host "`n1. 面接ボットを起動中... (http://localhost:3000)" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\waraj\Downloads\ai-interview-bot-cursor'; npm run dev"

# 少し待つ
Start-Sleep -Seconds 5

# Terminal 2: LP (ポート3001)
Write-Host "2. LPを起動中... (http://localhost:3001)" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\waraj\Downloads\ai-interview-lp'; npm run dev -- --port 3001"

# 少し待つ
Start-Sleep -Seconds 10

# ブラウザで開く
Write-Host "`n3. ブラウザで開きます..." -ForegroundColor Green
Start-Process "http://localhost:3000"  # 面接ボット
Start-Sleep -Seconds 2
Start-Process "http://localhost:3001"  # LP

Write-Host "`n✅ 完了！" -ForegroundColor Green
Write-Host "- 面接ボット: http://localhost:3000" -ForegroundColor Cyan
Write-Host "- LP: http://localhost:3001" -ForegroundColor Cyan