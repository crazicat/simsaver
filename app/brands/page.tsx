import Link from "next/link";
import type { Metadata } from "next";
import { fetchPlansFromDb, fmtFee } from "@/lib/plans";
import { groupBrands, brandPath } from "@/lib/brands";
import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "알뜰폰 통신사별 요금제 모아보기",
  description: "국내 알뜰폰 통신사(브랜드)별 요금제 수와 최저가를 한눈에. 통신사를 골라 전체 요금제를 가격순으로 비교하세요.",
  alternates: { canonical: `${SITE_URL}/brands` },
  openGraph: {
    type: "website",
    title: `알뜰폰 통신사별 요금제 모아보기 | ${SITE_NAME}`,
    description: "알뜰폰 통신사별 요금제 수와 최저가를 한눈에 비교",
    url: `${SITE_URL}/brands`,
    siteName: SITE_NAME,
    locale: "ko_KR",
  },
};

const MVNO_COLOR: Record<string, string> = {
  SKT: "text-red-500",
  KT: "text-orange-500",
  "LGU+": "text-purple-500",
};

export default async function BrandsPage() {
  const brands = groupBrands(await fetchPlansFromDb());

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
            <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">통신사별 요금제</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          알뜰폰 통신사 {brands.length}곳의 요금제를 매일 수집합니다. 요금제가 많은 순.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {brands.map((b) => (
            <Link
              key={b.key}
              href={brandPath(b.key)}
              className="flex items-center justify-between gap-3 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{b.name}</p>
                <p className="text-[11px] mt-0.5">
                  {b.networks.map((m) => (
                    <span key={m} className={`mr-1.5 font-semibold ${MVNO_COLOR[m]}`}>{m}</span>
                  ))}
                  <span className="text-gray-400">{b.plans.length}개</span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-gray-400">최저</p>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400">월 {fmtFee(b.minFee)}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          목록에 없는 통신사이신가요?{" "}
          <Link href="/partners?type=listing" className="underline hover:text-gray-600 dark:hover:text-gray-300">
            무료 입점 문의
          </Link>
        </p>
      </main>
    </div>
  );
}
