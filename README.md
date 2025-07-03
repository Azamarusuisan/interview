# AI面接対策ボット - Cursor開発環境セットアップ

## 📋 プロジェクト概要

日本人新卒就活生向けのLLM搭載型ケース面接・人物面接対策ウェブアプリです。

## 🚀 Cursorでの開発セットアップ

### 1. 必要な環境
- Node.js 18以上
- Python 3.8以上
- OpenAI APIキー

### 2. プロジェクト構成
```
ai-interview-bot/
├── frontend/          # React フロントエンド
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Flask バックエンド
│   ├── src/
│   ├── requirements.txt
│   └── .env.example
├── README.md
└── setup.sh          # 自動セットアップスクリプト
```

### 3. クイックスタート

#### 自動セットアップ（推奨）
```bash
# プロジェクトをクローン/ダウンロード後
chmod +x setup.sh
./setup.sh
```

#### 手動セットアップ

**フロントエンド**
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173 でアクセス
```

**バックエンド**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# .envファイルを作成
cp .env.example .env
# .envファイルにOpenAI APIキーを設定

python src/main.py
# http://localhost:5000 でAPIサーバー起動
```

### 4. OpenAI APIキー設定

1. OpenAIアカウントでAPIキーを取得
2. `backend/.env`ファイルを作成
3. 以下を記入：
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. 開発時のポイント

#### Cursorでの推奨設定
- **拡張機能**: ES7+ React/Redux/React-Native snippets, Python, Prettier
- **設定**: Auto Save有効、Format on Save有効

#### 開発フロー
1. バックエンドを先に起動（Port 5000）
2. フロントエンドを起動（Port 5173）
3. ブラウザで http://localhost:5173 にアクセス

#### デバッグ
- フロントエンド: ブラウザの開発者ツール
- バックエンド: Flaskのデバッグモード有効

### 6. 主要機能

✅ **企業別面接対策**: 企業情報に基づくカスタマイズ
✅ **音声面接**: Web Speech APIによる音声認識・合成
✅ **AI面接官**: GPT-4による質問生成と評価
✅ **詳細フィードバック**: 4軸評価とアドバイス
✅ **レスポンシブUI**: デスクトップ・モバイル対応

### 7. APIコスト目安

- **1セッション**: 約$0.18（GPT-4使用時）
- **月100セッション**: 約$18
- **コスト削減**: GPT-3.5-turboに変更で約1/10

### 8. カスタマイズポイント

#### フロントエンド
- `src/App.jsx`: メインアプリケーション
- `src/App.css`: スタイル設定
- Tailwind CSS + shadcn/ui使用

#### バックエンド
- `src/routes/interview.py`: 面接ロジック
- `src/main.py`: Flaskアプリ設定
- プロンプト調整で面接内容カスタマイズ可能

### 9. トラブルシューティング

#### よくある問題
1. **音声認識が動作しない**
   - Chrome/Edge/Safariを使用
   - HTTPSまたはlocalhostでアクセス

2. **API接続エラー**
   - OpenAI APIキーが正しく設定されているか確認
   - バックエンドが起動しているか確認

3. **CORS エラー**
   - バックエンドのCORS設定を確認
   - フロントエンドのAPI URLを確認

### 10. 本番デプロイ

#### フロントエンド
```bash
cd frontend
npm run build
# dist/フォルダをホスティングサービスにアップロード
```

#### バックエンド
- Heroku、Railway、Renderなどのサービス利用推奨
- 環境変数でOpenAI APIキーを設定

---

## 📞 サポート

開発中に問題が発生した場合は、以下を確認してください：
1. Node.js、Pythonのバージョン
2. 依存関係のインストール状況
3. APIキーの設定
4. ポートの競合

Happy Coding! 🎉

