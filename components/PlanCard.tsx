"use client";
import { Plan } from "@/lib/types";
import { fmtFee, fmtData, fmtVoice } from "@/lib/plans";

interface Props {
  plan: Plan;
  isFav: boolean;
  inCompare: boolean;
  onFav: () => void;
  onCompare: () => void;
  compareDisabled: boolean; // 이미 3개 선택됐을 때
}

const MVNO_BADGE: Record<string, string> = {
  SKT: "badge badge-skt",
  KT: "badge badge-kt",
  "LGU+": "badge badge-lgu",
};

const CLICKABLE_CARRIERS = new Set(["U+알뜰모바일", "LG헬로모바일", "스노우맨", "핀다이렉트"]);

export default function PlanCard({
  plan,
  isFav,
  inCompare,
  onFav,
  onCompare,
  compareDisabled,
}: Props) {
  const hasLink = !!plan.url && CLICKABLE_CARRIERS.has(plan.carrier);

  return (
    <article
      className={`plan-card p-5 relative ${inCompare ? "selected" : ""} ${hasLink ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={hasLink ? () => window.open(plan.url, "_blank", "noopener,noreferrer") : undefined}
    >
      {/* 즐겨찾기 */}
      <button
        onClick={(e) => { e.stopPropagation(); onFav(); }}
        aria-label={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        className="absolute top-4 right-4 text-lg leading-none transition-transform hover:scale-110 active:scale-95"
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
          <span className="text-xs text-gray-400">LTE</span>
        )}
        {plan.contractMonths === 0 && (
          <span className="badge badge-free">무약정</span>
        )}
      </div>

      {/* 통신사 / 요금제명 */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
        {plan.carrier}
      </p>
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 leading-snug">
        {plan.name}
      </h3>

      {/* 요금 */}
      <div className="mb-4">
        <span className="text-2xl font-semibold text-brand-800 dark:text-brand-100 tracking-tight">
          {fmtFee(plan.monthlyFee)}
        </span>
        <span className="text-xs text-gray-400 ml-1">/월</span>
      </div>

      {/* 스펙 3칸 */}
      <div className="flex gap-2 mb-3">
        <div className="spec-box">
          <p className="text-[10px] text-gray-400 mb-0.5">데이터</p>
          <p className="text-xs font-medium">{fmtData(plan.data)}</p>
        </div>
        <div className="spec-box">
          <p className="text-[10px] text-gray-400 mb-0.5">통화</p>
          <p className="text-xs font-medium">{fmtVoice(plan.voice)}</p>
        </div>
        <div className="spec-box">
          <p className="text-[10px] text-gray-400 mb-0.5">문자</p>
          <p className="text-xs font-medium">{fmtVoice(plan.sms)}</p>
        </div>
      </div>

      {/* 소진 후 속도 */}
      {plan.data.throttledSpeed && plan.data.total !== "unlimited" && (
        <p className="text-[11px] text-gray-400 mb-2">
          소진 후 {plan.data.throttledSpeed}Kbps
        </p>
      )}

      {/* 혜택 태그 */}
      <div className="flex flex-wrap gap-1 mb-3">
        {plan.benefits.slice(0, 2).map((b) => (
          <span
            key={b}
            className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300
                       px-2 py-0.5 rounded-full"
          >
            {b}
          </span>
        ))}
      </div>

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
