-- ============================================================
-- 크롤링 보호 컬럼
-- crawler_protected = true 인 요금제는 크롤러가 건드리지 않음
-- (is_active 비활성화 및 데이터 upsert 모두 제외)
-- ============================================================
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS crawler_protected boolean NOT NULL DEFAULT false;

-- 보호된 요금제 조회용 부분 인덱스 (대부분 false이므로 sparse)
CREATE INDEX IF NOT EXISTS idx_plans_crawler_protected
  ON plans(crawler_protected)
  WHERE crawler_protected = true;

COMMENT ON COLUMN plans.crawler_protected IS
  'true = 크롤러가 이 요금제를 건드리지 않음 (is_active 변경 및 upsert 모두 제외). 어드민 수동 수정값 보존용.';
