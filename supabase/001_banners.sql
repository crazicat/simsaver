-- ============================================================
-- 배너 테이블
-- ============================================================
create table if not exists banners (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  subtitle        text,
  badge_text      text,
  bg_color        text not null default '#1e3a5f',
  text_color      text not null default '#ffffff',
  cta_text        text default '자세히 보기',
  link_url        text,
  plan_id         uuid references plans(id) on delete set null,
  position        text not null check (position in ('hero', 'mid_grid', 'sidebar')),
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  start_date      timestamptz,
  end_date        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 활성 배너 조회용 인덱스
create index if not exists idx_banners_position_order
  on banners(position, display_order)
  where is_active = true;

-- RLS 활성화: anon 은 활성·기간 내 배너만 조회 가능
alter table banners enable row level security;

create policy "anon_read_active_banners" on banners
  for select to anon
  using (
    is_active = true
    and (start_date is null or start_date <= now())
    and (end_date   is null or end_date   >= now())
  );

-- service_role 은 RLS 우회 (정책 불필요)
