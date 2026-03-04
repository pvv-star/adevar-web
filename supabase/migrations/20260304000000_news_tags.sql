-- Add tags column to news_items for category filtering
alter table news_items add column if not exists tags text[] not null default '{}';
create index if not exists idx_news_items_tags on news_items using gin(tags);
