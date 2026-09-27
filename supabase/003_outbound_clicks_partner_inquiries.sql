-- ============================================================
-- 003: 송객(가입 버튼 클릭) 기록 + 입점·광고 문의
-- Supabase SQL Editor 에서 1회 실행.
-- 두 테이블 모두 RLS 활성 + 정책 없음 → anon 접근 불가, 서버(service role)만 사용.
-- ============================================================

-- 가입 버튼 클릭 (/go/[id] 경유). IP·UA 원문은 저장하지 않음.
CREATE TABLE IF NOT EXISTS outbound_clicks (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id       text        NOT NULL,
  carrier       text        NOT NULL,
  mvno          text,
  src           text,                 -- card | detail | compare | carrier
  is_mobile     boolean,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_created ON outbound_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_carrier ON outbound_clicks(carrier, created_at);
ALTER TABLE outbound_clicks ENABLE ROW LEVEL SECURITY;

-- 기간별 통신사 송객 집계 (파트너 페이지·월간 리포트용)
CREATE OR REPLACE FUNCTION click_stats(days int DEFAULT 30)
RETURNS TABLE(carrier text, mvno text, clicks bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT carrier, max(mvno), count(*)
  FROM outbound_clicks
  WHERE created_at >= now() - make_interval(days => days)
  GROUP BY carrier
  ORDER BY 3 DESC
$$;
REVOKE ALL ON FUNCTION click_stats(int) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION click_stats(int) TO service_role;

-- 입점·광고 문의
CREATE TABLE IF NOT EXISTS partner_inquiries (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company     text NOT NULL,
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  type        text NOT NULL,          -- listing | correction | ad | other
  message     text,
  status      text NOT NULL DEFAULT 'new',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_partner_inquiries_created ON partner_inquiries(created_at);
ALTER TABLE partner_inquiries ENABLE ROW LEVEL SECURITY;
