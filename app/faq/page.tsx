import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  // layout.tsx 의 title.template("%s | 알뜰폰갤러리")이 접미사를 붙이므로 여기서는 생략
  title: "알뜰폰 요금제 자주 묻는 질문 (FAQ)",
  description:
    "알뜰폰 요금제 비교·가입·번호이동 등 자주 묻는 질문과 답변. KT·SKT·LGU+망 차이, 데이터 무제한, 유심비, 약정 여부까지 한 번에 확인하세요.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    type: "website",
    title: `알뜰폰 요금제 자주 묻는 질문 (FAQ) | ${SITE_NAME}`,
    description: "알뜰폰 요금제 비교·가입·번호이동에 관한 모든 궁금증 해결",
    url: `${SITE_URL}/faq`,
    siteName: SITE_NAME,
    locale: "ko_KR",
  },
};

const FAQ_ITEMS = [
  {
    q: "알뜰폰 요금제 어디서 비교하나요?",
    a: "알뜰폰갤러리(simsaver)에서 KT·SKT·LGU+ 3사 망을 사용하는 24개 이상 알뜰폰 사업자의 1,000개+ 요금제를 한눈에 비교할 수 있습니다. 가격순·데이터순 정렬과 망별 필터로 내게 맞는 요금제를 빠르게 찾을 수 있습니다.",
  },
  {
    q: "알뜰폰과 통신 3사(SKT·KT·LGU+)의 차이는 무엇인가요?",
    a: "알뜰폰(MVNO)은 SKT·KT·LGU+ 통신 3사의 망을 빌려 서비스를 제공합니다. 통화·데이터 품질은 동일하지만 유통 비용을 줄여 요금이 30~70% 저렴합니다. 단, 일부 서비스(VoLTE 로밍, 특정 부가서비스)는 제한될 수 있습니다.",
  },
  {
    q: "KT망 알뜰폰 요금제 추천해 주세요.",
    a: "KT망 알뜰폰은 핀다이렉트, 스노우맨, 헬로모바일, 스마텔, KB리브엠 등이 대표적입니다. 데이터 11GB 기준 월 2~3만원대 요금제가 많습니다. 알뜰폰갤러리에서 'KT망' 필터를 선택하면 가격순으로 즉시 확인할 수 있습니다.",
  },
  {
    q: "알뜰폰 번호이동(MNP) 방법과 절차는?",
    a: "번호이동은 원하는 알뜰폰 사업자 홈페이지에서 온라인으로 신청합니다. ①현재 통신사 고객센터에서 번호이동 인증번호 발급 → ②알뜰폰 가입 페이지에서 번호이동 선택 → ③유심 수령 후 개통 순서로 진행됩니다. 통상 1~2 영업일 소요됩니다.",
  },
  {
    q: "알뜰폰도 5G 요금제가 있나요?",
    a: "네, 있습니다. SKT·KT·LGU+ 5G망을 사용하는 알뜰폰 5G 요금제가 존재합니다. SK7mobile, KT 요고(YOGO), LG헬로모바일 등에서 5G 요금제를 제공하며, 통신 3사 대비 20~40% 저렴한 편입니다.",
  },
  {
    q: "알뜰폰 데이터 무제한 요금제 가격은 얼마인가요?",
    a: "데이터 완전무제한 알뜰폰 요금제는 보통 월 3~5만원대입니다. 데이터 소진 후 속도를 제한하는 '반무제한' 요금제는 1~3만원대부터 시작합니다. 알뜰폰갤러리에서 '무제한' 필터를 선택해 최저가 순으로 비교할 수 있습니다.",
  },
  {
    q: "알뜰폰 유심(USIM) 비용은 얼마인가요?",
    a: "알뜰폰 유심 비용은 사업자마다 다르지만 보통 2,000~8,800원 수준입니다. 일부 사업자는 신규 가입 이벤트로 유심비 무료 혜택을 제공하기도 합니다. 각 요금제 상세 페이지에서 유심비 포함 여부를 확인하세요.",
  },
  {
    q: "알뜰폰은 약정 없이 가입할 수 있나요?",
    a: "대부분의 알뜰폰 요금제는 무약정입니다. 언제든지 다른 통신사로 이동하거나 해지할 수 있습니다. 일부 요금제는 12~24개월 약정 시 추가 할인을 제공합니다. 알뜰폰갤러리에서 '무약정' 필터로 선택해 비교할 수 있습니다.",
  },
  {
    q: "알뜰폰 통화 품질은 어떤가요?",
    a: "알뜰폰은 SKT·KT·LGU+ 동일한 망을 사용하므로 통화 품질은 같습니다. 다만 일부 사업자는 데이터 혼잡 시간대에 속도 우선순위가 낮을 수 있습니다. KT·SKT·LGU+ 망 중 자신의 거주 지역에서 품질이 좋은 망을 선택하는 것이 좋습니다.",
  },
  {
    q: "알뜰폰 가입 시 필요한 서류는 무엇인가요?",
    a: "온라인 가입 기준으로 신분증(주민등록증·운전면허증) 사진 또는 스캔본, 계좌번호(자동이체 시), 본인 명의 휴대폰(본인 인증)이 필요합니다. 미성년자는 법정대리인 동의가 추가로 필요합니다.",
  },
  {
    q: "알뜰폰 요금제는 얼마나 자주 업데이트되나요?",
    a: "알뜰폰갤러리는 매일 새벽 24개 이상 알뜰폰 사업자 공식 사이트를 자동으로 크롤링해 최신 요금 정보로 업데이트합니다. 요금·데이터·혜택 변경사항을 빠르게 반영하므로 항상 최신 정보를 확인할 수 있습니다.",
  },
  {
    q: "망(SKT·KT·LGU+) 선택이 왜 중요한가요?",
    a: "망은 실제 통화·데이터 품질을 결정합니다. 현재 사용 중인 스마트폰이 특정 망의 5G 주파수를 지원하는지 확인이 필요하며, 거주·직장 지역 커버리지도 고려해야 합니다. 일반적으로 SKT·KT망이 지방 커버리지가 좋고, LGU+는 도심 데이터 속도가 빠른 편입니다.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">알뜰폰갤러리</p>
              <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">자주 묻는 질문</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          {/* 인트로 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              알뜰폰 FAQ
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              알뜰폰 요금제 비교·가입·번호이동에 관한 자주 묻는 질문을 모았습니다.
            </p>
          </div>

          {/* FAQ 목록 */}
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }, i) => (
              <details
                key={i}
                className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none select-none">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug pr-2">
                    {q}
                  </span>
                  <svg
                    className="flex-shrink-0 w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 bg-blue-50 dark:bg-blue-950 rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              내게 맞는 알뜰폰 요금제 찾기
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
              24개 사업자 1,000개+ 요금제를 가격순으로 비교하세요
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors"
            >
              요금제 비교하러 가기 →
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
