-- accounts: monday.com OAuth tokens per workspace
create table if not exists accounts (
  account_id   text primary key,
  access_token text not null,
  refresh_token text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- notification_rules: per-board notification config
create table if not exists notification_rules (
  id              uuid primary key default gen_random_uuid(),
  account_id      text not null references accounts(account_id) on delete cascade,
  board_id        text not null,
  board_name      text not null,
  trigger_column  text not null default 'any',
  channel         text not null check (channel in ('slack', 'teams', 'email')),
  webhook_url     text not null,
  created_at      timestamptz default now()
);

create index if not exists idx_rules_account on notification_rules(account_id);
create index if not exists idx_rules_board   on notification_rules(board_id);

-- notification_logs: delivery history
create table if not exists notification_logs (
  id            uuid primary key default gen_random_uuid(),
  rule_id       uuid references notification_rules(id) on delete set null,
  account_id    text not null,
  status        text not null check (status in ('success', 'error')),
  error_message text,
  sent_at       timestamptz default now()
);

create index if not exists idx_logs_account on notification_logs(account_id);
create index if not exists idx_logs_sent    on notification_logs(sent_at desc);

-- RLS
alter table accounts          enable row level security;
alter table notification_rules enable row level security;
alter table notification_logs  enable row level security;

-- Service role bypasses RLS; app uses service key server-side only
