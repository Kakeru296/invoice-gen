# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## プロジェクト概要

- **プロダクト名**: Smart Notify（仮）
- **一言説明**: monday.com のボード変更を Slack / Teams / メールにリアルタイム通知するアプリ
- **ターゲット市場**: monday.com マーチャント（245,000社以上、Enterprise 90% がアプリ利用）
- **Marketplace**: monday.com App Marketplace
- **本番URL**: [デプロイ後に記入]

---

## 技術スタック

```
フロントエンド : React + Vite + monday-ui-react-core → Vercel
バックエンド   : Express.js on Vercel Functions（Webhook 受信・通知送信）
DB             : Supabase (PostgreSQL + RLS)
SDK            : @mondaycom/sdk, monday-sdk-js
テスト         : Vitest + Supertest
デプロイ       : Vercel (GitHub 連携)
CS             : Intercom
タスク         : Linear
```

---

## 開発コマンド

```bash
npm install              # 依存関係インストール
npm run dev              # フロントエンド開発サーバー (Vite, port 8301)
npm run server           # バックエンド開発サーバー
npm test                 # テスト実行 (Vitest)
npm test -- --run src/path/to/file.test.ts  # 単一テスト実行
npm run build            # 本番ビルド
vercel --prod            # 本番デプロイ
vercel env ls            # 環境変数確認
```

### ローカル開発（monday.com トンネル）
monday.com アプリはローカルで ngrok / Vercel CLI のトンネルが必要:
```bash
vercel dev               # ローカルサーバー起動（Vercel トンネル自動）
# または
npx monday-tunnel        # monday.com 公式トンネル
```

---

## ディレクトリ構成

```
app2/
├── src/                        # React フロントエンド（monday.com iframe 内表示）
│   ├── components/
│   │   ├── RuleBuilder.jsx     # 通知ルール作成 UI
│   │   └── NotificationPreview.jsx
│   ├── hooks/
│   │   └── useMonday.js        # monday SDK フック
│   └── App.jsx
├── server/                     # Express バックエンド
│   ├── routes/
│   │   ├── webhook.js          # monday.com Webhook 受信（署名検証必須）
│   │   ├── oauth.js            # OAuth 2.0 フロー
│   │   └── notifications.js   # Slack / Teams / メール送信
│   ├── services/
│   │   ├── monday.js           # monday API クライアント
│   │   ├── slack.js            # Slack Incoming Webhook
│   │   └── supabase.js         # DB アクセス
│   └── index.js
├── tests/
├── public/                     # privacy.html, tos.html
├── scripts/
│   ├── create_assets.py        # Marketplace 素材生成 (PIL)
│   └── create_demo_video.py    # デモ動画生成
├── CLAUDE.md
├── vercel.json
└── .env
```

---

## 外部 API・サービス

| サービス | 用途 | トークン種別 | 永続化方法 |
|---------|------|------------|----------|
| monday.com API | ボードデータ取得・Webhook | OAuth2 access_token + refresh_token（永続） | Supabase accounts テーブル |
| Slack | 通知送信 | Incoming Webhook URL（永続） | Supabase notification_rules テーブル |
| Microsoft Teams | 通知送信 | Incoming Webhook URL（永続） | Supabase notification_rules テーブル |
| Supabase | DB | Service Role Key（永続） | Vercel env var |

### 認証フロー（monday.com OAuth2）

```
マーチャントが Marketplace からインストール
  → monday.com が /oauth/callback にリダイレクト
  → code を access_token + refresh_token に交換
  → Supabase accounts テーブルに暗号化保存
  → アプリが monday SDK で API 呼び出し
```

**重要**: access_token の有効期限と refresh_token の更新フローを実装初日に確認・実装する。短命トークンのまま進めない。

---

## データベース設計（Supabase）

| テーブル | 用途 |
|---------|------|
| accounts | monday.com アカウント情報・トークン（暗号化） |
| notification_rules | 通知ルール（ボードID・列・条件・送信先） |
| notification_logs | 送信履歴・エラーログ |

### RLS ポリシー
- accounts: account_id 単位でのアクセス制御
- notification_rules: accounts に紐づく account_id のみ読み書き可

---

## 必須環境変数

```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
MONDAY_CLIENT_ID=
MONDAY_CLIENT_SECRET=
MONDAY_SIGNING_SECRET=         # Webhook 署名検証に使用
APP_URL=                       # Vercel の本番 URL
ENCRYPTION_KEY=                # トークン暗号化用（32バイト）
```

---

## Webhook 署名検証（セキュリティ必須）

monday.com からの Webhook はすべて署名検証を行う:

```javascript
// server/routes/webhook.js
const crypto = require('crypto');
const sig = req.headers['x-monday-signature'];
const hash = crypto.createHmac('sha256', process.env.MONDAY_SIGNING_SECRET)
  .update(JSON.stringify(req.body)).digest('base64');
if (sig !== `sha256=${hash}`) return res.status(401).send('Unauthorized');
```

---

## Marketplace 申請メモ

- **申請日**: 未定
- **審査ステータス**: 未申請
- **必要素材**:
  - [ ] アプリアイコン 512×512px（`scripts/create_assets.py` で生成可）
  - [ ] スクリーンショット 3枚以上（実データが入った状態）
  - [ ] デモ動画 30秒以内（`scripts/create_demo_video.py` で生成可）
  - [ ] Privacy Policy URL（public/privacy.html）
  - [ ] Terms of Service URL（public/tos.html）
  - [ ] monday.com Partner Program 登録

---

## 既知の問題・TODO

- [ ] Phase 0: Figma モック作成 → Facebook/Community 投稿 → 需要検証
- [ ] monday.com Partner Program 登録
- [ ] Supabase プロジェクト作成・接続設定
- [ ] OAuth2 トークン永続化の実装（Week 2 最優先）
- [ ] Webhook 署名検証の実装（Week 2 必須）
