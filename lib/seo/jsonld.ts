import { Plan } from "@/lib/types";
import { fmtData, fmtVoice, fmtFee, fmtSms } from "@/lib/plans";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "./metadata";

/** WebSite + Sitelinks SearchBox */
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Organization (사이트 운영 조직) */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icons/icon-192.png`,
      width: 192,
      height: 192,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: "Korean",
    },
  };
}

/** Product + Offer (요금제 상세) */
export function buildProductJsonLd(plan: Plan) {
  const planUrl = `${SITE_URL}/plans/${plan.id}`;
  const ogImage = `${SITE_URL}/api/og/plan/${plan.id}`;

  const dataStr =
    plan.data.total === "unlimited" ? "데이터 완전무제한" : `데이터 ${fmtData(plan.data)}`;
  const voiceStr =
    plan.voice === "unlimited" ? "통화 무제한" : `통화 ${fmtVoice(plan.voice)}`;
  const smsStr = plan.sms === "unlimited" ? "무제한" : fmtSms(plan.sms);
  const description = `${plan.carrier} ${plan.name} — 월 ${fmtFee(plan.monthlyFee)}, ${dataStr}, ${voiceStr}, ${plan.mvno}망 ${plan.network}`;

  // priceValidUntil: 1년 뒤
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    description,
    brand: { "@type": "Brand", name: plan.carrier },
    category: "알뜰폰 요금제",
    image: ogImage,
    sku: plan.id,
    offers: {
      "@type": "Offer",
      price: String(plan.monthlyFee),
      priceCurrency: "KRW",
      availability: "https://schema.org/InStock",
      url: plan.url ?? planUrl,
      priceValidUntil: priceValidUntil.toISOString().slice(0, 10),
      seller: { "@type": "Organization", name: plan.carrier },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "데이터", value: dataStr },
      { "@type": "PropertyValue", name: "통화", value: voiceStr },
      { "@type": "PropertyValue", name: "문자", value: smsStr },
      { "@type": "PropertyValue", name: "망", value: plan.mvno },
      { "@type": "PropertyValue", name: "네트워크", value: plan.network },
      {
        "@type": "PropertyValue",
        name: "약정",
        value: plan.contractMonths === 0 ? "무약정" : `${plan.contractMonths}개월`,
      },
    ],
  };
}

/** BreadcrumbList */
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** ItemList (홈 리스팅) */
export function buildItemListJsonLd(plans: Plan[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "알뜰폰 요금제 목록",
    description: "국내 알뜰폰(MVNO) 요금제 전체 비교 — SKT·KT·LGU+ 망",
    url: SITE_URL,
    numberOfItems: Math.min(plans.length, 50),
    itemListElement: plans.slice(0, 50).map((plan, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/plans/${plan.id}`,
      name: `${plan.name} — ${plan.carrier} 월 ${fmtFee(plan.monthlyFee)}`,
    })),
  };
}
