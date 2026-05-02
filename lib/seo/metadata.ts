import { Metadata } from "next";
import { Plan } from "@/lib/types";
import { fmtData, fmtVoice, fmtFee } from "@/lib/plans";

export const SITE_URL = "https://simsaver.vercel.app";
export const SITE_NAME = "알뜰폰갤러리";
export const SITE_TITLE = "알뜰폰갤러리 — 알뜰폰 요금제 비교";
export const SITE_DESCRIPTION =
  "수십 개 알뜰폰 통신사 요금제를 자동으로 수집해 항상 최신 정보로 비교하세요. 가격·데이터·통화 조건에 맞는 최적 요금제를 찾아드립니다.";

/** 요금제 상세 페이지 metadata */
export function buildPlanMetadata(plan: Plan): Metadata {
  const dataStr =
    plan.data.total === "unlimited" ? "데이터 완전무제한" : `데이터 ${fmtData(plan.data)}`;
  const voiceStr =
    plan.voice === "unlimited" ? "통화 무제한" : `통화 ${fmtVoice(plan.voice)}`;
  const feeStr = `월 ${fmtFee(plan.monthlyFee)}`;

  const rawTitle = `${plan.name} | ${plan.carrier} 알뜰폰 요금제 - ${SITE_NAME}`;
  const title = rawTitle.length > 60 ? rawTitle.slice(0, 57) + "..." : rawTitle;

  const rawDesc =
    `${feeStr}에 ${dataStr}, ${voiceStr}. ${plan.mvno}망 ${plan.network} 사용 가능.` +
    ` 가입비·유심비 포함 정확한 요금제 정보를 한눈에 비교하세요.`;
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 152) + "..." : rawDesc;

  const ogImage = `${SITE_URL}/api/og/plan/${plan.id}`;
  const canonical = `${SITE_URL}/plans/${plan.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "ko_KR",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    // URL이 없는 요금제는 noindex (단종/미제공)
    robots: plan.url ? "index, follow" : "noindex, follow",
  };
}

/** 홈(리스팅) 페이지 metadata */
export function buildListingMetadata(): Metadata {
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    alternates: { canonical: SITE_URL },
    openGraph: {
      type: "website",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: "ko_KR",
      images: [
        {
          url: `${SITE_URL}/og-default.png`,
          width: 1200,
          height: 630,
          alt: SITE_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [`${SITE_URL}/og-default.png`],
    },
  };
}
