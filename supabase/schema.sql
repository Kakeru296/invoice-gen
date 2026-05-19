-- InvoiceGen for monday.com - Supabase Schema

create extension if not exists "pgcrypto";

-- monday.com アカウント（OAuth トークン）
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  account_id text not null unique,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  monday_user_id text,
  monday_account_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 請求書テンプレート（会社情報）
create table if not exists invoice_templates (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references accounts(account_id) on delete cascade,
  company_name text not null,
  company_address text,
  company_email text,
  company_phone text,
  logo_url text,
  tax_rate decimal(5,2) default 0,
  payment_terms text default 'Net 30',
  currency text default 'USD',
  invoice_prefix text default 'INV-',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(account_id)
);

-- 生成済み請求書
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references accounts(account_id) on delete cascade,
  invoice_number text not null,
  board_id text not null,
  item_ids text[] not null,
  client_name text,
  client_email text,
  subtotal decimal(12,2) not null default 0,
  tax_amount decimal(12,2) not null default 0,
  total decimal(12,2) not null default 0,
  currency text default 'USD',
  status text default 'draft',  -- draft, sent, paid
  pdf_url text,
  due_date date,
  issued_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS ポリシー
alter table accounts enable row level security;
alter table invoice_templates enable row level security;
alter table invoices enable row level security;

-- サービスロールキーからの全アクセスを許可（バックエンドのみ使用）
create policy "service_role_accounts" on accounts using (true);
create policy "service_role_templates" on invoice_templates using (true);
create policy "service_role_invoices" on invoices using (true);
