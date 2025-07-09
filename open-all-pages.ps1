# 面接ボットの全ページを開く

# メインページ（ダッシュボード）
Start-Process "http://localhost:3001"

# 少し待つ
Start-Sleep -Seconds 2

# ケース面接
Start-Process "http://localhost:3001/case"

# 人物面接
Start-Process "http://localhost:3001/general"

# 履歴ページ
Start-Process "http://localhost:3001/history"

# ESページ
Start-Process "http://localhost:3001/es"

# ログインページ
Start-Process "http://localhost:3001/login"