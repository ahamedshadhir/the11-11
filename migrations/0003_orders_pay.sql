alter table store_orders add column if not exists status text not null default 'placed';
alter table store_orders add column if not exists pay text not null default 'cod';
alter table store_orders add column if not exists skipcash_id text;
create index if not exists store_orders_skipcash_id_idx on store_orders (skipcash_id);
create index if not exists store_orders_status_idx on store_orders (status);
