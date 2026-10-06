create table if not exists store_orders (
  id         text primary key,
  user_id    text not null,
  payload    text not null,
  created_at timestamptz not null default now()
);
create index if not exists store_orders_user_id_idx on store_orders (user_id);
