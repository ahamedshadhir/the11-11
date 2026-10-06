create table if not exists store_products (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  image text not null,
  category_id text not null,
  price integer not null,
  compare_at integer not null default 0,
  stock integer not null default 24,
  rating numeric not null default 4.5,
  created_at timestamptz not null default now()
);

create table if not exists store_hidden_products (
  id text primary key
);

create table if not exists store_roles (
  user_id text primary key,
  role text not null,
  updated_at timestamptz not null default now()
);

create table if not exists store_settings (
  id text primary key,
  pages jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
