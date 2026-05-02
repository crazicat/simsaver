import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchPlanById, fetchPlansFromDb, fmtData, fmtVoice, fmtSms, fmtFee, fmtThrottle, fmtContract } from "@/lib/plans";
import { buildPlanMetadata } from "@/lib/seo/metadata";
import { buildProductJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/metadata";

// ISR: 하루 1회 재검증 (크롤러가 매일 갱신)
export const revalidate = 86400;
// 알 수 없는 ID는 동적으로 렌더링 허용
export const dynamicParams = true;

type Props = { params: { id: string } };

/** 빌드 시 상위 100개 요금제 pre-render */
export async function generateStaticParams() {
  const plans = await fetchPlansFromDb();
  return plans.slice(0, 100).map((p) => ({ id: p.id }));
}

/** 동적 메타데이터 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const plan = await fetchPlanById(params.id);
  if (!plan) return { title: "요금제를 찾을 수 없습니다" };
  return buildPlanMetadata(plan);
}

/** 혜택 텍스트 → 이모지 */
function benefitIcon(text: string): string {
  const t = text.toLowerCase();
  if (/넷플릭스|netflix/.test(t)) return "🎬";
  if (/티빙|tving|왓챠|wavve|웨이브|시리즈on/.test(t)) return "📺";
  if (/유튜브|youtube/.test(t)) return "▶️";
  if (/쿠팡/.test(t)) return "🛒";
  if (/네이버페이|naver\s*pay/.test(t)) return "💚";
  if (/카카오/.test(t)) return "💛";
  if (/지니|멜론|플로|뮤직|음악/.test(t)) return "🎵";
  if (/밀리|독서|서재|책/.test(t)) return "📚";
  if (/해외.?로밍|로밍/.test(t)) return "✈️";
  if (/유심비|유심/.test(t)) return "💳";
  if (/즉시.?개통|바로.?개통/.test(t)) return "⚡";
  if (/첫.?달|%\s*할인|\d+원\s*할인|이벤트/.test(t)) return "🎁";
  if (/무약정/.test(t)) return "🔓";
  if (/완전.?무제한|데이터.?무제한/.test(t)) return "♾️";
  if (/소진\s*후|kbps|mbps|속도/.test(t)) return "📶";
  return "✓";
}

const MVNO_COLOR: Record<string, string> = {
  SKT: "bg-red-100 text-red-700",
  KT: "bg-orange-100 text-orange-700",
  "LGU+": "bg-purple-100 text-purple-700",
};

export default async function PlanDetailPage({ params }: Props) {
  const plan = await fetchPlanById(params.id);
  if (!plan) notFound();

  const productJsonLd = buildProductJsonLd(plan);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", url: SITE_URL },
    { name: "요금제 비교", url: SITE_URL },
    { name: `${plan.name} — ${plan.carrier}`, url: `${SITE_URL}/plans/${plan.id}` },
  ]);

  const dataDisplay = (() => {
    const base = fmtData(plan.data);
    if (plan.data.throttledSpeed && plan.data.total !== "unlimited") {
      return `${base} (소진 후 ${fmtThrottle(plan.data.throttledSpeed)})`;
    }
    return base;
  })();

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* 헤더 */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              aria-label="홈으로"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">알뜰폰갤러리</p>
              <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {plan.name}
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {/* 통신사 + 요금제명 */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${MVNO_COLOR[plan.mvno] ?? "bg-gray-100 text-gray-700"}`}>
                {plan.mvno}
              </span>
              {plan.network === "5G" && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">5G</span>
              )}
              {plan.contractMonths === 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">무약정</span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{plan.carrier}</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 leading-snug mb-4">
              {plan.name}
            </h2>

            {/* 요금 */}
            {plan.promoText && (
              <p className="text-xs font-semibold text-rose-500 mb-1">{plan.promoText}</p>
            )}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight">
                {fmtFee(plan.monthlyFee)}
              </span>
              <span className="text-sm text-gray-400">/월</span>
              {plan.originalFee && plan.originalFee > plan.monthlyFee && (
                <span className="text-sm text-gray-400 line-through">
                  {fmtFee(plan.originalFee)}
                </span>
              )}
            </div>
            {plan.promoMonths && plan.originalFee && plan.originalFee > plan.monthlyFee && (
              <p className="text-xs text-gray-400 mt-1">
                {plan.promoMonths}개월 이후 {fmtFee(plan.originalFee)}
              </p>
            )}
          </section>

          {/* 스펙 상세 */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">요금제 상세</h3>
            <dl className="space-y-3">
              {[
                { label: "데이터", value: dataDisplay },
                { label: "통화", value: fmtVoice(plan.voice) },
                { label: "문자", value: fmtSms(plan.sms) },
                { label: "망", value: plan.mvno },
                { label: "네트워크", value: plan.network },
                { label: "약정", value: fmtContract(plan.contractMonths) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 혜택 */}
          {plan.benefits.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">혜택</h3>
              <ul className="space-y-2">
                {plan.benefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-base leading-none">{benefitIcon(b)}</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA */}
          <div className="space-y-3">
            {plan.url ? (
              <a
                href={plan.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-sm"
              >
                가입 신청하기 →
              </a>
            ) : (
              <p className="text-center text-sm text-gray-400 py-3">
                가입 링크가 준비되지 않았습니다.
              </p>
            )}
            <Link
              href="/"
              className="block w-full text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-2xl text-sm transition-colors"
            >
              다른 요금제 비교하기
            </Link>
          </div>

          {/* 마지막 업데이트 */}
          <p className="text-center text-xs text-gray-400">
            마지막 업데이트: {plan.lastUpdated}
          </p>
        </main>
      </div>
    </>
  );
}
