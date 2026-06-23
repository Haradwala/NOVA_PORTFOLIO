-- ============================================================
-- SHADAB PORTFOLIO — Supabase Setup v3
-- Run this in Supabase → SQL Editor → Run
-- ============================================================

-- Drop and recreate cleanly
drop table if exists messages      cascade;
drop table if exists conversations cascade;

-- Conversations (one per client)
create table conversations (
  id           uuid default gen_random_uuid() primary key,
  client_name  text not null default 'Client',
  client_token text unique not null,
  created_at   timestamptz default now(),
  last_seen    timestamptz default now()
);

-- Messages
create table messages (
  id              uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role            text not null check (role in ('client','admin','nova')),
  content         text not null,
  created_at      timestamptz default now()
);

-- Indexes
create index idx_messages_conv on messages(conversation_id);
create index idx_messages_time on messages(created_at);
create index idx_convs_token   on conversations(client_token);
create index idx_convs_seen    on conversations(last_seen desc);

-- RLS — allow all (client_token = auth, row-level security is the token)
alter table conversations enable row level security;
alter table messages       enable row level security;
create policy "open_conversations" on conversations for all using (true) with check (true);
create policy "open_messages"      on messages       for all using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;

-- ============================================================
-- IMPORTANT: After running this SQL, go to:
-- Supabase → Authentication → Providers → Email
-- Turn OFF "Confirm email" so clients can log in immediately
-- ============================================================
