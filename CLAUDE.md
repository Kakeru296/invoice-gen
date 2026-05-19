# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## プロジェクト概要

- **プロダクト名**: InvoiceGen for monday.com
- **一言説明**: monday.com のボードアイテムから請求書・見積書を2クリックで生成するアプリ
- **ターゲット市場**: monday.com 上の代理店・フリーランス・サービス業（DocuGen 33K実績で市場証明済み）
- **差別化**: DocuGen（複雑・高価）に対し「シンプルに請求書だけ」に特化
- **Marketplace**: monday.com App Marketplace
- **本番URL**: [デプロイ後に記入]

---

## 技術スタック

```
フロントエンド : React + Vite + monday-ui-react-core → Vercel
バックエンド   : Express.js on Vercel Functions（PDF生成・メール送信）
DB             : Supabase (PostgreSQL + RLS)
SDK            : @mondaycom/sdk, monday-sdk-js
PDF生成        : pdfkit (Node.js サーバーサイド)
テスト         : Vitest + Supertest
デプロイ       : Vercel (GitHub 連携)
```

---

## 開発コマンド

```bash
npm install              # 依存関係インストール
npm run dev              # フロントエンド開発サーバー (Vite, port 8301)
npm run server           # バックエンド開発サーバー
npm test                 # テスト実行 (Vitest)
npm run build            # 本番ビルド
vercel --prod            # 本番デプロイ
```

---

## ディレクトリ構成

```
app3/
├── src/
│   ├── components/
│   │   ├── ItemSelector.jsx      # ボードアイテム選択 UI
│   │   ├── InvoicePreview.jsx    # 請求書プレビュー
│   │   └── TemplateSettings.jsx  # 会社情報・テンプレート設定
│   ├── hooks/
│   │   └── useMonday.js          # monday SDK フック
│   └── App.jsx
├── server/
│   ├── routes/
│   │   ├── oauth.js              # OAuth 2.0 フロー
│   │   ├── invoice.js            # PDF生成エンドポイント
│   │   └── template.js           # テンプレート CRUD
│   ├── services/
│   │   ├── monday.js             # monday API クライアント
│   │   ├── pdf.js                # pdfkit PDF生成
│   │   └── supabase.js           # DB アクセス
│   └── index.js
├── tests/
├── public/
├── CLAUDE.md
├── vercel.json
└── .env
```

---

## 外部 API・サービス

| サービス | 用途 | トークン種別 |
|---------|------|------------|
| monday.com API | ボードデータ取得 | OAuth2 access_token |
| Supabase | テンプレート・請求書記録 | Service Role Key |

---

## データベース設計（Supabase）

| テーブル | 用途 |
|---------|------|
| accounts | monday.com アカウント・トークン |
| invoice_templates | 会社情報・ロゴ・支払条件・税率 |
| invoices | 生成済み請求書（PDF URL・ステータス） |

### invoice_templates スキーマ
- account_id (text)
- company_name (text)
- company_address (text)
- company_email (text)
- logo_url (text, nullable)
- tax_rate (decimal, default 0)
- payment_terms (text, default "Net 30")
- currency (text, default "USD")
- invoice_prefix (text, default "INV-")
- created_at, updated_at

---

## 必須環境変数

```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
MONDAY_CLIENT_ID=
MONDAY_CLIENT_SECRET=
MONDAY_SIGNING_SECRET=
APP_URL=
ENCRYPTION_KEY=
```

---

## コア機能（MVP）

1. **アイテム選択**: ボードからアイテムを選択、列マッピング（数量・単価・説明）を設定
2. **テンプレート設定**: 会社名・住所・税率・支払条件を登録（初回のみ）
3. **PDF生成**: pdfkitでPDF生成 → ダウンロード or メール送信
4. **履歴**: 生成済み請求書を Supabase に記録

## Marketplace 申請メモ

- **申請日**: 未定
- **審査ステータス**: 未申請
