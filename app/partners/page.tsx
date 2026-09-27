import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { fetchPlansFromDb } from "@/lib/plans";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";
import PartnerForm from "@/components/PartnerForm";

// 1시간마다 재검증 — 지표는 실시간 DB 기준
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "알뜰폰 통신사 입점·광고 문의",
  description:
    "알뜰폰 요금제 비교 사이트 알뜰폰갤러리 입점 안내. 요금제 무료 등록·정보 수정, 가입 페이지 직접 연결, 송객 현황 공유. 광고·제휴 문의도 받습니다.",
  alternates: { canonical: `${SITE_URL}/partners` },
  openGraph: {
    type: "website",
    title: `알뜰폰 통신사 입점·광고 문의 | ${SITE_NAME}`,
    description: "요금제 무료 등록부터 광고·제휴까지. 알뜰폰을 찾는 사용자에게 귀사 요금제를 보여주세요.",
    url: `${SITE_URL}/partners`,
    siteName: SITE_NAME,
    locale: "ko_KR",
  },
};

type ClickStat = { carrier: string; mvno: string | null; clicks: number };

async function fetchClickStats(days: number): Promise<ClickStat[] | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.rpc("click_stats", { days });
  if (error) return null; // 003 마이그레이션 전이면 지표 섹션만 숨김
  return (data as ClickStat[]).map((r) => ({ ...r, clicks: Number(r.clicks) }));
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

export default async function PartnersPage() {
  const [plans, clickStats] = await Promise.all([fetchPlansFromDb(), fetchClickStats(30)]);

  const carrierCount = new Set(plans.map((p) => p.carrier.split("(")[0].trim())).size;
  const byMvno = (["SKT", "KT", "LGU+"] as const).map((m) => ({
    mvno: m,
    count: plans.filter((p) => p.mvno === m).length,
  }));
  const totalClicks = clickStats?.reduce((s, r) => s + r.clicks, 0) ?? 0;

  const stats = [
    { label: "비교 중인 요금제", value: `${fmt(plans.length)}개` },
    { label: "수집 중인 알뜰폰 브랜드", value: `${fmt(carrierCount)}곳` },
    { label: "요금 정보 갱신", value: "매일 새벽" },
    ...(totalClicks > 0 ? [{ label: "최근 30일 가입 페이지 연결", value: `${fmt(totalClicks)}건` }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" aria-label="홈으로">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400">알뜰폰갤러리</p>
            <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">입점·광고 문의</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* 히어로 */}
        <section>
          <p className="text-xs font-semibold text-blue-600 mb-2">알뜰폰 통신사 담당자님께</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 leading-snug mb-3">
            요금제를 비교하는 사용자에게
            <br />
            귀사 요금제를 보여주세요
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            알뜰폰갤러리는 국내 알뜰폰 요금제를 매일 자동 수집해 가격·데이터·망 조건으로 비교하는 서비스입니다.
            요금제 등록과 정보 수정은 <strong className="text-gray-900 dark:text-gray-100">무료</strong>이며,
            가입 버튼은 귀사 공식 가입 페이지로 바로 연결됩니다.
          </p>
          <a
            href="#inquiry"
            className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors"
          >
            입점 문의하기 →
          </a>
        </section>

        {/* 실시간 지표 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">현재 운영 현황</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
                <p className="text-xl font-extrabold text-gray-900 dark:text-gray-50">{s.value}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">망별 등록 요금제</p>
            <div className="space-y-1.5">
              {byMvno.map(({ mvno, count }) => (
                <div key={mvno} className="flex items-center gap-2 text-xs">
                  <span className="w-10 font-semibold text-gray-700 dark:text-gray-300">{mvno}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${plans.length ? (100 * count) / plans.length : 0}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-gray-500">{fmt(count)}개</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 제공 내용 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-green-600 mb-1">무료</p>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-3">입점·정보 관리</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>✓ 신규 요금제 등록, 단종 요금제 정리</li>
              <li>✓ 요금·혜택·프로모션 정보 수정</li>
              <li>✓ 가입 버튼 → 귀사 공식 가입 페이지 직접 연결 (UTM 포함)</li>
              <li>✓ 귀사 요금제 가입 페이지 연결 현황 공유</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-blue-600 mb-1">문의</p>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-3">광고·제휴</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>✓ 메인·목록 배너</li>
              <li>✓ 추천 요금제 노출</li>
              <li>✓ 신규 요금제·이벤트 기획전</li>
              <li>✓ 망별 페이지 제휴</li>
            </ul>
          </div>
        </section>

        {/* 진행 절차 */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-3">진행 절차</h2>
          <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><strong className="text-gray-900 dark:text-gray-100">1.</strong> 아래 양식으로 문의</li>
            <li><strong className="text-gray-900 dark:text-gray-100">2.</strong> 영업일 2일 안에 회신, 요금제 정보 확인</li>
            <li><strong className="text-gray-900 dark:text-gray-100">3.</strong> 등록·수정 반영 후 매일 자동 갱신</li>
          </ol>
        </section>

        {/* 문의 폼 */}
        <section id="inquiry" className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm scroll-mt-20">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-50 mb-4">입점·광고 문의</h2>
          <Suspense fallback={null}>
            <PartnerForm />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
