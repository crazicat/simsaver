import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchPlansFromDb, fmtFee, fmtData, fmtVoice, dataToGb } from "@/lib/plans";
import { groupBrands, brandPath, Brand } from "@/lib/brands";
import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { Plan } from "@/lib/types";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: { brand: string } };

function decodeKey(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function getBrand(raw: string): Promise<Brand | null> {
  const key = decodeKey(raw);
  const brands = groupBrands(await fetchPlansFromDb());
  return brands.find((b) => b.key === key) ?? null;
}

export async function generateStaticParams() {
  const brands = groupBrands(await fetchPlansFromDb());
  return brands.map((b) => ({ brand: b.key }));
}

/** 받침 유무에 따라 조사 선택 ("이야기모바일" → "은", "SK7mobile" → "은(는)") */
function josa(word: string, withBatchim: string, without: string): string {
  const code = word.trim().charCodeAt(word.trim().length - 1);
  if (code >= 0xac00 && code <= 0xd7a3) return word + ((code - 0xac00) % 28 ? withBatchim : without);
  return `${word}${withBatchim}(${without})`;
}

/** "월 10원 (첫 12개월, 이후 14,300원)" 처럼 프로모션까지 풀어 쓴 가격 */
function priceText(p: Plan): string {
  const base = `월 ${fmtFee(p.monthlyFee)}`;
  if (p.originalFee && p.originalFee > p.monthlyFee) {
    return p.promoMonths
      ? `${base} (첫 ${p.promoMonths}개월, 이후 ${fmtFee(p.originalFee)})`
      : `${base} (정상가 ${fmtFee(p.originalFee)})`;
  }
  return base;
}

function specText(p: Plan): string {
  return `데이터 ${fmtData(p.data)}, 통화 ${fmtVoice(p.voice)}, ${p.mvno}망 ${p.network}`;
}

/** 수집 데이터로 계산한 FAQ — 가격이 바뀌면 답도 매일 바뀐다 */
function buildFaq(b: Brand): { q: string; a: string }[] {
  const cheapest = b.plans[0];
  const faq = [
    {
      q: `${b.name}에서 가장 저렴한 요금제는?`,
      a: `${b.name}의 ${b.plans.length}개 요금제 중 최저가는 「${cheapest.name.replace(/\s+/g, " ")}」(${priceText(cheapest)})입니다. ${specText(cheapest)}. (${cheapest.lastUpdated} 수집 기준)`,
    },
    {
      q: `${josa(b.name, "은", "는")} 어떤 통신망을 쓰나요?`,
      a: `${josa(b.name, "은", "는")} ${b.networks.join("·")} 망 요금제를 제공합니다.${b.has5G ? " 5G 요금제도 있습니다." : " 현재 수집된 5G 요금제는 없습니다."}`,
    },
  ];
  const unlimitedCall = b.plans.find((p) => p.voice === "unlimited" && dataToGb(p.data) >= 10);
  if (unlimitedCall) {
    faq.push({
      q: `${b.name} 통화 무제한 + 데이터 10GB 이상 요금제 중 가장 싼 것은?`,
      a: `「${unlimitedCall.name.replace(/\s+/g, " ")}」 — ${priceText(unlimitedCall)}, ${specText(unlimitedCall)}.`,
    });
  }
  return faq;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = await getBrand(params.brand);
  if (!b) return { title: "통신사를 찾을 수 없습니다" };
  const title = `${b.name} 요금제 비교 — ${b.plans.length}개 최저가순`;
  const description =
    `${b.name} 알뜰폰 요금제 ${b.plans.length}개를 가격순으로 비교하세요. 최저 월 ${fmtFee(b.minFee)}부터, ` +
    `${b.networks.join("·")} 망${b.has5G ? ", 5G 포함" : ""}. 매일 자동 갱신.`;
  const canonical = `${SITE_URL}${brandPath(b.key)}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title: `${title} | ${SITE_NAME}`, description, url: canonical, siteName: SITE_NAME, locale: "ko_KR" },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description },
  };
}

const MVNO_COLOR: Record<string, string> = {
  SKT: "bg-red-100 text-red-700",
  KT: "bg-orange-100 text-orange-700",
  "LGU+": "bg-purple-100 text-purple-700",
};

export default async function BrandPage({ params }: Props) {
  const b = await getBrand(params.brand);
  if (!b) notFound();

  const faq = buildFaq(b);
  const url = `${SITE_URL}${brandPath(b.key)}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${b.name} 요금제 목록`,
      url,
      numberOfItems: b.plans.length,
      itemListElement: b.plans.slice(0, 50).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/plans/${p.id}`,
        name: `${p.name} — 월 ${fmtFee(p.monthlyFee)}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    buildBreadcrumbJsonLd([
      { name: "홈", url: SITE_URL },
      { name: "통신사별 요금제", url: `${SITE_URL}/brands` },
      { name: b.name, url },
    ]),
  ];

  return (
    <>
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/brands" className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors" aria-label="통신사 목록으로">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">알뜰폰갤러리 · 통신사별 요금제</p>
              <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{b.name} 요금제 비교</h1>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* 요약 */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              {b.networks.map((m) => (
                <span key={m} className={`text-xs font-bold px-2 py-0.5 rounded-full ${MVNO_COLOR[m]}`}>{m}</span>
              ))}
              {b.has5G && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">5G</span>}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">{b.name} 알뜰폰 요금제 {b.plans.length}개</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              최저 <strong className="text-blue-700 dark:text-blue-400">월 {fmtFee(b.minFee)}</strong>부터. 매일 새벽 {b.name} 공식 사이트에서 자동 수집한 요금입니다.
            </p>
          </section>

          {/* 요금제 목록 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">가격 낮은 순</h2>
            <div className="space-y-2">
              {b.plans.map((p) => (
                <Link
                  key={p.id}
                  href={`/plans/${p.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <span className={`font-bold px-1.5 rounded ${MVNO_COLOR[p.mvno]}`}>{p.mvno}</span>
                        <span>{fmtData(p.data)}</span>
                        <span>·</span>
                        <span>통화 {fmtVoice(p.voice)}</span>
                        {p.network === "5G" && <span className="text-blue-500 font-semibold">5G</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-extrabold text-blue-700 dark:text-blue-400">{fmtFee(p.monthlyFee)}</p>
                      {p.originalFee && p.originalFee > p.monthlyFee && p.promoMonths ? (
                        <p className="text-[10px] text-gray-400">{p.promoMonths}개월 후 {fmtFee(p.originalFee)}</p>
                      ) : (
                        <p className="text-[10px] text-gray-400">/월</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">{b.name} 자주 묻는 질문</h2>
            <div className="space-y-4">
              {faq.map(({ q, a }) => (
                <div key={q}>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">{q}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 통신사 담당자 */}
          <section className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-5">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">{b.name} 담당자이신가요?</p>
            <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
              요금제 정보 수정·신규 요금제 등록은 무료입니다. 가입 페이지 연결 현황도 공유해 드립니다.
            </p>
            <Link
              href={`/partners?carrier=${encodeURIComponent(b.name)}&type=correction`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors"
            >
              정보 수정·입점 문의 →
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}
