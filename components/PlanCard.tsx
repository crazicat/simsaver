"use client";
import Link from "next/link";
import { Plan } from "@/lib/types";
import { fmtFee, fmtData, fmtVoice, fmtSms, fmtThrottle } from "@/lib/plans";

interface Props {
  plan: Plan;
  isFav: boolean;
  inCompare: boolean;
  onFav: () => void;
  onCompare: () => void;
  compareDisabled: boolean;
  showAnnual?: boolean;
  annualFee?: number;
}

/** 혜택 텍스트 키워드 → 이모지 아이콘 */
function benefitIcon(text: string): string {
  const t = text.toLowerCase();
  if (/넷플릭스|netflix/.test(t))                    return "🎬";
  if (/티빙|tving|왓챠|wavve|웨이브|시리즈on/.test(t)) return "📺";
  if (/유튜브|youtube/.test(t))                       return "▶️";
  if (/쿠팡/.test(t))                                 return "🛒";
  if (/네이버페이|naver\s*pay/.test(t))               return "💚";
  if (/카카오/.test(t))                               return "💛";
  if (/지니|멜론|플로|뮤직|음악/.test(t))             return "🎵";
  if (/밀리|독서|서재|책/.test(t))                    return "📚";
  if (/해외.?로밍|로밍/.test(t))                      return "✈️";
  if (/유심비|유심/.test(t))                          return "💳";
  if (/즉시.?개통|바로.?개통/.test(t))                return "⚡";
  if (/첫.?달|%\s*할인|\d+원\s*할인|이벤트/.test(t)) return "🎁";
  if (/무약정/.test(t))                               return "🔓";
  if (/완전.?무제한|데이터.?무제한/.test(t))           return "♾️";
  if (/소진\s*후|kbps|mbps|속도/.test(t))             return "📶";
  return "✓";
}

const MVNO_BADGE: Record<string, string> = {
  SKT: "badge badge-skt",
  KT: "badge badge-kt",
  "LGU+": "badge badge-lgu",
};

export default function PlanCard({
  plan,
  isFav,
  inCompare,
  onFav,
  onCompare,
  compareDisabled,
  showAnnual = false,
  annualFee,
}: Props) {
  const hasLink = !!plan.url;

  // 데이터 + 소진후 속도 통합 표시 ("7GB + 1Mbps" 형태)
  const dataDisplay = (() => {
    const base = fmtData(plan.data);
    if (plan.data.throttledSpeed && plan.data.total !== "unlimited") {
      return `${base} + ${fmtThrottle(plan.data.throttledSpeed)}`;
    }
    return base;
  })();

  return (
    <article
      className={`plan-card p-4 sm:p-5 relative ${inCompare ? "selected" : ""} ${hasLink ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={hasLink ? () => window.open(plan.url, "_blank", "noopener,noreferrer") : undefined}
    >
      {/* 즐겨찾기 */}
      <button
        onClick={(e) => { e.stopPropagation(); onFav(); }}
        aria-label={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-lg leading-none
                   transition-transform hover:scale-110 active:scale-95 z-10"
      >
        {isFav ? (
          <span className="text-red-500">♥</span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600">♡</span>
        )}
      </button>

      {/* 뱃지 줄 */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2 pr-7">
        <span className={MVNO_BADGE[plan.mvno]}>{plan.mvno}</span>
        {plan.network === "5G" ? (
          <span className="badge badge-5g">5G</span>
        ) : (
          <span className="text-[11px] text-gray-400">LTE</span>
        )}
        {plan.contractMonths === 0 && (
          <span className="badge badge-free">무약정</span>
        )}
      </div>

      {/* 통신사 / 요금제명 */}
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">
        {plan.carrier}
      </p>
      <Link
        href={`/plans/${plan.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block"
      >
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 leading-snug line-clamp-2 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
          {plan.name}
        </h3>
      </Link>

      {/* 요금 */}
      <div className="mb-3">
        {plan.promoText && (
          <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 mb-0.5">
            {plan.promoText}
          </p>
        )}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[22px] sm:text-2xl font-bold text-brand-800 dark:text-brand-100 tracking-tight leading-none">
            {fmtFee(plan.monthlyFee)}
          </span>
          <span className="text-xs text-gray-400">/월</span>
          {plan.originalFee && plan.originalFee > plan.monthlyFee && (
            <span className="text-[11px] text-gray-400 line-through ml-0.5">
              {fmtFee(plan.originalFee)}
            </span>
          )}
        </div>
        {plan.promoMonths && plan.originalFee && plan.originalFee > plan.monthlyFee && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {plan.promoMonths}개월 이후 {fmtFee(plan.originalFee)}
          </p>
        )}
        {showAnnual && annualFee != null && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
            12개월 총{" "}
            <span className="text-brand-700 dark:text-brand-300 font-semibold">
              {fmtFee(annualFee)}
            </span>
          </p>
        )}
      </div>

      {/* 스펙: 모바일은 인라인, 데스크탑은 박스 */}
      {/* 모바일 인라인 */}
      <div className="sm:hidden text-[12px] text-gray-600 dark:text-gray-400 space-y-0.5 mb-3">
        <p>
          <span className="text-gray-400 mr-1">데이터</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{dataDisplay}</span>
        </p>
        <p>
          <span className="text-gray-400 mr-1">통화</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{fmtVoice(plan.voice)}</span>
          <span className="text-gray-300 dark:text-gray-600 mx-1.5">|</span>
          <span className="text-gray-400 mr-1">문자</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{fmtSms(plan.sms)}</span>
        </p>
      </div>

      {/* 데스크탑 박스 */}
      <div className="hidden sm:flex gap-2 mb-3">
        <div className="spec-box">
          <p className="text-[10px] text-gray-400 mb-0.5">데이터</p>
          <p className="text-xs font-medium">{dataDisplay}</p>
        </div>
        <div className="spec-box">
          <p className="text-[10px] text-gray-400 mb-0.5">통화</p>
          <p className="text-xs font-medium">{fmtVoice(plan.voice)}</p>
        </div>
        <div className="spec-box">
          <p className="text-[10px] text-gray-400 mb-0.5">문자</p>
          <p className="text-xs font-medium">{fmtSms(plan.sms)}</p>
        </div>
      </div>

      {/* 혜택 태그 */}
      {plan.benefits.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {plan.benefits.slice(0, 2).map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-0.5 text-[10px]
                         bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300
                         px-2 py-0.5 rounded-full"
            >
              <span className="text-[11px] leading-none">{benefitIcon(b)}</span>
              <span>{b}</span>
            </span>
          ))}
        </div>
      )}

      {/* 하단 */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
        <span className="text-[11px] text-gray-400">
          업데이트 {plan.lastUpdated}
        </span>
        <label
          className={`flex items-center gap-1.5 cursor-pointer text-xs select-none
            ${inCompare ? "text-brand-600 font-medium" : "text-gray-400"}
            ${compareDisabled && !inCompare ? "opacity-40 cursor-not-allowed" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={inCompare}
            onChange={onCompare}
            disabled={compareDisabled && !inCompare}
            className="accent-brand-600 w-3.5 h-3.5"
          />
          비교
        </label>
      </div>
    </article>
  );
}
