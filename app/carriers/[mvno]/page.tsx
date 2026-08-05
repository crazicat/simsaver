import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchPlansFromDb, fmtFee, fmtData, fmtVoice } from "@/lib/plans";
import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";
import { buildItemListJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 1800;

type MvnoKey = "kt" | "skt" | "lgu";

const MVNO_CONFIG: Record<MvnoKey, {
  label: string;
  mvno: "KT" | "SKT" | "LGU+";
  color: string;
  badge: string;
  desc: string;
  faq: { q: string; a: string }[];
}> = {
  kt: {
    label: "KT망",
    mvno: "KT",
    color: "bg-orange-100 text-orange-700",
    badge: "KT",
    desc: "KT 망을 사용하는 알뜰폰 요금제 전체 비교. 핀다이렉트·스노우맨·헬로모바일·KB리브엠 등 KT망 알뜰폰 사업자 요금제를 가격순으로 한눈에 비교하세요.",
    faq: [
      { q: "KT망 알뜰폰 가장 저렴한 요금제는?", a: "KT망 알뜰폰은 핀다이렉트·스노우맨에서 월 1만원 이하 요금제부터 시작합니다. 데이터 3~5GB 기준 월 9,900~12,900원 수준이며, 실시간 비교는 이 페이지에서 확인하세요." },
      { q: "KT망 알뜰폰 추천 사업자는?", a: "핀다이렉트(가격 최저), 스노우맨(소진 후 속도 우수), 헬로모바일(안정성), KB리브엠(카드 할인)이 KT망 대표 사업자입니다." },
      { q: "KT망과 SKT망 중 어디가 더 잘 터지나요?", a: "서울·수도권은 두 망 모두 우수합니다. 지방·농어촌은 SKT망이 약간 유리하고, KT망은 건물 내·지하 커버리지가 강점입니다." },
      { q: "KT망 알뜰폰 번호이동 방법은?", a: "원하는 KT망 알뜰폰 사이트에서 '번호이동' 선택 후 신청합니다. 현재 통신사 고객센터에서 번호이동 인증번호(유효 24시간)를 받아 입력하면 됩니다." },
    ],
  },
  skt: {
    label: "SKT망",
    mvno: "SKT",
    color: "bg-red-100 text-red-700",
    badge: "SKT",
    desc: "SKT 망을 사용하는 알뜰폰 요금제 전체 비교. SK7mobile·토스모바일·스노우맨 등 SKT망 알뜰폰 사업자 요금제를 가격순으로 한눈에 비교하세요.",
    faq: [
      { q: "SKT망 알뜰폰 가장 저렴한 요금제는?", a: "SK7mobile·스노우맨에서 월 1만원대 SKT망 요금제를 제공합니다. 통화+데이터 5GB 기준 약 13,000~15,000원 수준입니다." },
      { q: "SKT망 알뜰폰 추천 사업자는?", a: "SK7mobile(SKT 계열사·라인업 방대), 토스모바일(간편 가입), 스노우맨(가성비)이 SKT망 대표 사업자입니다." },
      { q: "SKT망 알뜰폰이 전국 커버리지가 좋은가요?", a: "네. SKT망은 전국 커버리지 1위로, 도서산간·농어촌 지역에서도 안정적입니다. 산행·여행이 잦은 분께 특히 추천합니다." },
      { q: "SKT 본통신사에서 알뜰폰으로 번호이동 가능한가요?", a: "가능합니다. SKT 고객센터(114)에서 번호이동 인증번호 발급 후 원하는 알뜰폰 사업자에서 번호이동 신청하면 됩니다." },
    ],
  },
  lgu: {
    label: "LGU+망",
    mvno: "LGU+",
    color: "bg-purple-100 text-purple-700",
    badge: "LGU+",
    desc: "LGU+ 망을 사용하는 알뜰폰 요금제 전체 비교. LG헬로모바일·U+알뜰모바일·KB리브엠 등 LGU+망 알뜰폰 사업자 요금제를 가격순으로 한눈에 비교하세요.",
    faq: [
      { q: "LGU+망 알뜰폰 가장 저렴한 요금제는?", a: "U+알뜰모바일·헬로모바일에서 월 1만원대 LGU+망 요금제를 제공합니다. 통화+데이터 기준 약 11,000~16,000원 수준입니다." },
      { q: "LGU+망 알뜰폰 추천 사업자는?", a: "LG헬로모바일(LGU+ 직계열사·안정적), U+알뜰모바일(저렴), KB리브엠(카드 혜택)이 LGU+망 대표 사업자입니다." },
      { q: "LGU+망 데이터 속도는 어떤가요?", a: "도심·수도권 기준 LGU+망은 5G 데이터 속도가 SKT·KT와 대등하거나 우수합니다. 단, 농어촌 커버리지는 세 망 중 상대적으로 약할 수 있습니다." },
      { q: "LGU+ 본통신사에서 알뜰폰으로 번호이동하면 위약금이 있나요?", a: "약정 기간 내 해지 시 위약금이 발생합니다. LGU+ 앱(U+모바일)에서 잔여 위약금을 먼저 확인하세요." },
    ],
  },
};

type Props = { params: { mvno: MvnoKey } };

export function generateStaticParams() {
  return [{ mvno: "kt" }, { mvno: "skt" }, { mvno: "lgu" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cfg = MVNO_CONFIG[params.mvno];
  if (!cfg) return { title: "요금제를 찾을 수 없습니다" };
  // layout.tsx 의 title.template("%s | 알뜰폰갤러리")이 접미사를 붙이므로 여기서는 생략
  const title = `${cfg.label} 알뜰폰 요금제 비교`;
  const description = cfg.desc;
  const canonical = `${SITE_URL}/carriers/${params.mvno}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "ko_KR",
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description },
  };
}

export default async function CarrierPage({ params }: Props) {
  const cfg = MVNO_CONFIG[params.mvno];
  if (!cfg) notFound();

  const allPlans = await fetchPlansFromDb();
  const plans = allPlans
    .filter((p) => p.mvno === cfg.mvno)
    .sort((a, b) => a.monthlyFee - b.monthlyFee);

  const itemListJsonLd = {
    ...buildItemListJsonLd(plans),
    name: `${cfg.label} 알뜰폰 요금제 목록`,
    description: cfg.desc,
    url: `${SITE_URL}/carriers/${params.mvno}`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cfg.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* 헤더 */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" aria-label="홈으로">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">알뜰폰갤러리</p>
              <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{cfg.label} 알뜰폰 요금제 비교</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* 인트로 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.badge}</span>
              <span className="text-xs text-gray-400">{plans.length}개 요금제</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              {cfg.label} 알뜰폰 요금제 전체 비교
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{cfg.desc}</p>
          </div>

          {/* 요금제 목록 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">
              가격 낮은 순 · {plans.length}개
            </h2>
            <div className="space-y-2">
              {plans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/plans/${plan.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{plan.carrier}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{plan.name}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span>{fmtData(plan.data)}</span>
                        <span>·</span>
                        <span>통화 {fmtVoice(plan.voice)}</span>
                        {plan.network === "5G" && <span className="text-blue-500 font-semibold">5G</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-extrabold text-blue-700 dark:text-blue-400">{fmtFee(plan.monthlyFee)}</p>
                      <p className="text-[10px] text-gray-400">/월</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">자주 묻는 질문</h2>
            <div className="space-y-3">
              {cfg.faq.map(({ q, a }, i) => (
                <details key={i} className="group border-b border-gray-100 dark:border-gray-800 last:border-0 pb-3 last:pb-0">
                  <summary className="flex items-center justify-between cursor-pointer list-none select-none py-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 pr-4">{q}</span>
                    <svg className="flex-shrink-0 w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* 다른 망 바로가기 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">다른 망 비교</h2>
            <div className="grid grid-cols-3 gap-2">
              {(["kt", "skt", "lgu"] as MvnoKey[]).filter(k => k !== params.mvno).map(k => (
                <Link
                  key={k}
                  href={`/carriers/${k}`}
                  className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${MVNO_CONFIG[k].color}`}>
                    {MVNO_CONFIG[k].badge}
                  </span>
                  <p className="text-xs text-gray-500">{MVNO_CONFIG[k].label} 보기</p>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-5 text-center">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
              전체 알뜰폰 요금제 비교하기
            </p>
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors">
              전체 요금제 보기 →
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
